// DEMONSTRATION expert profiles. All names and biographies are invented and do not describe real people.
const b = (en, sw) => ({ en, sw });

const rawExperts = [
  { id: 'e1', name: 'Demo Expert One', countryId: 'africa', area: 'irrigation',
    areaLabel: b('Irrigation and water management', 'Umwagiliaji na usimamizi wa maji'),
    bio: b('Invented profile showing how an expert page will look. Interested in low-cost irrigation for small farms.', 'Wasifu uliobuniwa unaoonyesha jinsi ukurasa wa mtaalamu utakavyoonekana. Anapendezwa na umwagiliaji wa gharama nafuu kwa mashamba madogo.'),
    expertise: b(['Drip systems', 'Water budgeting', 'Farmer training'], ['Mifumo ya matone', 'Bajeti ya maji', 'Mafunzo kwa wakulima']) },
  { id: 'e2', name: 'Demo Expert Two', countryId: 'netherlands', area: 'greenhouse',
    areaLabel: b('Greenhouse production', 'Uzalishaji wa nyumba kitalu'),
    bio: b('Invented profile. Works on climate control and crop scheduling inside greenhouses.', 'Wasifu uliobuniwa. Hufanya kazi ya udhibiti wa hali ya hewa na ratiba ya mazao ndani ya nyumba kitalu.'),
    expertise: b(['Climate control', 'Crop scheduling', 'Energy saving'], ['Udhibiti wa hali ya hewa', 'Ratiba ya mazao', 'Kuokoa nishati']) },
  { id: 'e3', name: 'Demo Expert Three', countryId: 'india', area: 'soil',
    areaLabel: b('Soil health', 'Afya ya udongo'),
    bio: b('Invented profile. Focuses on simple soil testing and fertilizer planning for smallholders.', 'Wasifu uliobuniwa. Anaangazia upimaji rahisi wa udongo na mpango wa mbolea kwa wakulima wadogo.'),
    expertise: b(['Soil testing', 'Fertilizer planning', 'Composting'], ['Upimaji wa udongo', 'Mpango wa mbolea', 'Mboji']) },
  { id: 'e4', name: 'Demo Expert Four', countryId: 'china', area: 'livestock',
    areaLabel: b('Livestock systems', 'Mifumo ya mifugo'),
    bio: b('Invented profile. Interested in poultry housing and herd monitoring technology.', 'Wasifu uliobuniwa. Anapendezwa na makazi ya kuku na teknolojia ya kufuatilia mifugo.'),
    expertise: b(['Poultry housing', 'Herd monitoring', 'Feed planning'], ['Makazi ya kuku', 'Ufuatiliaji wa mifugo', 'Mpango wa malisho']) },
  { id: 'e5', name: 'Demo Expert Five', countryId: 'africa', area: 'extension',
    areaLabel: b('Agricultural extension and training', 'Ugani wa kilimo na mafunzo'),
    bio: b('Invented profile. Explains new tools to farmer groups in plain language.', 'Wasifu uliobuniwa. Huelezea zana mpya kwa vikundi vya wakulima kwa lugha rahisi.'),
    expertise: b(['Farmer groups', 'Demonstration plots', 'Training design'], ['Vikundi vya wakulima', 'Mashamba darasa', 'Usanifu wa mafunzo']) },
  { id: 'e6', name: 'Demo Expert Six', countryId: 'russia', area: 'mechanization',
    areaLabel: b('Mechanization and precision farming', 'Mashine na kilimo sahihi'),
    bio: b('Invented profile. Works on machinery choice and field mapping for larger farms.', 'Wasifu uliobuniwa. Hufanya kazi ya uchaguzi wa mashine na ramani za mashamba makubwa.'),
    expertise: b(['Machinery choice', 'Field mapping', 'Planting accuracy'], ['Uchaguzi wa mashine', 'Ramani za shamba', 'Usahihi wa upandaji']) },
];

export const expertAreas = ['irrigation', 'greenhouse', 'soil', 'livestock', 'extension', 'mechanization'];

// `initial` feeds the avatar and the translated sample name.
export const experts = rawExperts.map((e, n) => ({ ...e, initial: String.fromCharCode(65 + n) }));
