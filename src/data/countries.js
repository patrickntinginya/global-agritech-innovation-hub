// Demonstration data. Descriptions are generic placeholders, not verified facts.
export const countries = [
  {
    id: 'china',
    tone: 'a',
    name: { en: 'China', sw: 'China' },
    description: {
      en: 'Sample listing: drones, smart farm platforms and large-scale automation.',
      sw: 'Orodha ya mfano: ndege zisizo na rubani, majukwaa ya mashamba janja na uendeshaji wa kiotomatiki.',
    },
  },
  {
    id: 'russia',
    tone: 'b',
    name: { en: 'Russia', sw: 'Urusi' },
    description: {
      en: 'Sample listing: large-field grain production and heavy mechanization.',
      sw: 'Orodha ya mfano: uzalishaji wa nafaka kwenye mashamba makubwa na matumizi ya mashine nzito.',
    },
  },
  {
    id: 'israel',
    tone: 'c',
    name: { en: 'Israel', sw: 'Israeli' },
    description: {
      en: 'Sample listing: water-efficient irrigation and arid-land farming methods.',
      sw: 'Orodha ya mfano: umwagiliaji unaotumia maji kwa ufanisi na mbinu za kilimo cha maeneo kame.',
    },
  },
  {
    id: 'netherlands',
    tone: 'd',
    name: { en: 'Netherlands', sw: 'Uholanzi' },
    description: {
      en: 'Sample listing: greenhouse horticulture and precision growing systems.',
      sw: 'Orodha ya mfano: kilimo cha bustani ndani ya nyumba kitalu na mifumo ya uzalishaji sahihi.',
    },
  },
  {
    id: 'india',
    tone: 'e',
    name: { en: 'India', sw: 'India' },
    description: {
      en: 'Sample listing: phone-based advisory and low-cost tools for smallholders.',
      sw: 'Orodha ya mfano: ushauri kupitia simu na zana za gharama nafuu kwa wakulima wadogo.',
    },
  },
  {
    id: 'africa',
    tone: 'f',
    name: { en: 'Africa', sw: 'Afrika' },
    description: {
      en: 'Sample listing: home-grown tools, from mobile advisory to solar cold storage.',
      sw: 'Orodha ya mfano: zana za nyumbani, kuanzia ushauri wa simu hadi hifadhi baridi ya jua.',
    },
  },
  {
    id: 'other-regions',
    tone: 'g',
    name: { en: 'Other Regions', sw: 'Kanda Nyingine' },
    description: {
      en: 'Sample listing: ideas from the Americas, Europe, Oceania and beyond.',
      sw: 'Orodha ya mfano: mawazo kutoka Amerika, Ulaya, Oceania na kwingineko.',
    },
  },
];

export const countryById = Object.fromEntries(countries.map((c) => [c.id, c]));
