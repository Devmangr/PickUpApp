import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TextInput, Alert, Button } from "react-native";
import { Picker } from "@react-native-picker/picker";
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAppContext } from './AppContext';
import { encode as btoa } from 'base-64';

const ParastatikoDetail = ({ selectedType }) => {
  const [isPickerFocused, setIsPickerFocused] = useState(false);
  const [seriecode, setSeriecode] = useState('');
  const [docnumber, setDocnumber] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);
  const [suppliers, setSuppliers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const { itemData, wsHost, wsPort, wsRoot, wsUser, wsPass, seriesM, seriesT, branch, handleQuantityChange } = useAppContext();
  const API_ENDPOINT = `http://${wsHost}:${wsPort}/${wsRoot}/DBDataSetValues`;
  const [btnLoading, setBtnLoading] = useState(false);

  const handleDateChange = (event, date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
    } 
  }

  const handleFocus = (focus) => {
    //console.log(isPickerFocused);
    if (!isPickerFocused) {
      setIsPickerFocused(true);
    } else {
      setIsPickerFocused(focus);
    }
    { isPickerFocused ? (fetchSuppliers()) : null }
  }

  const clearFields = () => {
    setDocnumber('');
    setSelectedSupplierId(null);
    setSeriecode('');
    setSelectedDate(new Date());
    handleQuantityChange([]);
  }

  const sendPurchase = async (jsonData) => {
    setBtnLoading(true);
    const url = `http://${wsHost}:${wsPort}/${wsRoot}/ApplyBOData`;
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${wsUser}:${wsPass}`),
        },
        body: JSON.stringify(jsonData),
      });
      const apiData = await response.json();
      //console.log(apiData);
      setBtnLoading(false);
      if (apiData.error) {
        Alert.alert('Σφάλμα', `Μήνυμα λάθους: ${apiData.error}`, [
          {
            text: 'Ok',
            onPress: () => console.log(apiData.error)
          }
        ]);
      } else {
        Alert.alert('Ενημέρωση', `Το παραστατικό με αριθμό ${docnumber} καταχωρήθηκε!!`, [
          {
            text: 'Ok',
            onPress: () => clearFields()
          }
        ]);
      }
    } catch (error) {
      Alert.alert('Σφάλμα', `Σφάλμα στην αποστολή του παραστατικού με αριθμό ${docnumber}. Μήνυμα: ${apiData.error}. `, [
        {
          text: 'Ok',
          onPress: () => console.error('Error sending purchase', error)
        }
      ]);
    }
  }

  const fetchSuppliers = async () => {
    try {
      const body = JSON.stringify({ "sql": "select id, code, name from supplier order by name", "dbfqr": true, "params": [] });
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Basic ' + btoa(`${wsUser}:${wsPass}`),
        },
        body: body,
      });
      const apiData = await response.json();
      setSuppliers(apiData);
    } catch (error) {
      console.error('Error fetching suppliers', error);
    }
  };
  useEffect(()=>{
    fetchSuppliers();
  },[])
  const handleSave = () => {
    const data =
    {
      docprmid: selectedType === 'returning' ? 32 : selectedType === 'receiving' ? 28 : 70,
      seriecode: selectedType === 'receiving' ? seriesT : seriesM,
      //Number: docnumber,
      //docserie: seriecode,
      docdate: selectedDate.toISOString().split('T')[0],
      //amtrn_s1: [{amid:selectedSupplierId}],
      Itetrn: itemData.map((item) => ({
        itemid: item.itemid,
        priqty: item.quantity,
        price: 0.0,
        discval1: 0.0,
        discval2: 0.0,
        discval3: 0.0,
      })),
    };

    if (selectedType === 'receiving' || selectedType === 'returning') {
      data.amtrn_S1 = [{ amid: selectedSupplierId }];
      data.Number = docnumber;
      data.docserie = seriecode;
      data.branchid = branch;
    } else if (selectedType === 'inventory') {
      data.branchid = branch;
    }

    const jsonData = {
      bo: selectedType === 'inventory' ? "TSTORETRNBO" : "TPURCHASETRNBO",
      data: data,
    };
    if (selectedType === 'returning') {
      jsonData.doprint = 2
    }
    console.log(jsonData);
    sendPurchase(jsonData);
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.caption, styles.alignRight]}>Προμηθευτής:</Text>
        <Picker
          style={styles.input}
          selectedValue={selectedSupplierId}
          onValueChange={(itemValue) => setSelectedSupplierId(itemValue)}
          onFocus={() => handleFocus(true)}
        >
          {suppliers.map((supplier) => (
            <Picker.Item
              key={supplier.id}
              label={supplier.name}
              value={supplier.id}
            />
          ))}

        </Picker>
      </View>
      <View style={styles.row}>
        <Text style={[styles.caption, styles.alignRight]}>Ημερομηνία:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ημερομηνία.."
          value={selectedDate.toISOString().split('T')[0]}
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
      <View style={styles.row}>
        <Text style={[styles.caption, styles.alignRight]}>Αριθμός:</Text>
        <TextInput
          style={styles.input}
          placeholder="Αριθμός.."
          value={docnumber}
          onChangeText={(text) => setDocnumber(text)}
        />
      </View>
      <View style={styles.row}>
        <Text style={[styles.caption, styles.alignRight]}>Σειρά:</Text>
        <TextInput
          style={styles.input}
          placeholder="Σειρά.."
          value={seriecode || '.'}
          onChangeText={(text) => setSeriecode(text)} />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Αποθήκευση"
          className={`btn ${btnLoading ? 'btn-warning' : 'btn-success'}`}
          onPress={() => handleSave()}
          disabled={btnLoading}>
          {btnLoading ? 'Loading...' : 'Αποθήκευση'}
        </Button>
      </View>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16
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
    marginBottom: 20
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
})
export default ParastatikoDetail;