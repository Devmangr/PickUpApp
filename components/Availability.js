import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Modal, TouchableOpacity, Alert, FlatList } from "react-native";
import BarcodeComponent from "./scanner";
import { encode as btoa } from 'base-64';
import { useAppContext } from "./AppContext";
import AvailabilityGrid from "./AvailabilityGrid";

export default function Availability() {
    const { wsHost, wsPort, wsUser, wsPass } = useAppContext();
    const [isScanning, setIsScanning] = useState(false);
    const [labelCode, setLabelCode] = useState('');
    const [labelDescr, setLabelDescr] = useState('');
    const [labelBarcode, setLabelBarcode] = useState('');
    const [combinedData, setCombinedData] = useState([]);
    const [isPopupVisible, setIsPopupVisible] = useState(false);
    const [popupInputValue, setPopupInputValue] = useState('');
    const API_ENDPOINT = `http://${wsHost}:${wsPort}/root/DBDataSetValues`;
    const API_ENDPOINTOE = `http://${wsHost}:${wsPort}/oe/DBDataSetValues`;
    const API_ENDPOINTZER = `http://${wsHost}:${wsPort}/zer/DBDataSetValues`;

    const startScanner = () => {
        setIsScanning(true);
    };

    const handleBarcodeScanned = async (data) => {

        setIsScanning(false);
        const body = JSON.stringify({ "sql": "select it.code, it.description, fnqty.WhLCodeID, whl.Descr, fnqty.QtyProvision from item it left join itembarcode ibc on ibc.itemid = it.id left join (select IteID, WhLCodeID, QtyProvision from fnQtyProvision0(year(getdate()))) as fnqty on fnqty.iteid = it.id Inner join [whlocation] AS [WHL] ON (fnqty.WhLCodeID=Whl.CodeId) where ibc.BarCode = :0 group by it.code, it.description, fnqty.WhLCodeID, whl.Descr, fnqty.QtyProvision", "dbfqr": true, "params": [data] });
        try {
            const endpoints = [API_ENDPOINT, API_ENDPOINTOE, API_ENDPOINTZER];

            const [response1, response2, response3] = await Promise.all (endpoints.map(endpoint => fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + btoa(`${wsUser}:${wsPass}`),
                },
                body: body,
            }))
        );
            const [data1, data2, data3] = await Promise.all([response1.json(), response2.json(), response3.json()]);

            const compineData = [
                ...(Array.isArray(data1) ? data1 : []),
                ...(Array.isArray(data2) ? data2 : []),
                ...(Array.isArray(data3) ? data3 : [])
            ];

            if (compineData.length > 0) {
                setLabelCode(compineData[0].code);
                setLabelDescr(compineData[0].description);
                setLabelBarcode(data);
                setCombinedData(compineData)
            } else {
                setLabelCode('Δεν βρέθηκε προϊόν');
                setLabelDescr('');
                setLabelBarcode(data);
                setCombinedData([]);
            }
        } catch (error) {
            Alert.alert('Σφάλμα', `Σφάλμα στην αναζήτηση barcode. Μήνυμα: ${error}. `, [
                {
                    text: 'Ok',
                    onPress: () => console.error('Error calling API', error)
                }
            ]);
        }
    }

    const handleCodeSearch = async (data) => {
        setIsPopupVisible(false);
        const body = JSON.stringify({ "sql": "select it.code, it.description, fnqty.WhLCodeID, whl.Descr, fnqty.QtyProvision from item it left join itembarcode ibc on ibc.itemid = it.id left join (select IteID, WhLCodeID, QtyProvision from fnQtyProvision0(year(getdate()))) as fnqty on fnqty.iteid = it.id Inner join [whlocation] AS [WHL] ON (fnqty.WhLCodeID=Whl.CodeId) where ibc.BarCode = :0 or it.code=:1 group by it.code, it.description, fnqty.WhLCodeID, whl.Descr, fnqty.QtyProvision", "dbfqr": true, "params": [data, data] });
        try {
            const endpoints = [API_ENDPOINT, API_ENDPOINTOE, API_ENDPOINTZER];

            const [response1, response2, response3] = await Promise.all(
                endpoints.map(endpoint => fetch(endpoint, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Basic ' + btoa(`${wsUser}:${wsPass}`),
                    },
                    body: body,
                }))
            );

            const [data1, data2, data3] = await Promise.all([response1.json(), response2.json(), response3.json()]);

            const combinedData = [
                ...(Array.isArray(data1) ? data1 : []),
                ...(Array.isArray(data2) ? data2 : []),
                ...(Array.isArray(data3) ? data3 : [])
            ];

            if (combinedData.length > 0) {
                setLabelCode(combinedData[0].code);
                setLabelDescr(combinedData[0].description);
                setLabelBarcode(data);
                setCombinedData(combinedData);
            } else {
                setLabelCode('Δεν βρέθηκε προϊόν');
                setLabelDescr('');
                setLabelBarcode(data);
                setCombinedData([]);
            }

        } catch (error) {
            Alert.alert('Σφάλμα', `Σφάλμα στην αναζήτηση κωδικού. Μήνυμα: ${error}. `, [
                {
                    text: 'Ok',
                    onPress: () => console.error('Error calling API', error)
                }
            ]);
        }
        setPopupInputValue('');
    }

    const handleCancelPopup = () => {
        setPopupInputValue('');
        setIsPopupVisible(false);
    }

    return (
        <View style={styles.container}>
            <View style={styles.contentContainer}>
                <View style={styles.row}>
                    <Text style={styles.caption}>Κωδικός:</Text>
                    <Text style={styles.rowdata}>{labelCode}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.caption}>Περιγραφή:</Text>
                    <Text style={styles.rowdata}>{labelDescr}</Text>
                </View>
                <View style={styles.row}>
                    <Text style={styles.caption}>Barcode:</Text>
                    <Text style={styles.rowdata}>{labelBarcode}</Text>
                </View>
            </View>
            {/* Show store availability */}
            <View style={styles.contentContainerStores}>
                <View style={styles.rowHead}>
                    <Text style={styles.captionHead}>Διαθ. Καταστημάτων</Text>
                </View>
                <AvailabilityGrid combinedData={combinedData} />
            </View>
            <View style={styles.buttonContainer}>
                <Pressable onPress={() => setIsPopupVisible(true)}>
                    <Text style={styles.btnCode}>Κωδικός</Text>
                </Pressable>
                <Pressable onPress={startScanner}>
                    <Text style={styles.btnScan}>Scan</Text>
                </Pressable>
            </View>
            {isScanning ? (
                <BarcodeComponent onBarCodeScanned={handleBarcodeScanned} />
            ) : null}

            <Modal
                transparent={false}
                animationType="slide"
                visible={isPopupVisible}
                onRequestClose={() => setIsPopupVisible(false)}
            >
                <View style={styles.popupContainer}>
                    <View style={styles.popupDataContainer}>
                        <View style={styles.popup}>
                            <Text style={styles.textInputLabel}>Δώσε κωδικό αναζήτησης</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Κωδικός..."
                                value={popupInputValue}
                                onChangeText={(text) => setPopupInputValue(text)}
                                keyboardType="numeric"
                            />
                        </View>
                        <View style={styles.buttonPopupContainer}>
                            <TouchableOpacity
                                style={styles.popupSearchButton}
                                onPress={() => handleCodeSearch(popupInputValue)}
                            >
                                <Text style={styles.popupButtonText}>Αναζήτηση</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.popupCancelButton}
                                onPress={handleCancelPopup}
                            >
                                <Text style={styles.popupButtonText}>Άκυρο</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
    },
    contentContainer: {
        borderWidth: 0.7,
        borderRadius: 4,
        padding: 4,
        borderColor: '#b1b1b1',
    },
    contentContainerStores: {
        padding: 4,
        marginTop: 10,
        flex:1,        
    },
    caption: {
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
        width: '33%',
    },
    captionHead: {
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
        textAlign:'center'
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    rowHead:{
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rowdata: {
        fontSize: 16,
        textAlign: 'left',
        flex: 1,
    },
    inputData: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10
    },
    input: {
        height: 40,
        borderColor: 'gray',
        borderRadius: 4,
        borderWidth: 0.5,
        paddingHorizontal: 8,
        flex: 1
    },
    //Style for buttons
    buttonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '110%',
        position: 'absolute',
        bottom: 0,
        paddingHorizontal: 15,
        paddingBottom: 16,
    },
    btnCode: {
        backgroundColor: 'blue',
        borderRadius: 8,
        color: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 15,
        fontSize: 16,
        elevation: 8
    },
    btnScan: {
        backgroundColor: 'blue',
        borderRadius: 8,
        color: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 35,
        fontSize: 16,
        elevation: 8,
    },
    btnSave: {
        backgroundColor: 'green',
        borderRadius: 8,
        color: 'white',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 15,
        paddingHorizontal: 20,
        fontSize: 16,
        elevation: 8
    },
    // Styles for PopUp
    popupContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    popupDataContainer: {
        borderWidth: 0.7,
        borderRadius: 8,
        borderColor: '#b1b1b1',
        padding: 10,
    },
    popup: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonPopupContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '95%',
        paddingHorizontal: 10,
    },
    popupSearchButton: {
        backgroundColor: 'green',
        borderRadius: 8,
        color: 'white',
        alignItems: 'center',
        paddingVertical: 15,
        marginTop: 20,
        width: 100
    },
    popupCancelButton: {
        backgroundColor: 'red',
        borderRadius: 8,
        color: 'white',
        alignItems: 'center',
        paddingVertical: 15,
        marginTop: 20,
        width: 100
    },
    popupButtonText: {
        color: 'white',
    },
})
