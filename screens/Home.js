import React, { useState } from 'react';
import { TabView, TabBar, SceneMap } from 'react-native-tab-view';
import { View } from 'react-native';
import GridComponent from '../components/gridComponent';
import FirstTab from '../components/firstTab';
import ParastatikoDetail from '../components/Parastatiko';

const FirstRoute = () => (
  <View style={{ flex: 1 }}>
    <FirstTab />
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
  console.log(selectedType);
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'first', title: 'Αναζήτηση' },
    { key: 'second', title: 'Προϊόντα' },
    { key: 'third', title: 'Παραστατικό' }
  ]);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'first':
        return <FirstRoute />;
      case 'second':
        return <SecondRoute />;
      case 'third':
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
          indicatorStyle={{ backgroundColor: 'blue' }}
          style={{ backgroundColor: '#d3d3d3' }}
          activeColor="blue"
          inactiveColor="black"
          labelStyle={{ textTransform: 'capitalize', fontSize: 16 }}
        />
      )}
    />
  );
};

export default TabViewExample;
