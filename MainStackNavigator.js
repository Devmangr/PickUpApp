// MainStackNavigator.js
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import Settings from './components/Settings';
import TabViewExample from './screens/Home'; 
import Availability from './components/Availability';

const Stack = createStackNavigator();

const MainStackNavigator = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Επιλογές" component={HomeScreen} />
      <Stack.Screen name="Ρυθμίσεις" component={Settings} />
      <Stack.Screen name="Main" component={TabViewExample} />
      <Stack.Screen name="Διαθεσιμότητα" component={Availability} />
    </Stack.Navigator>
  );
};

export default MainStackNavigator;
