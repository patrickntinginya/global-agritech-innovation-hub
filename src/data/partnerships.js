// Fictional demonstration opportunities, challenges and organizations. Not real offers.
export const opportunities = [
  { id: 'o1', type: 'pilot', status: 'open',
    title: { en: 'Field pilot partners for drip irrigation kits', sw: 'Washirika wa majaribio ya vifaa vya umwagiliaji wa matone' },
    summary: { en: 'Sample opportunity: a technology team looks for farm groups to test a kit for one season.', sw: 'Fursa ya mfano: timu ya teknolojia inatafuta vikundi vya wakulima kujaribu kifaa kwa msimu mmoja.' } },
  { id: 'o2', type: 'research', status: 'open',
    title: { en: 'University and farm research partnership', sw: 'Ushirikiano wa utafiti kati ya chuo na mashamba' },
    summary: { en: 'Sample opportunity: students and farmers study soil cover practices together.', sw: 'Fursa ya mfano: wanafunzi na wakulima wanachunguza mbinu za kufunika udongo pamoja.' } },
  { id: 'o3', type: 'training', status: 'planned',
    title: { en: 'Training of extension officers on digital tools', sw: 'Mafunzo ya maafisa ugani kuhusu zana za kidijitali' },
    summary: { en: 'Sample opportunity: a short course on using advisory apps with farmers.', sw: 'Fursa ya mfano: kozi fupi ya kutumia programu za ushauri na wakulima.' } },
  { id: 'o4', type: 'funding', status: 'planned',
    title: { en: 'Small grants call for farm innovations', sw: 'Mwito wa ruzuku ndogo kwa ubunifu wa mashamba' },
    summary: { en: 'Sample opportunity: a placeholder showing how funding calls would be listed. No funding is offered.', sw: 'Fursa ya mfano: kielelezo kinachoonyesha jinsi miito ya ufadhili itakavyoorodheshwa. Hakuna ufadhili unaotolewa.' } },
];

export const challenges = [
  { id: 'c1', categoryId: 'storage', status: 'open',
    title: { en: 'Keep tomatoes fresh for one more week', sw: 'Kuweka nyanya mbichi kwa wiki moja zaidi' },
    summary: { en: 'Sample challenge: low-cost ways to slow spoilage between farm and market.', sw: 'Changamoto ya mfano: njia za gharama nafuu za kupunguza kuharibika kati ya shamba na soko.' } },
  { id: 'c2', categoryId: 'herd', status: 'open',
    title: { en: 'Detect sick animals sooner on small farms', sw: 'Kugundua wanyama wagonjwa mapema katika mashamba madogo' },
    summary: { en: 'Sample challenge: simple tools that work without constant mobile coverage.', sw: 'Changamoto ya mfano: zana rahisi zinazofanya kazi bila mtandao wa simu wa kila wakati.' } },
  { id: 'c3', categoryId: 'advisory', status: 'closed',
    title: { en: 'Advice in local languages by voice message', sw: 'Ushauri kwa lugha za wenyeji kwa ujumbe wa sauti' },
    summary: { en: 'Sample challenge: reach farmers who prefer listening to reading.', sw: 'Changamoto ya mfano: kuwafikia wakulima wanaopendelea kusikiliza kuliko kusoma.' } },
];

export const organizations = [
  { id: 'g1', type: 'cooperative', countryId: 'africa', name: 'Sample Growers Cooperative',
    summary: { en: 'Demonstration profile of a farmer cooperative looking for storage partners.', sw: 'Wasifu wa mfano wa chama cha ushirika cha wakulima kinachotafuta washirika wa uhifadhi.' } },
  { id: 'g2', type: 'university', countryId: 'netherlands', name: 'Sample Agricultural Institute',
    summary: { en: 'Demonstration profile of a research institute open to field trials.', sw: 'Wasifu wa mfano wa taasisi ya utafiti iliyo tayari kwa majaribio ya shambani.' } },
  { id: 'g3', type: 'ngo', countryId: 'india', name: 'Sample Rural Advisory Network',
    summary: { en: 'Demonstration profile of a non-profit running farmer advice lines.', sw: 'Wasifu wa mfano wa shirika lisilo la faida linaloendesha simu za ushauri kwa wakulima.' } },
  { id: 'g4', type: 'agency', countryId: 'other-regions', name: 'Sample Livestock Services Agency',
    summary: { en: 'Demonstration profile of an agency supporting herd health programmes.', sw: 'Wasifu wa mfano wa wakala unaosaidia programu za afya ya mifugo.' } },
];
