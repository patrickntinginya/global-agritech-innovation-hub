// DEMONSTRATION courses. Not accredited and not available for enrolment.
const b = (en, sw) => ({ en, sw });

export const courseCategories = ['crop', 'livestock', 'technology', 'climate', 'business', 'digital'];

export const courses = [
  {
    id: 'modern-crop-farming', level: 'beginner', weeks: 6, icon: 'sprout', category: 'crop', relatedCategoryId: 'smart-farming',
    title: b('Modern crop farming', 'Kilimo cha kisasa cha mazao'),
    description: b('Sample outline: land preparation, seed choice, spacing and field records.', 'Muhtasari wa mfano: maandalizi ya shamba, uchaguzi wa mbegu, nafasi za upandaji na kumbukumbu za shamba.'),
    modules: { en: ['Preparing the land', 'Choosing seed and spacing', 'Keeping field records'], sw: ['Kuandaa shamba', 'Kuchagua mbegu na nafasi', 'Kutunza kumbukumbu za shamba'] },
  },
  {
    id: 'livestock-management', level: 'beginner', weeks: 6, icon: 'cow', category: 'livestock', relatedCategoryId: 'livestock-technology',
    title: b('Livestock management', 'Usimamizi wa mifugo'),
    description: b('Sample outline: housing, feeding, basic health checks and herd records.', 'Muhtasari wa mfano: makazi, ulishaji, ukaguzi wa msingi wa afya na kumbukumbu za mifugo.'),
    modules: { en: ['Housing and water', 'Feeding basics', 'Health checks and herd records'], sw: ['Makazi na maji', 'Misingi ya ulishaji', 'Ukaguzi wa afya na kumbukumbu za mifugo'] },
  },
  {
    id: 'agricultural-technology', level: 'intermediate', weeks: 8, icon: 'chip', category: 'technology', relatedCategoryId: 'precision-agriculture',
    title: b('Agricultural technology', 'Teknolojia ya kilimo'),
    description: b('Sample outline: sensors, drones and software, and how to judge what suits a farm.', 'Muhtasari wa mfano: vitambuzi, ndege zisizo na rubani na programu, na jinsi ya kuamua kinachofaa shamba.'),
    modules: { en: ['Sensors and data', 'Drones and imagery', 'Choosing technology that fits'], sw: ['Vitambuzi na data', 'Ndege zisizo na rubani na picha', 'Kuchagua teknolojia inayofaa'] },
  },
  {
    id: 'climate-smart-agriculture', level: 'intermediate', weeks: 5, icon: 'sun', category: 'climate', relatedCategoryId: 'smart-irrigation',
    title: b('Climate-smart agriculture', 'Kilimo kinachostahimili tabianchi'),
    description: b('Sample outline: water saving, soil cover and planning for uneven rainfall.', 'Muhtasari wa mfano: kuokoa maji, kufunika udongo na kupanga kwa mvua zisizo za uhakika.'),
    modules: { en: ['Saving and storing water', 'Protecting the soil', 'Planning for uncertain seasons'], sw: ['Kuokoa na kuhifadhi maji', 'Kulinda udongo', 'Kupanga kwa misimu isiyo ya uhakika'] },
  },
  {
    id: 'farm-business-management', level: 'intermediate', weeks: 6, icon: 'cart', category: 'business', relatedCategoryId: 'marketplace-tech',
    title: b('Farm business management', 'Usimamizi wa biashara ya shamba'),
    description: b('Sample outline: costs, pricing, simple accounts and finding buyers.', 'Muhtasari wa mfano: gharama, bei, hesabu rahisi na kutafuta wanunuzi.'),
    modules: { en: ['Knowing your costs', 'Pricing and records', 'Finding and keeping buyers'], sw: ['Kujua gharama zako', 'Bei na kumbukumbu', 'Kutafuta na kuwabakiza wanunuzi'] },
  },
  {
    id: 'digital-farming', level: 'advanced', weeks: 8, icon: 'laptop', category: 'digital', relatedCategoryId: 'farm-software',
    title: b('Digital farming', 'Kilimo cha kidijitali'),
    description: b('Sample outline: farm data, record-keeping apps and using data to decide.', 'Muhtasari wa mfano: data za shamba, programu za kumbukumbu na kutumia data kufanya maamuzi.'),
    modules: { en: ['Collecting farm data', 'Record-keeping apps', 'Using data to decide'], sw: ['Kukusanya data za shamba', 'Programu za kumbukumbu', 'Kutumia data kufanya maamuzi'] },
  },
];

export const courseTopics = courseCategories;
export const courseLevels = ['beginner', 'intermediate', 'advanced'];
