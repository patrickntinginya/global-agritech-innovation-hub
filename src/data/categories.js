// Demonstration data. `applications` ids are translated through the dictionary (applications.<id>).
// `blurb` describes the category; `consider` is one category-specific implementation note.
const c = (id, icon, apps, title, blurb, consider) => ({
  id, icon, applications: apps,
  title: { en: title[0], sw: title[1] },
  blurb: { en: blurb[0], sw: blurb[1] },
  consider: { en: consider[0], sw: consider[1] },
});

export const applications = [
  'water-saving', 'pest-disease', 'soil-fertility', 'crop-monitoring', 'herd-health', 'feed-nutrition',
  'climate-control', 'post-harvest', 'market-access', 'farm-planning', 'mechanization', 'energy-access',
];

export const categories = [
  c('smart-farming', 'sprout', ['farm-planning', 'crop-monitoring'], ['Smart Farming', 'Kilimo Janja'],
    ['Connected sensors, controllers and data tools that help run a farm with fewer guesses.', 'Vitambuzi, vidhibiti na zana za data zinazosaidia kuendesha shamba kwa makadirio machache.'],
    ['Start with one measurement that matters, such as rainfall or soil moisture, before adding more devices.', 'Anza na kipimo kimoja muhimu, kama mvua au unyevu wa udongo, kabla ya kuongeza vifaa zaidi.']),
  c('precision-agriculture', 'target', ['soil-fertility', 'crop-monitoring'], ['Precision Agriculture', 'Kilimo Sahihi'],
    ['Methods that apply seed, water and nutrients where and when each part of a field needs them.', 'Mbinu zinazotumia mbegu, maji na virutubisho mahali na wakati kila sehemu ya shamba inapohitaji.'],
    ['Good field maps and records matter as much as the equipment itself.', 'Ramani nzuri za shamba na kumbukumbu ni muhimu kama vifaa vyenyewe.']),
  c('ai-in-agriculture', 'chip', ['pest-disease', 'crop-monitoring'], ['Artificial Intelligence in Agriculture', 'Akili Bandia katika Kilimo'],
    ['Models that read images and data to flag pests, forecast yields and support decisions.', 'Mifumo inayosoma picha na data kutambua wadudu, kukadiria mavuno na kusaidia maamuzi.'],
    ['Treat suggestions as a first opinion and confirm important decisions with an adviser.', 'Chukulia mapendekezo kama maoni ya kwanza na thibitisha maamuzi muhimu na mshauri.']),
  c('agricultural-drones', 'drone', ['crop-monitoring', 'pest-disease'], ['Agricultural Drones', 'Ndege zisizo na Rubani za Kilimo'],
    ['Aerial platforms for scouting fields, mapping and targeted spraying.', 'Majukwaa ya angani ya kukagua mashamba, kuchora ramani na kunyunyizia kwa lengo.'],
    ['Check local flight rules and operator requirements before buying or hiring.', 'Angalia kanuni za ndege za eneo na mahitaji ya waendeshaji kabla ya kununua au kukodi.']),
  c('smart-irrigation', 'droplet', ['water-saving', 'energy-access'], ['Smart Irrigation', 'Umwagiliaji Janja'],
    ['Systems that deliver water in the right amount at the right time, often with solar power.', 'Mifumo inayotoa maji kwa kiasi sahihi wakati sahihi, mara nyingi kwa nguvu ya jua.'],
    ['Water quality affects blockages, so ask about filters and cleaning.', 'Ubora wa maji huathiri kuziba, kwa hiyo uliza kuhusu vichujio na usafishaji.']),
  c('soil-health', 'layers', ['soil-fertility'], ['Soil Health Technology', 'Teknolojia ya Afya ya Udongo'],
    ['Tools for testing soil and guiding fertilizer, cover and rotation choices.', 'Zana za kupima udongo na kuongoza uchaguzi wa mbolea, kifuniko na mzunguko wa mazao.'],
    ['Take samples the same way each time so results can be compared across seasons.', 'Chukua sampuli kwa njia ileile kila mara ili matokeo yalinganishwe katika misimu.']),
  c('agricultural-robotics', 'robot', ['mechanization', 'herd-health'], ['Agricultural Robotics', 'Roboti za Kilimo'],
    ['Machines that take on repetitive field and dairy tasks such as weeding and milking.', 'Mashine zinazofanya kazi za kurudia-rudia shambani na kwenye maziwa kama palizi na kukamua.'],
    ['Robots need reliable power, trained operators and nearby technical support.', 'Roboti zinahitaji umeme wa uhakika, waendeshaji waliofunzwa na msaada wa kiufundi karibu.']),
  c('greenhouse', 'greenhouse', ['climate-control', 'water-saving'], ['Greenhouse Technology', 'Teknolojia ya Nyumba Kitalu'],
    ['Structures and controls that keep heat, humidity and light steady for crops.', 'Miundo na vidhibiti vinavyoweka joto, unyevu na mwanga thabiti kwa mazao.'],
    ['Ventilation and disease control matter as much as the structure itself.', 'Uingizaji hewa na udhibiti wa magonjwa ni muhimu kama muundo wenyewe.']),
  c('crop-protection', 'shield', ['pest-disease'], ['Crop Protection', 'Ulinzi wa Mazao'],
    ['Approaches for watching and reducing pest, disease and weed pressure.', 'Mbinu za kufuatilia na kupunguza shinikizo la wadudu, magonjwa na magugu.'],
    ['Follow product labels and local advice, and keep spray records.', 'Fuata maelekezo ya bidhaa na ushauri wa eneo, na uweke kumbukumbu za unyunyiziaji.']),
  c('livestock-technology', 'cow', ['herd-health', 'feed-nutrition', 'climate-control'], ['Livestock Technology', 'Teknolojia ya Mifugo'],
    ['Tags, controllers and records that support animal health, feeding and housing.', 'Vitambulisho, vidhibiti na kumbukumbu zinazosaidia afya ya wanyama, ulishaji na makazi.'],
    ['Technology supports, but does not replace, regular checks by a qualified veterinarian.', 'Teknolojia inasaidia, lakini haibadilishi, ukaguzi wa kawaida na daktari wa mifugo aliyehitimu.']),
  c('farm-software', 'laptop', ['farm-planning', 'market-access'], ['Farm Management Software', 'Programu za Usimamizi wa Shamba'],
    ['Apps and services for records, advice, planning and farm finances.', 'Programu na huduma za kumbukumbu, ushauri, mipango na fedha za shamba.'],
    ['Check that the tool works offline and in your language before relying on it.', 'Hakikisha zana inafanya kazi bila mtandao na kwa lugha yako kabla ya kuitegemea.']),
  c('processing', 'factory', ['post-harvest', 'market-access'], ['Agricultural Processing', 'Usindikaji wa Mazao ya Kilimo'],
    ['Drying, chilling and processing equipment that adds value and cuts losses.', 'Vifaa vya kukausha, kupoza na kusindika vinavyoongeza thamani na kupunguza hasara.'],
    ['Hygiene and quality standards for your market affect which equipment you can use.', 'Viwango vya usafi na ubora vya soko lako huathiri vifaa unavyoweza kutumia.']),
  c('renewable-energy', 'sun', ['energy-access', 'post-harvest'], ['Renewable Energy for Agriculture', 'Nishati Mbadala kwa Kilimo'],
    ['Solar and other clean power for pumps, cold rooms and processing.', 'Nishati ya jua na safi nyingine kwa pampu, vyumba baridi na usindikaji.'],
    ['Size the system for your real daily load and plan for battery or panel replacement.', 'Pima ukubwa wa mfumo kulingana na mzigo wako halisi wa kila siku na upange kubadilisha betri au paneli.']),
  c('marketplace-tech', 'cart', ['market-access'], ['Agricultural Marketplace Technology', 'Teknolojia ya Masoko ya Kilimo'],
    ['Platforms that connect sellers, buyers and price information.', 'Majukwaa yanayounganisha wauzaji, wanunuzi na taarifa za bei.'],
    ['Check fees, payment methods and how disputes are handled before listing produce.', 'Angalia ada, njia za malipo na jinsi migogoro inavyoshughulikiwa kabla ya kuorodhesha mazao.']),
];

export const categoryById = Object.fromEntries(categories.map((x) => [x.id, x]));
