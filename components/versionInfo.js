import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView,
  SafeAreaView,
  
} from 'react-native';
import VersionCheck from 'react-native-version-check';
import { getBuildNumber } from 'react-native-device-info';
import Constants from 'expo-constants';

const AppVersionInfo = () => {
  const [versionInfo, setVersionInfo] = useState({
    version: '',
    versionCode: '',
    buildNumber: '',
    bundleId: '',
    isDebug: false,
    platform: '',
    expoVersion: '',
    buildDate: new Date().toISOString()
  });
  const [pressCount, setPressCount] = useState(0);

  useEffect(() => {
    const getVersionInfo = async () => {
      try {
        const currentVersion = VersionCheck.getCurrentVersion();
        const buildNumber = await getBuildNumber();
        const bundleId = VersionCheck.getPackageName();
        const platform = Constants.platform?.ios ? 'iOS' : 'Android';
        
        setVersionInfo({
          version: currentVersion || 'N/A',
          versionCode: buildNumber || 'N/A',
          buildNumber: buildNumber || 'N/A',
          bundleId: bundleId || 'N/A',
          isDebug: __DEV__,
          platform: platform,
          expoVersion: Constants.expoVersion || 'N/A',
          buildDate: Constants.executionEnvironment || 'N/A',
          device: Constants.isDevice ? 'Physical Device' : 'Simulator/Emulator',
          appOwnership: Constants.appOwnership || 'N/A'
        });
      } catch (error) {
        console.error('Error getting version info:', error);
        setVersionInfo({
          version: 'Error',
          versionCode: 'Error',
          buildNumber: 'Error',
          bundleId: 'Error',
          isDebug: __DEV__,
          platform: 'Unknown',
          expoVersion: 'Error',
          buildDate: 'Error',
          device: 'Unknown',
          appOwnership: 'Error'
        });
      }
    };

    getVersionInfo();
  }, []);

  const handleVersionPress = () => {
    setPressCount(prev => prev + 1);
    
    if (pressCount >= 6) {
      showDebugInfo();
      setPressCount(0);
    }
    
    setTimeout(() => setPressCount(0), 2000);
  };

  const showDebugInfo = () => {
    const debugInfo = `
Debug Information:
Version: ${versionInfo.version}
Version Code: ${versionInfo.versionCode}
Build Number: ${versionInfo.buildNumber}
Bundle ID: ${versionInfo.bundleId}
Platform: ${versionInfo.platform}
Is Debug: ${versionInfo.isDebug ? 'Yes' : 'No'}
Expo Version: ${versionInfo.expoVersion}
Device Type: ${versionInfo.device}
App Ownership: ${versionInfo.appOwnership}
Build Environment: ${versionInfo.buildDate}
    `.trim();

  };

  const InfoRow = ({ label, value, isHighlight = false }) => (
    <View style={[styles.row, isHighlight && styles.highlightRow]}>
      <Text style={[styles.label, isHighlight && styles.highlightLabel]}>
        {label}
      </Text>
      <Text style={[styles.value, isHighlight && styles.highlightValue]}>
        {value}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Πληροφορίες Εφαρμογής</Text>
          {versionInfo.isDebug && (
            <View style={styles.debugBadge}>
              <Text style={styles.debugText}>DEBUG BUILD</Text>
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Έκδοση</Text>
          <View style={styles.card}>
            <InfoRow 
              label="Version" 
              value={versionInfo.version} 
              isHighlight={true}
            />
            <InfoRow 
              label="Version Code" 
              value={versionInfo.versionCode} 
              isHighlight={true}
            />
            <InfoRow 
              label="Build Number" 
              value={versionInfo.buildNumber} 
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Πλατφόρμα</Text>
          <View style={styles.card}>
            <InfoRow label="Platform" value={versionInfo.platform} />
            <InfoRow label="Device Type" value={versionInfo.device} />
            <InfoRow label="Bundle ID" value={versionInfo.bundleId} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Build Environment</Text>
          <View style={styles.card}>
            <InfoRow label="Expo Version" value={versionInfo.expoVersion} />
            <InfoRow label="App Ownership" value={versionInfo.appOwnership} />
            <InfoRow label="Build Type" value={versionInfo.isDebug ? 'Development' : 'Production'} />
          </View>
        </View>

        <TouchableOpacity 
          style={styles.easterEggButton}
          onPress={handleVersionPress}
          activeOpacity={0.7}
        >
          <Text style={styles.easterEggText}>
            Tap 7 times for debug info {pressCount > 0 && `(${pressCount}/7)`}
          </Text>
        </TouchableOpacity>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            © 2025 PickUp App - iTechs
          </Text>
          <Text style={styles.footerText}>
            All rights reserved
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  debugBadge: {
    backgroundColor: '#ff4444',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  highlightRow: {
    backgroundColor: '#f8f9fa',
    marginHorizontal: -16,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderBottomColor: 'transparent',
  },
  label: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    flex: 1,
  },
  highlightLabel: {
    color: '#333',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '400',
    textAlign: 'right',
    flex: 1,
  },
  highlightValue: {
    color: '#007AFF',
    fontWeight: '600',
  },
  easterEggButton: {
    marginTop: 30,
    padding: 20,
    alignItems: 'center',
  },
  easterEggText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  footer: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  footerText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
});

export default AppVersionInfo;