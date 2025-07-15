import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Dimensions,
  Alert,
  TouchableOpacity,
} from "react-native";
import { useAppContext } from "./AppContext";
import React, { useCallback } from "react";

const GridComponent = React.memo(() => {
  const { itemData, handleQuantityChange } = useAppContext();
  const screenWidth = Dimensions.get("window").width;

  const columnWidths = {
    code: screenWidth * 0.17,
    name: screenWidth * 0.49,
    qty: screenWidth * 0.17,
    delete: screenWidth * 0.17,
  };

  const confirmDelete = (index, itemName) => {
    Alert.alert(
      "Επιβεβαίωση",
      `Θέλεις να διαγράψεις το προϊόν:\n\n${itemName};`,
      [
        { text: "Άκυρο", style: "cancel" },
        {
          text: "Διαγραφή",
          style: "destructive",
          onPress: () => {
            const updatedData = [...itemData];
            updatedData.splice(index, 1);
            handleQuantityChange(updatedData);
          },
        },
      ]
    );
  };

  const renderHeader = () => (
    <View style={[styles.row, styles.header]}>
      <Text style={[styles.cell, styles.headerText, { width: columnWidths.code }]}>Κωδικός</Text>
      <Text style={[styles.cell, styles.headerText, { width: columnWidths.name }]}>Περιγραφή</Text>
      <Text style={[styles.cell, styles.headerText, { width: columnWidths.qty }]}>Ποσ.</Text>
      <Text style={[styles.cell, styles.headerText, { width: columnWidths.delete }]}>Διαγραφή</Text>
    </View>
  );

  const renderItem = useCallback(({ item, index }) => (
    <View style={styles.row}>
      <Text style={[styles.cell, { width: columnWidths.code }]}>{item.code}</Text>
      <Text style={[styles.cell, { width: columnWidths.name }]}>{item.itemName}</Text>
      <Text style={[styles.cell, { width: columnWidths.qty }]}>{item.quantity}</Text>
      <TouchableOpacity
        style={[styles.cell, { width: columnWidths.delete }]}
        onPress={() => confirmDelete(index, item.itemName)}
      >
        <Text style={styles.deleteButton}>🗑️</Text>
      </TouchableOpacity>
    </View>
  ), [itemData]);

  return (
    <View>
      {renderHeader()}
      <FlatList
        data={itemData}
        renderItem={renderItem}
        keyExtractor={(item, index) => `${item.code}-${index}`}
        scrollEnabled={true}
        initialNumToRender={20}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </View>
  );
});


const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    height: 40,
    borderBottomWidth: 0.5,
    borderColor: "#ddd",
  },
  header: {
    backgroundColor: "#f1f8ff",
  },
  cell: {
    textAlign: "center",
    justifyContent: "center",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 13,
  },
  deleteButton: {
    fontSize: 18,
    color: "red",
    textAlign: "center",
  },
});

export default GridComponent;
