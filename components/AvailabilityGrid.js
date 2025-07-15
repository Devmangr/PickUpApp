import { View, Text, StyleSheet, FlatList } from "react-native";
import React, { useCallback } from "react";

const AvailabilityTable = React.memo(({ combinedData }) => {
  const renderItem = useCallback(({ item }) => (
    <View style={styles.tableRow}>
      <Text style={styles.cellText}>{item.WhLCodeID}</Text>
      <Text style={styles.cellText}>{item.Descr}</Text>
      <Text style={styles.cellTextBalance}>{item.QtyProvision}</Text>
    </View>
  ), []);

  if (!combinedData || combinedData.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Δεν βρέθηκαν διαθέσιμα δεδομένα.</Text>
      </View>
    );
  }

  return (
    <View style={styles.tableContainer}>
      {/* Table Header */}
      <View style={styles.tableHeader}>
        <Text style={styles.headerText}>Κωδικός Αποθήκης</Text>
        <Text style={styles.headerText}>Περιγραφή Αποθήκης</Text>
        <Text style={styles.headerText}>Διαθεσιμότητα</Text>
      </View>

      <FlatList
        data={combinedData}
        keyExtractor={(item, index) => `${item.WhLCodeID}-${index}`}
        renderItem={renderItem}
        initialNumToRender={20}
        windowSize={10}
        removeClippedSubviews={true}
      />
    </View>
  );
});

const styles = StyleSheet.create({
  tableContainer: {
    flex: 1,
    padding: 12,
    backgroundColor: "#fff",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderColor: "#000",
    paddingVertical: 10,
    paddingHorizontal: 5,
    alignItems: "center",
  },
  headerText: {
    fontWeight: "bold",
    fontSize: 14,
    flex: 1,
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#e0e0e0",
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  cellText: {
    flex: 1,
    fontSize: 13,
    textAlign: "center",
  },
  cellTextBalance: {
    flex: 1,
    fontSize: 13,
    textAlign: "center",
    fontWeight: "bold",
    color: "#4caf50",
  },
  emptyContainer: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#777",
  },
});

export default AvailabilityTable;
