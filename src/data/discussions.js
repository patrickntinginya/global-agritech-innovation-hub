// DEMONSTRATION community content. Nothing here was written by real members.
const b = (en, sw) => ({ en, sw });

export const discussionTopics = ['crops', 'livestock', 'technology', 'climate', 'business', 'learning'];

export const discussions = [
  { id: 'd1', kind: 'question', topic: 'technology', date: '2026-10-05', author: b('Demo member A', 'Mwanachama wa mfano A'), answered: true,
    title: b('Which sensors are worth buying first on a small farm?', 'Ni vitambuzi gani vya kununua kwanza kwenye shamba dogo?'),
    body: b('Sample question: I have two hectares and a limited budget. Where should I start?', 'Swali la mfano: Nina hekta mbili na bajeti ndogo. Nianzie wapi?'),
    replies: [
      { id: 'r1', author: b('Demo member B', 'Mwanachama wa mfano B'), accepted: true, text: b('Sample answer: start with one soil moisture sensor where you irrigate most, then add more once you trust the readings.', 'Jibu la mfano: anza na kitambuzi kimoja cha unyevu mahali unapomwagilia zaidi, kisha ongeza ukiwa na imani na vipimo.') },
      { id: 'r2', author: b('Demo member C', 'Mwanachama wa mfano C'), text: b('Sample answer: a rain gauge is cheap and useful too.', 'Jibu la mfano: kipimo cha mvua ni cha bei nafuu na kina manufaa pia.') },
    ] },
  { id: 'd2', kind: 'discussion', topic: 'livestock', date: '2026-10-02', author: b('Demo member D', 'Mwanachama wa mfano D'), answered: false,
    title: b('How do you keep records for a mixed herd?', 'Mnatunzaje kumbukumbu za kundi mchanganyiko?'),
    body: b('Sample discussion: paper notebooks, phone apps or spreadsheets? Share what works for you.', 'Mjadala wa mfano: daftari, programu za simu au lahajedwali? Shirikisha kinachokufaa.'),
    replies: [
      { id: 'r3', author: b('Demo member E', 'Mwanachama wa mfano E'), text: b('Sample reply: a simple notebook with one page per animal worked for us at first.', 'Jibu la mfano: daftari rahisi lenye ukurasa mmoja kwa kila mnyama lilitufaa mwanzoni.') },
    ] },
  { id: 'd3', kind: 'question', topic: 'climate', date: '2026-09-29', author: b('Demo member F', 'Mwanachama wa mfano F'), answered: false,
    title: b('What can I plant when the rains start late?', 'Nipande nini mvua zikichelewa kuanza?'),
    body: b('Sample question: the season started late and I am worried about maize.', 'Swali la mfano: msimu umechelewa na nina wasiwasi kuhusu mahindi.'),
    replies: [] },
  { id: 'd4', kind: 'discussion', topic: 'business', date: '2026-09-20', author: b('Demo member G', 'Mwanachama wa mfano G'), answered: false,
    title: b('Selling together as a group: what worked?', 'Kuuza pamoja kama kikundi: nini kilifanya kazi?'),
    body: b('Sample discussion about group marketing and shared transport.', 'Mjadala wa mfano kuhusu uuzaji wa kikundi na usafiri wa pamoja.'),
    replies: [
      { id: 'r4', author: b('Demo member H', 'Mwanachama wa mfano H'), text: b('Sample reply: agree on grading and a pickup day before anything else.', 'Jibu la mfano: kubaliana kuhusu madaraja na siku ya kuchukua kabla ya jambo lingine lolote.') },
    ] },
  { id: 'd5', kind: 'question', topic: 'crops', date: '2026-09-14', author: b('Demo member I', 'Mwanachama wa mfano I'), answered: true,
    title: b('How often should I test my soil?', 'Napaswa kupima udongo wangu mara ngapi?'),
    body: b('Sample question about soil testing frequency for vegetables.', 'Swali la mfano kuhusu mara za kupima udongo kwa mboga.'),
    replies: [
      { id: 'r5', author: b('Demo member J', 'Mwanachama wa mfano J'), accepted: true, text: b('Sample answer: many growers test once a year before the main season. Ask your extension officer for local advice.', 'Jibu la mfano: wakulima wengi hupima mara moja kwa mwaka kabla ya msimu mkuu. Muulize afisa ugani kwa ushauri wa eneo lako.') },
    ] },
  { id: 'd6', kind: 'discussion', topic: 'learning', date: '2026-09-05', author: b('Demo member K', 'Mwanachama wa mfano K'), answered: false,
    title: b('Best way to learn farm record-keeping?', 'Njia bora ya kujifunza kutunza kumbukumbu za shamba?'),
    body: b('Sample discussion for students and new farmers.', 'Mjadala wa mfano kwa wanafunzi na wakulima wapya.'),
    replies: [] },
];

// Role ids for sign-up and profile forms (labels live under roles.<id> in the dictionaries).
export { userRoles } from './adminData.js';
