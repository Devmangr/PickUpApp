import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const AvailabilityTable = ({ combinedData }) => {
  return (
    <View style={styles.tableContainer}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Κωδικός Αποθήκης</Text>
        <Text style={styles.headerText}>Περιγραφή Αποθήκης</Text>
        <Text style={styles.headerText}>Διαθεσιμότητα</Text>
      </View>

      {/* Table Rows */}
      <ScrollView>
        {combinedData.map((item, index) => (
          <View key={index} style={styles.tableRow}>
            <Text style={styles.cellText}>{item.WhLCodeID}</Text>
            <Text style={styles.cellText}>{item.Descr}</Text>
            <Text style={styles.cellTextBalance}>{item.QtyProvision}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  tableContainer: {
    flex: 1,
    padding: 16,
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
    fontSize: 16,
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
});

export default AvailabilityTable;
