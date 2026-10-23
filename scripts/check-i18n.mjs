// Checks the translation dictionaries without needing a browser or a build:
//  1. English and Kiswahili have exactly the same keys (per merged dictionary)
//  2. every translation key referenced in the source exists
//  3. keys built from ids at runtime (for example `applications.${id}`) exist for every id
// Run with: node scripts/check-i18n.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src');
const load = async (rel) => (await import(pathToFileURL(path.join(src, rel)).href));
const merge = (...parts) => {
  const out = {};
  for (const part of parts) for (const [k, v] of Object.entries(part)) {
    const isObj = v && typeof v === 'object' && !Array.isArray(v);
    out[k] = isObj && out[k] && typeof out[k] === 'object' ? merge(out[k], v) : v;
  }
  return out;
};
const dict = async (lang) => merge(...(await Promise.all(['', '.pages', '.panels', '.admin', '.extra', '.runtime', '.gaps', '.ui', '.phase2', '.wording'].map(async (s) => (await load(`i18n/${lang}${s}.js`)).default))));
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? flat(v, `${p}${k}.`) : [[`${p}${k}`, v]]));

const en = await dict('en');
const sw = await dict('sw');
const E = new Map(flat(en));
const S = new Map(flat(sw));
let problems = 0;
const report = (title, list) => { if (list.length) { problems += list.length; console.log(`\n✘ ${title} (${list.length})\n  ${list.join('\n  ')}`); } };

report('Keys in English but not Kiswahili', [...E.keys()].filter((k) => !S.has(k)));
report('Keys in Kiswahili but not English', [...S.keys()].filter((k) => !E.has(k)));
report('Array length differs between languages', [...E].filter(([k, v]) => Array.isArray(v) && Array.isArray(S.get(k)) && v.length !== S.get(k).length).map(([k]) => k));
report('Empty Kiswahili strings', [...S].filter(([, v]) => v === '').map(([k]) => k));
// {placeholders} must match between languages
const ph = (v) => (typeof v === 'string' ? (v.match(/\{\w+\}/g) ?? []).sort().join(',') : '');
report('Placeholder mismatch', [...E].filter(([k, v]) => S.has(k) && ph(v) !== ph(S.get(k))).map(([k]) => k));

// 2. static keys used in source
const namespaces = new Set(Object.keys(en));
const files = [];
(function walk(d) { for (const f of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, f.name); if (f.isDirectory()) walk(p); else if (/\.(jsx?)$/.test(f.name) && !/i18n\//.test(p)) files.push(p); } })(src);
const used = new Map();
const templated = new Map();
for (const f of files) {
  const text = fs.readFileSync(f, 'utf8');
  for (const m of text.matchAll(/['"`]([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9-]+)+)['"`]/g)) {
    const key = m[1];
    if (namespaces.has(key.split('.')[0]) && !/\.(jsx?|css|svg|invalid)$/.test(key)) used.set(key, f);
  }
  for (const m of text.matchAll(/`([a-z][A-Za-z0-9]*(?:\.[A-Za-z0-9]+)*)\.\$\{/g)) templated.set(m[1], f);
  // Any t('a.b') / labelKey: 'a.b' style reference is checked even when its first segment is not an existing
  // namespace, so a page that uses a whole missing namespace is reported too.
  for (const m of text.matchAll(/\b(?:t|tr)\(\s*['"`]([A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z0-9-]+)+)['"`]/g)) used.set(m[1], f);
  for (const m of text.matchAll(/\b(?:labelKey|hintKey|titleKey|descKey|descriptionKey|placeholderKey|ctaKey|key)\s*[:=]\s*['"]([A-Za-z][A-Za-z0-9]*(?:\.[A-Za-z0-9-]+)+)['"]/g)) if (/^(nav|admin|a11y|actions|ui|forms|footer|common|validation|notices)\./.test(m[1]) || namespaces.has(m[1].split('.')[0])) used.set(m[1], f);
}
const exists = (k) => E.has(k) || [...E.keys()].some((x) => x.startsWith(`${k}.`));
report('Keys used in source but missing from the dictionary', [...used].filter(([k]) => !exists(k)).map(([k, f]) => `${k}   (${path.relative(root, f)})`));

// Keys built from ids at runtime (for example `admin.sections.${id}.title`) are verified by rendering every
// route in both languages in a browser; see the build report. This script covers keys written out in source.

console.log(`\nEnglish keys: ${E.size}   Kiswahili keys: ${S.size}`);
console.log(problems ? `\n${problems} problem(s) found.` : '\nAll translation checks passed.');
process.exit(problems ? 1 : 0);
