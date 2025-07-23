import React from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from 'react-native';

const DateInputRow = React.memo(function DateInputRow({ label, value, onPress, labelStyle, inputStyle }) {
  return (
    <View style={styles.row}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      <TouchableOpacity style={{ flex: 1, height:40 }} onPress={onPress}>
        <TextInput
          style={[styles.input, inputStyle]}
          value={value}
          editable={false}
          pointerEvents="none"
        />
      </TouchableOpacity>
    </View>
  );
});

export default DateInputRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    width: '33%',
    textAlign: 'right',
  },
  input: {
    flex: 1,
    height: 50,
    borderColor: 'gray',
    borderRadius: 4,
    borderWidth: 0.5,
    paddingHorizontal: 8,
    backgroundColor: '#fff',
  },
}); 