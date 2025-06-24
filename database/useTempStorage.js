import { useEffect } from 'react';
import { getRealm } from './realmConfig';

let realmInstance;

export const useTempStorage = () => {
  useEffect(() => {
    // Αρχικοποίηση Realm on mount
    getRealm().then(realm => {
      realmInstance = realm;
    }).catch(err => console.error('Realm init error', err));
  }, []);

  // Αύξων κλειδί
  const nextId = (schemaName) => {
    const max = realmInstance.objects(schemaName).max('id');
    return (max ?? 0) + 1;
  };

  const saveTempData = async ({ operationType, supplierId, supplierName, items }) => {
    const realm = realmInstance;
    if (!realm) throw new Error('Realm not initialized');

    realm.write(() => {
      const setId = nextId('TempSet');
      realm.create('TempSet', {
        id: setId,
        operationType,
        supplierId,
        supplierName,
        timestamp: new Date(),
      });
      items.forEach(item => {
        realm.create('TempItem', {
          id: nextId('TempItem'),
          setId,
          itemid: item.itemid,
          code: item.code,
          itemName: item.itemName,
          quantity: item.quantity,
        });
      });
    });
  };

  const getSets = async (operationType) => {
    const realm = realmInstance;
    if (!realm) return [];
    const all = realm.objects('TempSet').filtered('operationType == $0', operationType)
      .sorted('timestamp', true);
    return all.map(s => ({
      id: s.id,
      supplierName: s.supplierName,
      timestamp: s.timestamp,
    }));
  };

  const getItemsBySetId = async (setId) => {
    const realm = realmInstance;
    if (!realm) return [];
    const items = realm.objects('TempItem').filtered('setId == $0', setId);
    return items.map(i => ({
      itemid: i.itemid,
      code: i.code,
      itemName: i.itemName,
      quantity: i.quantity,
    }));
  };

  const clearSetsForSupplier = async (operationType, supplierId) => {
    const realm = realmInstance;
    if (!realm) return;
    realm.write(() => {
      const sets = realm.objects('TempSet').filtered('operationType == $0 AND supplierId == $1', operationType, supplierId);
      sets.forEach(s => {
        const items = realm.objects('TempItem').filtered('setId == $0', s.id);
        realm.delete(items);
        realm.delete(s);
      });
    });
  };

  const getAllSets = () => {
    const realm = realmInstance;
    if (!realm) return [];
    const all = realm.objects('TempSet');
    console.log('📦 Όλα τα σετ (χωρίς filter):', all.map(s => ({
      id: s.id,
      operationType: s.operationType,
      supplierId: s.supplierId,
      name: s.supplierName
    })));
    return all;
  };


  return { saveTempData, getSets, getItemsBySetId, clearSetsForSupplier, getAllSets };
};
