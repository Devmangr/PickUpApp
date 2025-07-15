import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const InfoRow = React.memo(function InfoRow({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.caption}>{label}</Text>
      <Text style={styles.rowdata}>{value}</Text>
    </View>
  );
});

export default InfoRow;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  caption: {
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    width: '33%',
  },
  rowdata: {
    fontSize: 16,
    textAlign: 'left',
    flex: 1,
  },
}); 