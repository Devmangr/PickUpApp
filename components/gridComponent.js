import React from 'react';
import { StyleSheet, View, ScrollView } from 'react-native';
import { Table, Row, Rows } from 'react-native-table-component';
import { useAppContext } from './AppContext';

const GridComponent = () => {  
  const { itemData } = useAppContext();

  const tableHead = ['Κωδικός','Περιγραφή', 'Ποσ.', 'Ν.Τιμή'];
  const tableData = itemData.map((item) => [item.code, item.itemName, item.quantity, item.itemNewPrice]);

  const widthArr = [70,190,50,70];
  
  return (
    <ScrollView>
      <View style={styles.container}>
        <Table style={styles.table}>
          <Row key={Math.random()} data={tableHead} widthArr={widthArr} style={styles.head} />
          <Rows key={Math.random()} data={tableData} widthArr={widthArr} style={styles.rowText} textStyle={styles.textStyle}/>
        </Table>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  textStyle:{fontSize:12, fontWeight:600},
  container: {
    flex: 1,
    padding: 14,
    paddingTop: 10,    
  },
  table:{
    borderWidth:0,
    borderColor:'#c8e1ff',
    flex:1,
  },
  head: { 
    width:'100%',
    height: 40, 
    backgroundColor: '#f1f8ff' 
  },
  headText: { 
    margin: 2 
  },
  rowText: { 
    margin: 2 , 
    color: 'black',
  },
});

export default GridComponent;
