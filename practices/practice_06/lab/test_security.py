"""Security regression tests for confirmed findings from REPORT_01.md / THREAT_MODEL.md.

Each test maps to one or more Threat IDs from THREAT_MODEL.md section 10 (Test mapping)
and to the corresponding evidence file in evidence/before/. Before the fix in service.py,
these tests are expected to FAIL (they assert the *secure* behavior). After the fix,
they must all PASS, and the pre-existing tests in test_service.py / test_http.py must
keep passing unchanged.
"""

import unittest

from service import Shop


class SecurityTestBase(unittest.TestCase):
    def setUp(self):
        self.shop = Shop()
        self.addCleanup(self.shop.close)

    def request(self, method, path, body=None, headers=None):
        with self.shop.lock:
            return self.shop.dispatch(method, path, body or {}, headers or {})

    def login(self, username="alice", password="learn-alice"):
        status, result = self.request("POST", "/login", {"username": username, "password": password})
        self.assertEqual(status, 200)
        return {"X-Token": result["token"]}


class SpoofingTests(SecurityTestBase):
    """S-01 / E-01 / E-02 / I-07: role must come from the server session, not X-Role."""

    def test_x_role_header_alone_is_not_enough(self):
        status, _ = self.request("GET", "/admin/export", headers={"X-Role": "staff"})
        self.assertIn(status, (401, 403))

    def test_customer_session_with_x_role_header_is_rejected(self):
        auth = {**self.login(), "X-Role": "staff"}
        status, _ = self.request("GET", "/admin/export", headers=auth)
        self.assertEqual(status, 403)

    def test_staff_session_without_header_still_works(self):
        auth = self.login("staff", "learn-staff")
        status, profiles = self.request("GET", "/admin/export", headers=auth)
        self.assertEqual(status, 200)
        self.assertEqual(len(profiles), 2)


class TamperingTests(SecurityTestBase):
    """T-01..T-06, T-09: price integrity, SQL injection, review validation."""

    def test_client_supplied_price_is_ignored(self):
        status, order = self.request("POST", "/orders", {"product": "chair", "price": 1}, self.login())
        self.assertEqual(status, 201)
        self.assertEqual(order["price"], 5000)

    def test_negative_price_is_ignored(self):
        status, order = self.request("POST", "/orders", {"product": "chair", "price": -5000}, self.login())
        self.assertEqual(status, 201)
        self.assertEqual(order["price"], 5000)

    def test_profile_id_sql_injection_does_not_leak_other_profiles(self):
        auth = self.login()
        status, profiles = self.request("GET", "/profile?id=0 OR 1=1", headers=auth)
        self.assertIn(status, (400, 403))
        if status == 200:
            self.fail("SQL injection returned data instead of being rejected")

    def test_search_sql_injection_does_not_return_injected_rows(self):
        auth = self.login()
        status, rows = self.request(
            "GET", "/search?q=NOPE%' UNION SELECT 99,'INJECTED','sqli@proof','proof' -- ", headers=auth
        )
        self.assertEqual(status, 200)
        self.assertFalse(any(r.get("name") == "INJECTED" for r in rows))

    def test_order_id_sql_injection_does_not_leak_other_orders_into_context(self):
        auth = self.login()
        status, context = self.request("GET", "/assistant/context?order_id=0 OR 1=1", headers=auth)
        self.assertIn(status, (200, 400, 403))
        if status == 200:
            self.assertNotIn("lamp", context["prompt"])

    def test_anonymous_review_is_rejected(self):
        status, _ = self.request("POST", "/reviews", {"product": "chair", "text": "anon"})
        self.assertEqual(status, 401)

    def test_review_html_is_escaped_on_view(self):
        auth = self.login()
        self.request("POST", "/reviews", {"product": "chair", "text": "<script>alert(1)</script>"}, auth)
        status, html = self.request("GET", "/reviews/view", headers=auth)
        self.assertEqual(status, 200)
        self.assertNotIn("<script>", html)

    def test_malformed_order_body_returns_safe_400_not_500_with_internals(self):
        status, result = self.request("POST", "/orders", {}, self.login())
        self.assertEqual(status, 400)
        self.assertNotIn("KeyError", str(result))


class RepudiationTests(SecurityTestBase):
    """R-01 / R-03: logs must be restricted and attributable, not open to everyone."""

    def test_debug_logs_requires_staff(self):
        status, _ = self.request("GET", "/debug/logs")
        self.assertIn(status, (401, 403))

    def test_debug_logs_rejects_customer(self):
        status, _ = self.request("GET", "/debug/logs", headers=self.login())
        self.assertEqual(status, 403)


class InformationDisclosureTests(SecurityTestBase):
    """I-01..I-10: IDOR, cross-user leakage, log/token exposure."""

    def test_profile_idor_is_blocked(self):
        auth = self.login()  # alice, id=1
        status, _ = self.request("GET", "/profile?id=2", headers=auth)
        self.assertEqual(status, 403)

    def test_profile_requires_session(self):
        status, _ = self.request("GET", "/profile?id=1")
        self.assertEqual(status, 401)

    def test_orders_are_scoped_to_owner(self):
        auth = self.login()  # alice
        status, orders = self.request("GET", "/orders", headers=auth)
        self.assertEqual(status, 200)
        self.assertTrue(all(o["owner"] == 1 for o in orders))

    def test_files_cannot_read_other_users_receipt(self):
        auth = self.login()  # alice
        status, _ = self.request("GET", "/files?user=bob&path=receipt.txt", headers=auth)
        self.assertIn(status, (403, 404))

    def test_files_path_traversal_into_private_is_blocked(self):
        auth = self.login()  # alice
        status, _ = self.request(
            "GET", "/files?user=alice&path=../../private/operator-note.txt", headers=auth
        )
        self.assertIn(status, (400, 403, 404))

    def test_debug_logs_do_not_expose_raw_token_or_password(self):
        auth = self.login("staff", "learn-staff")
        self.login("alice", "learn-alice")
        status, logs = self.request("GET", "/debug/logs", headers=auth)
        self.assertEqual(status, 200)
        dumped = str(logs)
        self.assertNotIn("learn-alice", dumped)
        self.assertNotIn(auth["X-Token"], dumped)

    def test_assistant_context_does_not_leak_other_users_order_by_default(self):
        auth = self.login()  # alice, owns order 1 only
        status, context = self.request("GET", "/assistant/context?order_id=2", headers=auth)
        self.assertIn(status, (200, 403, 404))
        if status == 200:
            self.assertNotIn("lamp", context["prompt"])

    def test_export_profiles_tool_requires_staff(self):
        status, _ = self.request(
            "POST", "/assistant/execute",
            {"decision": {"tool": "export_profiles", "arguments": {}}},
        )
        self.assertIn(status, (401, 403))

    def test_export_profiles_tool_rejects_customer(self):
        auth = self.login()
        status, _ = self.request(
            "POST", "/assistant/execute",
            {"decision": {"tool": "export_profiles", "arguments": {}}},
            auth,
        )
        self.assertEqual(status, 403)

    def test_read_file_tool_cannot_fetch_other_users_receipt(self):
        auth = self.login()  # alice
        status, result = self.request(
            "POST", "/assistant/execute",
            {"decision": {"tool": "read_file", "arguments": {"path": "files/bob/receipt.txt"}}},
            auth,
        )
        if status == 200:
            self.assertNotIn("TEST_BOB", result["content"])
        else:
            self.assertIn(status, (403, 404))

    def test_read_file_tool_cannot_reach_private_note(self):
        auth = self.login()  # alice
        status, result = self.request(
            "POST", "/assistant/execute",
            {"decision": {"tool": "read_file", "arguments": {"path": "private/operator-note.txt"}}},
            auth,
        )
        if status == 200:
            self.assertNotIn("TEST_ONLY_OPERATOR_SECRET", result["content"])
        else:
            self.assertIn(status, (403, 404))

    def test_read_file_tool_requires_session(self):
        status, _ = self.request(
            "POST", "/assistant/execute",
            {"decision": {"tool": "read_file", "arguments": {"path": "files/alice/receipt.txt"}}},
        )
        self.assertIn(status, (401, 403))


class DenialOfServiceTests(SecurityTestBase):
    """T-08 / D-01 / L-09: delete_tree must never be reachable via the assistant tool."""

    def test_delete_tree_tool_is_always_rejected(self):
        status, _ = self.request(
            "POST", "/assistant/execute",
            {"decision": {"tool": "delete_tree", "arguments": {"path": "files"}}},
        )
        self.assertIn(status, (401, 403))

    def test_delete_tree_tool_is_rejected_even_with_valid_customer_session(self):
        auth = self.login()
        status, _ = self.request(
            "POST", "/assistant/execute",
            {"decision": {"tool": "delete_tree", "arguments": {"path": "files"}}},
            auth,
        )
        self.assertEqual(status, 403)
        # fixture files must still be readable afterwards
        status, receipt = self.request(
            "GET", "/files?user=alice&path=receipt.txt", headers=auth
        )
        self.assertEqual(status, 200)
        self.assertIn("TEST_ALICE", receipt["content"])


class LoginLockoutTests(SecurityTestBase):
    """S-04 / D-06: brute-force lockout must be time-limited, not permanent.

    REPORT_02.md section 9 recorded a FAIL here: after FAILED_LOGIN_LIMIT
    wrong passwords, the account used to stay locked forever (until the
    process restarted), so even the *correct* password was rejected with
    429. These tests drive the shop's injectable clock (`shop._clock`)
    instead of sleeping for real, so they stay fast and deterministic.
    """

    def setUp(self):
        super().setUp()
        self.fake_time = 0.0
        self.shop._clock = lambda: self.fake_time

    def fail_login(self, username="alice", password="wrong"):
        return self.request("POST", "/login", {"username": username, "password": password})

    def test_lockout_kicks_in_after_the_limit(self):
        statuses = [self.fail_login()[0] for _ in range(5)]
        self.assertEqual(statuses, [401, 401, 401, 401, 401])
        # one more wrong attempt, while still locked, must be 429
        status, _ = self.fail_login()
        self.assertEqual(status, 429)

    def test_correct_password_is_rejected_while_locked(self):
        for _ in range(5):
            self.fail_login()
        status, _ = self.fail_login("alice", "learn-alice")
        self.assertEqual(status, 429)

    def test_correct_password_works_again_once_lockout_expires(self):
        for _ in range(5):
            self.fail_login()
        status, _ = self.fail_login("alice", "learn-alice")
        self.assertEqual(status, 429, "sanity check: must be locked right after the limit")

        # Advance the fake clock past the lockout window - no real sleep.
        from service import LOGIN_LOCKOUT_SECONDS
        self.fake_time += LOGIN_LOCKOUT_SECONDS + 1

        status, result = self.request(
            "POST", "/login", {"username": "alice", "password": "learn-alice"}
        )
        self.assertEqual(status, 200)
        self.assertIn("token", result)

    def test_lockout_is_still_active_one_second_before_it_expires(self):
        for _ in range(5):
            self.fail_login()
        from service import LOGIN_LOCKOUT_SECONDS
        self.fake_time += LOGIN_LOCKOUT_SECONDS - 1

        status, _ = self.request(
            "POST", "/login", {"username": "alice", "password": "learn-alice"}
        )
        self.assertEqual(status, 429)

    def test_lockout_is_per_account_not_global(self):
        for _ in range(5):
            self.fail_login("alice", "wrong")
        status, _ = self.fail_login("alice", "learn-alice")
        self.assertEqual(status, 429)
        # bob must be able to log in normally while alice is locked out
        status, result = self.request(
            "POST", "/login", {"username": "bob", "password": "learn-bob"}
        )
        self.assertEqual(status, 200)
        self.assertIn("token", result)

    def test_successful_login_resets_the_failure_counter(self):
        for _ in range(4):  # one below the limit
            self.fail_login()
        status, result = self.request(
            "POST", "/login", {"username": "alice", "password": "learn-alice"}
        )
        self.assertEqual(status, 200)
        # a fresh run of failures afterwards must need the full limit again,
        # not just one more attempt from the earlier count
        statuses = [self.fail_login()[0] for _ in range(4)]
        self.assertEqual(statuses, [401, 401, 401, 401])


class ExecuteSchemaTests(SecurityTestBase):
    """L-05 / L-06: /assistant/execute rejects unknown fields and wrong types
    with a safe 400 and never runs the tool."""

    def execute(self, decision, headers=None):
        return self.request("POST", "/assistant/execute", {"decision": decision},
                            headers if headers is not None else self.login())

    def test_extra_decision_field_is_rejected(self):
        status, result = self.execute({"tool": "read_file", "arguments": {}, "run_as": "staff"})
        self.assertEqual((status, result), (400, {"error": "invalid decision"}))

    def test_extra_argument_field_is_rejected(self):
        status, result = self.execute({"tool": "read_file", "arguments": {"path": "x", "user": "bob"}})
        self.assertEqual((status, result), (400, {"error": "invalid decision"}))

    def test_non_string_path_is_rejected_for_customer_and_staff(self):
        for headers in (self.login(), self.login("staff", "learn-staff")):
            for bad in (["files/bob/receipt.txt"], {"a": 1}, 5, None):
                status, result = self.execute({"tool": "read_file", "arguments": {"path": bad}}, headers)
                self.assertEqual((status, result), (400, {"error": "invalid decision"}))

    def test_export_profiles_with_arguments_is_rejected_even_for_staff(self):
        status, result = self.execute({"tool": "export_profiles", "arguments": {"x": 1}},
                                      self.login("staff", "learn-staff"))
        self.assertEqual((status, result), (400, {"error": "invalid decision"}))

    def test_delete_tree_with_extra_field_is_400_and_files_survive(self):
        status, _ = self.execute({"tool": "delete_tree", "arguments": {"path": "files", "force": True}})
        self.assertEqual(status, 400)
        status, result = self.request("GET", "/files", headers=self.login())
        self.assertEqual(status, 200)
        self.assertIn("TEST_ALICE", result["content"])

    def test_valid_decisions_still_work(self):
        status, result = self.execute({"tool": "read_file", "arguments": {"path": "ignored"}})
        self.assertEqual(status, 200)
        self.assertIn("TEST_ALICE", result["content"])
        status, _ = self.execute({"tool": "read_file"})
        self.assertEqual(status, 200)
        status, result = self.execute({"tool": "export_profiles", "arguments": {}},
                                      self.login("staff", "learn-staff"))
        self.assertEqual(status, 200)
        self.assertEqual(len(result), 2)


class FailedLoginMemoryTests(SecurityTestBase):
    """D-02 / S-04: failed_logins must not grow with attacker-chosen names."""

    def test_unknown_usernames_are_not_stored(self):
        for i in range(2000):
            status, _ = self.request("POST", "/login", {"username": f"ghost-{i}", "password": "x"})
            self.assertEqual(status, 401)
        self.assertEqual(self.shop.failed_logins, {})

    def test_unknown_usernames_never_get_locked_out(self):
        statuses = {self.request("POST", "/login", {"username": "ghost", "password": "x"})[0]
                    for _ in range(10)}
        self.assertEqual(statuses, {401})

    def test_known_account_still_locks_and_recovers_after_30_seconds(self):
        now = [0.0]
        self.shop._clock = lambda: now[0]
        for _ in range(5):
            self.request("POST", "/login", {"username": "alice", "password": "bad"})
        status, _ = self.request("POST", "/login", {"username": "alice", "password": "learn-alice"})
        self.assertEqual(status, 429)
        self.assertEqual(list(self.shop.failed_logins), ["alice"])
        now[0] = 31.0
        status, _ = self.request("POST", "/login", {"username": "alice", "password": "learn-alice"})
        self.assertEqual(status, 200)


class AuditTrailTests(SecurityTestBase):
    """R-01 / R-02: audit records carry timestamp, request_id and the outcome,
    and never contain passwords or tokens."""

    def staff_logs(self):
        status, result = self.request("GET", "/debug/logs", headers=self.login("staff", "learn-staff"))
        self.assertEqual(status, 200)
        return result

    def test_request_log_has_timestamp_request_id_and_status(self):
        self.request("GET", "/profile", headers=self.login())
        self.request("GET", "/profile?id=2", headers=self.login())
        records = self.staff_logs()["requests"]
        for rec in records:
            self.assertRegex(rec["timestamp"], r"^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}\+00:00$")
            self.assertEqual(len(rec["request_id"]), 32)
        self.assertEqual(len({r["request_id"] for r in records}), len(records))
        by_target = [r["status"] for r in records if r["target"].startswith("/profile")]
        self.assertEqual(by_target, [200, 403])

    def test_failed_login_status_is_logged_without_password(self):
        self.request("POST", "/login", {"username": "alice", "password": "wrong-pass-xyz"})
        rec = [r for r in self.staff_logs()["requests"] if r["target"] == "/login"][0]
        self.assertEqual(rec["status"], 401)
        self.assertNotIn("wrong-pass-xyz", str(self.staff_logs()))

    def test_tool_audit_links_to_request_log_and_has_no_secrets(self):
        headers = self.login()
        token = headers["X-Token"]
        self.request("POST", "/assistant/execute", {"decision": {"tool": "export_profiles", "arguments": {}}}, headers)
        self.request("POST", "/assistant/execute", {"decision": {"tool": "read_file", "arguments": {"p": 1}}}, headers)
        logs = self.staff_logs()
        ids = {r["request_id"]: r for r in logs["requests"]}
        decisions = logs["tool_decisions"]
        self.assertEqual([(d["tool"], d["verdict"], d["reason"]) for d in decisions],
                         [("export_profiles", "deny", "not staff"), ("read_file", "deny", "invalid schema")])
        for d in decisions:
            self.assertIn("timestamp", d)
            self.assertIn(d["request_id"], ids)
        self.assertEqual([ids[d["request_id"]]["status"] for d in decisions], [403, 400])
        self.assertNotIn(token, str(logs))
        self.assertNotIn("learn-", str(logs))


if __name__ == "__main__":
    unittest.main()
