import { userRoles } from './taxonomies.js';

export const communityRoles = [
  { id: 'farmers', icon: 'sprout' },
  { id: 'researchers', icon: 'layers' },
  { id: 'officers', icon: 'users' },
  { id: 'students', icon: 'book' },
  { id: 'startups', icon: 'rocket' },
  { id: 'developers', icon: 'chip' },
  { id: 'organizations', icon: 'building' },
];

export const partnershipCards = [
  { id: 'startups', icon: 'rocket', to: '/startups' },
  { id: 'developers', icon: 'chip', to: '/startups#solutions' },
  { id: 'research', icon: 'layers', to: '/partnerships' },
  { id: 'challenges', icon: 'target', to: '/partnerships#challenges' },
  { id: 'organizations', icon: 'building', to: '/startups#organizations' },
  { id: 'collaboration', icon: 'handshake', to: '/partnerships' },
];

export { userRoles };
