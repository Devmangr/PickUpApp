import Realm from 'realm';

// Ορισμός schema για σετ και στοιχεία
export const TempItemSchema = {
  name: 'TempItem',
  properties: {
    id: 'int',           // primary key
    setId: 'int',        // σχέση με TempSet.id
    itemid: 'int',
    code: 'string',
    itemName: 'string',
    quantity: 'double',
  },
  primaryKey: 'id',
};

export const TempSetSchema = {
  name: 'TempSet',
  properties: {
    id: 'int',                // primary key
    operationType: 'string',  // τύπος λειτουργίας
    supplierId: 'int',
    supplierName: 'string?',  // optional
    timestamp: 'date',
    //items: { type: 'linkingObjects', objectType: 'TempItem', property: 'setId' },
  },
  primaryKey: 'id',
};
