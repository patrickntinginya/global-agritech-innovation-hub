// Bundles the app for the browser checks with the stand-in backend. Needs esbuild (installed with Vite).
// Env: HARNESS_MODULES = extra node_modules directory to resolve react / esbuild from (optional).
//      USE_ROUTER_SHIM=1 = use tests/browser/rr-shim.jsx instead of react-router-dom (only if it cannot be installed).
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '../..');
const extra = process.env.HARNESS_MODULES;
const req = createRequire(extra ? path.join(extra, 'x.js') : path.join(root, 'package.json'));
const esbuild = req('esbuild');
const out = process.env.SITE_DIR || '/tmp/agritech-site';
fs.rmSync(out, { recursive: true, force: true });
const alias = { '@supabase/supabase-js': path.join(here, 'fake-client-stub.mjs') };
if (process.env.USE_ROUTER_SHIM) alias['react-router-dom'] = path.join(here, 'rr-shim.jsx');
await esbuild.build({
  entryPoints: { main: path.join(root, 'src/main.jsx') }, bundle: true, splitting: true, format: 'esm', outdir: out, logLevel: 'warning',
  jsx: 'automatic', loader: { '.css': 'css' }, alias, nodePaths: extra ? [extra] : [],
  define: {
    'process.env.NODE_ENV': '"production"',
    'import.meta.env': JSON.stringify({ DEV: true, VITE_SUPABASE_URL: 'https://fake.supabase.test', VITE_SUPABASE_ANON_KEY: 'anon-test-key', VITE_APP_URL: '' }),
  },
});
fs.writeFileSync(path.join(out, 'index.html'), '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Global AgriTech Innovation Hub</title><link rel="stylesheet" href="/main.css"></head><body><div id="root"></div><script type="module" src="/main.js"></script></body></html>');
console.log('built into', out);
