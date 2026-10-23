// Single source of truth for header navigation and the admin/user area menus.
export const mainNav = [
  { key: 'nav.home', to: '/' },
  { key: 'nav.explore', to: '/explore' },
  { key: 'nav.smartFarming', to: '/smart-farming' },
  { key: 'nav.livestock', to: '/livestock' },
  { key: 'nav.research', to: '/research' },
  { key: 'nav.learning', to: '/courses' },
  { key: 'nav.startups', to: '/startups' },
  { key: 'nav.community', to: '/community' },
  { key: 'nav.about', to: '/about' },
];

export const userNav = [
  { id: 'dashboard', to: '/dashboard', icon: 'layers' },
  { id: 'profile', to: '/profile', icon: 'users' },
  { id: 'saved', to: '/saved', icon: 'bookmark' },
  { id: 'settings', to: '/settings', icon: 'chip' },
];

// Admin sections in sidebar order (15 required by the Phase 1 brief).
export const adminSectionIds = [
  'overview', 'innovations', 'categories', 'countries', 'articles', 'courses', 'experts', 'startups',
  'community', 'users', 'media', 'messages', 'notifications', 'seo', 'settings',
];
export const adminIcons = {
  overview: 'layers', innovations: 'sprout', categories: 'target', countries: 'globe', articles: 'book', courses: 'book',
  experts: 'users', startups: 'rocket', community: 'shield', users: 'users', media: 'layers', messages: 'mail',
  notifications: 'bookmark', seo: 'search', settings: 'chip',
};
