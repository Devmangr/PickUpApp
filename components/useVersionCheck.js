import { useEffect } from 'react';
import * as Updates from 'expo-updates';
import VersionCheck from 'react-native-version-check';
import remoteConfig from '@react-native-firebase/remote-config';
import { Alert, Linking, Platform } from 'react-native';
import Constants from 'expo-constants';

const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.itechs.PickUpApp';

export const useVersionCheck = () => {
  useEffect(() => {
    const initializeRemoteConfig = async () => {
      try {
        // Set default values
        await remoteConfig().setDefaults({
          latest_version: '1.0.0',
          force_update: false,
          testing_version: '1.0.0',
          enable_testing_check: false,
          update_message: 'Μια νέα έκδοση είναι διαθέσιμη',
          force_update_message: 'Αυτή η ενημέρωση είναι υποχρεωτική'
        });

        // Set cache expiration (1 hour for production, 0 for development)
        const cacheExpiration = __DEV__ ? 0 : 3600;
        
        await remoteConfig().fetch(cacheExpiration);
        await remoteConfig().activate();
        
        console.log('Firebase Remote Config initialized');
      } catch (error) {
        console.error('Firebase Remote Config initialization failed:', error);
      }
    };

    const checkForUpdates = async () => {
      try {
        // Skip in development or simulator
        if (__DEV__ || !Constants.isDevice) {
          console.log('Skipping version check in development');
          return;
        }

        // Initialize Firebase Remote Config
        await initializeRemoteConfig();

        const currentVersion = VersionCheck.getCurrentVersion();
        console.log('Current app version:', currentVersion);

        // Get values from Remote Config
        const latestVersion = remoteConfig().getValue('latest_version').asString();
        const testingVersion = remoteConfig().getValue('testing_version').asString();
        const forceUpdate = remoteConfig().getValue('force_update').asBoolean();
        const enableTestingCheck = remoteConfig().getValue('enable_testing_check').asBoolean();
        const updateMessage = remoteConfig().getValue('update_message').asString();
        const forceUpdateMessage = remoteConfig().getValue('force_update_message').asString();

        console.log('Remote Config values:', {
          latestVersion,
          testingVersion,
          forceUpdate,
          enableTestingCheck
        });

        // 1️⃣ Check for OTA updates first
        try {
          const update = await Updates.checkForUpdateAsync();
          if (update.isAvailable) {
            Alert.alert(
              'Ενημέρωση διαθέσιμη',
              'Μια νέα έκδοση είναι διαθέσιμη για άμεση εγκατάσταση.',
              [
                { text: 'Αργότερα' },
                {
                  text: 'Ενημέρωση',
                  onPress: async () => {
                    try {
                      await Updates.fetchUpdateAsync();
                      Updates.reloadAsync();
                    } catch (error) {
                      console.error('OTA update failed:', error);
                    }
                  },
                },
              ]
            );
            return;
          }
        } catch (otaError) {
          console.log('OTA check skipped:', otaError.message);
        }

        // 2️⃣ Determine which version to check against
        let targetVersion = latestVersion;
        let isTestingBuild = false;

        // Check if this is a testing build
        if (enableTestingCheck) {
          // You can implement your own logic to detect testing builds
          // For example, check if installed from internal distribution
          isTestingBuild = await isAppFromTestingTrack();
          
          if (isTestingBuild) {
            targetVersion = testingVersion;
            console.log('Using testing version for comparison:', targetVersion);
          }
        }

        // 3️⃣ Compare versions
        const needsUpdate = compareVersions(currentVersion, targetVersion);

        if (needsUpdate) {
          const title = forceUpdate ? 'Υποχρεωτική ενημέρωση' : 'Νέα έκδοση διαθέσιμη';
          const message = forceUpdate 
            ? `${forceUpdateMessage}\n\nΤρέχουσα: ${currentVersion}\nΝέα: ${targetVersion}`
            : `${updateMessage}\n\nΤρέχουσα: ${currentVersion}\nΝέα: ${targetVersion}`;

          const buttons = forceUpdate 
            ? [{ text: 'Ενημέρωση', onPress: () => openStore() }]
            : [
                { text: 'Αργότερα' },
                { text: 'Ενημέρωση', onPress: () => openStore() }
              ];

          Alert.alert(title, message, buttons, { 
            cancelable: !forceUpdate 
          });
        }

        // 4️⃣ Log analytics (optional)
        logVersionCheckAnalytics({
          currentVersion,
          targetVersion,
          isTestingBuild,
          needsUpdate,
          forceUpdate
        });

      } catch (error) {
        console.warn('Έλεγχος έκδοσης απέτυχε:', error);
      }
    };

    // Delay execution to avoid blocking app startup
    const timer = setTimeout(checkForUpdates, 3000);
    return () => clearTimeout(timer);
  }, []);
};

// Helper function to detect testing builds
const isAppFromTestingTrack = async () => {
  try {
    // Method 1: Check installer package (Android)
    if (Platform.OS === 'android') {
      // You might need to use a native module for this
      // For now, return false - implement based on your needs
      return false;
    }
    
    // Method 2: Check specific build flags or bundle identifiers
    // You can set custom flags in your build process
    return Constants.appOwnership === 'expo' || __DEV__;
  } catch (error) {
    console.log('Could not determine build type:', error);
    return false;
  }
};

// Enhanced version comparison
const compareVersions = (current, target) => {
  if (!current || !target) return false;
  
  try {
    const currentParts = current.split('.').map(num => parseInt(num, 10) || 0);
    const targetParts = target.split('.').map(num => parseInt(num, 10) || 0);
    
    const maxLength = Math.max(currentParts.length, targetParts.length);
    
    for (let i = 0; i < maxLength; i++) {
      const currentPart = currentParts[i] || 0;
      const targetPart = targetParts[i] || 0;
      
      if (targetPart > currentPart) {
        return true; // Update needed
      } else if (targetPart < currentPart) {
        return false; // Current is newer
      }
    }
    
    return false; // Same version
  } catch (error) {
    console.error('Version comparison failed:', error);
    return false;
  }
};

// Open app store
const openStore = () => {
  if (Platform.OS === 'android') {
    Linking.openURL(PLAY_STORE_URL);
  } else if (Platform.OS === 'ios') {
    // Add iOS App Store URL when needed
    Linking.openURL('https://apps.apple.com/app/your-app-id');
  }
};

// Analytics logging (optional)
const logVersionCheckAnalytics = (data) => {
  console.log('Version check analytics:', data);
  // You can send this data to your analytics service
  // Firebase Analytics, Crashlytics, etc.
};