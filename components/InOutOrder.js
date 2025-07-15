import React, { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Modal, Pressable, TextInput, FlatList } from "react-native";
import { useAppContext } from "./AppContext";
import { encode as btoa } from "base-64";

const InOutSupTable = React.memo(({ combinedData, scannedCode, clearScannedCode }) => {
  const { itemData, handleQuantityChange, priceList } = useAppContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectdItem, setSelectedItem] = useState(null);
  const [qtyValue, setQtyValue] = useState("");
  const [itemid, setItemid] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [itemDescr, setItemDescr] = useState("");
  const [orderedItems, setOrderedItems] = useState([]);
  const [searchText, setSearchText] = useState("");
  const { wsHost, wsPort, wsRoot, wsUser, wsPass } = useAppContext();
  const API_ENDPOINT = `http://${wsHost}:${wsPort}/${wsRoot}/DBDataSetValues`;
  const filteredData = combinedData.filter(item =>
    (item.Description?.toLowerCase() || '').includes(searchText.toLowerCase()) ||
    (item.code?.toLowerCase() || '').includes(searchText.toLowerCase())
  );

  const handleRowPress = useCallback((item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
    setItemid(item.itemid);
    setItemDescr(item.Description);
    setItemCode(item.code);
  }, []);

  useEffect(() => {
    const fetchItemByBarcode = async (barcode) => {
      try {
        const body = JSON.stringify({
          sql: "select it.id, it.code, it.description, isnull(prlst.price, it.Retail_Price) price, munit.Descr unit from item it inner join itembarcode ibc on ibc.itemid = it.id left join MATMESUNIT munit on munit.CodeID = ibc.SecUnit_Id outer apply(select top(1) itemid,price, PrLstDim.ValidFromDT, PrLstDim.ValidToDT from ITEMPRLIST ItePrList inner join PriceListDim PrLstDim on PrLstDim.ID=ItePrList.PrListDimID inner join PRICELIST prList on prList.CodeID=ItePrList.PrListCodeID where prList.CodeID=:0 and itemid=it.id order by prList.type desc, PrLstDim.ValidFromDT) as PrLst where ibc.barcode=:1",
          dbfqr: true,
          params: [priceList, barcode],
        });

        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Basic " + btoa(`${wsUser}:${wsPass}`),
          },
          body: body,
        });

        const data = await response.json();

        if (data && data.length > 0) {
          const item = data[0];

          const alreadyExists = orderedItems.includes(item.id);

          setItemid(item.id);
          setItemCode(item.code);
          setItemDescr(item.description);
          setSelectedItem(item);
          setIsModalVisible(true);

          // Αν υπάρχει, δεν προσθέτουμε, απλώς ανοίγουμε modal για να ενημερωθεί ποσότητα
          if (!alreadyExists) {
            setOrderedItems((prev) => [...prev, item.id]);
          }
        } else {
          alert(`Δεν βρέθηκε προϊόν με barcode: ${barcode}`);
        }
      } catch (error) {
        alert("Σφάλμα κατά την αναζήτηση του barcode.");
        console.error("Barcode fetch error", error);
      } finally {
        clearScannedCode();
      }
    };

    if (scannedCode) {
      fetchItemByBarcode(scannedCode);
    }
  }, [scannedCode]);


  const handleCloseModal = () => {
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const handleSave = () => {
    if (qtyValue === "") {
      Alert.alert("Σφάλμα", `Δεν επιτρέπεται μηδενική ποσότητα. `, [
        {
          text: "Ok",
          onPress: () => console.error("Error calling API"),
        },
      ]);
    } else {
      const newItem = {
        itemid: itemid,
        code: itemCode,
        itemName: itemDescr,
        //itemNewPrice: newPrice,
        quantity: parseInt(qtyValue, 10) || 0,
      };

      const updatedData = [...itemData, newItem];

      handleQuantityChange(updatedData);
      setOrderedItems((prev) => [...prev, itemid]);
      handleCloseModal();
      setQtyValue("");
    }
  };

  const handleRemoveItem = () => {
    const updatedData = itemData.filter((item) => item.itemid !== itemid);
    handleQuantityChange(updatedData);

    setOrderedItems((prev) => prev.filter((id) => id !== itemid));
    handleCloseModal();
  };

  const renderItem = useCallback(({ item, index }) => (
    <TouchableOpacity key={index} onPress={() => handleRowPress(item)}>
      <View key={index} style={[styles.tableRow, orderedItems.includes(item.itemid) && styles.orderedRow,]}>
        <Text style={[styles.cellText, styles.colCode, styles.cellCode]}>
          {item.code}
        </Text>
        <Text style={[styles.cellText, styles.colDescription]}>
          {item.Description}
        </Text>
        <Text style={[styles.cellTextBalance, styles.colInqty]}>
          {item.inQty}
        </Text>
        <Text style={[styles.cellTextBalance, styles.colOutqty]}>
          {item.outQty}
        </Text>
        <Text style={[styles.cellTextBalance, styles.colBal]}>
          {item.bal}
        </Text>
      </View>
    </TouchableOpacity>
  ), [orderedItems, handleRowPress]);

  return (
    <View style={styles.tableContainer}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={[styles.headerText, styles.colCode]}>Κωδ.</Text>
        <Text style={[styles.headerText, styles.colDescription]}>
          Περιγραφή
        </Text>
        <Text style={[styles.headerText, styles.colInqty]}>Αγορ.</Text>
        <Text style={[styles.headerText, styles.colOutqty]}>Πωλ.</Text>
        <Text style={[styles.headerText, styles.colBal]}>Υπόλ.</Text>
      </View>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Αναζήτηση περιγραφής..."
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>
      {/* Table Rows */}
      <FlatList
        data={filteredData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.code}-${index}`}
        contentContainerStyle={{ paddingBottom: 80 }}
        initialNumToRender={20}
        windowSize={10}
        removeClippedSubviews={true}
      />
      {/* Modal for Orders */}
      <Modal
        transparent={false}
        animationType="slide"
        visible={isModalVisible}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.popupContainer}>
          <View style={styles.popupDataContainer}>
            <Text style={{ textAlign: "center", fontSize: 16 }}>
              Ποσότητα Παραγγελίας.
            </Text>
            <View style={styles.row}>
              <TextInput
                style={styles.input}
                placeholder="Ποσότητα..."
                value={qtyValue}
                onChangeText={(qty) => setQtyValue(qty)}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.buttonPopupContainer}>
              <TouchableOpacity style={styles.popupSearchButton} onPress={() => handleSave()}>
                <Text style={{ textAlign: "center", fontSize: 16, fontWeight: "bold", color: "#fff", }}>OK</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupCancelButton} onPress={() => handleCloseModal()}>
                <Text style={styles.popupButtonText}>Άκυρο</Text>
              </TouchableOpacity>
            </View>
            {orderedItems.includes(itemid) && (
              <Pressable
                style={[styles.btn, { backgroundColor: "red", marginTop: 10 }]}
                onPress={handleRemoveItem}
              >
                <Text style={styles.btnText}>Αφαίρεση</Text>
              </Pressable>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
});

const styles = StyleSheet.create({
  tableContainer: {
    flex: 1,
    padding: 8,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: "center",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 12,
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  cellText: {
    flex: 1,
    textAlign: "left",
    fontSize: 14,
  },
  cellTextBalance: {
    flex: 1,
    textAlign: "right",
    fontSize: 14,
  },
  colCode: {
    flex: 0.5,
    paddingRight: 5,
  },
  cellCode: {
    fontSize: 11,
  },
  colDescription: {
    flex: 2.5, // Πλατύτερη στήλη για την περιγραφή
  },
  colInqty: {
    flex: 0.5, // Στήλες ίδιου μεγέθους για Αγορ., Πωλ., Υπόλ.
  },
  colOutqty: {
    flex: 0.5, // Στήλες ίδιου μεγέθους για Αγορ., Πωλ., Υπόλ.
  },
  colBal: {
    flex: 0.5, // Στήλες ίδιου μεγέθους για Αγορ., Πωλ., Υπόλ.
  },
  buttonContainer: {
    flex: 1,
  },
  btn: {
    backgroundColor: "green",
    borderRadius: 8,
    color: "white",
    textAlign: "center",
    paddingVertical: 16,
    fontSize: 20,
    fontWeight: "bold",
    elevation: 8,
  },
  buttonPopupContainer: {
    flexDirection: "row", justifyContent: "space-between",
    width: "95%", paddingHorizontal: 10
  },
  popupSearchButton: {
    backgroundColor: "green", borderRadius: 8, alignItems: "center",
    paddingVertical: 15, marginTop: 20, width: 100,
  },
  popupCancelButton: {
    backgroundColor: "red", borderRadius: 8, alignItems: "center",
    paddingVertical: 15, marginTop: 20, width: 100,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderRadius: 4,
    borderWidth: 0.5,
    paddingHorizontal: 8,
  },
  popupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  popupDataContainer: {
    borderWidth: 0.7,
    borderRadius: 8,
    borderColor: "#b1b1b1",
    padding: 10,
    width: 300,
  },
  popup: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  orderedRow: {
    backgroundColor: "#d0f0c0"
  },
  btnText: {
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  searchContainer: {
    marginBottom: 8,

  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 8,
  },

});

export default InOutSupTable;
