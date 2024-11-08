import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Pressable,
  Alert,
  Image,
  Modal,
} from "react-native";
import { useAppContext } from "./AppContext";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { encode as btoa } from "base-64";
import { Picker } from "@react-native-picker/picker";

const SettingsScreen = () => {
  const {
    wsHost,
    wsPort,
    wsRoot,
    wsUser,
    wsPass,
    seriesM,
    seriesT,
    priceList,
    branch,
    branchDescr,
    updateWsHost,
    updateWsPort,
    updateWsRoot,
    updateWsUser,
    updateWsPass,
    updateSeriesM,
    updateSeriesT,
    updatePriceList,
    updateBranch,
  } = useAppContext();
  const navigation = useNavigation();
  const [isPickerFocused, setIsPickerFocused] = useState(false);
  const [branches, setBranches] = useState([]);
  const [isPopupVisible, setIsPopupVisible] = useState(false);

  const handleFocus = (focus) => {
    if (!isPickerFocused) {
      setIsPickerFocused(true);
    } else {
      setIsPickerFocused(focus);
    }
    // Call fetchBranch only if isPickerFocused is true
    {
      isPickerFocused ? fetchBranches() : null;
    }
  };
  const fetchBranches = async () => {
    const url = `http://${wsHost}:${wsPort}/${wsRoot}/DBDataSetValues`;
    try {
      const body = JSON.stringify({
        sql: "select codeid, description from branch order by codeid",
        dbfqr: true,
        params: [],
      });
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${wsUser}:${wsPass}`),
        },
        body: body,
      });
      const apiData = await response.json();

      if (Array.isArray(apiData)) {
        setBranches(apiData);
      } else {
        setBranches([]);
      }

      AsyncStorage.setItem("branches", JSON.stringify(apiData));
    } catch (error) {
      console.error("Error fetching branches", error);
    }
  };

  useEffect(() => {
    // Call fetchBranch when the component mounts
    fetchBranches();
  }, []);

  const checkConn = async () => {
    const url = `http://${wsHost}:${wsPort}/${wsRoot}/info`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Basic " + btoa(`${wsUser}:${wsPass}`),
        },
      });
      const apiData = await response.json();
      console.log(apiData);
      if (apiData.error) {
        Alert.alert("Σφάλμα", `Μήνυμα λάθους: ${apiData.error}`, [
          {
            text: "Ok",
            onPress: () => console.log("Error credentials"),
          },
        ]);
      } else {
        Alert.alert("Ενημέρωση", `Τα στοιχεία σύνδεσης είναι σωστά.`, [
          {
            text: "Ok",
            onPress: () => navigation.goBack(),
          },
        ]);
      }
    } catch (error) {
      Alert.alert(
        "Σφάλμα",
        `Τα στοιχεία σύνδεσης δεν είναι σωστά. Error: ${error}. `,
        [
          {
            text: "Ok",
            onPress: () => console.error("Error sending purchase", error),
          },
        ]
      );
    }
  };

  const handleSaveSettings = () => {
    const branchString = typeof branch === "string" ? branch : String(branch);
    try {
      AsyncStorage.setItem("wsHost", wsHost);
      AsyncStorage.setItem("wsPort", wsPort);
      AsyncStorage.setItem("wsRoot", wsRoot);
      AsyncStorage.setItem("wsUser", wsUser);
      AsyncStorage.setItem("wsPass", wsPass);
      AsyncStorage.setItem("seriesM", seriesM);
      AsyncStorage.setItem("seriesT", seriesT);
      AsyncStorage.setItem("priceList", priceList);
      AsyncStorage.setItem("branch", branchString);
      checkConn();
      //updateBranch(selectedBranch);
      console.log("Value that is saved in Branch: ", branch);
    } catch (error) {
      Alert.alert(
        "Σφάλμα",
        `Σφάλμα στην αποθήκευση ρυθμίσεων. Μήνυμα: ${error}. `,
        [
          {
            text: "Ok",
            onPress: () => console.error("Error saving settings", error),
          },
        ]
      );
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={[styles.caption, styles.alignRight]}>WS Host:</Text>
        <TextInput
          style={styles.input}
          placeholder="WS Host"
          value={wsHost}
          onChangeText={(text) => updateWsHost(text)}
        />
      </View>
      <View style={styles.row}>
        <Text style={[styles.caption, styles.alignRight]}>WS Port:</Text>
        <TextInput
          style={styles.input}
          placeholder="WS Port"
          value={wsPort}
          onChangeText={(text) => updateWsPort(text)}
          keyboardType="numeric"
        />
      </View>
      <View style={styles.row}>
        <Text style={[styles.caption, styles.alignRight]}>WS Root:</Text>
        <TextInput
          style={styles.input}
          placeholder="WS Root"
          value={wsRoot}
          onChangeText={(text) => updateWsRoot(text)}
        />
      </View>
      <View style={styles.row}>
        <Text style={[styles.caption, styles.alignRight]}>WS User:</Text>
        <TextInput
          style={styles.input}
          placeholder="WS User"
          value={wsUser}
          onChangeText={(text) => updateWsUser(text)}
        />
      </View>
      <View style={styles.row}>
        <Text style={[styles.caption, styles.alignRight]}>WS Pass:</Text>
        <TextInput
          style={styles.input}
          placeholder="WS Pass"
          value={wsPass}
          onChangeText={(text) => updateWsPass(text)}
        />
      </View>
      <View style={styles.row}>
        <Text style={[styles.caption, styles.alignRight]}>Κατάστημα:</Text>
        <TextInput
          style={styles.input}
          placeholder="Κατάστημα"
          value={`${branch}. ${branchDescr}`}
          editable={false}
          onChangeText={(text) => updateBranch(text)}
        />
        <Pressable style={styles.press} onPress={() => setIsPopupVisible(true)}>
          <Image
            style={styles.img}
            source={require("../assets/—Pngtree—vector refresh icon_4187318.png")}
          />
        </Pressable>
      </View>
      <View style={styles.row}>
        <Text style={[styles.caption, styles.alignRight]}>Σειρές:</Text>
        <TextInput
          style={styles.input}
          placeholder="Σειρά Μ"
          value={seriesM}
          onChangeText={(text) => updateSeriesM(text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Σειρά T"
          value={seriesT}
          onChangeText={(text) => updateSeriesT(text)}
        />
      </View>
      <View style={styles.row}>
        <Text style={[styles.caption, styles.alignRight]}>Τιμοκατάλογος:</Text>
        <TextInput
          style={styles.input}
          placeholder="Τιμοκατάλογος"
          value={priceList}
          onChangeText={(text) => updatePriceList(text)}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Pressable onPress={handleSaveSettings}>
          <Text style={styles.btn}>Save</Text>
        </Pressable>
      </View>
      <Modal
        transparent={false}
        animationType="slide"
        visible={isPopupVisible}
        onRequestClose={() => setIsPopupVisible(false)}
      >
        <View style={styles.popupContainer}>
          <View style={styles.popupDataContainer}>
            <Text style={{ textAlign: "center", fontSize: 16 }}>
              Επέλεξε κατάστημα.
            </Text>
            <View style={styles.popup}>
              <Text style={{ marginBottom: 20, fontSize: 16 }}>
                {branch}. {branchDescr}
              </Text>
              <Picker
                style={styles.picker}
                selectedValue={branch}
                onValueChange={(itemValue) => updateBranch(itemValue)}
                onFocus={() => handleFocus(true)}
              >
                {Array.isArray(branches) && branches.length > 0 ? (
                  branches.map((br) => (
                    <Picker.Item
                      key={br.codeid}
                      label={br.description}
                      value={br.codeid}
                    />
                  ))
                ) : (
                  <Picker.Item
                    label="Μη διαθέσιμα υποκαταστήματα"
                    value={null}
                  />
                )}
              </Picker>
            </View>
            <Pressable
              style={styles.btn}
              onPress={() => setIsPopupVisible(false)}
            >
              <Text
                style={{
                  textAlign: "center",
                  fontSize: 16,
                  fontWeight: "bold",
                  color: "#fff",
                }}
              >
                OK
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  img: {
    width: 30,
    height: 30,
  },
  press: {
    width: 30,
    height: 30,
  },
  container: {
    flex: 1,
    padding: 16,
  },
  caption: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 8,
    width: "40%",
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
  // Styles for PopUp
  picker: {
    width: 40,
  },
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
    width: 300,
  },
  popup: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 10,
  },
});

export default SettingsScreen;
