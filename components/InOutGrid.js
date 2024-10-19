import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const InOutSupTable = ({ combinedData }) => {
    return (
        <View style={styles.tableContainer}>
            {/* Table Header */}
            <View style={styles.tableHeader}>
                <Text style={[styles.headerText, styles.colCode]}>Κωδ.</Text>
                <Text style={[styles.headerText, styles.colDescription]}>Περιγραφή</Text>
                <Text style={[styles.headerText, styles.colInqty]}>Αγορ.</Text>
                <Text style={[styles.headerText, styles.colOutqty]}>Πωλ.</Text>
                <Text style={[styles.headerText, styles.colBal]}>Υπόλ.</Text>
            </View>

            {/* Table Rows */}
            <ScrollView>
                {combinedData.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={[styles.cellText,styles.colCode, styles.cellCode]}>{item.code}</Text>
                        <Text style={[styles.cellText, styles.colDescription]}>{item.Description}</Text>
                        <Text style={[styles.cellTextBalance, styles.colInqty]}>{item.inQty}</Text>
                        <Text style={[styles.cellTextBalance, styles.colOutqty]}>{item.outQty}</Text>
                        <Text style={[styles.cellTextBalance, styles.colBal]}>{item.bal}</Text>
                    </View>
                ))}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    tableContainer: {
        flex: 1,
        padding: 8,
    },
    tableHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderColor: '#000',
        paddingVertical: 10,
        paddingHorizontal: 5,
        alignItems:'center'
    },
    headerText: {
        fontWeight: 'bold',
        fontSize: 12,
        flex: 1,
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
        borderColor: '#ccc',
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    cellText: {
        flex: 1,
        textAlign: 'left',
        fontSize: 14,
    },
    cellTextBalance: {
        flex: 1,
        textAlign: 'right',
        fontSize: 14,
    },
    colCode: {
        flex: 0.5, 
        paddingRight:5,
    },
    cellCode: {
        fontSize:11
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
});

export default InOutSupTable;
