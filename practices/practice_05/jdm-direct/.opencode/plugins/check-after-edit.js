// OpenCode project plugin: check-after-edit
// Triggers the trusted runner after successful file-changing tool calls.

/**
 * Plugin entry.
 * Returns hooks; we use `tool.execute.after` to react after tools run.
 */
export default (async ({ client, project, directory }) => {
  const FILE_EDIT_TOOLS = new Set(["write", "edit", "apply_patch", "patch"]);

  // Small helper to run the trusted runner and capture stdout/stderr.
  async function runCheck() {
    const { exec } = await import("node:child_process");
    const cwd = directory || project?.path || process.cwd();
    const cmd = "sh scripts/check.sh"; // single source of truth for checks

    return new Promise((resolve, reject) => {
      exec(cmd, { cwd, env: process.env, maxBuffer: 20 * 1024 * 1024 }, (err, stdout, stderr) => {
        if (err) {
          reject({ err, stdout: String(stdout || ""), stderr: String(stderr || "") });
        } else {
          resolve({ stdout: String(stdout || ""), stderr: String(stderr || "") });
        }
      });
    });
  }

  // Create a short summary from runner output.
  function summarize(stdout, stderr) {
    // Heuristic: take last few non-empty lines from stdout; fallback to stderr.
    const tail = (s) => String(s || "").trim().split(/\r?\n/).filter(Boolean).slice(-5).join("\n");
    const outTail = tail(stdout);
    if (outTail) return outTail;
    const errTail = tail(stderr);
    return errTail || "";
  }

  return {
    async "tool.execute.after"(input, output) {
      try {
        // React only to successful file-changing tools.
        const toolName = input?.tool;
        if (!FILE_EDIT_TOOLS.has(toolName)) return;
        if (output?.error || output?.ok === false) return;

        const { stdout, stderr } = await runCheck();
        const marker = "[check-after-edit] PASS";
        const short = summarize(stdout, stderr);

        // Structured logging if available.
        try {
          await client?.log?.info?.(marker, {
            plugin: "check-after-edit",
            summary: short,
          });
        } catch {}

        // Attach a brief note to the tool output for visibility.
        output["check-after-edit"] = `${marker}\n${short}`;
      } catch (e) {
        const marker = "[check-after-edit] FAIL";
        const stdout = e?.stdout ?? "";
        const stderr = e?.stderr ?? "";
        const combined = [stdout, stderr].filter(Boolean).join("\n");

        try {
          await client?.log?.error?.(marker, {
            plugin: "check-after-edit",
            stdout,
            stderr,
          });
        } catch {}

        const err = new Error(`${marker}\n${combined}`);
        err.name = "CheckAfterEditError";
        throw err;
      }
    },
  };
});
