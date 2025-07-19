import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';

const PopupInput = React.memo(function PopupInput({ visible, value, onChange, onSearch, onCancel }) {
  return (
    <Modal
      transparent={false}
      animationType="slide"
      visible={visible}
      onRequestClose={onCancel}
    >
      <View style={styles.popupContainer}>
        <View style={styles.popupDataContainer}>
          <View style={styles.popup}>
            <Text style={styles.textInputLabel}>Δώσε κωδικό αναζήτησης</Text>
            <TextInput
              style={styles.input}
              placeholder="Κωδικός..."
              value={value}
              onChangeText={onChange}
              keyboardType="numeric"
            />
          </View>
          <View style={styles.buttonPopupContainer}>
            <TouchableOpacity
              style={styles.popupSearchButton}
              onPress={onSearch}
            >
              <Text style={styles.popupButtonText}>Αναζήτηση</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.popupCancelButton}
              onPress={onCancel}
            >
              <Text style={styles.popupButtonText}>Άκυρο</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
});

export default PopupInput;

const styles = StyleSheet.create({
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
  popup: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderRadius: 4,
    borderWidth: 0.5,
    paddingHorizontal: 8,
    flex: 1,
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
    width: 100,
  },
  popupCancelButton: {
    backgroundColor: 'red',
    borderRadius: 8,
    color: 'white',
    alignItems: 'center',
    paddingVertical: 15,
    marginTop: 20,
    width: 100,
  },
  popupButtonText: {
    color: 'white',
  },
  textInputLabel: {
    marginRight: 10,
    fontSize: 16,
  },
}); 