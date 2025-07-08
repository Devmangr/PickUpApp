import React from "react";
import { StyleSheet, View, ScrollView, Text, TouchableOpacity, Alert } from "react-native";
import { Table, Row, Rows } from "react-native-table-component";
import { useAppContext } from "./AppContext";

const GridComponent = () => {
  const { itemData, handleQuantityChange } = useAppContext();

  const tableHead = ["Κωδικός", "Περιγραφή", "Ποσ.", "Διαγραφή"];
  const widthArr = [70, 190, 50, 80];

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

  const tableData = itemData.map((item, index) => [
    item.code,
    item.itemName,
    item.quantity,
    <TouchableOpacity onPress={() => confirmDelete(index, item.itemName)}>
      <Text style={styles.deleteButton}>🗑️</Text>
    </TouchableOpacity>,
  ]);

  return (
    <ScrollView>
      <View style={styles.container}>
        <Table style={styles.table}>
          <Row
            data={tableHead}
            widthArr={widthArr}
            style={styles.head}
            textStyle={styles.headerText}
          />
          <Rows
            data={tableData}
            widthArr={widthArr}
            style={styles.row}
            textStyle={styles.text}
          />
        </Table>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 5,
    paddingTop: 10,
  },
  table: {
    borderWidth: 0,
    borderColor: "#c8e1ff",
    flex: 1,
  },
  head: {
    width: "100%",
    height: 40,
    backgroundColor: "#f1f8ff",
  },
  headerText: {
    fontSize: 13,
    fontWeight: "bold",
    textAlign: "center",
  },
  row: {
    height: 40,
  },
  text: {
    fontSize: 12,
    textAlign: "center",
  },
  deleteButton: {
    color: "red",
    fontSize: 18,
    textAlign: "center",
  },
});

export default GridComponent;
