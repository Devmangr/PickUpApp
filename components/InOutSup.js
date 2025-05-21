import React, { useEffect, useState } from "react";
import { View, Button, Text, TextInput, StyleSheet } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Dropdown } from 'react-native-element-dropdown';
import { encode as btoa } from "base-64";
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
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);

  const API_ENDPOINT = `http://${wsHost}:${wsPort}/${wsRoot}/DBDataSetValues`;

  const fetchSuppliers = async () => {
    try {
      const sqlQuery = JSON.stringify({
        sql: "select id, code, name from supplier ",
        dbfqr: true,
        params: [],
      });

      const response = await fetch(API_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: "Basic " + btoa(`${wsUser}:${wsPass}`),
        },
        body: sqlQuery,
      });
      const data = await response.json();
      setSupplierDropdownData(data);
    } catch (error) {
      console.error("Error fetching suppliers data: ", error);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);
  const handleQuery = async () => {
    if (fromDate && toDate) {
      setBtnLoading(true);
      try {
        const sqlQuery = JSON.stringify({
          sql: "declare @val varchar(max); declare @amid int=:0; declare @branchId int=:1; declare @dtFrom varchar(30)=:2; declare @dtTo varchar(30)=:3; exec inoutsup @amid, @branchId, @dtFrom, @dtTo, @val output;",
          dbfqr: false,
          params: [
            selectedSupplierId,
            branch,
            fromDate.toISOString().split("T")[0],
            toDate.toISOString().split("T")[0],
          ],
        });
        const response = await fetch(API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: "Basic " + btoa(`${wsUser}:${wsPass}`),
          },
          body: sqlQuery,
        });
        const textData = await response.text();
        const newData = JSON.parse(textData);
        //console.log('Parsed Data:', newData);
        setBtnLoading(false);

        if (Array.isArray(newData)) {
          const parsedData = JSON.parse(newData[0].__COLUMN1);
          //console.log(parsedData);
          setReturnedData(parsedData);
        } else {
          console.error("Expected an array, but got:", typeof newData);
        }
      } catch (error) {
        console.error("Error: ", error);
      }
    } else {
      alert("Πρέπει να επιλέξεις ημερομηνίες");
    }
  };

  const handleFocus = (focus) => {
    if (!isPickerFocused) {
      setIsPickerFocused(true);
    } else {
      setIsPickerFocused(focus);
    }
    {
      isPickerFocused ? fetchSuppliers() : null;
    }
  };
  const handleDateChangeFromDate = (event, date) => {
    setShowDatePicker1(false);
    if (date) {
      setFromDate(date);
      setSelectedFromDate(date);
    } else {
      setFromDate(selectedFromDate);
    }
  };
  const handleDateChangeToDate = (event, date) => {
    setShowDatePicker2(false);
    if (date) {
      setToDate(date);
      setSelectedToDate(date);
    } else {
      setToDate(selectedToDate);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headContainer}>
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
            onChange={(item) => {
              setSelectedSupplierId(item.value);
            }}
          />
        </View>
        <View style={styles.row}>
          <Text style={[styles.caption, styles.alignRight]}>Από:</Text>
          <TextInput
            style={styles.input}
            placeholder="Ημερομηνία.."
            value={selectedFromDate.toISOString().split("T")[0]}
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
            value={selectedToDate.toISOString().split("T")[0]}
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
              className={`btn ${btnLoading ? "btn-warning" : "btn-success"}`}
              onPress={() => handleQuery()}
              disabled={btnLoading}
            >
              {btnLoading ? "Loading..." : "Αναζήτηση"}
            </Button>
          </View>
        </View>
      </View>
      <InOutSupTable combinedData={returnedData} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 8,
  },
  headContainer: {
    borderWidth: 0.5,
    borderRadius: 10,
    padding: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
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
    flex:1,
    height: 50,
    borderColor: 'gray',
    borderWidth: 0.5,
    borderRadius: 4,
    paddingHorizontal: 8,
  },
});

export default InOutSup;
