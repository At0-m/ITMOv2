import './style.css'
import heroImg from './assets/hero.png'
import { validateAndCalculateAsync } from './priceValidation'
import { validateBudget, filterCarsByBudget, mapBudgetErrorToMessage } from './featuredFilter'
import {
  initialSelection,
  toggleSelection,
  resetSelection,
  isSelected,
  canCompare,
  hiddenSelectedIds,
  selectedPair,
  MAX_SELECTED,
  type SelectionState,
} from './compareSelection'
import { compareCars, mapCompareErrorToMessage, type CompareItem } from './compareApi'

// Build landing page UI
document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <header class="site-header">
    <div class="container header-inner">
      <a href="#top" class="brand" aria-label="JDM DIRECT home">JDM DIRECT</a>
      <nav aria-label="Primary">
        <a class="nav-link" href="#featured">Авто</a>
        <a class="nav-link" href="#how">Как это работает</a>
        <a class="nav-link cta" href="#calc">Рассчитать</a>
      </nav>
    </div>
  </header>

  <main id="top">
    <section class="hero-section" aria-labelledby="hero-title">
      <div class="container hero-grid">
        <div class="hero-copy">
          <h1 id="hero-title">Покупка и импорт JDM авто из Японии</h1>
          <p class="subtitle">Прямой доступ к японским аукционам. Честный отчёт, прозрачная доставка и оформление.</p>
          <div class="hero-ctas">
            <a class="btn btn-primary" href="#calc">Рассчитать стоимость</a>
          </div>
        </div>
        <div class="hero-media" role="img" aria-label="Спортивное JDM авто">
          <img src="${heroImg}" alt="JDM автомобиль на тёмном фоне" />
          <div class="media-glow" aria-hidden="true"></div>
        </div>
      </div>
    </section>

    <section id="featured" class="featured-section" aria-labelledby="featured-title">
      <div class="container">
        <h2 id="featured-title">Featured JDM</h2>
        <p class="section-note">Легенды японского автопрома</p>

        <form id="budget-form" class="budget-form" aria-describedby="budget-help budget-error" style="margin: 12px 0 16px; display: flex; gap: 8px; align-items: flex-end; flex-wrap: wrap;">
          <div style="display:flex; flex-direction: column; gap:4px;">
            <label for="budget-input" class="input-label">Бюджет JPY</label>
            <input id="budget-input" name="budget" type="text" inputmode="numeric" placeholder="Напр. 4200000" aria-describedby="budget-help budget-error" />
            <div id="budget-help" class="help-text">Диапазон: 1 — 100000000 JPY</div>
          </div>
          <button type="submit" class="btn btn-secondary">Применить</button>
          <button type="button" id="budget-reset" class="btn" style="display:none;">Сбросить фильтр</button>
          <div id="budget-error" class="error-text" role="alert" aria-live="polite" style="flex-basis:100%"></div>
        </form>

        <div id="featured-empty" class="empty-state" style="display:none; margin: 12px 0;">По вашему бюджету ничего не найдено</div>

        <div id="featured-grid" class="card-grid"></div>

        <section id="compare-panel" class="compare-panel" aria-labelledby="compare-panel-title" aria-busy="false" hidden>
          <h3 id="compare-panel-title" class="compare-panel-title"><span class="jp-label" lang="ja">比較</span> Сравнение импорта</h3>
          <div id="compare-loading" class="compare-loading" role="status" aria-live="polite" hidden>
            <span class="compare-spinner" aria-hidden="true"></span>
            <span>Выполняется расчёт стоимости импорта</span>
          </div>
          <div id="compare-error" class="compare-error" role="alert" aria-live="assertive" hidden>
            <p id="compare-error-text" class="compare-error-text"></p>
            <button type="button" id="compare-retry" class="btn btn-secondary">Повторить расчёт</button>
          </div>
          <div id="compare-result" class="compare-result" hidden></div>
        </section>

        <div id="compare-tray" class="compare-tray" role="region" aria-label="Панель сравнения автомобилей" hidden>
          <div class="tray-main">
            <div class="tray-counter" aria-label="Выбрано автомобилей">
              <span class="tray-counter-label" lang="ja">選択</span>
              <span id="compare-counter" class="tray-counter-value">0 / 2</span>
            </div>
            <ul id="compare-slots" class="tray-slots" aria-label="Выбранные автомобили"></ul>
            <div class="tray-actions">
              <button type="button" id="compare-submit" class="btn btn-primary" aria-describedby="compare-hint">Сравнить 2 автомобиля</button>
              <button type="button" id="compare-reset" class="btn btn-ghost">Сбросить сравнение</button>
            </div>
          </div>
          <p id="compare-hint" class="tray-hint">Выберите два автомобиля для сравнения</p>
          <div id="compare-hidden-notice" class="tray-notice" hidden>
            <span id="compare-hidden-text"></span>
            <button type="button" id="compare-hidden-reset" class="btn btn-ghost btn-sm">Сбросить фильтр</button>
          </div>
          <p id="compare-feedback" class="tray-feedback" role="status" aria-live="polite"></p>
        </div>
      </div>
    </section>

    <section id="how" class="how-section" aria-labelledby="how-title">
      <div class="container">
        <h2 id="how-title">Как это работает</h2>
        <div class="steps">
          <div class="step">
            <div class="step-badge" aria-hidden="true">1</div>
            <h3 class="step-title">Подбор</h3>
            <p class="step-text">Определяем бюджет и критерии. Находим подходящие лоты.</p>
          </div>
          <div class="step">
            <div class="step-badge" aria-hidden="true">2</div>
            <h3 class="step-title">Аукцион</h3>
            <p class="step-text">Ставим ставки на проверенные автомобили с отчётами.</p>
          </div>
          <div class="step">
            <div class="step-badge" aria-hidden="true">3</div>
            <h3 class="step-title">Доставка</h3>
            <p class="step-text">Морская перевозка и страхование. Прозрачное отслеживание.</p>
          </div>
          <div class="step">
            <div class="step-badge" aria-hidden="true">4</div>
            <h3 class="step-title">Выдача</h3>
            <p class="step-text">Растаможка и регистрация. Вы получаете готовый автомобиль.</p>
          </div>
        </div>
      </div>
    </section>

    <section id="calc" class="calc-section" aria-labelledby="calc-title">
      <div class="container calc-container">
        <div class="calc-copy">
          <h2 id="calc-title">Калькулятор стоимости</h2>
          <p class="section-note">Введите цену лота на аукционе в йенах, чтобы оценить итоговую стоимость.</p>
        </div>
        <form id="calc-form" class="calc-form" aria-describedby="price-help">
          <label for="price-input" class="input-label">Цена JPY</label>
          <input id="price-input" name="price" type="number" inputmode="numeric" min="1" max="100000000" step="1" aria-describedby="price-help price-error" />
          <div id="price-help" class="help-text">Допустимый диапазон: 1 — 100000000 JPY</div>
          <div id="price-error" class="error-text" role="alert" aria-live="polite"></div>
          <div id="price-result" class="result-text" aria-live="polite"></div>
          <button type="submit" class="btn btn-primary">Рассчитать</button>
        </form>
      </div>
    </section>

    <section class="cta-bottom" aria-label="Финальный призыв к действию">
      <div class="container cta-inner">
        <h2 class="cta-title">Готовы привезти JDM мечты?</h2>
        <a class="btn btn-primary" href="#calc">Рассчитать стоимость</a>
      </div>
    </section>
  </main>

  <footer class="site-footer">
    <div class="container footer-inner">
      <p class="brand">JDM DIRECT</p>
      <nav aria-label="Footer">
        <a class="nav-link" href="#featured">Авто</a>
        <a class="nav-link" href="#how">Процесс</a>
        <a class="nav-link" href="#calc">Калькулятор</a>
      </nav>
      <p class="copyright">© ${new Date().getFullYear()} JDM DIRECT</p>
    </div>
  </footer>
`

// Minimal local async calculation service to demonstrate invocation
// Returns a demo result after a short delay
async function mockCalcServiceAsync(price: number) {
  return new Promise<{ total: number }>((resolve) => {
    // simulate small network/service latency
    setTimeout(() => resolve({ total: Math.round(price * 1.1) }), 200)
  })
}

// Preserve selectors/IDs for existing behavior
const form = document.getElementById('calc-form') as HTMLFormElement
const priceInput = document.getElementById('price-input') as HTMLInputElement
const errorEl = document.getElementById('price-error') as HTMLDivElement
const resultEl = document.getElementById('price-result') as HTMLDivElement
const submitBtn = document.querySelector('#calc-form button[type="submit"]') as HTMLButtonElement

form?.addEventListener('submit', async (e) => {
  e.preventDefault()
  const raw = priceInput.value

  // UI loading state
  submitBtn.disabled = true
  resultEl.innerHTML = '<div class="result-block"><div class="result-label">Расчёт</div><div class="result-value">…</div></div>'
  errorEl.textContent = ''

  try {
    const res = await validateAndCalculateAsync(raw, mockCalcServiceAsync, { timeoutMs: 800 })
    if ('ok' in res && res.ok) {
      // success: clear error, show result
      errorEl.textContent = ''
      // Extract total and format it for users; avoid raw JSON
      let total: number | null = null
      const r: unknown = res.result
      if (r && typeof r === 'object' && 'total' in (r as any)) {
        const v = (r as any).total
        if (typeof v === 'number' && Number.isFinite(v)) total = v
      }
      // Fallback: if result is a number itself
      if (total === null && typeof r === 'number' && Number.isFinite(r)) {
        total = r
      }
      if (total !== null) {
        const formatted = new Intl.NumberFormat('ru-RU').format(total)
        resultEl.innerHTML = `
          <div class="result-block">
            <div class="result-label">Итоговая стоимость</div>
            <div class="result-value">${formatted} <span class="result-currency">JPY</span></div>
          </div>
        `
      } else {
        // Unknown shape: show generic success without JSON
        resultEl.innerHTML = `
          <div class="result-block">
            <div class="result-label">Итоговая стоимость</div>
            <div class="result-value">—</div>
          </div>
        `
      }
    } else {
      // error: show domain-provided message
      errorEl.textContent = res.error
      resultEl.textContent = ''
    }
  } finally {
    submitBtn.disabled = false
  }
})

// Featured catalog budget filtering (client-side)
type FeaturedCar = { id: string; title: string; meta: string; engine: string; drivetrain: string; img: string; priceJpy: number }

const FEATURED_CARS: FeaturedCar[] = [
  { id: 'r34', title: 'Nissan Skyline GT-R', meta: 'R34 • AWD • RB26DETT', engine: 'RB26DETT', drivetrain: 'AWD', img: '/cars/skyline-r34.jpg', priceJpy: 5_800_000 },
  { id: 'supra', title: 'Toyota Supra', meta: 'A80 • RWD • 2JZ-GTE', engine: '2JZ-GTE', drivetrain: 'RWD', img: '/cars/supra-a80.jpg', priceJpy: 4_200_000 },
  { id: 'rx7', title: 'Mazda RX-7', meta: 'FD3S • RWD • 13B-REW', engine: '13B-REW', drivetrain: 'RWD', img: '/cars/rx7-fd.jpg', priceJpy: 3_100_000 },
]

const featuredGrid = document.getElementById('featured-grid') as HTMLDivElement
const budgetForm = document.getElementById('budget-form') as HTMLFormElement
const budgetInput = document.getElementById('budget-input') as HTMLInputElement
const budgetError = document.getElementById('budget-error') as HTMLDivElement
const budgetResetBtn = document.getElementById('budget-reset') as HTMLButtonElement
const featuredEmpty = document.getElementById('featured-empty') as HTMLDivElement

function formatJpy(n: number): string {
  return new Intl.NumberFormat('ru-RU').format(n) + ' JPY'
}

function renderFeatured(list: FeaturedCar[]): void {
  if (!featuredGrid) return
  featuredGrid.innerHTML = list
    .map(
      (c) => `
      <article class="car-card${isSelected(selection, c.id) ? ' is-selected' : ''}" data-car-id="${c.id}">
        <div class="card-media">
          <img src="${c.img}" alt="${c.title}" />
        </div>
        <h3 class="card-title">${c.title}</h3>
        <p class="card-meta">${c.meta}</p>
        <p class="card-price">${formatJpy(c.priceJpy)}</p>
        <button type="button" class="select-btn" data-select-id="${c.id}"></button>
      </article>
    `,
    )
    .join('')
  syncCardSelection()
  updateTray()
}

// ---- Compare: selection, tray, request lifecycle ----

const comparePanel = document.getElementById('compare-panel') as HTMLElement
const compareLoading = document.getElementById('compare-loading') as HTMLDivElement
const compareError = document.getElementById('compare-error') as HTMLDivElement
const compareErrorText = document.getElementById('compare-error-text') as HTMLParagraphElement
const compareRetryBtn = document.getElementById('compare-retry') as HTMLButtonElement
const compareResultEl = document.getElementById('compare-result') as HTMLDivElement
const compareTray = document.getElementById('compare-tray') as HTMLDivElement
const compareCounter = document.getElementById('compare-counter') as HTMLSpanElement
const compareSlots = document.getElementById('compare-slots') as HTMLUListElement
const compareSubmitBtn = document.getElementById('compare-submit') as HTMLButtonElement
const compareResetBtn = document.getElementById('compare-reset') as HTMLButtonElement
const compareHint = document.getElementById('compare-hint') as HTMLParagraphElement
const compareHiddenNotice = document.getElementById('compare-hidden-notice') as HTMLDivElement
const compareHiddenText = document.getElementById('compare-hidden-text') as HTMLSpanElement
const compareHiddenResetBtn = document.getElementById('compare-hidden-reset') as HTMLButtonElement
const compareFeedback = document.getElementById('compare-feedback') as HTMLParagraphElement

type CompareView =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; code: string }
  | { kind: 'success'; results: [CompareItem, CompareItem] }

let selection: SelectionState = initialSelection()
let compareView: CompareView = { kind: 'idle' }
let compareToken = 0 // invalidates in-flight responses after reset / selection change

function carById(id: string): FeaturedCar | undefined {
  return FEATURED_CARS.find((c) => c.id === id)
}

function setFeedback(text: string): void {
  compareFeedback.textContent = text
}

function hiddenText(n: number): string {
  return n === 1 ? '1 выбран скрыт фильтром' : `${n} выбранных скрыты фильтром`
}

// Reflect selection onto rendered cards in place (keeps keyboard focus on the toggled button).
function syncCardSelection(): void {
  const busy = compareView.kind === 'loading'
  featuredGrid.querySelectorAll<HTMLElement>('.car-card[data-car-id]').forEach((card) => {
    const id = card.dataset.carId as string
    const car = carById(id)
    const on = isSelected(selection, id)
    const btn = card.querySelector<HTMLButtonElement>('.select-btn')
    card.classList.toggle('is-selected', on)
    if (!btn || !car) return
    btn.setAttribute('aria-pressed', String(on))
    btn.setAttribute('aria-label', `${on ? 'Снять с сравнения' : 'Выбрать для сравнения'}: ${car.title}`)
    btn.disabled = busy
    btn.innerHTML = on
      ? '<span class="select-icon" aria-hidden="true">✓</span><span>Выбрано · Снять</span>'
      : '<span class="select-icon" aria-hidden="true">+</span><span>Сравнить</span>'
  })
}

function updateTray(): void {
  const n = selection.ids.length
  const busy = compareView.kind === 'loading'
  compareTray.hidden = n === 0
  compareCounter.textContent = `${n} / ${MAX_SELECTED}`
  compareSlots.innerHTML = selection.ids
    .map((id, i) => `<li class="tray-slot"><span class="tray-slot-no" aria-hidden="true">${i + 1}</span>${carById(id)?.title ?? id}</li>`)
    .join('')
  compareSubmitBtn.disabled = !canCompare(selection) || busy
  compareHint.hidden = canCompare(selection)
  compareResetBtn.disabled = false

  const hidden = hiddenSelectedIds(selection, activeList.map((c) => c.id)).length
  compareHiddenNotice.hidden = hidden === 0
  compareHiddenText.textContent = hidden === 0 ? '' : hiddenText(hidden)
}

function renderComparePanel(): void {
  const v = compareView
  comparePanel.hidden = v.kind === 'idle'
  comparePanel.setAttribute('aria-busy', String(v.kind === 'loading'))
  compareLoading.hidden = v.kind !== 'loading'
  compareError.hidden = v.kind !== 'error'
  compareResultEl.hidden = v.kind !== 'success'
  if (v.kind === 'error') compareErrorText.textContent = mapCompareErrorToMessage(v.code)
  if (v.kind === 'success') compareResultEl.innerHTML = renderResult(v.results)
  syncCardSelection()
  updateTray()
}

function renderResult(results: [CompareItem, CompareItem]): string {
  const [a, b] = results
  // Highlight only the strictly cheaper total from backend values; a tie highlights nothing.
  const cheaperId = a.totalImportJpy === b.totalImportJpy ? null : a.totalImportJpy < b.totalImportJpy ? a.carId : b.carId
  const col = (r: CompareItem): string => {
    const car = carById(r.carId)
    const cheaper = r.carId === cheaperId
    return `
      <article class="compare-col${cheaper ? ' is-cheaper' : ''}" data-car-id="${r.carId}">
        ${cheaper ? '<p class="cheaper-badge"><span aria-hidden="true">★</span> Меньший итог импорта</p>' : ''}
        ${car ? `<div class="compare-media"><img src="${car.img}" alt="${car.title}" /></div>` : ''}
        <h4 class="compare-car-title">${car?.title ?? r.carId}</h4>
        <dl class="spec-list">
          <div><dt>Двигатель</dt><dd>${car?.engine ?? '—'}</dd></div>
          <div><dt>Привод</dt><dd>${car?.drivetrain ?? '—'}</dd></div>
        </dl>
        <dl class="cost-list">
          <div><dt>Цена покупки</dt><dd>${formatJpy(r.purchasePriceJpy)}</dd></div>
          <div><dt>Аукционный сбор</dt><dd>${formatJpy(r.auctionFeeJpy)}</dd></div>
          <div><dt>Доставка</dt><dd>${formatJpy(r.shippingJpy)}</dd></div>
          <div class="cost-total"><dt><span class="jp-label" lang="ja">合計</span> Итого импорт</dt><dd>${formatJpy(r.totalImportJpy)}</dd></div>
        </dl>
      </article>`
  }
  return col(a) + col(b)
}

function clearCompareOutcome(): void {
  compareToken++
  compareView = { kind: 'idle' }
}

async function runCompare(): Promise<void> {
  const pair = selectedPair(selection)
  if (!pair || compareView.kind === 'loading') return // explicit, 2/2 only, no duplicate submit
  const token = ++compareToken
  compareView = { kind: 'loading' }
  setFeedback('')
  renderComparePanel()
  const out = await compareCars(pair)
  if (token !== compareToken) return // reset happened meanwhile
  compareView = out.ok ? { kind: 'success', results: out.results } : { kind: 'error', code: out.code }
  renderComparePanel()
  if (!out.ok) compareRetryBtn.focus()
}

featuredGrid.addEventListener('click', (e) => {
  const btn = (e.target as HTMLElement).closest<HTMLButtonElement>('button[data-select-id]')
  if (!btn || compareView.kind === 'loading') return
  const res = toggleSelection(selection, btn.dataset.selectId as string)
  if (res.outcome === 'rejected') {
    setFeedback('Выбрано максимум 2 автомобиля')
    return
  }
  selection = res.state
  setFeedback('')
  if (compareView.kind !== 'idle') clearCompareOutcome() // result/error belongs to the previous pair
  renderComparePanel()
})

compareSubmitBtn.addEventListener('click', () => void runCompare())
compareRetryBtn.addEventListener('click', () => void runCompare())

compareResetBtn.addEventListener('click', () => {
  selection = resetSelection()
  clearCompareOutcome()
  setFeedback('')
  renderComparePanel() // budget filter is intentionally untouched
})

compareHiddenResetBtn.addEventListener('click', () => {
  budgetResetBtn.click()
  const first = featuredGrid.querySelector<HTMLElement>('.select-btn')
  first?.focus()
})

let activeList: FeaturedCar[] = FEATURED_CARS.slice()

renderFeatured(activeList)

budgetForm?.addEventListener('submit', (e) => {
  e.preventDefault()
  const raw = budgetInput?.value ?? ''
  const prevList = activeList
  const res = validateBudget(raw)
  if (res.ok) {
    budgetError.textContent = ''
    if (res.value === null) {
      // Empty submit → show full catalog in original order
      activeList = FEATURED_CARS.slice()
      renderFeatured(activeList)
      featuredEmpty.style.display = 'none'
      budgetResetBtn.style.display = 'none'
    } else {
      const out = filterCarsByBudget(FEATURED_CARS, res.value)
      activeList = out
      renderFeatured(activeList)
      featuredEmpty.style.display = out.length === 0 ? 'block' : 'none'
      budgetResetBtn.style.display = 'inline-block'
    }
  } else {
    // Invalid non-empty -> show error, do not change current list
    budgetError.textContent = mapBudgetErrorToMessage(res.code)
    activeList = prevList
    // keep reset visibility as-is; empty state unchanged
  }
})

budgetResetBtn?.addEventListener('click', () => {
  if (!budgetInput) return
  budgetInput.value = ''
  budgetError.textContent = ''
  featuredEmpty.style.display = 'none'
  activeList = FEATURED_CARS.slice()
  renderFeatured(activeList)
  budgetResetBtn.style.display = 'none'
})
