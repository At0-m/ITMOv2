import './style.css'
import heroImg from './assets/hero.png'
import { validateAndCalculateAsync } from './priceValidation'

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
        <div class="card-grid">
          <article class="car-card">
            <div class="card-media">
              <img src="/cars/skyline-r34.jpg" alt="Nissan Skyline GT-R R34" />
            </div>
            <h3 class="card-title">Nissan Skyline GT-R</h3>
            <p class="card-meta">R34 • AWD • RB26DETT</p>
          </article>
          <article class="car-card">
            <div class="card-media">
              <img src="/cars/supra-a80.jpg" alt="Toyota Supra A80" />
            </div>
            <h3 class="card-title">Toyota Supra</h3>
            <p class="card-meta">A80 • RWD • 2JZ-GTE</p>
          </article>
          <article class="car-card">
            <div class="card-media">
              <img src="/cars/rx7-fd.jpg" alt="Mazda RX-7 FD3S" />
            </div>
            <h3 class="card-title">Mazda RX-7</h3>
            <p class="card-meta">FD3S • RWD • 13B-REW</p>
          </article>
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
