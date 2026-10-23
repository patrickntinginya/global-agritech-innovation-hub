// Shared vocabularies. Each entry has an id and bilingual label.
export const applications = [
  { id: 'water', label: { en: 'Water management', sw: 'Usimamizi wa maji' } },
  { id: 'pests', label: { en: 'Pest and disease control', sw: 'Udhibiti wa wadudu na magonjwa' } },
  { id: 'soil', label: { en: 'Soil and fertility', sw: 'Udongo na rutuba' } },
  { id: 'monitoring', label: { en: 'Field and herd monitoring', sw: 'Ufuatiliaji wa shamba na mifugo' } },
  { id: 'harvest', label: { en: 'Harvest and post-harvest', sw: 'Mavuno na baada ya mavuno' } },
  { id: 'market', label: { en: 'Market access', sw: 'Upatikanaji wa masoko' } },
  { id: 'energy', label: { en: 'Energy supply', sw: 'Upatikanaji wa nishati' } },
  { id: 'animal-health', label: { en: 'Animal health', sw: 'Afya ya wanyama' } },
  { id: 'feeding', label: { en: 'Feeding and nutrition', sw: 'Ulishaji na lishe' } },
  { id: 'advisory', label: { en: 'Advice and decision support', sw: 'Ushauri na msaada wa maamuzi' } },
];
export const applicationById = Object.fromEntries(applications.map((a) => [a.id, a]));

export const sectors = [
  { id: 'crop', label: { en: 'Crop farming', sw: 'Kilimo cha mazao' } },
  { id: 'livestock', label: { en: 'Livestock', sw: 'Mifugo' } },
];

export const userRoles = [
  { id: 'farmer', icon: 'sprout', label: { en: 'Farmer', sw: 'Mkulima' } },
  { id: 'officer', icon: 'users', label: { en: 'Agricultural Extension Officer', sw: 'Afisa Ugani wa Kilimo' } },
  { id: 'researcher', icon: 'layers', label: { en: 'Researcher', sw: 'Mtafiti' } },
  { id: 'student', icon: 'book', label: { en: 'Student', sw: 'Mwanafunzi' } },
  { id: 'startup', icon: 'rocket', label: { en: 'Startup', sw: 'Kampuni changa' } },
  { id: 'developer', icon: 'chip', label: { en: 'Technology Developer', sw: 'Msanidi wa Teknolojia' } },
  { id: 'investor', icon: 'cart', label: { en: 'Investor', sw: 'Mwekezaji' } },
  { id: 'organization', icon: 'building', label: { en: 'Organization', sw: 'Shirika' } },
];
