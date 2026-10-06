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
    // Leave the app in a clean state so one failure doesn't take the next checks down with it.
    await page.mouse.up().catch(() => {})
    for (let i = 0; i < 3; i++) if (await page.locator('.setup, .tour__card, .viewer-panel, .modal').count()) await page.keyboard.press('Escape')
  }
}
const expectVisible = async (sel, timeout = 4000) => page.locator(sel).first().waitFor({ state: 'visible', timeout })
const expectCount = async (sel, n) => {
  const c = await page.locator(sel).count()
  if (c < n) throw new Error(`${sel}: expected at least ${n}, got ${c}`)
}
const nodeAt = (id) => page.evaluate((i) => window.__cortex.screenOf(i), id)

/** The first of these nodes that's actually visible on the brain right now. */
async function visibleNode(ids) {
  const box = await page.locator('.brain__canvas').boundingBox()
  for (const id of ids) {
    const p = await nodeAt(id)
    if (p && p.x > box.x + 40 && p.x < box.x + box.width - 40 && p.y > box.y + 70 && p.y < box.y + box.height - 70) return id
  }
  throw new Error('none of ' + ids.join(', ') + ' on screen')
}

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

// Teammates stay still for the main run (ambient=off); the last check turns them loose.
await page.goto(`${base}?theme=light&ambient=off`)
await wait(1800)
const search = () => page.getByRole('searchbox', { name: 'Search or ask the whole lab' })
const promptHits = () => page.evaluate(() => window.__cortex.promptHits())

await check('Theme switch: dark, mocha, light', async () => {
  for (const t of ['Dark · Ink', 'Mocha', 'Light · Oatmeal']) {
    await page.getByRole('radio', { name: t }).click()
    await wait(150)
  }
  const th = await page.evaluate(() => document.documentElement.dataset.theme)
  if (th !== 'light') throw new Error('theme is ' + th)
})

await check('Presenter setup: comma key, rename, recolour, status, copy link, reset', async () => {
  await page.keyboard.press(',')
  await expectVisible('.setup')
  await page.getByLabel('Lab name').fill('Motion Lab')
  const kofi = page.locator('.setup__person').first()
  await kofi.getByLabel('Name').fill('Dr. Ama Owusu')
  await kofi.getByLabel('Status').selectOption('away')
  // Busy, then straight back to Off so the rest of the run stays still.
  await page.locator('.setup').getByRole('radio', { name: /Busy/ }).click()
  await page.locator('.setup').getByRole('radio', { name: /Off/ }).click()
  if ((await page.locator('.setup').getByRole('radio', { name: /Off/ }).getAttribute('aria-checked')) !== 'true') throw new Error('ambient radio')
  await page.locator('.setup .toggle', { hasText: 'cursor' }).click()
  await shot('setup')
  await page.locator('.setup').getByRole('button', { name: /Copy setup link/ }).click()
  await expectVisible('.toast')
  await page.locator('.setup').getByRole('button', { name: 'Done' }).click()
  if ((await page.locator('.workspace__name').innerText()) !== 'Motion Lab') throw new Error('lab name not applied')
  await expectVisible('.person:has-text("Dr. Ama Owusu")')
  if (await page.locator('.brain__cursor').isVisible()) throw new Error('cursor still shown')
  await page.getByRole('button', { name: 'Your menu' }).click()
  await page.getByRole('menuitem', { name: /Presenter setup/ }).click()
  await expectVisible('.setup')
  await page.locator('.setup').getByRole('button', { name: 'Reset' }).click()
  await page.locator('.setup').getByRole('radio', { name: /Off/ }).click()
  await page.keyboard.press('Escape')
  if (await page.locator('.setup').count()) throw new Error('Esc did not close setup')
  if ((await page.locator('.workspace__name').innerText()) !== 'Robophysics Lab') throw new Error('reset did not restore the lab name')
  await expectVisible('.person:has-text("Dr. Kofi Mensah")')
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

await check('Question bank: 60+ questions, each found again when reworded', async () => {
  const bank = await page.evaluate(() => window.__cortex.bank())
  if (bank.length < 60) throw new Error(`only ${bank.length} questions`)
  const reword = (q) => q.replace(/[?.!]+$/, '').toLowerCase() + ' please'
  const misses = []
  for (const b of bank) {
    const got = await page.evaluate((q) => window.__cortex.match(q), reword(b.q))
    if (got !== b.id) misses.push(`${b.id}→${got}`)
  }
  if (misses.length) throw new Error(misses.join(', '))
})

await check('Search lists questions the Lab AI can answer', async () => {
  await search().fill('robot blob')
  await expectVisible('.search-pop__group:has-text("Questions the Lab AI can answer") .search-pop__row')
  await search().fill('')
  await page.keyboard.press('Escape')
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

await check('Question bank: an answer offers topic follow-ups that ask the next question', async () => {
  await search().fill('How do fire ants dig tunnels without traffic jams?')
  await search().press('Enter')
  await expectVisible('.try:has-text("Ask next") .try__q', 9000)
  const asked = await page.locator('.msg--human').count()
  const next = await page.locator('.try__q').first().innerText()
  await page.locator('.try__q').first().click()
  await wait(300)
  await expectCount('.msg--human', asked + 1)
  await expectVisible('.msg--ai >> nth=1', 9000)
  await page.waitForFunction(() => document.querySelectorAll('.msg--ai .sources, .msg--ai .sources--files').length >= 2, null, { timeout: 9000 })
  if (!next) throw new Error('empty follow-up')
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

await check('Double-click a chat on the brain: it unfolds into its prompts', async () => {
  await page.getByRole('button', { name: 'Fit the whole lab' }).click()
  await wait(900)
  const id = await visibleNode(['c-traffic', 'c-pairs', 'c-drift', 'c-rft', 'c-stuck', 'c-grant'])
  const p = await nodeAt(id)
  await page.mouse.dblclick(p.x, p.y)
  await wait(1700)
  const hits = await promptHits()
  if (!hits.some((h) => h.kind === 'row')) throw new Error('no prompt card')
  await shot('zoom-dblclick')
  await page.keyboard.press('Escape')
  await wait(700)
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
  try {
    await dragNodeTo(await visibleNode(['c-traffic', 'c-pairs', 'c-drift', 'c-rft']), '.rail--right')
    await wait(200)
    await expectVisible('.newchat-drop.is-over')
    await shot('drag-to-new-chat')
  } finally {
    await page.mouse.up()
  }
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
  const first = await visibleNode(['p-review', 'f-onboard', 'c-onboard', 'c-grant', 'c-review', 'r-bed'])
  try {
    await dragNodeTo(first, '.chat')
    await wait(150)
    await expectVisible('.tray.is-over')
    await shot('drag-tether')
  } finally {
    await page.mouse.up()
  }
  await wait(260)
  await shot('drag-flight')
  await wait(900)
  await shot('drag-landed')
  const second = await visibleNode(['c-agenda', 'c-safety', 'f-agenda', 'f-safety', 'c-grant', 'c-review', 'r-bed'].filter((x) => x !== first))
  try {
    await dragNodeTo(second, '.chat')
  } finally {
    await page.mouse.up()
  }
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

await check('Zoom into a chat: prompts unfold, a prompt jumps to its message, a file opens', async () => {
  await page.locator('.brain__level').getByRole('button', { name: 'Chat', exact: true }).click()
  await wait(1700)
  const hits = await promptHits()
  const rows = hits.filter((h) => h.kind === 'row')
  const files = hits.filter((h) => h.kind === 'file')
  if (rows.length < 3) throw new Error(`${rows.length} prompt rows`)
  await shot('zoom')
  await page.mouse.click(rows[1].x, rows[1].y)
  await expectVisible('.msg.is-flash', 4000)
  if (!files.length) throw new Error('no prompt files')
  const again = (await promptHits()).filter((h) => h.kind === 'file')
  await page.mouse.click(again[0].x, again[0].y)
  await expectVisible('.viewer-panel')
  await page.locator('.viewer-panel').getByRole('button', { name: 'Close' }).click()
  await page.locator('.brain__level').getByRole('button', { name: 'Topic', exact: true }).click()
  await wait(900)
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
  await expectVisible('.tour__card')
  const total = Number((await page.locator('.tour__count').innerText()).split(/\s+of\s+/i)[1])
  if (total < 14) throw new Error(`only ${total} steps`)
  for (let i = 0; i < total; i++) {
    await expectVisible('.tour__card').catch(() => { throw new Error(`step ${i + 1}: card missing`) })
    await wait(750)
    const title = await page.locator('.tour__title').innerText()
    const show = page.locator('.tour__actions > .btn:not(.btn--primary):not(.btn--ghost)')
    if (await show.count()) {
      await show.click()
      await wait(/Drag anything|Zoom into/.test(title) ? 2400 : 900)
      if (await page.locator('.viewer-panel, .modal').count()) await page.keyboard.press('Escape')
    }
    if (/Drag anything/.test(title)) await shot('tour-drag')
    if (/Zoom into/.test(title)) {
      await shot('tour-zoom')
      if (!(await promptHits()).length) throw new Error('tour zoom: no prompt card')
    }
    await page.locator('.tour__nav .btn--primary').click({ timeout: 6000 }).catch((e) => { throw new Error(`step ${i + 1}: ${e.message.split('\n')[0]}`) })
  }
  if (await page.locator('.tour__card').count()) throw new Error('tour still open')
})

await check('Cortex logo returns home', async () => {
  await page.getByRole('button', { name: 'Cortex home: the whole lab' }).click()
  await wait(600)
  await shot('end')
})

await check('Ambient (busy): teammates ask on their own, and someone notices your chat', async () => {
  await page.goto(`${base}?theme=light&ambient=busy`)
  await wait(1200)
  await search().fill('What is robophysics?')
  await search().press('Enter')
  await expectVisible('.msg--ai .sources', 9000)
  await page.locator('.toast', { hasText: 'reading your chat' }).waitFor({ timeout: 25000 })
  await page.waitForFunction(() => [...document.querySelectorAll('.feed__item')].some((li) => /asked the Lab AI in/.test(li.textContent ?? '') && !/^You/.test((li.textContent ?? '').trim())), null, { timeout: 25000 })
  await page.getByRole('button', { name: /Notifications/ }).click()
  await page.locator('.notice', { hasText: 'opened your chat' }).first().click()
  await expectVisible('.chat')
  await page.getByRole('button', { name: 'Cortex home: the whole lab' }).click()
  await wait(9000)
  await shot('ambient')
})

await browser.close()
for (const r of results) console.log(r[0].padEnd(5), r[1], r[2] ? `  ← ${r[2]}` : '')
console.log(`\n${results.filter((r) => r[0] === 'ok').length}/${results.length} passed`)
if (errors.length) console.log('Page errors:\n' + [...new Set(errors)].join('\n'))
