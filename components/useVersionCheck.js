import { useEffect } from 'react';
import * as Updates from 'expo-updates';
import VersionCheck from 'react-native-version-check';
import { Alert, Linking, Platform } from 'react-native';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.itechs.PickUpApp';

export const useVersionCheck = () => {
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        // 1️⃣ OTA (Expo) Update check
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          Alert.alert(
            'Ενημέρωση διαθέσιμη',
            'Μια νέα έκδοση είναι διαθέσιμη. Θέλεις να γίνει λήψη;',
            [
              { text: 'Όχι' },
              {
                text: 'Ναι',
                onPress: async () => {
                  await Updates.fetchUpdateAsync();
                  Updates.reloadAsync();
                },
              },
            ]
          );
          return;
        }

        // 2️⃣ Play Store version check
        const latestVersion = await VersionCheck.getLatestVersion();
        const currentVersion = VersionCheck.getCurrentVersion();

        const updateNeeded = VersionCheck.needUpdate({
          currentVersion,
          latestVersion,
        });

        if (updateNeeded?.isNeeded) {
          Alert.alert(
            'Νέα έκδοση εφαρμογής',
            `Η έκδοση ${latestVersion} είναι διαθέσιμη. Θέλεις να την εγκαταστήσεις;`,
            [
              { text: 'Όχι' },
              {
                text: 'Ναι',
                onPress: () => {
                  if (Platform.OS === 'android') {
                    Linking.openURL(PLAY_STORE_URL);
                  }
                },
              },
            ]
          );
        }
      } catch (error) {
        console.warn('Έλεγχος έκδοσης απέτυχε:', error);
      }
    };

    checkForUpdates();
  }, []);
};
