// Maps the topic lists on the homepage (farming.cropItems / farming.livestockItems) to pages.
// Index order matches the dictionary arrays.
export const sectorConfig = {
  crop: {
    path: '/smart-farming',
    titleKey: 'nav.smartFarming',
    introKey: 'sectorPage.cropIntro',
    descKey: 'farming.cropDesc',
    itemsKey: 'farming.cropItems',
    icon: 'sprout',
    topicLinks: [
      '/categories/smart-farming',
      '/categories/smart-irrigation',
      '/categories/soil-health',
      '/categories/greenhouse',
      '/categories/agricultural-robotics',
      '/categories/crop-protection',
      '/categories/processing',
    ],
  },
  livestock: {
    path: '/livestock',
    titleKey: 'nav.livestock',
    introKey: 'sectorPage.livestockIntro',
    descKey: 'farming.livestockDesc',
    itemsKey: 'farming.livestockItems',
    icon: 'cow',
    topicLinks: [
      '/explore?sector=livestock&application=herd-health',
      '/categories/livestock-technology',
      '/explore?sector=livestock&q=milk',
      '/explore?sector=livestock&q=poultry',
      '/explore?sector=livestock&q=cattle',
      '/explore?sector=livestock&category=smart-farming',
      '/explore?sector=livestock',
    ],
  },
};
