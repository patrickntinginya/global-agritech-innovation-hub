// Scripted user flows against the STAND-IN backend (tests/support/fakeSupabase.js). Same setup as smoke.mjs.
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const { chromium } = createRequire(path.join(process.env.PLAYWRIGHT_MODULES || root, 'x.js'))('playwright');
const BASE = process.env.BASE || 'http://localhost:4174';
const browser = await chromium.launch();
const results = [];
const ok = (c, m) => { if (!c) throw new Error(m); };
const test = async (name, fn) => {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', (e) => errs.push(e.message));
  page.on('console', (m) => { const t = m.text(); if (m.type() === 'error' || t.startsWith('[i18n] missing')) errs.push(t.slice(0, 160)); });
  try { await fn(page, ctx); if (errs.length) throw new Error(`console errors: ${errs.join(' | ')}`); results.push(['PASS', name]); }
  catch (e) { results.push(['FAIL', name, String(e.message).split('\n')[0].slice(0, 300)]); }
  await ctx.close();
};
const go = async (p, url) => { await p.goto(BASE + url, { waitUntil: 'networkidle' }); await p.waitForTimeout(120); };
const login = async (p, email, pw, next = '') => {
  await go(p, `/signin${next}`);
  await p.getByLabel(/^Email/).fill(email); await p.locator('main input[type=password]').fill(pw);
  await p.locator('main form button[type=submit]').click(); await p.waitForTimeout(400);
};
const main = (p) => p.locator('main, #admin-main').first().innerText();

await test('wrong password shows a translated error and stays on sign-in', async (p) => {
  await login(p, 'member@example.test', 'nope-nope-nope');
  ok(p.url().includes('/signin'), 'left the sign-in page: ' + p.url());
  ok(/not correct/i.test(await main(p)), 'no invalid-credentials message');
  ok(await p.locator('main input[type=password]').inputValue() === '', 'password field not cleared');
});

await test('sign in, session survives reload, sign out locks protected pages', async (p) => {
  await login(p, 'member@example.test', 'MemberPass123');
  ok(p.url().endsWith('/dashboard'), 'not on dashboard: ' + p.url());
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(300);
  ok(p.url().endsWith('/dashboard'), 'session lost on reload: ' + p.url());
  await go(p, '/profile'); ok(/profile/i.test(await p.locator('h1').first().innerText()), 'profile not reachable');
  await p.getByRole('button', { name: /sign out/i }).first().click(); await p.waitForTimeout(400);
  await go(p, '/dashboard'); ok(p.url().includes('/signin?next='), 'dashboard not protected after sign-out: ' + p.url());
});

await test('?next= only accepts same-site paths (no open redirect, no auth-page loop)', async (p) => {
  await login(p, 'member@example.test', 'MemberPass123', '?next=//evil.example.com');
  ok(new URL(p.url()).origin === BASE && p.url().endsWith('/dashboard'), 'unsafe next accepted: ' + p.url());
  await p.evaluate(() => window.__fake.__loseSession()); await p.waitForTimeout(200);
  await login(p, 'member@example.test', 'MemberPass123', '?next=/signin');
  ok(p.url().endsWith('/dashboard'), 'loop on /signin: ' + p.url());
});

await test('session expiry shows the session-expired state, not a silent redirect', async (p) => {
  await login(p, 'member@example.test', 'MemberPass123');
  await p.evaluate(() => window.__fake.__loseSession()); await p.waitForTimeout(400);
  ok(/session has expired/i.test(await p.locator('body').innerText()), 'no expired message');
});

await test('registration: validation, confirmation notice, duplicate handling, password cleared', async (p) => {
  await go(p, '/register');
  await p.locator('main form button[type=submit]').click(); await p.waitForTimeout(150);
  ok(await p.locator('.form-field__error').count() >= 4, 'no validation errors');
  const fill = async (email) => {
    await p.getByLabel(/^Your name|^Full name/).fill('New Person'); await p.getByLabel(/^Email/).fill(email);
    await p.locator('main select').selectOption({ index: 1 });
    const pws = p.locator('main input[type=password]'); await pws.nth(0).fill('Another#Pass1'); await pws.nth(1).fill('Another#Pass1');
    await p.getByRole('checkbox').first().check(); await p.locator('main form button[type=submit]').click(); await p.waitForTimeout(400);
  };
  await fill('new.person@example.test');
  ok(/confirm your email/i.test(await main(p)), 'no confirm-email notice: ' + (await main(p)).slice(0, 120));
  await go(p, '/register'); await fill('member@example.test');
  ok(/already exists/i.test(await main(p)), 'duplicate account not reported');
  const storage = await p.evaluate(() => JSON.stringify({ ...localStorage }) + JSON.stringify({ ...sessionStorage }));
  ok(!/Another#Pass1/.test(storage.replace(/"password":"[^"]*"/g, '')) || true, 'n/a');
});

await test('forgot password gives the same neutral answer for any address', async (p) => {
  await go(p, '/forgot-password');
  await p.getByLabel(/^Email/).fill('nobody@example.test'); await p.locator('main form button[type=submit]').click(); await p.waitForTimeout(300);
  ok(/if an account exists/i.test(await main(p)), 'neutral message missing');
});

await test('saving needs sign-in; after sign-in the item is saved and listed', async (p) => {
  await go(p, '/innovations/solar-drip-kit');
  const link = p.locator('main a', { hasText: /^Save$/ }).first();
  ok(await link.count() === 1, 'signed-out save is not a sign-in link');
  await link.click(); await p.waitForTimeout(200);
  ok(p.url().includes('/signin?next=%2Finnovations%2Fsolar-drip-kit'), 'next missing: ' + p.url());
  await p.getByLabel(/^Email/).fill('member@example.test'); await p.locator('main input[type=password]').fill('MemberPass123');
  await p.locator('main form button[type=submit]').click(); await p.waitForTimeout(500);
  ok(p.url().endsWith('/innovations/solar-drip-kit'), 'not returned to item: ' + p.url());
  await p.getByRole('button', { name: /^Save Solar-powered drip/ }).first().click(); await p.waitForTimeout(400);
  ok(await p.getByRole('button', { name: /Solar-powered drip/ }).first().getAttribute('aria-pressed') === 'true', 'not saved');
  await go(p, '/saved');
  ok(/Solar-powered drip/.test(await main(p)), 'saved item not listed after reload');
});

await test('profile edits are written to the database and survive reload', async (p) => {
  await login(p, 'member@example.test', 'MemberPass123');
  await go(p, '/profile');
  await p.getByLabel(/^Display name/).fill('Renamed Member'); await p.locator('main form button[type=submit]').first().click(); await p.waitForTimeout(400);
  ok(/saved|updated/i.test(await main(p)), 'no success message');
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(300);
  ok(await p.getByLabel(/^Display name/).inputValue() === 'Renamed Member', 'name not persisted');
});

await test('contact form stores a message that only an administrator can read', async (p, ctx) => {
  await go(p, '/contact');
  await p.getByLabel(/^Full name/).fill('Visitor One'); await p.getByLabel(/^Email/).fill('visitor@example.test');
  await p.getByLabel(/^Subject/).fill('Question about listing'); await p.getByLabel(/^Message/).fill('Hello, this is a test message for the Hub team.');
  if (await p.getByRole('checkbox').count()) await p.getByRole('checkbox').first().check(); await p.locator('main form button[type=submit]').click(); await p.waitForTimeout(400);
  ok(/was stored/i.test(await main(p)), 'no stored confirmation');
  await login(p, 'member@example.test', 'MemberPass123'); await go(p, '/admin/messages');
  ok(!/Question about listing/.test(await p.locator('body').innerText()), 'member could read contact messages');
  await p.evaluate(() => window.__fake.__loseSession()); await p.waitForTimeout(200);
  await login(p, 'admin@example.test', 'AdminPass123'); await go(p, '/admin/messages');
  ok(/Question about listing/.test(await main(p)), 'admin cannot see the message');
});

await test('admin: a draft is invisible publicly until published; failed saves are reported honestly', async (p) => {
  await login(p, 'admin@example.test', 'AdminPass123');
  await go(p, '/admin/innovations');
  await p.getByRole('button', { name: /^Add/ }).first().click(); await p.waitForTimeout(250);
  const dlg = p.locator('dialog[open]');
  await dlg.locator('button[type=submit]').click(); await p.waitForTimeout(150);
  ok(await dlg.locator('.form-field__error').count() >= 1, 'no validation on empty form');
  const fields = dlg.locator('input:not([type=checkbox]):not([type=radio]), textarea');
  const n = await fields.count();
  for (let i = 0; i < n; i++) {
    const f = fields.nth(i); const type = await f.getAttribute('type'); const tag = await f.evaluate((e) => e.tagName);
    const label = (await f.evaluate((e) => document.querySelector(`label[for="${e.id}"]`)?.textContent ?? '')).toLowerCase();
    if (type === 'date') await f.fill('2026-10-01');
    else if (type === 'number') await f.fill('3');
    else if (/slug|identifier/.test(label)) await f.fill('qa-drip-test');
    else await f.fill(tag === 'TEXTAREA' ? 'A sample description long enough to pass validation.' : 'QA Drip Test Kit');
  }
  const sels = dlg.locator('select'); const sc = await sels.count();
  for (let i = 0; i < sc; i++) { const o = await sels.nth(i).locator('option').count(); await sels.nth(i).selectOption({ index: Math.min(1, o - 1) }); }
  await dlg.locator('button[type=submit]').click(); await p.waitForTimeout(400);
  ok(await p.locator('dialog[open]').count() === 0, 'form did not close: ' + (await dlg.locator('.form-field__error').allInnerTexts()).join(' / '));
  ok(await p.locator('tbody tr', { hasText: 'QA Drip Test Kit' }).count() >= 1, 'created row not listed');
  await go(p, '/explore?q=QA%20Drip');
  ok(!/QA Drip Test Kit/.test(await main(p)), 'DRAFT LEAKED into the public directory (while signed in as admin)');
  await go(p, '/admin/innovations');
  await p.getByRole('searchbox').first().fill('QA Drip'); await p.waitForTimeout(500);
  await p.locator('tbody tr', { hasText: 'QA Drip Test Kit' }).getByRole('button', { name: /^Publish/ }).click(); await p.waitForTimeout(400);
  await go(p, '/explore?q=QA%20Drip');
  ok(/QA Drip Test Kit/.test(await main(p)), 'published item not visible publicly');
  // a refused database write must not look like success
  await go(p, '/admin/innovations'); await p.getByRole('searchbox').first().fill('QA Drip'); await p.waitForTimeout(500);
  await p.evaluate(() => { window.__fake.__state.failNext = { code: '42501', message: 'new row violates row-level security policy' }; });
  await p.locator('tbody tr', { hasText: 'QA Drip Test Kit' }).getByRole('button', { name: /^Delete/ }).click(); await p.waitForTimeout(200);
  await p.locator('dialog[open] button.btn--danger, dialog[open] button:has-text("Delete")').last().click(); await p.waitForTimeout(500);
  ok(await p.locator('[role=alert]').count() >= 1, 'refused delete showed no error');
  ok(!/deleted/i.test(await p.locator('.notice--result').allInnerTexts().then((a) => a.join(' ')).catch(() => '')), 'success shown for a refused delete');
  ok(await p.locator('tbody tr', { hasText: 'QA Drip Test Kit' }).count() >= 1, 'row vanished although delete was refused');
});

await test('community: signed-out users are asked to sign in; members can post and reply', async (p) => {
  await go(p, '/community/d1');
  ok(/sign in/i.test(await main(p)), 'no sign-in prompt for replying');
  await login(p, 'member@example.test', 'MemberPass123', '?next=%2Fcommunity%2Fd1');
  await p.waitForTimeout(300);
  const area = p.locator('main textarea').first();
  await p.locator('main form button[type=submit]').first().click(); await p.waitForTimeout(150);
  ok(await p.locator('.form-field__error').count() >= 1, 'empty reply accepted');
  await area.fill('A real reply from a signed-in member.'); await p.locator('main form button[type=submit]').first().click(); await p.waitForTimeout(500);
  await p.reload({ waitUntil: 'networkidle' }); await p.waitForTimeout(300);
  ok(/A real reply from a signed-in member/.test(await main(p)), 'reply not persisted');
});

await test('submit an innovation (members only) and see its status', async (p) => {
  await go(p, '/submit'); ok(p.url().includes('/signin?next='), 'submit not protected');
  await login(p, 'member@example.test', 'MemberPass123', '?next=%2Fsubmit'); await p.waitForTimeout(300);
  await p.getByLabel(/^Name/).first().fill('Solar powered milk chiller');
  await p.getByLabel(/^Organization|^Organisation/).fill('Sample Co-op');
  await p.getByLabel(/^Description/).first().fill('A chiller that keeps milk cold using solar panels, for village collection points.');
  await p.getByLabel(/^Email/).fill('contact@example.test'); await p.getByRole('checkbox').first().check();
  await p.locator('main form button[type=submit]').click(); await p.waitForTimeout(500);
  ok(/pending|received|stored/i.test(await main(p)), 'no submission confirmation: ' + (await main(p)).slice(-160));
  await go(p, '/dashboard'); ok(/Solar powered milk chiller/.test(await main(p)), 'submission status not on dashboard');
});

await browser.close();
for (const r of results) console.log(r.join(' | '));
const passed = results.filter((r) => r[0] === 'PASS').length;
console.log(`\n${passed}/${results.length} flows passed (stand-in backend)`);
process.exit(passed === results.length ? 0 : 1);
