import { bi } from './helpers.js';

// Demonstration records for the admin and user interfaces. Invented; nothing is real.
export const demoUserProfile = {
  displayName: 'Sample Member',
  role: 'farmer',
  country: 'Tanzania',
  interests: ['smart-irrigation', 'soil-health', 'livestock-technology'],
};

export const userRoles = ['farmer', 'officer', 'researcher', 'student', 'startup', 'developer', 'investor', 'organization'];

export const demoNotifications = [
  { id: 'n1', kind: 'content', when: '2026-10-12', text: bi('A new guide matching your interests was added (sample notification).', 'Mwongozo mpya unaolingana na mapendeleo yako umeongezwa (arifa ya mfano).') },
  { id: 'n2', kind: 'community', when: '2026-10-10', text: bi('Someone replied to a question you followed (sample notification).', 'Mtu amejibu swali ulilofuatilia (arifa ya mfano).') },
  { id: 'n3', kind: 'learning', when: '2026-10-07', text: bi('A course outline you viewed has new modules (sample notification).', 'Muhtasari wa kozi uliyotazama una moduli mpya (arifa ya mfano).') },
];

export const demoLearningActivity = [
  { courseId: 'modern-crop-farming', progress: 40 },
  { courseId: 'climate-smart-agriculture', progress: 15 },
];

export const demoCommunityActivity = [
  { discussionId: 'd1', action: 'following' },
  { discussionId: 'd4', action: 'asked' },
];

export const adminUsers = [
  { id: 'u1', name: 'Demo User 1', email: 'user1@example.invalid', role: 'farmer', status: 'active', joinedAt: '2026-08-02' },
  { id: 'u2', name: 'Demo User 2', email: 'user2@example.invalid', role: 'researcher', status: 'active', joinedAt: '2026-08-14' },
  { id: 'u3', name: 'Demo User 3', email: 'user3@example.invalid', role: 'officer', status: 'active', joinedAt: '2026-08-30' },
  { id: 'u4', name: 'Demo User 4', email: 'user4@example.invalid', role: 'student', status: 'pending', joinedAt: '2026-09-11' },
  { id: 'u5', name: 'Demo User 5', email: 'user5@example.invalid', role: 'startup', status: 'active', joinedAt: '2026-09-19' },
  { id: 'u6', name: 'Demo User 6', email: 'user6@example.invalid', role: 'investor', status: 'suspended', joinedAt: '2026-09-23' },
  { id: 'u7', name: 'Demo User 7', email: 'user7@example.invalid', role: 'developer', status: 'active', joinedAt: '2026-10-01' },
  { id: 'u8', name: 'Demo User 8', email: 'user8@example.invalid', role: 'organization', status: 'pending', joinedAt: '2026-10-05' },
];

export const adminMedia = [
  { id: 'm1', name: 'hero-field.svg', type: 'image', size: '24 KB', addedAt: '2026-09-01' },
  { id: 'm2', name: 'drip-kit-diagram.svg', type: 'image', size: '18 KB', addedAt: '2026-09-04' },
  { id: 'm3', name: 'soil-guide.pdf', type: 'document', size: '1.2 MB', addedAt: '2026-09-10' },
  { id: 'm4', name: 'cold-room-case.pdf', type: 'document', size: '860 KB', addedAt: '2026-09-18' },
  { id: 'm5', name: 'course-intro.mp4', type: 'video', size: '14 MB', addedAt: '2026-09-25' },
  { id: 'm6', name: 'partner-logos.zip', type: 'archive', size: '3.4 MB', addedAt: '2026-10-02' },
];

export const adminMessages = [
  { id: 'c1', name: 'Demo Sender 1', email: 'sender1@example.invalid', subject: bi('Question about listing an innovation', 'Swali kuhusu kuorodhesha ubunifu'), status: 'new', receivedAt: '2026-10-12', body: bi('This is a sample message used to show how contact messages will be listed.', 'Huu ni ujumbe wa mfano unaoonyesha jinsi jumbe za mawasiliano zitakavyoorodheshwa.') },
  { id: 'c2', name: 'Demo Sender 2', email: 'sender2@example.invalid', subject: bi('Partnership enquiry', 'Swali kuhusu ushirikiano'), status: 'read', receivedAt: '2026-10-09', body: bi('This is a sample message about a partnership. It was not sent by a real person.', 'Huu ni ujumbe wa mfano kuhusu ushirikiano. Haukutumwa na mtu halisi.') },
  { id: 'c3', name: 'Demo Sender 3', email: 'sender3@example.invalid', subject: bi('Course feedback', 'Maoni kuhusu kozi'), status: 'replied', receivedAt: '2026-10-04', body: bi('This is a sample feedback message created for design review.', 'Huu ni ujumbe wa mfano wa maoni uliotengenezwa kwa ajili ya mapitio ya muundo.') },
  { id: 'c4', name: 'Demo Sender 4', email: 'sender4@example.invalid', subject: bi('Report a problem on a page', 'Ripoti tatizo kwenye ukurasa'), status: 'new', receivedAt: '2026-10-14', body: bi('This is a sample problem report used to demonstrate the table and detail view.', 'Hii ni ripoti ya mfano ya tatizo inayoonyesha jedwali na mwonekano wa maelezo.') },
];

export const adminNotifications = [
  { id: 'an1', title: 'Welcome to the Hub', audience: 'all', status: 'draft', createdAt: '2026-10-01' },
  { id: 'an2', title: 'New guides this month', audience: 'farmer', status: 'draft', createdAt: '2026-10-06' },
  { id: 'an3', title: 'Challenge deadline reminder', audience: 'startup', status: 'draft', createdAt: '2026-10-10' },
];

export const adminRegionRows = null; // derived from data/countries.js in the admin config

// Pages that have editable SEO settings in the admin interface.
export const seoPages = [
  { id: 'home', path: '/', title: bi('Global AgriTech Innovation Hub', 'Kituo cha Kimataifa cha Ubunifu wa Teknolojia ya Kilimo'), description: bi('Discover agricultural technologies, knowledge and partnerships.', 'Gundua teknolojia za kilimo, maarifa na ushirikiano.'), indexed: 'yes' },
  { id: 'explore', path: '/explore', title: bi('Explore Innovations', 'Gundua Ubunifu'), description: bi('Search agricultural technologies by category, country and sector.', 'Tafuta teknolojia za kilimo kwa kategoria, nchi na sekta.'), indexed: 'yes' },
  { id: 'library', path: '/library', title: bi('Knowledge Library', 'Maktaba ya Maarifa'), description: bi('Guides, case studies and research summaries.', 'Miongozo, tafiti za kesi na muhtasari wa utafiti.'), indexed: 'yes' },
  { id: 'courses', path: '/courses', title: bi('Courses and Masterclasses', 'Kozi na Semina Maalum'), description: bi('Demonstration course outlines for farmers and advisers.', 'Muhtasari wa kozi za mfano kwa wakulima na washauri.'), indexed: 'yes' },
  { id: 'community', path: '/community', title: bi('Community', 'Jamii'), description: bi('Questions and discussions about farming and livestock.', 'Maswali na majadiliano kuhusu kilimo na mifugo.'), indexed: 'no' },
];
