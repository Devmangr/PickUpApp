import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
} from "react-native";
import { encode as btoa } from "base-64";
import { useAppContext } from "./AppContext";
import BarcodeComponent from "./scanner";

export default function ItemInfo() {
  const { wsHost, wsPort, wsUser, wsPass, wsRoot, branch, priceList } =
    useAppContext();
  const [isScanning, setIsScanning] = useState(false);
  const [labelCode, setLabelCode] = useState("");
  const [labelDescr, setLabelDescr] = useState("");
  const [labelBarcode, setLabelBarcode] = useState("");
  const [lastDocdate, setLastDocdate] = useState("");
  const [lastBuyPrice, setLastBuyPrice] = useState("");
  const [lastBuyQty, setLastBuyQty] = useState("");
  const [itemDescr, setItemDescr] = useState("");
  const [itemBal, setItemBal] = useState("");
  const [retailItems, setRetailItems] = useState([]);
  const [combinedData, setCombinedData] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupInputValue, setPopupInputValue] = useState("");
  const API_ENDPOINT = `http://${wsHost}:${wsPort}/${wsRoot}/DBDataSetValues`;
  const startScanner = () => {
    setIsScanning(true);
  };

  const handleCancelPopup = () => {
    setPopupInputValue("");
    setIsPopupVisible(false);
  };

  const handleCodeSearch = async (data) => {
    setIsPopupVisible(false);
    const body = JSON.stringify({
      sql: "declare @itid int = (select distinct id from item left join itembarcode ibc on ibc.itemid = item.id where code =:0 or ibc.barcode=:1); declare @itdescr varchar(150) = (select description from item where id=@itid); declare @itqty float = (select sum(QtyProvision) qty from fnQtyProvision1(year(getdate())) where WhLCodeID=:2 and iteid = @itid group by iteid); declare @itRetail varchar(max) = (select cast(Price as money) Retail, case when mat.Descr is null then 'TEM' else mat.Descr end matDescr from ITEMPRLIST prlist left join MATMESUNIT mat on mat.CodeID = prlist.MatMUCodeID where ItemID = @itid and PrListCodeID=:3 for json path) SELECT Sum( priQty ) PriQty, Sum( itemtrn.net_val) /  Sum(priQty ) CalcPrice, SUM(itemtrn.Start_Val) / Sum(PriQty) Price, Min( itemtrn.DocDate ) DocDate, am.code, am.name, @itdescr itdescr, @itqty itqty, @itRetail itRetail FROM ItemTrn left join allmaster am on am.id=itemtrn.amid WHERE itemid = @itid AND itemtrn.trndocId = (SELECT max(ITr.TrnDocID) FROM ItemTrn itr INNER JOIN DocTrn DTrn ON (DTrn.Id = Itr.TrnDocId  AND DTrn.UpdLastPrice = 1) INNER JOIN DocPrmDetSt DPrmSt ON (DPrmst.DocId = Dtrn.docprmid AND dprmst.LineType = itr.linetype AND dprmst.updLastPrice = 1) WHERE itr.ItemId = @itid AND dtrn.iscanceled = 0 AND itr.InVal = 1 AND net_val > 0 AND priqty > 0 AND itr.Id > 0 and itr.amRowType=2 and itr.WHLCodeID=:4) group by am.code, am.name Having Sum(PriQty)<>0 ",
      dbfqr: true,
      params: [data, data, branch, priceList, branch],
    });

    try {
      const endpoints = [API_ENDPOINT];

      const [response1] = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + btoa(`${wsUser}:${wsPass}`),
            },
            body: body,
          })
        )
      );
      const [data1] = await Promise.all([response1.json()]);
      const compineData = [...(Array.isArray(data1) ? data1 : [])];

      if (compineData.length > 0) {
        setLabelCode(data);
        setLabelDescr(compineData[0].name);
        setLastBuyPrice(compineData[0].Price.toFixed(2));
        setLastDocdate(compineData[0].DocDate.split("-").reverse().join("-"));
        setLastBuyQty(compineData[0].PriQty);
        setItemDescr(compineData[0].itdescr);
        setItemBal(compineData[0].itqty);
        setCombinedData(compineData);

        const retailData = JSON.parse(compineData[0].itRetail);
        setRetailItems(Array.isArray(retailData) ? retailData : [retailData]);
      } else {
        setLabelCode("Δεν βρέθηκε προϊόν");
        setLabelDescr("");
        setLabelBarcode(data);
        setRetailItems([]);
        setCombinedData([]);
      }
    } catch (error) {
      Alert.alert(
        "Σφάλμα",
        `Σφάλμα στην αναζήτηση barcode. Μήνυμα: ${error}. `,
        [
          {
            text: "Ok",
            onPress: () => console.error("Error calling API", error),
          },
        ]
      );
    }
    setPopupInputValue("");
  };

  const handleBarcodeScanned = async (data) => {
    setIsScanning(false);
    console.log('Scanned'); 
    const body = JSON.stringify({
      sql: "declare @itid int = (select distinct id from item left join itembarcode ibc on ibc.itemid = item.id where ibc.barcode=:1); declare @itdescr varchar(150) = (select description from item where id=@itid); declare @itqty float = (select sum(QtyProvision) qty from fnQtyProvision1(year(getdate())) where WhLCodeID=:2 and iteid = @itid group by iteid); declare @itRetail varchar(max) = (select cast(Price as money) Retail, case when mat.Descr is null then 'TEM' else mat.Descr end matDescr from ITEMPRLIST prlist left join MATMESUNIT mat on mat.CodeID = prlist.MatMUCodeID where ItemID = @itid and PrListCodeID=:3 for json path) SELECT Sum( priQty ) PriQty, Sum( itemtrn.net_val) /  Sum(priQty ) CalcPrice, SUM(itemtrn.Start_Val) / Sum(PriQty) Price, Min( itemtrn.DocDate ) DocDate, am.code, am.name, @itdescr itdescr, @itqty itqty, @itRetail itRetail FROM ItemTrn left join allmaster am on am.id=itemtrn.amid WHERE itemid = @itid AND itemtrn.trndocId = (SELECT max(ITr.TrnDocID) FROM ItemTrn itr INNER JOIN DocTrn DTrn ON (DTrn.Id = Itr.TrnDocId  AND DTrn.UpdLastPrice = 1) INNER JOIN DocPrmDetSt DPrmSt ON (DPrmst.DocId = Dtrn.docprmid AND dprmst.LineType = itr.linetype AND dprmst.updLastPrice = 1) WHERE itr.ItemId = @itid AND dtrn.iscanceled = 0 AND itr.InVal = 1 AND net_val > 0 AND priqty > 0 AND itr.Id > 0 and itr.amRowType=2 and itr.WHLCodeID=:4) group by am.code, am.name Having Sum(PriQty)<>0",
      dbfqr: true,
      params: [data, branch, priceList, branch],
    });

    try {
      const endpoints = [API_ENDPOINT];

      const [response1] = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + btoa(`${wsUser}:${wsPass}`),
            },
            body: body,
          })
        )
      );
      const [data1] = await Promise.all([response1.json()]);
      const compineData = [...(Array.isArray(data1) ? data1 : [])];

      if (compineData.length > 0) {
        setLabelCode(data);
        setLabelDescr(compineData[0].name);
        setLastBuyPrice(compineData[0].Price.toFixed(2));
        setLastDocdate(compineData[0].DocDate.split("-").reverse().join("-"));
        setLastBuyQty(compineData[0].PriQty);
        setItemDescr(compineData[0].itdescr);
        setItemBal(compineData[0].itqty);
        setCombinedData(compineData);

        const retailData = JSON.parse(compineData[0].itRetail);
        setRetailItems(Array.isArray(retailData) ? retailData : [retailData]);
      } else {
        setLabelCode("Δεν βρέθηκε προϊόν");
        setLabelDescr("");
        setLabelBarcode(data);
        setRetailItems([]);
        setCombinedData([]);
      }
    } catch (error) {
      Alert.alert(
        "Σφάλμα",
        `Σφάλμα στην αναζήτηση barcode. Μήνυμα: ${error}. `,
        [
          {
            text: "Ok",
            onPress: () => console.error("Error calling API", error),
          },
        ]
      );
    }
    setPopupInputValue("");
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <View style={styles.row}>
          <Text style={styles.caption}>Κωδικός:</Text>
          <Text style={styles.rowdata}>{labelCode}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.caption}>Περιγραφή:</Text>
          <Text style={styles.rowdata}>{itemDescr}</Text>
        </View>
        <View style={styles.row}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              width: "100%",
              textAlign: "center",
            }}
          >
            Στοιχεία Τελευταίας Αγοράς
          </Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.caption}>Επωνυμία:</Text>
          <Text style={styles.rowdata}>{labelDescr}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.caption}>Τελ. Ημ/νία:</Text>
          <Text style={styles.rowdata}>{lastDocdate}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.caption}>Τελ. Τιμή:</Text>
          <Text style={styles.rowdata}>{lastBuyPrice}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.caption}>Τελ. Ποσότητα:</Text>
          <Text style={styles.rowdata}>{lastBuyQty}</Text>
        </View>
      </View>
      <View style={[styles.contentContainer, { marginTop: 10 }]}>
        <View style={styles.row}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "600",
              width: "100%",
              textAlign: "center",
            }}
          >
            Στοιχεία Πώλησης
          </Text>
        </View>
        <View style={styles.row}>
          <Text>Υπόλοιπο Καταστήματος: {itemBal}</Text>
        </View>
        {/* Δυναμική απεικόνιση των στοιχείων του itRetail */}
        {retailItems.map((item, index) => (
          <View style={styles.row} key={index}>
            <Text style={styles.caption}>Λιανική Τιμή:</Text>
            <Text style={styles.rowdata}>
              {item.Retail} {item.matDescr && <Text>{item.matDescr}</Text>}
            </Text>
          </View>
        ))}
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
        <BarcodeComponent onBarCodeScanned={handleBarcodeScanned} onClose={() => setIsScanning(false)}/>
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
  );
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
    borderColor: "#b1b1b1",
  },
  contentContainerStores: {
    padding: 4,
    marginTop: 10,
    flex: 1,
  },
  caption: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
    width: "33%",
  },
  captionHead: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  rowHead: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowdata: {
    fontSize: 16,
    textAlign: "left",
    flex: 1,
  },
  inputData: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderRadius: 4,
    borderWidth: 0.5,
    paddingHorizontal: 8,
    flex: 1,
  },
  //Style for buttons
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "110%",
    position: "absolute",
    bottom: 0,
    paddingHorizontal: 15,
    paddingBottom: 16,
  },
  btnCode: {
    backgroundColor: "blue",
    borderRadius: 8,
    color: "white",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 15,
    fontSize: 16,
    elevation: 8,
  },
  btnScan: {
    backgroundColor: "blue",
    borderRadius: 8,
    color: "white",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 35,
    fontSize: 16,
    elevation: 8,
  },
  btnSave: {
    backgroundColor: "green",
    borderRadius: 8,
    color: "white",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    paddingHorizontal: 20,
    fontSize: 16,
    elevation: 8,
  },
  // Styles for PopUp
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
  },
  popup: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonPopupContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "95%",
    paddingHorizontal: 10,
  },
  popupSearchButton: {
    backgroundColor: "green",
    borderRadius: 8,
    color: "white",
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 20,
    width: 100,
  },
  popupCancelButton: {
    backgroundColor: "red",
    borderRadius: 8,
    color: "white",
    alignItems: "center",
    paddingVertical: 15,
    marginTop: 20,
    width: 100,
  },
  popupButtonText: {
    color: "white",
  },
});
