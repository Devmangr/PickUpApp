import React, { useEffect, useState } from "react";
import { View, Button, Text, TextInput, StyleSheet } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import { encode as btoa } from 'base-64';
import { useAppContext } from "./AppContext";
import InOutSupTable from "./InOutGrid";

const InOutSup = () => {
    const { wsHost, wsPort, wsRoot, wsUser, wsPass, branch } = useAppContext();
    const [returnedData, setReturnedData] = useState([]);
    const [isPickerFocused, setIsPickerFocused] = useState(false);
    const [fromDate, setFromDate] = useState(null);
    const [toDate, setToDate] = useState(null);
    const [selectedFromDate, setSelectedFromDate] = useState(new Date());
    const [selectedToDate, setSelectedToDate] = useState(new Date());
    const [showDatePicker1, setShowDatePicker1] = useState(false);
    const [showDatePicker2, setShowDatePicker2] = useState(false);
    const [btnLoading, setBtnLoading] = useState(false);
    const [supplierDropdownData, setSupplierDropdownData] = useState([]);
    const [selectedSupplierDropdown, setSelectedSupplierDropdown] = useState(null);

    const API_ENDPOINT = `http://${wsHost}:${wsPort}/${wsRoot}/DBDataSetValues`;

    const fetchSuppliers = async () => {
        try {
            const sqlQuery = JSON.stringify({ "sql": "select id, code, name from supplier ", "dbfqr": true, "params": [] });

            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': 'Basic ' + btoa(`${wsUser}:${wsPass}`),
                },
                body: sqlQuery,
            });
            const data = await response.json();
            setSupplierDropdownData(data);
        } catch (error) {
            console.error('Error fetching suppliers data: ', error);
        }
    };

    const handleQuery = async () => {
        if (fromDate && toDate) {
            setBtnLoading(true);
            try {
                const sqlQuery = JSON.stringify({ "sql": "SELECT item.id itemid, [Item].Code As Code, [Item].Description As Description, SUM(ItemTrn.PriQty*ItemTrn.DocSign*ItemTrn.InSheet) As inQty into #tbl FROM [ItemTrn] As [ItemTrn] Left join [Item] AS [Item] ON (Item.Id=ItemTrn.ItemId) Left join [DocTrn] AS [DocTrn] ON (DocTrn.Id=ItemTrn.TrnDocId) Left join [AllMaster] AS [AllMaster] ON (AllMaster.Id=ItemTrn.AmId) Left join [NoteType] AS [NoteType] ON (ItemTrn.TrnType=NoteType.NoteCode) WHERE DocTrn.DocDate >= :0 AND DocTrn.DocDate <= :1 AND NoteType.Rtype=1 AND ItemTrn.TrnType= 2 AND AllMaster.id= :2 and doctrn.BranchID = :3 GROUP BY item.id,ITEM.CODE, ITEM.Description select agor.*, isnull(pol.PriQty,0) outQty, isnull(fnqty.qty,0) as bal from #tbl agor left join (SELECT itemtrn.ItemID, SUM(ItemTrn.PriQty*(ItemTrn.OutQty-ItemTrn.InQty)*ItemTrn.DocSign*ItemTrn.InSheet) As PriQty FROM [ItemTrn] As [ItemTrn] Left join [AllMaster] AS [AllMaster] ON (AllMaster.Id=ItemTrn.AmId) Left join [NoteType] AS [NoteType] ON (ItemTrn.TrnType=NoteType.NoteCode) WHERE itemtrn.DocDate >= :4 AND itemtrn.DocDate <= :5 AND NoteType.Rtype=1 AND ItemTrn.TrnType= 20 and itemtrn.WHLCodeID=:6 GROUP BY ItemID ) as pol on pol.itemid = agor.itemid left join (select IteID, QtyProvision qty from fnQtyProvision1(year(getdate())) where WhLCodeID=:7) fnqty on fnqty.IteID = agor.itemid", "dbfqr": true, "params": [fromDate.toISOString().split('T')[0], toDate.toISOString().split('T')[0], selectedSupplierDropdown, branch, fromDate.toISOString().split('T')[0], toDate.toISOString().split('T')[0], branch, branch] });
                const response = await fetch(API_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                        'Authorization': 'Basic ' + btoa(`${wsUser}:${wsPass}`),
                    },
                    body: sqlQuery,
                });
                const textData = await response.text();

                const newData = JSON.parse(textData);
                //console.log('Parsed Data:', newData);
                setBtnLoading(false);

                if (Array.isArray(newData)) {
                    setReturnedData(newData);
                } else {
                    console.error('Expected an array, but got:', typeof newData);
                }
            } catch (error) {
                console.error('Error: ', error);
            };
        } else {
            alert('Πρέπει να επιλέξεις ημερομηνίες');
        };
    };

    const handleFocus = (focus) => {
        if (!isPickerFocused) {
            setIsPickerFocused(true);
        } else {
            setIsPickerFocused(focus);
        }
        { isPickerFocused ? (fetchSuppliers()) : null }
    }
    const handleDateChangeFromDate = (event, date) => {
        setShowDatePicker1(false);
        if (date) {
            setFromDate(date);
            setSelectedFromDate(date);
        } else {
            setFromDate(selectedFromDate);
        }
    }
    const handleDateChangeToDate = (event, date) => {
        setShowDatePicker2(false);
        if (date) {
            setToDate(date);
            setSelectedToDate(date);
        } else {
            setToDate(selectedToDate);
        }
    }

    return (
        <View style={styles.container}>
            <View style={styles.headContainer}>
                <View style={styles.row}>
                    <Text style={[styles.caption, styles.alignRight]}>Προμηθευτής:</Text>
                    <Picker
                        style={styles.input}
                        selectedValue={selectedSupplierDropdown}
                        onValueChange={(itemValue) => setSelectedSupplierDropdown(itemValue)}
                        onFocus={() => handleFocus(true)}
                    >
                        {supplierDropdownData.map((supplier) => (
                            <Picker.Item
                                key={supplier.id}
                                label={supplier.name}
                                value={supplier.id}
                            />
                        ))}

                    </Picker>
                </View>
                <View style={styles.row}>
                    <Text style={[styles.caption, styles.alignRight]}>Από:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ημερομηνία.."
                        value={selectedFromDate.toISOString().split('T')[0]}
                        onTouchStart={() => setShowDatePicker1(true)}
                    />
                    {showDatePicker1 && (
                        <DateTimePicker
                            value={fromDate || selectedFromDate}
                            mode="date"
                            display="default"
                            onChange={handleDateChangeFromDate}
                        />
                    )}
                </View>
                <View style={styles.row}>
                    <Text style={[styles.caption, styles.alignRight]}>Έως:</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Ημερομηνία.."
                        value={selectedToDate.toISOString().split('T')[0]}
                        onTouchStart={() => setShowDatePicker2(true)}
                    />
                    {showDatePicker2 && (
                        <DateTimePicker
                            value={toDate || selectedToDate}
                            mode="date"
                            display="default"
                            onChange={handleDateChangeToDate}
                        />
                    )}
                </View>
                <View style={styles.row}>
                    <View style={styles.buttonContainer}>
                        <Button
                            title="Αναζήτηση"
                            className={`btn ${btnLoading ? 'btn-warning' : 'btn-success'}`}
                            onPress={() => handleQuery()}
                            disabled={btnLoading}>
                            {btnLoading ? 'Loading...' : 'Αναζήτηση'}
                        </Button>
                    </View>
                </View>
            </View>
            <InOutSupTable combinedData={returnedData} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 8,
    },
    headContainer: {
        borderWidth: 0.5,
        borderRadius: 10,
        padding: 8
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    input: {
        flex: 1,
        height: 40,
        borderColor: 'gray',
        borderRadius: 4,
        borderWidth: 0.5,
        paddingHorizontal: 8,
    },
    alignRight: {
        textAlign: 'right',
    },
    buttonContainer: {
        flex: 1,
    },
    btn: {
        backgroundColor: 'green',
        borderRadius: 8,
        color: 'white',
        textAlign: 'center',
        paddingVertical: 16,
        fontSize: 20,
        fontWeight: 'bold',
        elevation: 8
    }
});

export default InOutSup;