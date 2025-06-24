import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Alert, Button } from "react-native";
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAppContext } from "./AppContext";
import { encode as btoa } from "base-64";
import { useTempStorage } from '../database/useTempStorage';

const ParastatikoDetail = ({ selectedType, sendPurchase: propSendPurchase, suppliers = [] }) => {
  const [seriecode, setSeriecode] = useState("");
  const [docnumber, setDocnumber] = useState("");

  const [supplierDropdownData, setSupplierDropdownData] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { wsHost, wsPort, wsRoot, wsUser, wsPass, seriesM, seriesT, branch, handleQuantityChange, selectSup: selectedSupplierId, updateSelectSup, itemData } = useAppContext();
  const [remarks, setRemarks] = useState("");
  const API_ENDPOINT = `http://${wsHost}:${wsPort}/${wsRoot}/DBDataSetValues`;
  const [btnLoading, setBtnLoading] = useState(false);
  const [stores] = useState([
    { id: 1, name: "Hellas", companyBranch: 2, sales_amid: 1960021490, Ship_amID: 1960021490, purch_amid: 37, companyId: 1, rootpath: "root", purch_serie: "02Μ01" },
    { id: 2, name: "Princess", companyBranch: 3, sales_amid: 1960021490, Ship_amID: 1960021491, purch_amid: 37, companyId: 1, rootpath: "root", purch_serie: "03Μ02" },
    { id: 3, name: "Aegean", companyBranch: 1, sales_amid: 32, Ship_amID: 32, purch_amid: 1960021494, companyId: 2, rootpath: "oe", purch_serie: "01Μ01" },
    { id: 4, name: "Imperial", companyBranch: 2, sales_amid: 32, Ship_amID: 33, purch_amid: 1960021494, companyId: 2, rootpath: "oe", purch_serie: "02Μ02" },
    { id: 5, name: "Village", companyBranch: 3, sales_amid: 32, Ship_amID: 34, purch_amid: 1960021494, companyId: 2, rootpath: "oe", purch_serie: "03Μ03" },
    { id: 6, name: "Park", companyBranch: 4, sales_amid: 32, Ship_amID: 35, purch_amid: 1960021494, companyId: 2, rootpath: "oe", purch_serie: "04Μ04" },
  ]);
  const [selectedStoreId, setSelectedStoreId] = useState(null);

  const getStoreByBranchAndRoot = (branchId, root) =>
    stores.find(store => store.companyBranch === Number(branchId) && store.rootpath === root);

  const getStoreById = (id) => stores.find(store => store.id === Number(id));

  const { saveTempData, clearSetsForSupplier } = useTempStorage();
  const supplierObj = supplierDropdownData.find(s => s.id === selectedSupplierId) || {};
  const supplierName = supplierObj.name || '—';

  const handleSaveTemp = async () => {
    try {
      await saveTempData({ operationType: selectedType, supplierId: selectedSupplierId, supplierName, items: itemData });
      Alert.alert('ΟΚ', 'Τα δεδομένα αποθηκεύτηκαν προσωρινά.');
      clearFields();
      handleQuantityChange([]);
    } catch (e) {
      console.error(e);
      Alert.alert('Σφάλμα', 'Κάτι πήγε στραβά στην αποθήκευση.');
    }
  };

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    }
  };

  const clearFields = () => {
    console.log('🧹 Καθαρισμός πεδίων...');
    setDocnumber("");
    updateSelectSup(null);
    setSelectedStoreId(null);
    setSeriecode("");
    setRemarks("");
    setSelectedDate(new Date());
    handleQuantityChange([]);
  };

  const sendPurchase = async (jsonData, customRoot = null) => {
    setBtnLoading(true);
    const rootToUse = customRoot || wsRoot;

    const url = `http://${wsHost}:${wsPort}/${rootToUse}/ApplyBOData`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${wsUser}:${wsPass}`),
        },
        body: JSON.stringify(jsonData),
      });
      const apiData = await response.json();

      setBtnLoading(false);
      if (apiData.error) {
        Alert.alert("Σφάλμα", `Μήνυμα λάθους: ${apiData.error}`, [
          {
            text: "Ok",
            onPress: () => console.log(apiData.error),
          },
        ]);
      } else {
        Alert.alert(
          "Ενημέρωση",
          `Το παραστατικό με αριθμό ${docnumber} καταχωρήθηκε!!`,
          [
            {
              text: "Ok",
              onPress: () => clearFields(),
            },
          ]
        );
        await clearSetsForSupplier(selectedType, selectedSupplierId);
      }
    } catch (error) {
      Alert.alert(
        "Σφάλμα",
        `Σφάλμα στην αποστολή του παραστατικού με αριθμό ${docnumber}. Μήνυμα: ${apiData.error}. `,
        [
          {
            text: "Ok",
            onPress: () => console.error("Error sending purchase", error),
          },
        ]
      );
    }
  };

  const fetchSuppliers = async () => {
    try {
      const body = JSON.stringify({
        sql: "select id, code, name from supplier order by name",
        dbfqr: true,
        params: [],
      });
      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${wsUser}:${wsPass}`),
        },
        body: body,
      });
      const apiData = await response.json();
      setSupplierDropdownData(apiData);
    } catch (error) {
      console.error("Error fetching suppliers", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleDefaultSave = () => {
    const data = {
      docprmid:
        selectedType === "returning"
          ? 32
          : selectedType === "receiving"
            ? 28
            : selectedType === "ordersup"
              ? 27
              : 70,
      seriecode: selectedType === "receiving" ? seriesT : seriesM,
      docdate: selectedDate.toISOString().split("T")[0],
      comment: remarks,
      Itetrn: itemData.map((item) => ({
        itemid: item.itemid,
        priqty: item.quantity,
        price: 0.0,
        discval1: 0.0,
        discval2: 0.0,
        discval3: 0.0,
      })),
    };
    if (
      selectedType === "receiving" ||
      selectedType === "returning" ||
      selectedType === "ordersup"
    ) {
      if (selectedType === "ordersup") {
        data.amtrn_S1 = [{ amid: selectSup }];
      } else {
        data.amtrn_S1 = [{ amid: selectedSupplierId }];
      }
      data.Number = docnumber;
      data.docserie = seriecode;
      data.branchid = branch;
    } else if (selectedType === "inventory") {
      data.branchid = branch;
    }
    const jsonData = {
      bo: selectedType === "inventory" ? "TSTORETRNBO" : "TPURCHASETRNBO",
      data,
    };
    if (selectedType === "returning" || selectedType === "ordersup") {
      jsonData.doprint = 2;
    }
    sendPurchase(jsonData);
  };

  const handleSave = async () => {
    if (selectedType === "intmovement") {
      const sourceStore = getStoreByBranchAndRoot(branch, wsRoot);
      const destStore = getStoreById(selectedStoreId);

      const baseItems = itemData.map(item => ({
        itemid: item.itemid,
        priqty: item.quantity,
        price: 0.0,
        discval1: 0.0,
        discval2: 0.0,
        discval3: 0.0,
      }));

      const common = {
        docdate: selectedDate.toISOString().split("T")[0],
        comment: remarks,
        Itetrn: baseItems,
      };

      if (sourceStore.companyId === destStore.companyId) {
        const data = {
          docprmid: 25,
          ...common,
          seriecode: seriesM,
          branchid: branch,
          DOCTPLUS: [{ WHLCodeIDTo: destStore.companyBranch }]
        };

        await sendPurchase({ bo: "TSTORETRNBO", data, doprint: 2 });
      } else {
        const sale = {
          docprmid: 20,
          ...common,
          seriecode: seriesM,
          branchid: branch,
          amtrn_S1: [{ amid: destStore.sales_amid }],
          DOCTPLUS: [{ Ship_amID: destStore.Ship_amID }]
        };
        const purchase = {
          docprmid: 28,
          ...common,
          seriecode: destStore.purch_serie,
          branchid: destStore.companyBranch,
          amtrn_S1: [{ amid: destStore.purch_amid }],
        };

        await sendPurchase({ bo: "TSALESTRNBO", data: sale, doprint: 2 });
        await sendPurchase({ bo: "TPURCHASETRNBO", data: purchase }, destStore.rootpath);
      }
    } else {
      handleDefaultSave();
    }
  };

  return (
    <View style={styles.container}>
      {selectedType != "inventory" && selectedType != "ordersup" && selectedType != "intmovement" && (
        <View style={styles.row}>
          <Dropdown
            style={styles.dropdown}
            data={supplierDropdownData.map((sup) => ({ label: sup.name, value: sup.id }))}
            search
            labelField="label"
            valueField="value"
            placeholder="Επιλογή Προμηθευτή"
            searchPlaceholder="Αναζήτηση..."
            value={selectedSupplierId}
            onChange={item => updateSelectSup(item.value)}
          />
        </View>
      )}
      {selectedType === "intmovement" && (
        <View style={styles.row}>
          <Text style={[styles.caption, styles.alignRight]}>Κατάστημα:</Text>
          <Dropdown
            style={styles.dropdown}
            data={stores.map((store) => ({ label: store.name, value: store.id }))}
            search
            labelField="label"
            valueField="value"
            placeholder="Επιλογή Καταστήματος"
            searchPlaceholder="Αναζήτηση..."
            value={selectedStoreId}
            onChange={(item) => setSelectedStoreId(item.value)}
          />
        </View>
      )}
      <View style={styles.row}>
        <Text style={[styles.caption, styles.alignRight]}>Ημερομηνία:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ημερομηνία.."
          value={selectedDate.toISOString().split("T")[0]}
          onTouchStart={() => setShowDatePicker(true)}
        />
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={handleDateChange}
          />
        )}
      </View>
      {selectedType === "receiving" && (
        <View style={styles.row}>
          <Text style={[styles.caption, styles.alignRight]}>Αριθμός:</Text>
          <TextInput
            style={styles.input}
            placeholder="Αριθμός.."
            value={docnumber}
            onChangeText={(text) => setDocnumber(text)}
          />
        </View>
      )}
      {selectedType === "receiving" && (
        <View style={styles.row}>
          <Text style={[styles.caption, styles.alignRight]}>Σειρά:</Text>
          <TextInput
            style={styles.input}
            placeholder="Σειρά.."
            value={seriecode || "."}
            onChangeText={(text) => setSeriecode(text)}
          />
        </View>
      )}
      {selectedType === "ordersup" && (
        <View style={styles.row}>
          <Text style={[styles.caption, styles.alignRight]}>Παρατηρήσεις:</Text>
          <TextInput
            style={styles.input}
            placeholder="Παρατηρήσεις..."
            value={remarks}
            onChangeText={(text) => setRemarks(text)}
            multiline
            numberOfLines={3}
          />
        </View>
      )}
      <View style={styles.buttonContainer}>
        <Button
          title="Αποθηκευση"
          className={`btn ${btnLoading ? "btn-warning" : "btn-success"}`}
          onPress={() => handleSave()}
          disabled={btnLoading}
        >
          {btnLoading ? "Loading..." : "Αποθηκευση"}
        </Button>
      </View>
      {selectedType != "inventory" && selectedType != "intmovement" && (
      <View style={styles.buttonTemp}>  
        <Button color="green" title="Αποθήκευση Προσωρινα" onPress={handleSaveTemp} />
      </View>)}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  caption: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
    width: "33%",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  input: {
    flex: 1,
    height: 40,
    borderColor: "gray",
    borderRadius: 4,
    borderWidth: 0.5,
    paddingHorizontal: 8,
  },
  alignRight: {
    textAlign: "right",
  },
  buttonContainer: {
    flex: 1,
  },
  buttonTemp : {
        
  },
  btn: {
    backgroundColor: "green",
    borderRadius: 8,
    color: "white",
    textAlign: "center",
    paddingVertical: 16,
    fontSize: 20,
    fontWeight: "bold",
    elevation: 8,
  },
  dropdown: {
    flex: 1,
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
});
export default ParastatikoDetail;
