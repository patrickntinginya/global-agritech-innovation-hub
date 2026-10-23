// Wording corrected after the backend arrived (replaces older Phase 1 prototype text). Merged last.
export default {
  // ---- Wording updated now that the Hub has a real backend (overrides older Phase 1 text) ----
  footer: { rights: '© {year} Global AgriTech Innovation Hub.' },
  notices: { noBackend: { title: 'Preview only.', body: 'This form is not connected to a database, so nothing you enter here is sent or saved.' } },
  contact: {
    desc: 'Questions about the Hub? Send us a message. It is stored in the Hub database and read by administrators.',
    detailsBody: 'Messages sent through this form are stored in the Hub database. Public contact details have not been published yet.',
    previewNote: 'Messages are stored in the Hub database and can only be read by administrators.',
    consent: 'I understand this message will be stored and read by the Hub team',
  },
  about: {
    status: 'Accounts, saved items, submissions, community posts and administrator tools work in this version. Sample content from the original prototype is marked as such.',
    statusNoticeTitle: 'Sample content',
    phase: 'Listings, courses, experts, startups and discussions seeded from the original prototype are samples written for design review and are marked as such. They do not describe real products, people, partnerships or research results. Accounts, saved items, submissions and community posts are real and stored in the Hub database. Content added by administrators and members is not verified by this version of the Hub.',
  },
  legal: {
    draftLine: 'Draft text for review',
    draftNotice: 'Draft text. It is not legal advice and must be reviewed by a qualified professional before launch.',
    privacy: { intro: 'How the Hub handles personal information. Draft wording: it must be reviewed before launch.' },
    terms: { intro: 'The rules for using the Hub. Draft wording: it must be reviewed before launch.' },
  },
  privacy: {
    sections: [
      { h: 'What the Hub collects', p: 'If you create an account the Hub stores your email address, display name, role, country, bio and interests, your saved items, notification choices and notifications, your content submissions and your community posts. A contact message stores the name, email address and message you type. Passwords are handled by the sign-in service and are never stored in the Hub\'s own tables.' },
      { h: 'Who can see it', p: 'Your profile, saved items and notifications are visible only to you. Contact messages and submissions can be read only by Hub administrators. Community posts are public and show your display name.' },
      { h: 'What is stored in your browser', p: 'Your language choice and, while you are signed in, a session kept by the sign-in service so you stay signed in after reloading the page. No advertising or analytics cookies are used.' },
      { h: 'Service providers', p: 'The Hub uses Supabase for its database and sign-in and a web hosting provider to serve the site. They process data on the Hub\'s behalf. Before launch the Hub operator must name the providers and the regions where data is stored.' },
      { h: 'Keeping and deleting data', p: 'To have your data deleted, use the Contact page. Self-service deletion is not available yet. A retention period must be set before launch.' },
      { h: 'Contact', p: 'Use the Contact page for questions about privacy.' },
    ],
  },
  terms: {
    sections: [
      { h: 'Sample content', p: 'Content marked as sample or demonstration was written for design review. It is not real and may be removed at any time.' },
      { h: 'No professional advice', p: 'Nothing on the Hub is veterinary, agronomic, legal or financial advice. Check decisions with qualified local professionals.' },
      { h: 'Accounts', p: 'You are responsible for your password and for activity on your account. Give accurate information and do not share your account.' },
      { h: 'Content and conduct', p: 'Posts and submissions must be respectful, accurate and lawful, and must not contain personal data about other people. Administrators can hide or remove content that breaks these rules and may review every submission before anything is published.' },
      { h: 'Availability', p: 'The Hub is provided as it is, may change, and may be unavailable at times.' },
      { h: 'Changes', p: 'These terms are draft wording and will be replaced with full terms reviewed by a qualified professional before launch.' },
    ],
  },
  community: { demoNotice: 'This thread is sample content from the original prototype. It is not a real conversation.' },
  submit: { desc: 'Tell us about an agricultural technology. An administrator reviews every submission before anything is published.' },
  user: { settingsBody: 'Change your display name, role and notification choices.' },
  notifications: { desc: 'Notifications sent to your account.' },
  settings: { changePassword: 'Change password' },
  auth: { passwordHint: 'At least 8 characters. Your password is handled by the sign-in service and is never stored by the Hub.' },
  profile: { desc: 'Update how you appear on the Hub.' },
};
