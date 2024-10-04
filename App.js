import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { AppProvider } from './components/AppContext';
import { SafeAreaView } from "react-native-safe-area-context";
import MainStackNavigator from './MainStackNavigator';

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

const App = () => {
  return (
    <SafeAreaView style={{flex:1}}>
      <NavigationContainer>
        <AppProvider>
          <MainStackNavigator />  
        </AppProvider>
      </NavigationContainer>
      </SafeAreaView>
  );
}

AppRegistry.registerComponent(appName, () => App);
export default App;