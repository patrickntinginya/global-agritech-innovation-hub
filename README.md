# Global AgriTech Innovation Hub: Phase 1 (frontend only)

React 18 + Vite 5 + React Router 6, plain CSS. No UI library, no backend, no AI services, no paid services.
Everything on screen is **demonstration content**. Nothing is saved to a server and there is no real authentication.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run build        # production build into dist/
npm run preview      # serve the production build
npm run check:i18n   # English/Kiswahili dictionary check (no install needed)
```

Netlify: build command `npm run build`, publish directory `dist`. `public/_redirects` holds the single-page-app fallback.

## What is in Phase 1

**Public site:** homepage (sections A to K); Explore Innovations (keyword search, category / country / sector /
application filters, sort, grid and list views, pagination, clear filters, loading / error / empty states; filters live
in the URL); innovation detail pages; 14 category pages; 7 country and region pages; Global Technology Directory;
Smart Farming and Livestock Technology pages; Research & Knowledge; Knowledge Library with article pages; Courses and
course pages; Experts; Community with discussion pages and a local reply preview; Startups, startup and organization
profiles; Partnerships and Opportunities; Submit an Innovation; global Search across innovations, articles, courses,
experts and startups; About; Contact; Privacy Policy; Terms of Service; custom 404 page; error boundary.

**Account prototype (no real accounts):** Sign In, Registration, Dashboard, Profile, Saved Innovations, Notifications,
Account Settings, with the eight future roles (farmer, extension officer, researcher, student, startup, technology
developer, investor, organization).

**Admin interface (no access control):** Overview plus 14 sections: innovations, categories, countries and regions,
articles and research, courses, experts, startups and partnerships, community moderation, users, media library,
contact messages, notifications, SEO settings, platform settings. Sidebar, responsive layout, data tables with search,
filters and pagination, add / edit forms with validation, delete confirmation, empty and loading states.

**English and Kiswahili:** one dictionary system in `src/i18n/`. `t('key')` for interface text, `loc({ en, sw })` for
content records. Switching the language changes the whole interface, the page `lang` attribute and is remembered
(the language choice is the only thing stored in the browser).

## Honesty notes

- All innovations, articles, courses, experts, startups, discussions and opportunities are fictional samples and are labelled so.
  Courses are not accredited and cannot be joined. Expert and organization names are placeholders.
- Bookmarks, recently viewed items, admin edits and community replies live in React state only and disappear on reload.
- Sign In, Registration, Contact, Submit, Expert and Partnership forms validate input, then say plainly that nothing was
  sent or saved. Passwords are cleared on submit and never stored.
- The admin area is open to anyone in Phase 1. Real authentication, permissions and saving arrive in Phase 2.
- Artwork is lightweight SVG placeholder graphics, not photographs.

## Structure

```
src/
  components/   shared UI (Layout, Navigation, Footer, cards, forms, Modal, Pagination, Tabs, states ...)
  context/      BookmarksContext, RecentlyViewedContext (in memory only)
  data/         demonstration content and route / taxonomy lists
  hooks/        useAsync, useFilters (URL state), useValidation, usePageTitle
  i18n/         en*.js / sw*.js dictionaries (merged in index.jsx) + provider
  pages/        public pages; pages/user and pages/admin are lazy-loaded bundles
  services/     contentService.js, innovationService.js: the only place pages get data
  styles/       global.css, pages.css, ui.css
scripts/check-i18n.mjs
```

## Preparing for Phase 2 (Supabase)

Pages never import data files directly. They call `src/services/*`, which return Promises. Replace the bodies of those
functions with Supabase queries and keep the signatures. Records already carry stable `id`s, `{ en, sw }` fields and
category / country ids, so they map to tables. Forms already validate on the client; add server validation, auth and
row-level security in Phase 2.

## Verification status (please read)

Run in the build environment, which had no access to the npm registry:

- `npm run check:i18n`: passes (English and Kiswahili have identical keys; every key used in source exists).
- The source was bundled with esbuild and exercised in headless Chromium using a small stand-in for React Router
  (not shipped). Result: all 118 routes in both languages render without console errors, missing translation keys, or
  horizontal overflow at 360px; 19 scripted flows pass (language switching, all directory filters, sort, list view,
  pagination, bookmarks, search, form validation, dialogs, admin add / edit / delete, mobile menu).

**Not done:** `npm install` and `npm run build` with the real Vite and React Router were not run here, so the production
build is unverified. Run `npm install && npm run build` first and report any error. No automated tests are included in
the package. Lighthouse and screen-reader testing have not been done.

## Known limitations

- Demonstration names such as "Demo Expert One" are not translated into Kiswahili.
- Kiswahili demonstration text was written without review by a native speaker and should be proofread.
- Several older stylesheet rules in `pages.css` are now unused.
