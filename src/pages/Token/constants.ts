
// mock wearables
export const mockWearables: Record<string, { collectionId: number, baseCollections: number[] }[]> = {
  opal: [
    { collectionId: 2217, baseCollections: [2216] }
  ],
  quartz: [],
  unique: [
    { collectionId: 388, baseCollections: [387] },
    { collectionId: 139, baseCollections: [138] }
  ]
};

export const fixPriceSellingCollectionIds: Record<string, { collectionId: number, price: number }[]> = {
  opal: [
    { collectionId: 2461, price: 850 }
  ],
  quartz: [],
  unique: [
    { collectionId: 474, price: 850 }
  ]
};

export const disallowSellingAttributeName = 'Ticket status';
export const disallowSellingAttributeValue = 'TICKET USED';
