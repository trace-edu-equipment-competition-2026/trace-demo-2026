import { test, expect, type Locator, type Page } from '@playwright/test'

// Measure rendered text (including nested captions) against composited backgrounds.
async function readable(button: Locator, minimum = 4.5) {
 const rows = await button.evaluate(el => {
  const rgba = (value: string) => { const c = value.match(/[\d.]+/g)!.map(Number); return c.length === 3 ? [...c, 1] : c }
  const blend = (fg: number[], bg: number[]) => fg.slice(0, 3).map((c, i) => c * fg[3] + bg[i] * (1 - fg[3]))
  const luminance = (rgb: number[]) => rgb.map(c => { c /= 255; return c <= .04045 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4 }).reduce((sum, c, i) => sum + c * [.2126, .7152, .0722][i], 0)
  return [el, ...el.querySelectorAll('*')].filter(e => [...e.childNodes].some(n => n.nodeType === 3 && n.textContent?.trim()) && e.getBoundingClientRect().height || e.matches('.sidebar-collapse-icon')).map(e => {
   const layers: number[][] = []
   for (let parent: Element | null = e; parent; parent = parent.parentElement) layers.unshift(rgba(getComputedStyle(parent).backgroundColor))
   const bg = layers.reduce((base, color) => blend(color, base), [255, 255, 255])
   const light = [luminance(blend(rgba(getComputedStyle(e).color), bg)), luminance(bg)].sort((a, b) => b - a)
   return { text: e.textContent, ratio: (light[0] + .05) / (light[1] + .05) }
  })
 })
 for (const row of rows) expect(row.ratio, `${row.text}: text contrast`).toBeGreaterThanOrEqual(minimum)
}
async function states(page: Page, button: Locator, minimum = 4.5) {
 await page.mouse.move(0, 0)
 await readable(button, minimum)
 await button.hover()
 await readable(button, minimum)
 await page.mouse.down()
 try { await readable(button, minimum) } finally { await page.mouse.move(0, 0); await page.mouse.up() }
 await button.focus()
 await readable(button, minimum)
}
async function menu(page: Page) {
 const opener = page.getByRole('button', { name: '수업 메뉴 열기', exact: true })
 if (await opener.isVisible() && !await page.locator('.sidebar.open').count()) await opener.click()
}
for (const width of [1440, 1180, 820]) test(`버튼 글씨는 선택·호버·누름·포커스 상태에서 읽힌다 (${width}px)`, async ({ page }) => {
 await page.setViewportSize({ width, height: 1080 })
 await page.emulateMedia({ reducedMotion: 'reduce' })
 await page.goto('/')
 await menu(page)
 const collapse = page.getByRole('button', { name: '사이드바 닫기', exact: true })
 await states(page, collapse, 3)
 await collapse.hover()
 await page.screenshot({ path: `.impeccable/review/button-sidebar-${width}.png`, fullPage: true })
 for (const button of await page.locator('.sidebar nav button, .sidebar-dropdown-trigger').all()) await states(page, button)
 await page.getByRole('button', { name: '프로필 전환', exact: true }).click()
 for (const button of await page.locator('.dropdown-option').all()) await states(page, button)
 await page.keyboard.press('Escape')
 await page.getByRole('button', { name: '프로젝트 · 과제 생성', exact: true }).click()
 for (const button of await page.locator('.step-tabs button, .segmented button, .project-type button').all()) await states(page, button)
 await page.getByRole('button', { name: 'AI 운영 방식 설정', exact: true }).click()
 for (const name of ['교수자 직접', 'AI 자동', '교수자 승인형']) {
  const tab = page.getByRole('tab', { name, exact: true })
  await tab.click()
  await expect(tab).toHaveAttribute('aria-selected', 'true')
  for (const button of await page.locator('.mode-tabs button').all()) await states(page, button)
 }
 await page.getByRole('tab', { name: '교수자 승인형', exact: true }).hover()
 await page.screenshot({ path: `.impeccable/review/button-contrast-${width}.png`, fullPage: true })
})
