import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from "react-native";
import { encode as btoa } from "base-64";
import { useAppContext } from "./AppContext";
import AvailabilityGrid from "./AvailabilityGrid";

export default function AvailabilityModal({ selectedItem, onClose }) {
  const { wsHost, wsPort, wsUser, wsPass } = useAppContext();

  const [info, setInfo] = useState({
    code: "",
    description: "",
    barcode: "",
    combinedData: [],
  });

  const endpoints = [
    `http://${wsHost}:${wsPort}/root/DBDataSetValues`,
    `http://${wsHost}:${wsPort}/oe/DBDataSetValues`,
    `http://${wsHost}:${wsPort}/zer/DBDataSetValues`,
  ];

  const fetchProductAvailability = async (barcode) => {
    const payload = JSON.stringify({
      sql: "declare @bc varchar(30) =:0; exec codesearch @code=@bc",
      dbfqr: true,
      params: [barcode],
    });

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: "Basic " + btoa(`${wsUser}:${wsPass}`),
      };

      const responses = await Promise.all(
        endpoints.map((url) =>
          fetch(url, {
            method: "POST",
            headers,
            body: payload,
          })
        )
      );

      const data = await Promise.all(responses.map((r) => r.json()));
      const combined = data.flat().filter(Boolean);

      if (combined.length > 0) {
        const { code, description } = combined[0];
        setInfo({ code, description, barcode, combinedData: combined });
      } else {
        setInfo({
          code: "Δεν βρέθηκε προϊόν",
          description: "",
          barcode,
          combinedData: [],
        });
      }
    } catch (error) {
      Alert.alert(
        "Σφάλμα",
        `Σφάλμα κατά την αναζήτηση προϊόντος:\n\n${error.message}`,
        [{ text: "OK", onPress: () => console.error("API Error", error) }]
      );
    }
  };

  useEffect(() => {
    if (selectedItem?.code) {
      fetchProductAvailability(selectedItem.code);
    }
  }, [selectedItem]);

  return (
    <View style={styles.container}>
      <View style={styles.infoBox}>
        <InfoRow label="Κωδικός:" value={info.code} />
        <InfoRow label="Περιγραφή:" value={info.description} />
        <InfoRow label="Barcode:" value={info.barcode} />
      </View>

      <View style={styles.availabilityBox}>
        <Text style={styles.sectionTitle}>Διαθ. Καταστημάτων</Text>
        <AvailabilityGrid combinedData={info.combinedData} />
      </View>

      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Text style={styles.closeButtonText}>Κλείσιμο</Text>
      </TouchableOpacity>
    </View>
  );
}

// Μικρό component για επαναχρησιμοποίηση γραμμών info
const InfoRow = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexGrow: 1,
  },
  infoBox: {
    borderWidth: 0.7,
    borderRadius: 4,
    borderColor: "#b1b1b1",
    padding: 10,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    width: "33%",
  },
  value: {
    fontSize: 16,
    flex: 1,
  },
  availabilityBox: {
    borderTopWidth: 1,
    borderColor: "#ccc",
    paddingTop: 10,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 6,
    textAlign: "center",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "red",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignSelf: "center",
  },
  closeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
