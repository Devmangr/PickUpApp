import { useState } from "react";
import { TabView, TabBar } from "react-native-tab-view";
import { View } from "react-native";
import GridComponent from "../components/gridComponent";
import OrderSup from "../components/OrderSup";
import ParastatikoDetail from "../components/Parastatiko";
import { useAppContext } from '../components/AppContext';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback } from 'react';

const FirstRoute = ({ selectedType }) => (
  <View style={{ flex: 1 }}>
    <OrderSup selectedType={selectedType}/>
  </View>
);

const SecondRoute = () => (
  <View style={{ flex: 1 }}>
    <GridComponent />
  </View>
);

const ThirdRoute = ({ selectedType }) => (
  <View style={{ flex: 1 }}>
    <ParastatikoDetail selectedType={selectedType} />
  </View>
);

const OrderScreen = ({ route }) => {
  const { handleQuantityChange, updateSelectSup } = useAppContext();

  useFocusEffect(
    useCallback(() => {
      return () => {
        console.log('👈 Επιστροφή από παραγγελία — καθάρισμα');
        updateSelectSup(null);
        handleQuantityChange([]);
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
        return <FirstRoute selectedType={selectedType}/>;
      case "second":
        return <SecondRoute />;
      case "third":
        return <ThirdRoute selectedType={selectedType} />;
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
