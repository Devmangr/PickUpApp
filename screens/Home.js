import React, { useState, useCallback } from "react";
import { TabView, TabBar, SceneMap } from "react-native-tab-view";
import { View } from "react-native";
import GridComponent from "../components/gridComponent";
import FirstTab from "../components/firstTab";
import ParastatikoDetail from "../components/Parastatiko";
import { useFocusEffect } from '@react-navigation/native';
import { useAppContext } from "../components/AppContext";

const FirstRoute = ({ selectedType }) => (
  <View style={{ flex: 1 }}>
    <FirstTab selectedType={selectedType} />
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

const TabViewExample = ({ route }) => {
  const { selectedType } = route.params || {};
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "first", title: "Αναζήτηση" },
    { key: "second", title: "Προϊόντα" },
    { key: "third", title: "Παραστατικό" },
  ]);

  const { updateSelectSup, handleQuantityChange } = useAppContext();

  useFocusEffect(
    useCallback(() => {
      return () => {
        console.log('👈 Επιστροφή στην αρχική — καθάρισμα');
        updateSelectSup(null);
        handleQuantityChange([]);
      };
    }, [])
  );

  const renderScene = ({ route }) => {
    switch (route.key) {
      case "first":
        return <FirstRoute selectedType={selectedType} />;
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

export default TabViewExample;
