import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const load = async (name) => (await import(path.join(root, 'src/i18n', name))).default;
const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? flat(v, `${p}${k}.`) : [[`${p}${k}`, v]]));

test('check:i18n script passes (every used key exists; English and Kiswahili are in sync)', () => {
  const run = spawnSync('node', ['scripts/check-i18n.mjs'], { cwd: root, encoding: 'utf8' });
  assert.equal(run.status, 0, run.stdout + run.stderr);
});

test('every Phase 2 key exists in both languages with the same variables and list lengths', async () => {
  for (const file of ['phase2', 'ui', 'wording']) {
    const en = new Map(flat(await load(`en.${file}.js`)));
    const sw = new Map(flat(await load(`sw.${file}.js`)));
    assert.deepEqual([...en.keys()].sort(), [...sw.keys()].sort(), `${file}: key sets differ`);
    for (const [k, v] of en) {
      if (typeof v !== 'string') continue;
      const vars = (s) => [...s.matchAll(/\{(\w+)\}/g)].map((m) => m[1]).sort().join(',');
      assert.equal(vars(sw.get(k)), vars(v), `${file}: placeholders differ in ${k}`);
      assert.ok(sw.get(k).trim().length > 0, `${file}: empty Kiswahili text for ${k}`);
    }
  }
});

test('the language preference is the only thing the app writes to localStorage', () => {
  const hits = [];
  (function walk(dir) {
    for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, f.name);
      if (f.isDirectory()) walk(p);
      else if (/\.(jsx?|mjs)$/.test(f.name)) {
        const s = fs.readFileSync(p, 'utf8');
        if (/localStorage\.setItem|sessionStorage\.setItem/.test(s)) hits.push(path.relative(root, p));
      }
    }
  })(path.join(root, 'src'));
  assert.deepEqual(hits, ['src/i18n/index.jsx']);
});
