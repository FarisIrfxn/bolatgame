// After-shots for the Oct 27 playtest QC: every boss HUD at desktop size.
import { openZone } from './lib.mjs';
const out = 'art/playtest-qc/after';
for (const boss of (process.argv[2]?.split(',') ?? ['bowat', 'bolat', 'snorlax', 'blep', 'megabowat', 'bolatex', 'finale'])) {
  const { browser, page, errors } = await openZone('labulanjut', { width: 1280, height: 720, save: { cards: [1,2,3,4,5,6,7,8], flags: { introSeen: true, endingSeen: true } } });
  await page.evaluate(b => { void window.__pokelove.playBoss(b, { zone: 'labulanjut', spawn: 'start' }); }, boss);
  await page.locator('.mg-go').waitFor({ timeout: 20000 }); await page.locator('.mg-go').click();
  await page.waitForTimeout(boss === 'bolat' ? 6000 : 3500);
  if (boss === 'bolat') { await page.keyboard.down('ArrowUp'); await page.waitForTimeout(200); await page.keyboard.up('ArrowUp'); await page.waitForTimeout(800); }
  await page.screenshot({ path: `${out}/boss-${boss}.png` });
  console.log(boss, errors.length ? errors : 'ok');
  await browser.close();
}
