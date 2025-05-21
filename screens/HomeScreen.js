import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";

const HomeScreen = ({ navigation }) => {
  const handleSelection = (type) => {
    if (type === "settings") {
      navigation.navigate("Ρυθμίσεις");
    } else if (type === "availability") {
      navigation.navigate("Διαθεσιμότητα");
    } else if (type === "inoutsup") {
      navigation.navigate("Αγορές - Πωλήσεις");
    } else if (type === "iteminfo") {
      navigation.navigate("Πληροφορίες Είδους");
    } else if (type === "ordersup") {
      navigation.navigate("Παραγγελία", { selectedType: type });
    } else if (type === "intmovement") {
      navigation.navigate('Εσ. Διακίνηση', { selectedType: type});
    } else if (type === "receiving") {
      navigation.navigate('Παραλαβή Προϊόντων', { selectedType: type});
    } else if (type === "returning") {
      navigation.navigate('Επιστροφή Προϊόντων', { selectedType: type});
    } else if (type === "inventory") {
      navigation.navigate('Απογραφή Προϊόντων', { selectedType: type});
    } 
    else { 
      navigation.navigate("Main", { selectedType: type });
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.grid}>
        <Pressable
          style={styles.button}
          onPress={() => handleSelection("receiving")}
        >
          <Text style={styles.buttonText}>Παραλαβή Προϊόντων</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handleSelection("returning")}
        >
          <Text style={styles.buttonText}>Επιστροφή Προϊόντων</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handleSelection("inventory")}
        >
          <Text style={styles.buttonText}>Απογραφή Προϊόντων</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handleSelection("availability")}
        >
          <Text style={styles.buttonText}>Διαθεσιμότητα Προϊόντων</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handleSelection("inoutsup")}
        >
          <Text style={styles.buttonText}>Αγορές - Πωλήσεις</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handleSelection("iteminfo")}
        >
          <Text style={styles.buttonText}>Πληροφορίες Είδους</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handleSelection("ordersup")}
        >
          <Text style={styles.buttonText}>Παραγγελία</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handleSelection("intmovement")}
        >
          <Text style={styles.buttonText}>Εσ. Διακίνηση</Text>
        </Pressable>
        <Pressable
          style={styles.button}
          onPress={() => handleSelection("settings")}
        >
          <Text style={styles.buttonText}>Ρυθμίσεις</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    width: "90%",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 10,
    margin: 5,
    borderRadius: 8,
    flexBasis: "45%", // Adjust this value to fit buttons nicely within grid
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
  },
});

export default HomeScreen;
