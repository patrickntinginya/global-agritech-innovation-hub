// DEMONSTRATION knowledge items. They are written as samples and are NOT verified research.
// `type` matches keys in research.types in the dictionaries.
const b = (en, sw) => ({ en, sw });

const rawKnowledge = [
  {
    id: 'k1', type: 'summary', sector: 'crop', date: '2026-09-12', categoryIds: ['smart-irrigation'],
    title: b('What recent studies say about drip irrigation and yield', 'Tafiti za hivi karibuni zinasema nini kuhusu umwagiliaji wa matone na mavuno'),
    summary: b('Sample summary of how water-saving systems affect harvests.', 'Muhtasari wa mfano wa jinsi mifumo ya kuokoa maji inavyoathiri mavuno.'),
    body: {
      en: ['This is a demonstration summary. It shows how a research summary page will look, and it does not report real findings.', 'A real entry would state the study question, the method, the main result and its limits, then link to the original source.'],
      sw: ['Huu ni muhtasari wa mfano. Unaonyesha jinsi ukurasa wa muhtasari wa utafiti utakavyoonekana, na hauripoti matokeo halisi.', 'Kipengee halisi kingeeleza swali la utafiti, mbinu, matokeo makuu na mipaka yake, kisha kuunganisha na chanzo asili.'],
    },
  },
  {
    id: 'k2', type: 'caseStudy', sector: 'crop', date: '2026-08-30', categoryIds: ['renewable-energy', 'processing'],
    title: b('A smallholder group adopts solar cold storage', 'Kikundi cha wakulima wadogo kinapokea hifadhi baridi ya jua'),
    summary: b('Sample case study about reducing post-harvest losses.', 'Utafiti wa kesi wa mfano kuhusu kupunguza hasara baada ya mavuno.'),
    body: {
      en: ['This is an invented example, not a real group or result. It shows the layout for case studies.', 'A real case study would describe the starting problem, what was installed, what changed and what the group would do differently.'],
      sw: ['Huu ni mfano uliobuniwa, si kikundi au matokeo halisi. Unaonyesha mpangilio wa tafiti za kesi.', 'Utafiti halisi wa kesi ungeeleza tatizo la mwanzo, kilichowekwa, kilichobadilika na ambacho kikundi kingefanya tofauti.'],
    },
  },
  {
    id: 'k3', type: 'cropGuide', sector: 'crop', date: '2026-09-01', categoryIds: ['soil-health'],
    title: b('A practical guide to soil testing before planting', 'Mwongozo wa vitendo wa kupima udongo kabla ya kupanda'),
    summary: b('Sample guide on taking soil samples and reading results.', 'Mwongozo wa mfano wa kuchukua sampuli za udongo na kusoma matokeo.'),
    body: {
      en: ['This sample guide shows how step-by-step farming guides will be laid out. The advice is general and should be checked with a local extension officer.', 'Typical sections: when to sample, how many spots to sample, how to label bags, and how to use the results when choosing inputs.'],
      sw: ['Mwongozo huu wa mfano unaonyesha jinsi miongozo ya kilimo ya hatua kwa hatua itakavyopangwa. Ushauri ni wa jumla na unapaswa kuhakikiwa na afisa ugani wa eneo lako.', 'Sehemu za kawaida: lini kuchukua sampuli, maeneo mangapi, jinsi ya kuweka lebo kwenye mifuko, na kutumia matokeo kuchagua pembejeo.'],
    },
  },
  {
    id: 'k4', type: 'livestockGuide', sector: 'livestock', date: '2026-09-18', categoryIds: ['livestock-technology'],
    title: b('Keeping dairy cows healthy through the dry season', 'Kuweka ng\u2019ombe wa maziwa wenye afya wakati wa kiangazi'),
    summary: b('Sample guide on feeding, water and shade.', 'Mwongozo wa mfano kuhusu malisho, maji na kivuli.'),
    body: {
      en: ['This is a demonstration guide. Animal health advice should always be confirmed with a qualified veterinarian.', 'A real guide would cover feed budgeting, clean water access, shade and signs that an animal needs a vet.'],
      sw: ['Huu ni mwongozo wa mfano. Ushauri wa afya ya wanyama lazima uthibitishwe na daktari wa mifugo aliyehitimu.', 'Mwongozo halisi ungehusu bajeti ya malisho, upatikanaji wa maji safi, kivuli na dalili kwamba mnyama anahitaji daktari.'],
    },
  },
  {
    id: 'k5', type: 'climate', sector: 'both', date: '2026-08-15', categoryIds: ['smart-farming', 'smart-irrigation'],
    title: b('Planning crops around uneven rainfall', 'Kupanga mazao kulingana na mvua zisizo za uhakika'),
    summary: b('Sample overview of climate-smart planting choices.', 'Muhtasari wa mfano wa uchaguzi wa upandaji unaostahimili tabianchi.'),
    body: {
      en: ['This is a sample overview. It shows how climate-smart agriculture topics will be presented.', 'A real article would compare crop and variety choices, planting dates, water storage and soil cover, with local data.'],
      sw: ['Huu ni muhtasari wa mfano. Unaonyesha jinsi mada za kilimo kinachostahimili tabianchi zitakavyowasilishwa.', 'Makala halisi ingelinganisha mazao na aina, tarehe za kupanda, uhifadhi wa maji na kufunika udongo, kwa data za eneo.'],
    },
  },
  {
    id: 'k6', type: 'implementation', sector: 'both', date: '2026-07-22', categoryIds: ['farm-software'],
    title: b('Rolling out a farm record app across a cooperative', 'Kuanzisha programu ya kumbukumbu za shamba katika chama cha ushirika'),
    summary: b('Sample walkthrough of training, devices and follow-up.', 'Mfano wa hatua za mafunzo, vifaa na ufuatiliaji.'),
    body: {
      en: ['This is a made-up implementation example for layout purposes. No real cooperative is described.', 'A real example would list the steps taken, the time and cost involved, the problems met and the lessons learned.'],
      sw: ['Huu ni mfano wa utekelezaji uliobuniwa kwa ajili ya mpangilio. Hakuna chama halisi kinachoelezwa.', 'Mfano halisi ungeorodhesha hatua zilizochukuliwa, muda na gharama, matatizo yaliyojitokeza na mafunzo yaliyopatikana.'],
    },
  },
  {
    id: 'k7', type: 'livestockGuide', sector: 'livestock', date: '2026-06-28', categoryIds: ['livestock-technology'],
    title: b('Poultry house ventilation basics', 'Misingi ya uingizaji hewa katika banda la kuku'),
    summary: b('Sample guide to airflow, heat and chick comfort.', 'Mwongozo wa mfano kuhusu mzunguko wa hewa, joto na starehe ya vifaranga.'),
    body: {
      en: ['This is a demonstration guide and not a verified recommendation. Ask a poultry specialist before changing a house.', 'A real guide would explain airflow, heat, humidity and how to read bird behaviour as a signal.'],
      sw: ['Huu ni mwongozo wa mfano na si pendekezo lililohakikiwa. Muulize mtaalamu wa kuku kabla ya kubadilisha banda.', 'Mwongozo halisi ungeeleza mzunguko wa hewa, joto, unyevu na jinsi ya kusoma tabia ya ndege kama ishara.'],
    },
  },
  {
    id: 'k8', type: 'summary', sector: 'crop', date: '2026-09-25', categoryIds: ['agricultural-drones', 'crop-protection'],
    title: b('Drone imagery for early pest detection: a review', 'Picha za ndege zisizo na rubani kugundua wadudu mapema: mapitio'),
    summary: b('Sample review of how aerial images flag crop stress.', 'Mapitio ya mfano ya jinsi picha za angani zinavyoonyesha mazao yenye changamoto.'),
    body: {
      en: ['This is a sample review page, not a real literature review.', 'A real review would list the studies included, how they were chosen, what they agree on and where evidence is thin.'],
      sw: ['Huu ni ukurasa wa mfano wa mapitio, si mapitio halisi ya machapisho.', 'Mapitio halisi yangeorodhesha tafiti zilizojumuishwa, jinsi zilivyochaguliwa, wanachokubaliana na pale ushahidi ni mdogo.'],
    },
  },
];

export const knowledgeTypes = ['summary', 'caseStudy', 'cropGuide', 'livestockGuide', 'climate', 'implementation'];

// `minutes` is a sample reading time used by the article cards.
export const knowledgeItems = rawKnowledge.map((item, n) => ({ ...item, minutes: 4 + (n % 4) * 2 }));
