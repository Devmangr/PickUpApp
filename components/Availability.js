import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Alert,
} from "react-native";
import BarcodeComponent from "./scanner";
import { encode as btoa } from "base-64";
import { useAppContext } from "./AppContext";
import AvailabilityGrid from "./AvailabilityGrid";

const Availability = () => {
  const { wsHost, wsPort, wsUser, wsPass } = useAppContext();
  const [isScanning, setIsScanning] = useState(false);
  const [labelCode, setLabelCode] = useState("");
  const [labelDescr, setLabelDescr] = useState("");
  const [labelBarcode, setLabelBarcode] = useState("");
  const [combinedData, setCombinedData] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [popupInputValue, setPopupInputValue] = useState("");

  const endpoints = [
    `http://${wsHost}:${wsPort}/root/DBDataSetValues`,
    `http://${wsHost}:${wsPort}/oe/DBDataSetValues`,
    `http://${wsHost}:${wsPort}/zer/DBDataSetValues`,
  ];

  const fetchFromEndpoints = async (params, isBarcode = true) => {
    const sql = isBarcode
      ? `SELECT it.code, it.description, fnqty.WhLCodeID, whl.Descr, fnqty.QtyProvision
         FROM item it
         LEFT JOIN itembarcode ibc ON ibc.itemid = it.id
         LEFT JOIN (SELECT IteID, WhLCodeID, QtyProvision FROM fnQtyProvision0(YEAR(GETDATE()))) AS fnqty
         ON fnqty.iteid = it.id
         INNER JOIN whlocation AS WHL ON fnqty.WhLCodeID = Whl.CodeId
         WHERE ibc.BarCode =:0
         GROUP BY it.code, it.description, fnqty.WhLCodeID, whl.Descr, fnqty.QtyProvision`
      : `SELECT it.code, it.description, fnqty.WhLCodeID, whl.Descr, fnqty.QtyProvision
         FROM item it
         LEFT JOIN itembarcode ibc ON ibc.itemid = it.id
         LEFT JOIN (SELECT IteID, WhLCodeID, QtyProvision FROM fnQtyProvision0(YEAR(GETDATE()))) AS fnqty
         ON fnqty.iteid = it.id
         INNER JOIN whlocation AS WHL ON fnqty.WhLCodeID = Whl.CodeId
         WHERE it.code=:1 OR ibc.BarCode =:2
         GROUP BY it.code, it.description, fnqty.WhLCodeID, whl.Descr, fnqty.QtyProvision`;

    const body = JSON.stringify({
      sql,
      dbfqr: true,
      params,
    });

    try {
      const responses = await Promise.all(
        endpoints.map((endpoint) =>
          fetch(endpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Basic " + btoa(`${wsUser}:${wsPass}`),
            },
            body,
          })
        )
      );

      const jsonData = await Promise.all(responses.map((res) => res.json()));
      return jsonData.flat().filter(Boolean);
    } catch (error) {
      console.error("API Error:", error);
      Alert.alert("Σφάλμα", `Αποτυχία σύνδεσης: ${error.message}`);
      return [];
    }
  };

  const handleBarcodeScanned = async (data) => {
    setIsScanning(false);
    const results = await fetchFromEndpoints([data], true);
    updateProductState(results, data);
  };

  const handleCodeSearch = async (data) => {
    setIsPopupVisible(false);
    const results = await fetchFromEndpoints([data, data], false);
    updateProductState(results, data);
    setPopupInputValue("");
  };

  const updateProductState = (dataArray, barcodeOrCode) => {
    if (dataArray.length > 0) {
      setLabelCode(dataArray[0].code);
      setLabelDescr(dataArray[0].description);
    } else {
      setLabelCode("Δεν βρέθηκε προϊόν");
      setLabelDescr("");
    }
    setLabelBarcode(barcodeOrCode);
    setCombinedData(dataArray);
  };

  const handleCancelPopup = () => {
    setPopupInputValue("");
    setIsPopupVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.contentContainer}>
        <InfoRow label="Κωδικός:" value={labelCode} />
        <InfoRow label="Περιγραφή:" value={labelDescr} />
        <InfoRow label="Barcode:" value={labelBarcode} />
      </View>

      <View style={styles.contentContainerStores}>
        <Text style={styles.captionHead}>Διαθ. Καταστημάτων</Text>
        <AvailabilityGrid combinedData={combinedData} />
      </View>

      <View style={styles.buttonContainer}>
        <Pressable onPress={() => setIsPopupVisible(true)}>
          <Text style={styles.btnCode}>Κωδικός</Text>
        </Pressable>
        <Pressable onPress={() => setIsScanning(true)}>
          <Text style={styles.btnScan}>Scan</Text>
        </Pressable>
      </View>

      {isScanning && (
        <BarcodeComponent
          onBarCodeScanned={handleBarcodeScanned}
          onClose={() => setIsScanning(false)}
        />
      )}

      <Modal
        transparent={false}
        animationType="slide"
        visible={isPopupVisible}
        onRequestClose={() => setIsPopupVisible(false)}
      >
        <View style={styles.popupContainer}>
          <View style={styles.popupDataContainer}>
            <Text style={styles.textInputLabel}>Δώσε κωδικό αναζήτησης</Text>
            <TextInput
              style={styles.input}
              placeholder="Κωδικός..."
              value={popupInputValue}
              onChangeText={setPopupInputValue}
              keyboardType="numeric"
            />
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
};

const InfoRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.caption}>{label}</Text>
    <Text style={styles.rowdata}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  contentContainer: {
    marginBottom: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingBottom: 10,
  },
  contentContainerStores: {
    flex: 1,
    marginTop: 10,
  },
  captionHead: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    marginBottom: 6,
    justifyContent: "space-between",
  },
  caption: {
    fontWeight: "bold",
    fontSize: 14,
  },
  rowdata: {
    fontSize: 14,
    flexShrink: 1,
    textAlign: "right",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 20,
  },
  btnCode: {
    backgroundColor: "blue",
    color: "white",
    paddingVertical: 15,
    paddingHorizontal: 25,
    borderRadius: 6,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16
  },
  btnScan: {
    backgroundColor: "green",
    color: "white",
    paddingVertical: 15,
    paddingHorizontal: 35,
    borderRadius: 6,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 16
  },
  popupContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  popupDataContainer: {
    width: "90%",
    padding: 20,
    backgroundColor: "#f9f9f9",
    borderRadius: 10,
    elevation: 5,
  },
  textInputLabel: {
    marginBottom: 10,
    fontSize: 16,
    fontWeight: "bold",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 15,
  },
  buttonPopupContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  popupSearchButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  popupCancelButton: {
    backgroundColor: "#dc3545",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 6,
  },
  popupButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default Availability;
