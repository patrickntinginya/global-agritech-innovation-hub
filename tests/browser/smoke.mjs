// Browser smoke test: renders routes in English and Kiswahili against the STAND-IN backend (tests/support/fakeSupabase.js).
// It checks the front end (rendering, guards, translations, flows). It does NOT test the real database or RLS.
// Run: build with tests/browser/build.mjs, serve with tests/browser/serve.mjs, then `node tests/browser/smoke.mjs`.
// Env: BASE (default http://localhost:4174), PLAYWRIGHT_MODULES (directory containing the playwright package).
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const req = createRequire(path.join(process.env.PLAYWRIGHT_MODULES || root, 'x.js'));
const { chromium } = req('playwright');
const BASE = process.env.BASE || 'http://localhost:4174';
const D = (m) => import(path.join(root, 'src/data', `${m}.js`));
const [inn, cat, cou, kn, co, di, st, pa] = await Promise.all(['innovations', 'categories', 'countries', 'knowledge', 'courses', 'discussions', 'startups', 'partnerships'].map(D));
const { adminNav } = await import(path.join(root, 'src/pages/admin/adminNav.js'));

const publicRoutes = ['/', '/explore', '/directory', '/categories', '/smart-farming', '/livestock', '/research', '/library', '/courses', '/experts', '/community',
  '/startups', '/partnerships', '/search?q=drip', '/about', '/contact', '/privacy', '/terms', '/signin', '/register', '/forgot-password',
  ...inn.innovations.map((x) => `/innovations/${x.id}`), ...cat.categories.map((x) => `/categories/${x.id}`), ...cou.countries.map((x) => `/countries/${x.id}`),
  ...kn.knowledgeItems.map((x) => `/library/${x.id}`), ...co.courses.map((x) => `/courses/${x.id}`), ...di.discussions.map((x) => `/community/${x.id}`),
  ...st.startups.map((x) => `/startups/${x.id}`), ...pa.organizations.map((x) => `/organizations/${x.id}`)];
const memberRoutes = ['/dashboard', '/profile', '/saved', '/notifications', '/settings', '/submit'];
const adminRoutes = adminNav.map((n) => n.to);
const notFound = ['/innovations/does-not-exist', '/library/zzz', '/courses/zzz', '/community/zzz', '/startups/zzz', '/nope/nothing'];

const browser = await chromium.launch();
const problems = [];
let checked = 0;

async function watch(page) {
  const log = { errors: [], missing: new Set() };
  page.on('pageerror', (e) => log.errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    const t = m.text();
    if (t.startsWith('[i18n] missing key:')) log.missing.add(t.replace('[i18n] missing key: ', ''));
    else if (m.type() === 'error') log.errors.push(`console: ${t.slice(0, 200)}`);
  });
  return log;
}
async function visit(page, log, lang, route, expect = 'page') {
  log.errors.length = 0; log.missing.clear();
  await page.goto(BASE + route, { waitUntil: 'networkidle' });
  await page.waitForTimeout(120);
  const info = await page.evaluate(() => ({
    h1: document.querySelectorAll('h1').length, h1Text: document.querySelector('h1')?.textContent?.trim() ?? '',
    title: document.title, lang: document.documentElement.lang, len: (document.querySelector('main, #admin-main') ?? document.body).innerText.length,
    skeleton: Boolean(document.querySelector('.skeleton')), overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth, path: location.pathname + location.search,
  }));
  checked++;
  const issues = [];
  if (log.errors.length) issues.push(`errors: ${log.errors.slice(0, 2).join(' | ')}`);
  if (log.missing.size) issues.push(`missing keys: ${[...log.missing].slice(0, 4).join(', ')}`);
  if (info.lang !== lang) issues.push(`html lang ${info.lang}`);
  if (info.skeleton) issues.push('loading skeleton still showing');
  if (info.overflow > 0) issues.push(`horizontal overflow ${info.overflow}px`);
  if (info.h1 !== 1) issues.push(`h1 count ${info.h1}`);
  const isNf = /not found|haujapatikana/i.test(info.h1Text);
  if (expect === '404' && !isNf) issues.push(`expected 404, got "${info.h1Text}"`);
  if (expect === 'page' && isNf) issues.push('unexpected 404');
  if (expect === 'page' && info.len < (/^\/admin\/(seo|settings)/.test(route) ? 60 : 150)) issues.push(`little content (${info.len})`);
  if (issues.length) problems.push(`[${lang}] ${route} -> ${info.path}: ${issues.join('; ')}`);
  return info;
}
async function signIn(page, email, password) {
  await page.goto(`${BASE}/signin`, { waitUntil: 'networkidle' });
  await page.getByLabel(/^Email|^Barua pepe/).fill(email);
  await page.locator('main input[type=password]').fill(password);
  await page.locator('main form button[type=submit]').click();
  await page.waitForFunction(() => !location.pathname.startsWith('/signin'), null, { timeout: 5000 }).catch(() => {});
}

for (const lang of ['en', 'sw']) {
  const ctx = await browser.newContext({ viewport: { width: Number(process.env.WIDTH || 1280), height: 900 } });
  await ctx.addInitScript((l) => { try { localStorage.setItem('agritech.lang', l); } catch { /* ignore */ } }, lang);
  const page = await ctx.newPage();
  const log = await watch(page);

  // 1. signed out: public pages render, protected pages redirect to sign-in with a safe ?next=
  for (const r of publicRoutes) await visit(page, log, lang, r);
  for (const r of notFound) await visit(page, log, lang, r, '404');
  for (const r of [...memberRoutes, '/admin', '/admin/innovations']) {
    const info = await visit(page, log, lang, r, 'any');
    if (!info.path.startsWith('/signin?next=')) problems.push(`[${lang}] signed-out ${r} did not redirect to sign-in (at ${info.path})`);
  }

  // 2. member session: user pages work, admin is forbidden (not merely hidden)
  await signIn(page, 'member@example.test', 'MemberPass123');
  for (const r of memberRoutes) await visit(page, log, lang, r);
  for (const r of ['/admin', '/admin/innovations', '/admin/messages']) {
    const info = await visit(page, log, lang, r, 'any');
    const body = await page.locator('body').innerText();
    if (/Messages from|Add new|Ongeza/i.test(body) || info.path.startsWith('/admin') === false) problems.push(`[${lang}] member could see admin content at ${r}`);
    if (!(await page.locator('[role=alert]').count())) problems.push(`[${lang}] member at ${r}: no forbidden state shown`);
  }
  await page.goto(`${BASE}/signin`, { waitUntil: 'networkidle' });
  if (!(await page.evaluate(() => location.pathname.startsWith('/dashboard')))) problems.push(`[${lang}] signed-in member visiting /signin was not redirected away`);

  // 3. admin session: every admin section renders
  await page.evaluate(() => sessionStorage.clear());
  await ctx.clearCookies();
  const page2 = await ctx.newPage();
  const log2 = await watch(page2);
  await signIn(page2, 'admin@example.test', 'AdminPass123');
  for (const r of adminRoutes) await visit(page2, log2, lang, r);
  await ctx.close();
}
await browser.close();
console.log(`${checked} page visits (both languages)`);
console.log(problems.length ? `PROBLEMS (${problems.length}):\n${problems.slice(0, 40).join('\n')}` : 'no problems found');
process.exit(problems.length ? 1 : 0);
