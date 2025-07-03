import { useState } from "react";
import { TabView, TabBar } from "react-native-tab-view";
import { View } from "react-native";
import GridComponent from "../components/gridComponent";
import OrderSup from "../components/OrderSup";
import ParastatikoDetail from "../components/Parastatiko";
import { useAppContext } from '../components/AppContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const OrderScreen = ({ route }) => {
  const { handleQuantityChange, updateSelectSup } = useAppContext();
  const [selectedSupplierId, setSelectedSupplierId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      return () => {
        console.log('👈 Επιστροφή από παραγγελία — καθάρισμα');
        updateSelectSup(null);
        handleQuantityChange([]);
        setSelectedSupplierId(null);
      };
    }, [])
  );
  
  const { selectedType } = route.params || {};
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "first", title: "Αναζήτηση" },
    { key: "second", title: "Προϊόντα" },
    { key: "third", title: "Παραστατικό" },
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "first":
        return (
          <View style={{ flex: 1 }}>
            <OrderSup
              selectedType={selectedType}
              selectedSupplierId={selectedSupplierId}
              setSelectedSupplierId={setSelectedSupplierId}
            />
          </View>
        );
      case "second":
        return (
          <View style={{ flex: 1 }}>
            <GridComponent />
          </View>
        )
      case "third":
        return (
          <View style={{ flex: 1 }}>
            <ParastatikoDetail
              selectedType={selectedType}
              selectedSupplierId={selectedSupplierId}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <TabView
      navigationState={{ index, routes }}
      renderScene={renderScene}
      onIndexChange={setIndex}
      initialLayout={{ width: 100 }}
      renderTabBar={(props) => (
        <TabBar
          {...props}
          indicatorStyle={{ backgroundColor: "blue" }}
          style={{ backgroundColor: "#d3d3d3" }}
          activeColor="blue"
          inactiveColor="black"
          labelStyle={{ textTransform: "capitalize", fontSize: 16 }}
        />
      )}
    />
  );
};

export default OrderScreen;
