// Screenshots of the prototype in every theme, for review.
// Usage: node scripts/shots.mjs [baseUrl]   (serve dist first: npx vite preview)
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://localhost:4173/'
const executablePath = process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome'
const themes = ['light', 'dark', 'mocha']
const views = [
  { name: 'home', query: '' },
  { name: 'chat', query: '&chat=c-slip' },
]

const browser = await chromium.launch({ executablePath })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))

for (const theme of themes) {
  for (const v of views) {
    await page.goto(`${base}?theme=${theme}&ambient=off${v.query}`)
    await page.waitForTimeout(2600)
    await page.screenshot({ path: `shots/${v.name}-${theme}.png` })
    console.log(`shots/${v.name}-${theme}.png`)
  }
}
await browser.close()
if (errors.length) {
  console.error('Page errors:\n' + errors.join('\n'))
  process.exit(1)
}
