import React, { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Button,
  StyleSheet,
  Alert
} from 'react-native';
import { useAppContext } from './AppContext';
import { useTempStorage } from '../database/useTempStorage';

const LoadTempModal = React.memo(function LoadTempModal({ visible, operationType, onCancel, onConfirm  }) {
  const {
    getSets,
    getItemsBySetId,
    clearSetsForSupplier
  } = useTempStorage();

  const { handleQuantityChange, updateSelectSup } = useAppContext();

  const [sets, setSets] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  useEffect(() => {
    if (!visible) return;

    getSets(operationType)
      .then(fetched => {
        setSets(fetched);
      })
      .catch(err => {
        console.error('❌ Error fetching sets:', err);
        setSets([]);
      });

    setSelectedIds([]);
  }, [visible]);

  const toggleSelect = id => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleLoad = async () => {
    if (selectedIds.length === 0) {
      Alert.alert('Προσοχή', 'Διάλεξε τουλάχιστον ένα σετ προς φόρτωση.');
      return;
    }

    try {
      let allItems = [];
      let finalSupplierId = null;
      let conflict = false;

      for (const setId of selectedIds) {
        const items = await getItemsBySetId(setId);
        const selectedSet = sets.find(s => s.id === setId);

        if (!selectedSet || items.length === 0) {
          console.warn(`⚠️ Σετ #${setId} είναι άδειο ή δεν βρέθηκε`);
          continue;
        }

        if (finalSupplierId === null) {
          finalSupplierId = selectedSet.supplierId;
        } else if (selectedSet.supplierId !== finalSupplierId) {
          conflict = true;
          break;
        }

        allItems = [...allItems, ...items];
      }

      if (conflict) {
        Alert.alert(
          'Σφάλμα',
          'Όλα τα επιλεγμένα σετ πρέπει να ανήκουν στον ίδιο προμηθευτή.'
        );
        return;
      }

      if (allItems.length === 0) {
        Alert.alert('Προσοχή', 'Δεν βρέθηκαν είδη για φόρτωση.');
        return;
      }

      // 🔄 Ομαδοποίηση ειδών ανά itemid (άθροιση ποσοτήτων)
      const groupedItemsMap = new Map();
      allItems.forEach(item => {
        if (groupedItemsMap.has(item.itemid)) {
          const existing = groupedItemsMap.get(item.itemid);
          groupedItemsMap.set(item.itemid, {
            ...existing,
            quantity: existing.quantity + item.quantity,
          });
        } else {
          groupedItemsMap.set(item.itemid, { ...item });
        }
      });

      const mergedItems = Array.from(groupedItemsMap.values());

      // Ενημέρωση του προμηθευτή
      updateSelectSup(finalSupplierId);

      // Αν υπάρχει onConfirm callback, τη χρησιμοποιούμε
      if (onConfirm && typeof onConfirm === 'function') {
        onConfirm(selectedIds);
      } else {
        // Fallback στην παλιά μέθοδο
        handleQuantityChange(mergedItems);
      }
      onCancel();
    } catch (e) {
      console.error('❌ Error loading selected sets:', e);
      Alert.alert('Σφάλμα', 'Κάτι πήγε στραβά στη φόρτωση.');
    }
  };

  const renderItem = useCallback(({ item }) => (
    <TouchableOpacity
      onPress={() => toggleSelect(item.id)}
      style={styles.row}
    >
      <Text style={styles.supText}>
        {`${item.supplierName} — ${new Date(item.timestamp).toLocaleString()}`}
      </Text>
      <Text style={styles.checked}>{selectedIds.includes(item.id) ? '✓' : ''}</Text>
    </TouchableOpacity>
  ), [selectedIds, toggleSelect]);

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <Text style={styles.title}>Επιλογή σετ για φόρτωση</Text>
        {sets.length === 0 ? (
          <Text style={{ textAlign: 'center', marginTop: 20 }}>
            🚫 Δεν βρέθηκαν αποθηκευμένα σετ.
          </Text>
        ) : (
          <FlatList
            data={sets}
            keyExtractor={item => item.id.toString()}
            renderItem={renderItem}
            initialNumToRender={20}
            windowSize={10}
            removeClippedSubviews={true}
          />
        )}
        <View style={styles.buttons}>
          <Button title="Ακύρωση" onPress={onCancel} />
          <Button title="Φόρτωση" onPress={handleLoad} />
        </View>
      </View>
    </Modal>
  );
});

export default LoadTempModal;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#eee'
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20
  },
  supText: {fontSize:14, width:'90%'},
  checked:{color:'green', fontSize:20}
});
