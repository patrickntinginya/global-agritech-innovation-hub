// DEMONSTRATION startups. All company names are invented and do not refer to real organizations.
const b = (en, sw) => ({ en, sw });

const rawStartups = [
  { id: 's1', name: 'Demo Startup AgroSense', countryId: 'africa', categoryId: 'smart-farming', stage: 'early',
    description: b('Invented company building low-cost field sensors.', 'Kampuni iliyobuniwa inayojenga vitambuzi vya shamba vya gharama nafuu.'),
    solutions: b(['Soil moisture probe', 'Farm dashboard app'], ['Kipimo cha unyevu wa udongo', 'Programu ya dashibodi ya shamba']) },
  { id: 's2', name: 'Demo Startup HerdWatch', countryId: 'other-regions', categoryId: 'livestock-technology', stage: 'growing',
    description: b('Invented company working on herd health monitoring.', 'Kampuni iliyobuniwa inayofanya kazi ya ufuatiliaji wa afya ya mifugo.'),
    solutions: b(['Ear tag monitor', 'Vet alert service'], ['Kifuatiliaji cha kitambulisho cha sikio', 'Huduma ya tahadhari kwa daktari wa mifugo']) },
  { id: 's3', name: 'Demo Startup SunCold', countryId: 'africa', categoryId: 'renewable-energy', stage: 'early',
    description: b('Invented company offering solar cold storage for farmer groups.', 'Kampuni iliyobuniwa inayotoa hifadhi baridi ya jua kwa vikundi vya wakulima.'),
    solutions: b(['Shared cold room', 'Pay-per-use storage'], ['Chumba baridi cha pamoja', 'Uhifadhi wa kulipa kwa matumizi']) },
  { id: 's4', name: 'Demo Startup FieldMarket', countryId: 'africa', categoryId: 'marketplace-tech', stage: 'growing',
    description: b('Invented company connecting farmers with buyers.', 'Kampuni iliyobuniwa inayounganisha wakulima na wanunuzi.'),
    solutions: b(['Buyer matching app', 'Price board'], ['Programu ya kuunganisha wanunuzi', 'Ubao wa bei']) },
  { id: 's5', name: 'Demo Startup SkyRows', countryId: 'china', categoryId: 'agricultural-drones', stage: 'established',
    description: b('Invented company providing drone survey services.', 'Kampuni iliyobuniwa inayotoa huduma za uchunguzi kwa ndege zisizo na rubani.'),
    solutions: b(['Field survey service', 'Crop stress maps'], ['Huduma ya uchunguzi wa shamba', 'Ramani za mazao yenye changamoto']) },
  { id: 's6', name: 'Demo Startup PlantPredict', countryId: 'india', categoryId: 'ai-in-agriculture', stage: 'early',
    description: b('Invented company building yield forecasting tools.', 'Kampuni iliyobuniwa inayojenga zana za kukadiria mavuno.'),
    solutions: b(['Yield forecast tool', 'Planting calendar'], ['Zana ya kukadiria mavuno', 'Kalenda ya upandaji']) },
];

export const startupStages = ['early', 'growing', 'established'];

export const startups = rawStartups.map((s, n) => ({ ...s, letter: String.fromCharCode(65 + n) }));

// Focus areas used by the startup filter: the technology categories that startups here belong to.
export const startupFocuses = [...new Set(rawStartups.map((s) => s.categoryId))];
