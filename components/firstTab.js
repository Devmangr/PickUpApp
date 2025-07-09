import React, { useState, useCallback } from "react";
import {
  View, Text, TextInput, Pressable, StyleSheet,
  Modal, TouchableOpacity, Alert
} from "react-native";
import BarcodeComponent from "./scanner";
import { encode as btoa } from "base-64";
import { useAppContext } from "./AppContext";
import { useTempStorage } from "../database/useTempStorage";
import { useFocusEffect } from "@react-navigation/native";
import LoadTempModal from "./LoadTempModal";

// 👇 Helper component για γραμμές info
const InfoRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.caption}>{label}</Text>
    <Text style={styles.rowdata}>{value}</Text>
  </View>
);

export default function FirstTab({ selectedType }) {
  const [qtyValue, setQtyValue] = useState("");
  const [popupInputValue, setPopupInputValue] = useState("");
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [isScanning, setIsScanning] = useState(false);

  const {
    itemData, handleQuantityChange,
    wsHost, wsPort, wsRoot, wsUser, wsPass,
    priceList, branch
  } = useAppContext();

  const [product, setProduct] = useState({
    itemid: "",
    code: "",
    description: "",
    barcode: "",
    price: "",
    unit: "",
    balance: ""
  });

  const { getSets, getItemsBySetId } = useTempStorage();
  const [availableSets, setAvailableSets] = useState([]);
  const [showLoadModal, setShowLoadModal] = useState(false);

  const API_ENDPOINT = `http://${wsHost}:${wsPort}/${wsRoot}/DBDataSetValues`;

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const sets = await getSets(selectedType);
        if (sets.length > 0) {
          setAvailableSets(sets);
          Alert.alert(
            'Βρέθηκαν προσωρινά σετ',
            `Βρέθηκαν ${sets.length} σετ. Θέλεις να τα φορτώσω;`,
            [
              { text: 'Όχι', style: 'cancel' },
              { text: 'Ναι', onPress: () => setShowLoadModal(true) }
            ]
          );
        }
      })();
    }, [selectedType])
  );

  const clearProduct = () => {
    setProduct({ itemid: "", code: "", description: "", barcode: "", price: "", unit: "", balance: "" });
    setQtyValue("");
  };

  const populateItemFields = (item) => {
    if (item) {
      setProduct({
        itemid: item.id,
        code: item.code,
        description: item.description,
        barcode: item.barcode || "",
        price: item.price || "",
        unit: item.unit || "",
        balance: item.balance || ""
      });
    } else {
      setProduct({
        itemid: "",
        code: "Δεν βρέθηκε προϊόν",
        description: "",
        barcode: "",
        price: "",
        unit: "",
        balance: ""
      });
    }
  };

  const fetchItem = async (query, params) => {
    try {
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${wsUser}:${wsPass}`)
        },
        body: JSON.stringify({ sql: query, dbfqr: true, params })
      });
      const data = await response.json();
      return data?.[0] || null;
    } catch (e) {
      console.error("❌ API error:", e);
      return null;
    }
  };

  const handleBarcodeScanned = async (data) => {
    setIsScanning(false);
    const sql = `select it.id, it.code, it.description, isnull(prlst.price, it.Retail_Price) price, fnqty.QtyProvision balance,
                 munit.Descr unit from item it inner join itembarcode ibc on ibc.itemid = it.id
                 left join MATMESUNIT munit on munit.CodeID = ibc.SecUnit_Id
                 outer apply(select top(1) itemid,price from ITEMPRLIST ItePrList
                 inner join PriceListDim PrLstDim on PrLstDim.ID=ItePrList.PrListDimID
                 inner join PRICELIST prList on prList.CodeID=ItePrList.PrListCodeID
                 where prList.CodeID=:0 and itemid=it.id order by prList.type desc) as PrLst
                 left join (select * from fnQtyProvision1(year(getdate())) where WhLCodeID=:1) fnqty on fnqty.IteID=it.id
                 where ibc.barcode=:2`;
    const result = await fetchItem(sql, [priceList, branch, data]);
    populateItemFields({ ...result, barcode: data });
  };

  const handleCodeSearch = async (data) => {
    setIsPopupVisible(false);
    const sql = `select top(1) it.id, it.code, it.description, isnull(prlst.price, it.Retail_Price) price, fnqty.QtyProvision balance,
                 ibc.barcode from item it
                 outer apply(select top(1) itemid,price from ITEMPRLIST ItePrList
                 inner join PriceListDim PrLstDim on PrLstDim.ID=ItePrList.PrListDimID
                 inner join PRICELIST prList on prList.CodeID=ItePrList.PrListCodeID
                 where prList.CodeID=:0 and itemid=it.id) as PrLst
                 left join itembarcode ibc on ibc.itemid=it.id
                 left join (select * from fnQtyProvision1(year(getdate())) where WhLCodeID=:1) fnqty on fnqty.IteID=it.id
                 where it.code=:2 or ibc.barcode=:3`;
    const result = await fetchItem(sql, [priceList, branch, data, data]);
    populateItemFields(result);
    setPopupInputValue("");
  };

  const handleSave = () => {
    const quantity = parseInt(qtyValue, 10) || 0;
    if (quantity === 0 || quantity > 50) {
      return Alert.alert("Σφάλμα", "Η ποσότητα πρέπει να είναι μεταξύ 1 και 50");
    }
    handleQuantityChange([...itemData, {
      itemid: product.itemid,
      code: product.code,
      itemName: product.description,
      quantity
    }]);
    clearProduct();
  };

  const handleLoadSets = async (selectedSetIds) => {
    let allItems = [];
    for (const id of selectedSetIds) {
      const items = await getItemsBySetId(id);
      allItems = allItems.concat(items);
    }
    handleQuantityChange(allItems);
    setShowLoadModal(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <InfoRow label="Κωδικός:" value={product.code} />
        <InfoRow label="Περιγραφή:" value={product.description} />
        <InfoRow label="Μον. Μέτρ:" value={product.unit} />
        <InfoRow label="Τιμή:" value={product.price} />
        <InfoRow label="Barcode:" value={product.barcode} />
        <InfoRow label="Διαθ. Υπ:" value={product.balance} />
        <View style={styles.row}>
          <Text style={styles.caption}>Ποσότητα:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ποσότητα..."
            value={qtyValue}
            onChangeText={setQtyValue}
            keyboardType="numeric"
          />
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <Pressable onPress={() => setIsPopupVisible(true)}>
          <Text style={styles.btnCode}>Κωδικός</Text>
        </Pressable>
        <Pressable onPress={() => setIsScanning(true)}>
          <Text style={styles.btnScan}>Scan</Text>
        </Pressable>
        <Pressable onPress={handleSave}>
          <Text style={styles.btnSave}>Save</Text>
        </Pressable>
      </View>

      {isScanning && <BarcodeComponent onBarCodeScanned={handleBarcodeScanned} onClose={() => setIsScanning(false)} />}

      <Modal
        transparent={false}
        animationType="slide"
        visible={isPopupVisible}
        onRequestClose={() => setIsPopupVisible(false)}
      >
        <View style={styles.popupContainer}>
          <View style={styles.popupDataContainer}>
            <View style={styles.popup}>
              <Text style={styles.textInputLabel}>Δώσε κωδικό</Text>
              <TextInput
                style={styles.input}
                placeholder="Κωδικός..."
                value={popupInputValue}
                onChangeText={setPopupInputValue}
                keyboardType="numeric"
              />
            </View>
            <View style={styles.buttonPopupContainer}>
              <TouchableOpacity style={styles.popupSearchButton} onPress={() => handleCodeSearch(popupInputValue)}>
                <Text style={styles.popupButtonText}>Αναζήτηση</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.popupCancelButton} onPress={() => setIsPopupVisible(false)}>
                <Text style={styles.popupButtonText}>Άκυρο</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <LoadTempModal
        visible={showLoadModal}
        sets={availableSets}
        onCancel={() => setShowLoadModal(false)}
        operationType={selectedType}
        onConfirm={handleLoadSets}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  contentContainer: {
    borderWidth: 0.7, borderRadius: 4, padding: 4, borderColor: "#b1b1b1"
  },
  caption: {
    fontSize: 18, fontWeight: "600", marginRight: 8, width: "33%"
  },
  row: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 10
  },
  rowdata: {
    fontSize: 16, textAlign: "left", flex: 1
  },
  input: {
    height: 40, borderColor: "gray", borderRadius: 4,
    borderWidth: 0.5, paddingHorizontal: 8, flex: 1
  },
  buttonContainer: {
    flexDirection: "row", justifyContent: "space-between",
    width: "110%", position: "absolute", bottom: 0,
    paddingHorizontal: 15, paddingBottom: 16,
  },
  btnCode: {
    backgroundColor: "blue", borderRadius: 8, color: "white",
    paddingVertical: 15, paddingHorizontal: 15, fontSize: 16, elevation: 8,
  },
  btnScan: {
    backgroundColor: "blue", borderRadius: 8, color: "white",
    paddingVertical: 15, paddingHorizontal: 35, fontSize: 16, elevation: 8,
  },
  btnSave: {
    backgroundColor: "green", borderRadius: 8, color: "white",
    paddingVertical: 15, paddingHorizontal: 20, fontSize: 16, elevation: 8,
  },
  popupContainer: {
    flex: 1, justifyContent: "center", alignItems: "center", padding: 16
  },
  popupDataContainer: {borderWidth: 0.7, borderRadius: 8, borderColor: "#b1b1b1", padding: 10,},
  popup: {flexDirection: "row", alignItems: "center", justifyContent: "center", },
  textInputLabel: { fontSize: 18, marginBottom: 10 },
  buttonPopupContainer: {
    flexDirection: "row", justifyContent: "space-between",
    width: "95%", paddingHorizontal: 10
  },
  popupSearchButton: {
    backgroundColor: "green", borderRadius: 8, alignItems: "center",
    paddingVertical: 15, marginTop: 20, width: 100,
  },
  popupCancelButton: {
    backgroundColor: "red", borderRadius: 8, alignItems: "center",
    paddingVertical: 15, marginTop: 20, width: 100,
  },
  popupButtonText: { color: "white" },
});
