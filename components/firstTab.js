import React, { useState } from "react";
import { View, Text, TextInput, Pressable, StyleSheet, Modal, TouchableOpacity, Alert, Button } from "react-native";
import BarcodeComponent from "./scanner";
import { encode as btoa } from 'base-64';
import { useAppContext } from "./AppContext";
import * as Print from 'expo-print';

export default function FirstTab() {
  const [qtyValue, setQtyValue] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const { itemData, handleQuantityChange, wsHost, wsPort, wsRoot, wsUser, wsPass, priceList } = useAppContext();
  const [isScanning, setIsScanning] = useState(false);
  const [itemid, setItemid] = useState('');
  const [labelCode, setLabelCode] = useState('');
  const [labelDescr, setLabelDescr] = useState('');
  const [labelBarcode, setLabelBarcode] = useState('');
  const [labelPrice, setLabelPrice] = useState('');
  const [labelUnit, setLabelUnit] = useState('');
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupInputValue, setPopupInputValue] = useState('');
  const API_ENDPOINT = `http://${wsHost}:${wsPort}/${wsRoot}/DBDataSetValues`;

  //test gia print
  const createAndPrintPDF = async () => {
    const htmlContent = `
    <html>
      <body>
        <h1 style="color: blue; text-align: center;">Test PDF Document</h1>
        <p>This is a test PDF generated from React Native with Expo.</p>
      </body>
    </html>
  `;

    try {
      // Δημιουργία PDF και αποθήκευση στο σύστημα αρχείων
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
      });
      console.log('PDF saved to:', uri);

      // Στέλνουμε το PDF για εκτύπωση
      await Print.printAsync({ uri });
    } catch (error) {
      console.error('Error creating PDF:', error);
    }
  };

  const startScanner = () => {
    setIsScanning(true);
  };

  const handleSave = () => {
    if (qtyValue === '') {
      Alert.alert('Σφάλμα', `Δεν επιτρέπεται μηδενική ποσότητα. `, [
        {
          text: 'Ok',
          onPress: () => console.error('Error calling API')
        }
      ]);
    } else {
      const newItem = {
        itemid: itemid,
        code: labelCode,
        itemName: labelDescr,
        itemNewPrice: newPrice,
        quantity: parseInt(qtyValue, 10) || 0,
      }

      const updatedData = [...itemData, newItem];

      handleQuantityChange(updatedData);

      setLabelCode('');
      setLabelDescr('');
      setLabelBarcode('');
      setLabelPrice('');
      setLabelUnit('');
      setQtyValue('');
      setNewPrice('');
    }
  };

  const handleBarcodeScanned = async (data) => {

    setIsScanning(false);
    try {
      const body = JSON.stringify({ "sql": "select it.id, it.code, it.description, isnull(prlst.price, it.Retail_Price) price, munit.Descr unit from item it inner join itembarcode ibc on ibc.itemid = it.id left join MATMESUNIT munit on munit.CodeID = ibc.SecUnit_Id outer apply(select top(1) itemid,price, PrLstDim.ValidFromDT, PrLstDim.ValidToDT from ITEMPRLIST ItePrList inner join PriceListDim PrLstDim on PrLstDim.ID=ItePrList.PrListDimID inner join PRICELIST prList on prList.CodeID=ItePrList.PrListCodeID where prList.CodeID=:0 and itemid=it.id order by prList.type desc, PrLstDim.ValidFromDT) as PrLst where ibc.barcode=:1", "dbfqr": true, "params": [priceList, data] });
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${wsUser}:${wsPass}`),
        },
        body: body,
      });
      const apiData = await response.json();

      if (apiData && apiData.length > 0) {
        setItemid(apiData[0].id);
        setLabelCode(apiData[0].code);
        setLabelDescr(apiData[0].description);
        setLabelPrice(apiData[0].price);
        setLabelUnit(apiData[0].unit)
        setLabelBarcode(data);
      } else {
        setLabelCode('Δεν βρέθηκε προϊόν');
        setLabelDescr('');
        setLabelPrice('');
        setLabelUnit('');
        setLabelBarcode(data);
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
    try {
      const body = JSON.stringify({ "sql": "select top(1) it.id, it.code, it.description, cast(isnull(prlst.price, it.Retail_Price) as money) price, ibc.barcode from item it outer apply(select top(1) itemid,price, PrLstDim.ValidFromDT, PrLstDim.ValidToDT from ITEMPRLIST ItePrList inner join PriceListDim PrLstDim on PrLstDim.ID=ItePrList.PrListDimID inner join PRICELIST prList on prList.CodeID=ItePrList.PrListCodeID where prList.CodeID=:0 and itemid=it.id) as PrLst left join itembarcode ibc on ibc.itemid=it.id where it.code=:1 or ibc.barcode=:2", "dbfqr": true, "params": [priceList, data, data] });
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${wsUser}:${wsPass}`),
        },
        body: body,
      });
      const apiData = await response.json();

      if (apiData && apiData.length > 0) {
        setItemid(apiData[0].id);
        setLabelCode(apiData[0].code);
        setLabelDescr(apiData[0].description);
        setLabelPrice(apiData[0].price);
        setLabelBarcode(apiData[0].barcode);
      } else {
        setLabelCode('Δεν βρέθηκε προϊόν');
        setLabelDescr('');
        setLabelPrice('');
        setLabelUnit('');
        setLabelBarcode('');
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
          <Text style={styles.caption}>Μον. Μέτρ:</Text>
          <Text style={styles.rowdata}>{labelUnit}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.caption}>Τιμή:</Text>
          <Text style={styles.rowdata}>{labelPrice}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.caption}>Barcode:</Text>
          <Text style={styles.rowdata}>{labelBarcode}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.caption}>Ποσότητα:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ποσότητα..."
            value={qtyValue}
            onChangeText={(qty) => setQtyValue(qty)}
            keyboardType="numeric"
          />
        </View>
        <View style={styles.row}>
          <Text style={styles.caption}>Αλλαγή τιμής:</Text>
          <TextInput
            style={styles.input}
            placeholder="Αλ. Τιμής..."
            value={newPrice}
            onChangeText={(pr) => setNewPrice(pr)}
            keyboardType="numeric"
          />
        </View>
      </View>
      <View style={styles.buttonContainer}>
        <Pressable onPress={() => setIsPopupVisible(true)}>
          <Text style={styles.btnCode}>Κωδικός</Text>
        </Pressable>
        <Pressable onPress={startScanner}>
          <Text style={styles.btnScan}>Scan</Text>
        </Pressable>
        <Pressable onPress={handleSave}>
          <Text style={styles.btnSave}>Save</Text>
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>PDF Generation and Printing Example</Text>
        <Button
          title="Create and Print PDF"
          onPress={createAndPrintPDF}
        />
      </View>
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
  caption: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    width: '33%'
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
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
