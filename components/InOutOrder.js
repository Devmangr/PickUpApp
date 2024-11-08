import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Pressable,
  TextInput,
} from "react-native";
import { useAppContext } from "./AppContext";

const InOutSupTable = ({ combinedData }) => {
  const { itemData, handleQuantityChange } = useAppContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectdItem, setSelectedItem] = useState(null);
  const [qtyValue, setQtyValue] = useState("");
  const [itemid, setItemid] = useState("");
  const [itemCode, setItemCode] = useState("");
  const [itemDescr, setItemDescr] = useState("");
  const [newPrice, setNewPrice] = useState("");

  const handleRowPress = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
    setItemid(item.itemid);
    setItemDescr(item.Description);
    setItemCode(item.code);
  };

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
      handleCloseModal();
      setQtyValue("");
    }
  };

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

      {/* Table Rows */}
      <ScrollView>
        {combinedData.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => handleRowPress(item)}>
            <View key={index} style={styles.tableRow}>
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
        ))}
      </ScrollView>
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
            <Pressable style={styles.btn} onPress={() => handleSave()}>
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#fff",
                }}
              >
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

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
});

export default InOutSupTable;
