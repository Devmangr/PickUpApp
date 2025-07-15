import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const FormRow = React.memo(function FormRow({ label, children, labelStyle, rowStyle }) {
  return (
    <View style={[styles.row, rowStyle]}>
      <Text style={[styles.label, labelStyle]}>{label}</Text>
      {children}
    </View>
  );
});

export default FormRow;

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
}); 