import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';
import * as Linking from 'expo-linking';

const EnhancedMicrophoneTest: React.FC = () => {
  const [permissionStatus, setPermissionStatus] = useState<string>('Unknown');
  const [isRequesting, setIsRequesting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = async () => {
    try {
      const { status } = await Audio.getPermissionsAsync();
      setPermissionStatus(status);
      console.log('🔍 Initial permission status:', status);
    } catch (error) {
      console.error('❌ Error checking permission status:', error);
      setPermissionStatus('Error');
    }
  };

  const requestPermissionsWithFallback = async () => {
    setIsRequesting(true);
    console.log('🔐 Starting permission request process...');

    try {
      // Try expo-av's permission request first
      console.log('📱 Attempting expo-av permission request...');
      const { status } = await Audio.requestPermissionsAsync();
      console.log('📱 expo-av permission result:', status);
      
      if (status === 'granted') {
        setPermissionStatus(status);
        Alert.alert('✅ Success', 'Microphone permission granted!');
        return;
      }

      // If expo-av fails, guide user to settings
      console.log('⚠️ expo-av permission denied, guiding to settings...');
      Alert.alert(
        'Permission Required',
        'Microphone access is required. Please enable it in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => {
              console.log('🔧 Opening device settings...');
              Linking.openURL('app-settings:');
            }
          }
        ]
      );

    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      Alert.alert(
        'Permission Error',
        'Unable to request microphone permission. Please enable it manually in your device settings.',
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Open Settings', 
            onPress: () => Linking.openURL('app-settings:')
          }
        ]
      );
    } finally {
      setIsRequesting(false);
    }
  };

  const testMicrophoneWithRetry = async () => {
    if (permissionStatus !== 'granted') {
      Alert.alert('Permission Required', 'Please grant microphone permission first.');
      return;
    }

    setIsTesting(true);
    console.log('🎤 Starting microphone test with retry logic...');

    const recordingConfigs = [
      {
        name: 'Ultra Conservative',
        options: {
          extension: '.m4a',
          outputFormat: 2,
          audioEncoder: 3,
          sampleRate: 16000,
          bitRate: 32000,
          audioQuality: 0,
          numberOfChannels: 1,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        }
      },
      {
        name: 'Conservative',
        options: {
          extension: '.m4a',
          outputFormat: 2,
          audioEncoder: 3,
          sampleRate: 22050,
          bitRate: 64000,
          audioQuality: 0,
          numberOfChannels: 1,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        }
      },
      {
        name: 'Default',
        options: {
          extension: '.m4a',
          outputFormat: 2,
          audioEncoder: 3,
          sampleRate: 44100,
          bitRate: 128000,
          audioQuality: 1,
          numberOfChannels: 1,
          linearPCMBitDepth: 16,
          linearPCMIsBigEndian: false,
          linearPCMIsFloat: false,
        }
      }
    ];

    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`🔄 Audio session reset attempt ${attempt}/3`);
      
      try {
        // Aggressive audio session reset
        console.log('🔄 Disabling audio session...');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: false,
          interruptionModeIOS: 1,
          playsInSilentModeIOS: false,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
          playThroughEarpieceAndroid: false,
        });
        
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🔄 Configuring audio session for recording...');
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: 1,
          playsInSilentModeIOS: true,
          shouldDuckAndroid: true,
          interruptionModeAndroid: 1,
          playThroughEarpieceAndroid: false,
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        console.log('✅ Audio session configured successfully');

        // Try each recording configuration
        for (const config of recordingConfigs) {
          console.log(`🎤 Trying ${config.name} configuration...`);
          
          try {
            const recording = new Audio.Recording();
            await recording.prepareToRecordAsync({
              android: config.options,
              ios: config.options,
              web: {},
            });
            
            console.log(`✅ ${config.name} configuration prepared successfully`);
            await recording.startAsync();
            console.log(`✅ Recording started with ${config.name} configuration`);
            
            // Stop after 1 second
            await new Promise(resolve => setTimeout(resolve, 1000));
            await recording.stopAndUnloadAsync();
            console.log('✅ Recording stopped successfully');
            
            Alert.alert(
              '🎉 Success!',
              `Microphone is working with ${config.name} configuration!\n\nThis configuration can be used in your main recording app.`
            );
            setIsTesting(false);
            return;
            
          } catch (configError) {
            console.error(`❌ ${config.name} configuration failed:`, configError);
            continue; // Try next configuration
          }
        }
        
        // If all configurations failed, try next attempt
        console.log(`❌ All configurations failed on attempt ${attempt}`);
        
      } catch (sessionError) {
        console.error(`❌ Audio session reset attempt ${attempt} failed:`, sessionError);
      }
      
      // Wait before next attempt
      if (attempt < 3) {
        console.log('⏳ Waiting before next attempt...');
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // If all attempts failed
    console.error('❌ All microphone test attempts failed');
    Alert.alert(
      '❌ Microphone Test Failed',
      'Unable to start recording after multiple attempts. This may be due to:\n\n• iOS audio session conflicts\n• Expo Go limitations\n• Device-specific issues\n\nTry:\n• Closing other audio apps\n• Restarting Expo Go\n• Using a development build instead',
      [
        { text: 'OK' },
        { 
          text: 'Retry', 
          onPress: () => testMicrophoneWithRetry()
        }
      ]
    );
    setIsTesting(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enhanced Microphone Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Permission Status:</Text>
        <Text style={[
          styles.statusValue,
          permissionStatus === 'granted' ? styles.granted : 
          permissionStatus === 'denied' ? styles.denied : styles.unknown
        ]}>
          {permissionStatus}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, isRequesting && styles.buttonDisabled]}
        onPress={requestPermissionsWithFallback}
        disabled={isRequesting}
      >
        {isRequesting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Request Microphone Permission</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button, 
          styles.testButton,
          (permissionStatus !== 'granted' || isTesting) && styles.buttonDisabled
        ]}
        onPress={testMicrophoneWithRetry}
        disabled={permissionStatus !== 'granted' || isTesting}
      >
        {isTesting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Test Microphone</Text>
        )}
      </TouchableOpacity>

      <Text style={styles.helpText}>
        This component tests microphone access with multiple configurations and retry logic.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
    color: '#333',
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 5,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
  },
  statusValue: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  granted: {
    color: '#4CAF50',
  },
  denied: {
    color: '#F44336',
  },
  unknown: {
    color: '#FF9800',
  },
  button: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  testButton: {
    backgroundColor: '#4CAF50',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 10,
    fontStyle: 'italic',
  },
});

export default EnhancedMicrophoneTest; 