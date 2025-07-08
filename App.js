import { NavigationContainer } from "@react-navigation/native";
import { AppProvider } from './components/AppContext';
import { SafeAreaView} from "react-native-safe-area-context";
//import { Button, View, Alert } from 'react-native';
import MainStackNavigator from './MainStackNavigator';
import { useVersionCheck } from './components/useVersionCheck';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
//import { getRealm }  from './database/realmConfig';

const App = () => {
  useVersionCheck();
  /*const clearTempData = async () => {
    try {
      const realm = await getRealm();
      realm.write(() => {
        realm.delete(realm.objects('TempItem'));
        realm.delete(realm.objects('TempSet'));
      });
      Alert.alert('OK', 'Όλα τα προσωρινά δεδομένα διαγράφηκαν.');
    } catch (e) {
      console.error('❌ Σφάλμα διαγραφής:', e);
      Alert.alert('Σφάλμα', 'Απέτυχε η διαγραφή των δεδομένων.');
    }
  };*/

  return (
    <SafeAreaView style={{flex:1}}>
      <NavigationContainer>
        <AppProvider>
          <MainStackNavigator />  
          {/*<View style={{ padding: 10 }}>
            <Button
              title="🧹 Διαγραφή Προσωρινών (DEBUG)"
              onPress={clearTempData}
              color="red"
            />
          </View>*/}
        </AppProvider>
      </NavigationContainer>
      </SafeAreaView>
  );
}

AppRegistry.registerComponent(appName, () => App);
export default App;