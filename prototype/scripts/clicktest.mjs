// Clicks every control in the prototype and checks what happens. Saves screenshots to shots/test-*.png.
// Usage: npx vite preview --port 4173 & node scripts/clicktest.mjs
import { chromium } from 'playwright-core'

const base = process.argv[2] ?? 'http://localhost:4173/'
const browser = await chromium.launch({ executablePath: process.env.CHROME ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true })
const page = await ctx.newPage()
const errors = []
page.on('pageerror', (e) => errors.push(e.message))
const results = []
const wait = (ms) => page.waitForTimeout(ms)
const shot = (name) => page.screenshot({ path: `shots/test-${name}.png` })

async function check(name, fn) {
  try {
    await fn()
    results.push(['ok', name])
  } catch (e) {
    results.push(['FAIL', name, String(e.message ?? e).split('\n')[0]])
  }
}
const expectVisible = async (sel, timeout = 4000) => page.locator(sel).first().waitFor({ state: 'visible', timeout })
const expectCount = async (sel, n) => {
  const c = await page.locator(sel).count()
  if (c < n) throw new Error(`${sel}: expected at least ${n}, got ${c}`)
}
const nodeAt = (id) => page.evaluate((i) => window.__cortex.screenOf(i), id)

async function dragNodeTo(id, target) {
  const a = await nodeAt(id)
  if (!a) throw new Error(`node ${id} not on screen`)
  const box = await page.locator(target).first().boundingBox()
  const b = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  await page.mouse.move(a.x, a.y)
  await page.mouse.down()
  const steps = 26
  for (let i = 1; i <= steps; i++) {
    const t = i / steps
    await page.mouse.move(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t - Math.sin(t * Math.PI) * 40)
    await wait(16)
  }
  return b
}

await page.goto(`${base}?theme=light`)
await wait(1800)

await check('Theme switch: dark, mocha, light', async () => {
  for (const t of ['Dark · Ink', 'Mocha', 'Light · Oatmeal']) {
    await page.getByRole('radio', { name: t }).click()
    await wait(150)
  }
  const th = await page.evaluate(() => document.documentElement.dataset.theme)
  if (th !== 'light') throw new Error('theme is ' + th)
})

await check('Demo lab chip opens credits', async () => {
  await page.getByRole('button', { name: 'Demo lab' }).click()
  await expectVisible('.credits')
  await page.locator('.credits').getByRole('button', { name: 'Close' }).click()
})

await check('Search lights up the brain and lists results', async () => {
  await page.getByRole('searchbox', { name: 'Search or ask the whole lab' }).fill('snake')
  await expectVisible('.search-pop__row')
  await wait(400)
  await shot('search')
  await page.locator('.search-pop__group').filter({ hasText: 'Chats' }).locator('.search-pop__row').first().click()
  await expectVisible('.chat')
  await page.keyboard.press('Escape')
  await wait(500)
})

await check('Search Enter asks the Lab AI in a new chat (pivot idea + suggested pull)', async () => {
  const box = page.getByRole('searchbox', { name: 'Search or ask the whole lab' })
  await box.fill('Could a centipede robot weed under blueberry bushes?')
  await box.press('Enter')
  await expectVisible('.chat')
  await expectVisible('.inline-suggest', 9000)
  await shot('new-idea')
  await page.locator('.inline-suggest').getByRole('button', { name: 'Pull it in' }).click()
  await expectVisible('.inline-suggest__done')
  await expectCount('.tray .ctx:not(.ctx--locked):not(.ctx--drop)', 1)
})

await check('Not-found answer for something outside the files', async () => {
  await page.getByRole('textbox', { name: 'Your question' }).fill('What is the lab budget for next year?')
  await page.getByRole('button', { name: 'Ask', exact: true }).click()
  await expectVisible('.msg__text.is-notfound', 9000)
  await page.keyboard.press('Escape')
  await wait(600)
})

await check('Notifications open, mark read, open a chat', async () => {
  await page.getByRole('button', { name: /Notifications/ }).click()
  await expectVisible('.notices')
  await page.getByRole('button', { name: 'Mark all read' }).click()
  await page.locator('.notice').nth(1).click()
  await expectVisible('.chat')
  await page.keyboard.press('Escape')
  await wait(500)
})

await check('Your menu and About', async () => {
  await page.getByRole('button', { name: 'Your menu' }).click()
  await expectVisible('.menu__who')
  await page.getByRole('menuitem', { name: 'About this demo lab' }).click()
  await expectVisible('.credits')
  await page.locator('.credits').getByRole('button', { name: 'Close' }).click()
})

await check('Live avatars follow a teammate, Stop ends it', async () => {
  await page.getByRole('button', { name: 'Follow Kofi' }).first().click()
  await expectVisible('.follow-pill')
  await wait(900)
  await page.locator('.follow-pill').getByRole('button', { name: 'Stop' }).click()
})

await check('People rail Follow buttons', async () => {
  const row = page.locator('.person').filter({ hasText: 'Jonah Kim' })
  await row.hover()
  await row.getByRole('button', { name: 'Follow' }).click()
  await expectVisible('.follow-pill')
  await row.getByRole('button', { name: 'Following' }).click()
})

await check('Research topics fly the camera', async () => {
  await page.locator('.topic').filter({ hasText: 'Fire ant tunnels' }).click()
  await wait(1000)
})

await check('Brain: files toggle, zoom in/out/fit', async () => {
  await page.getByRole('button', { name: /Files shown/ }).click()
  await page.getByRole('button', { name: /Files hidden/ }).click()
  await page.getByRole('button', { name: 'Zoom in' }).click()
  await page.getByRole('button', { name: 'Zoom out' }).click()
  await page.getByRole('button', { name: 'Fit the whole lab' }).click()
  await wait(800)
})

await check('Lineage layout and back', async () => {
  await page.getByRole('button', { name: 'Lineage' }).click()
  await wait(1500)
  await shot('lineage')
  await page.getByRole('button', { name: 'Brain', exact: true }).click()
  await wait(1400)
})

await check('Drag a node out of the brain onto People: starts a new chat with it', async () => {
  await dragNodeTo('c-traffic', '.rail--right')
  await wait(200)
  await expectVisible('.newchat-drop.is-over')
  await shot('drag-to-new-chat')
  await page.mouse.up()
  await expectVisible('.chat', 3000)
  await wait(1200)
  await expectCount('.tray .ctx:not(.ctx--locked):not(.ctx--drop)', 1)
  await page.keyboard.press('Escape')
  await wait(700)
})

await check('+ New chat, then drag two things in (population animation)', async () => {
  await page.getByRole('button', { name: 'New chat', exact: true }).click()
  await expectVisible('.empty')
  await wait(1300)
  await dragNodeTo('p-sidewind', '.chat')
  await wait(150)
  await expectVisible('.tray.is-over')
  await shot('drag-tether')
  await page.mouse.up()
  await wait(260)
  await shot('drag-flight')
  await wait(900)
  await shot('drag-landed')
  await dragNodeTo('c-contact', '.chat')
  await page.mouse.up()
  await wait(1300)
  await expectCount('.tray .ctx:not(.ctx--locked):not(.ctx--drop)', 2)
  await expectCount('.note--pull', 2)
  await page.getByRole('textbox', { name: 'Your question' }).fill('What did the lab learn about sidewinders on sandy slopes?')
  await page.getByRole('button', { name: 'Ask', exact: true }).click()
  await expectVisible('.msg--ai .sources', 9000)
  await shot('new-chat-answered')
})

await check('Chip × removes context', async () => {
  const before = await page.locator('.tray .ctx:not(.ctx--locked):not(.ctx--drop)').count()
  await page.locator('.tray .ctx button').first().click()
  const after = await page.locator('.tray .ctx:not(.ctx--locked):not(.ctx--drop)').count()
  if (after !== before - 1) throw new Error(`${before} → ${after}`)
  await page.keyboard.press('Escape')
  await wait(600)
})

await check('Open the hero chat from the live feed', async () => {
  await page.locator('.feed').getByRole('button', { name: 'Sidewinder robot keeps slipping on steep sand' }).click()
  await expectVisible('.live-draft')
})

await check('Show earlier messages', async () => {
  await page.getByRole('button', { name: 'show', exact: true }).click()
  await expectVisible('text=Summarise our snake robot slope trials')
  await page.getByRole('button', { name: 'hide', exact: true }).click()
})

await check('Citation opens the source panel; Show on brain; public link present', async () => {
  await page.locator('[data-tour="answer"] .cite').first().click()
  await expectVisible('.viewer-panel')
  await expectVisible('.viewer-panel a[href^="https://"]')
  await shot('source-panel')
  await page.locator('.viewer-panel').getByRole('button', { name: 'Show on the brain' }).click()
  await page.locator('.viewer-panel').getByRole('button', { name: 'A citation is wrong' }).click()
  await page.locator('.viewer-panel').getByRole('button', { name: 'Close' }).click()
})

await check('Source list rows open sources (table, doc, memory chat)', async () => {
  for (const name of ['slope_trials_2025-06.csv', 'Tilting bed calibration']) {
    await page.locator('.source').filter({ hasText: name }).first().click()
    await expectVisible('.viewer-panel')
    await page.locator('.viewer-panel').getByRole('button', { name: 'Close' }).click()
  }
  await page.locator('.source--memory').first().click()
  await expectVisible('.viewer-panel')
  await page.locator('.viewer-panel').getByRole('button', { name: 'Close' }).click()
})

await check('What did the AI see? opens the manifest', async () => {
  await page.locator('[data-tour="manifest"]').click()
  await expectVisible('.modal')
  await shot('manifest')
  await page.keyboard.press('Escape')
})

await check('Thumbs up / down', async () => {
  await page.getByRole('button', { name: 'Useful' }).first().click()
  await expectVisible('.toast')
  await page.getByRole('button', { name: 'Not useful' }).first().click()
})

await check('Suggested pull: Pull it in', async () => {
  await page.locator('.suggest').getByRole('button', { name: 'Pull it in' }).click()
  await wait(400)
  await expectCount('.tray .ctx:not(.ctx--locked):not(.ctx--drop)', 4)
})

await check('Filters change', async () => {
  await page.locator('.filter select').first().selectOption('GitHub')
  await page.locator('.filter select').nth(2).selectOption('This week')
})

await check('Port: branch from this answer, then cancel', async () => {
  await page.getByRole('button', { name: 'Branch from this answer' }).first().click()
  await expectVisible('text=Branching from this answer')
  await page.getByRole('button', { name: 'Cancel branch' }).click()
})

await check('Export .md downloads', async () => {
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 4000 }), page.getByRole('button', { name: 'Export as markdown' }).click()])
  if (!dl.suggestedFilename().endsWith('.md')) throw new Error(dl.suggestedFilename())
})

await check('More menu: copy link, show on brain, memory card', async () => {
  await page.getByRole('button', { name: 'More', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Copy link to this chat' }).click()
  await expectVisible('.toast')
  await page.getByRole('button', { name: 'More', exact: true }).click()
  await page.getByRole('menuitem', { name: 'Show it on the brain' }).click()
  await page.getByRole('button', { name: 'More', exact: true }).click()
  const [dl] = await Promise.all([page.waitForEvent('download', { timeout: 4000 }), page.getByRole('menuitem', { name: 'Download memory card (.md)' }).click()])
  if (!dl.suggestedFilename().includes('memory')) throw new Error(dl.suggestedFilename())
})

await check('Branch & ask in Kofi’s live chat → notified → Kofi merges back', async () => {
  await page.getByRole('textbox', { name: 'Your question' }).fill('What should we try next to stop the snake robot slipping?')
  await page.getByRole('button', { name: /Branch & ask/ }).click()
  await expectVisible('.note--branch')
  await expectVisible('.toast--live')
  await shot('branched')
  await wait(9500)
  await page.locator('.crumb-from').click()
  await expectVisible('.note--merge', 4000)
  await shot('merged-back')
})

await check('Header Branch button sets up a branch', async () => {
  await page.getByRole('button', { name: 'Branch from this chat' }).first().click()
  await expectVisible('text=Branching from the latest answer')
  await page.getByRole('button', { name: 'Cancel branch' }).click()
})

await check('Topic crumb and back arrow', async () => {
  await page.locator('button.crumb').click()
  await page.getByRole('button', { name: 'Back to the whole lab' }).click()
  await wait(700)
})

await check('Tour: every step and every “Show me”', async () => {
  await page.getByRole('button', { name: 'Take the tour' }).click()
  for (let i = 0; i < 13; i++) {
    await expectVisible('.tour__card').catch(() => { throw new Error(`step ${i + 1}: card missing`) })
    await wait(750)
    const show = page.locator('.tour__actions > .btn:not(.btn--primary):not(.btn--ghost)')
    if (await show.count()) {
      await show.click()
      await wait(i === 8 ? 2400 : 900)
      if (await page.locator('.viewer-panel, .modal').count()) await page.keyboard.press('Escape')
    }
    if (i === 8) await shot('tour-drag')
    await page.locator('.tour__nav .btn--primary').click({ timeout: 6000 }).catch((e) => { throw new Error(`step ${i + 1}: ${e.message.split('\n')[0]}`) })
  }
  if (await page.locator('.tour__card').count()) throw new Error('tour still open')
})

await check('Cortex logo returns home', async () => {
  await page.getByRole('button', { name: 'Cortex home: the whole lab' }).click()
  await wait(600)
  await shot('end')
})

await browser.close()
for (const r of results) console.log(r[0].padEnd(5), r[1], r[2] ? `  ← ${r[2]}` : '')
console.log(`\n${results.filter((r) => r[0] === 'ok').length}/${results.length} passed`)
if (errors.length) console.log('Page errors:\n' + [...new Set(errors)].join('\n'))
