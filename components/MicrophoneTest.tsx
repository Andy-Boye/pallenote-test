import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet } from 'react-native';
import { Audio } from 'expo-av';

const MicrophoneTest = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestPermissions = async () => {
    try {
      console.log('🔍 Requesting microphone permissions...');
      const { status } = await Audio.requestPermissionsAsync();
      console.log('📱 Permission status:', status);
      setHasPermission(status === 'granted');
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Microphone permission is required to record audio. Please enable it in Settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => console.log('User wants to open settings') }
          ]
        );
      }
      
      return status === 'granted';
    } catch (error) {
      console.error('❌ Error requesting permissions:', error);
      return false;
    }
  };

  const testMicrophone = async () => {
    try {
      console.log('🎤 Testing microphone access...');
      
      // First check permissions
      const permissionGranted = await requestPermissions();
      if (!permissionGranted) {
        console.log('❌ Permission not granted');
        return;
      }

      // AGGRESSIVE AUDIO SESSION RESET
      console.log('🔄 Performing aggressive audio session reset...');
      
      // Step 1: Completely disable audio session
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      
      // Step 2: Wait longer for session to clear
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Step 3: Configure audio session for recording
      console.log('⚙️ Configuring audio session for recording...');
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        interruptionModeIOS: 1,
        interruptionModeAndroid: 1,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });
      
      // Step 4: Wait for session to stabilize
      await new Promise(resolve => setTimeout(resolve, 300));

      // Create recording
      console.log('📱 Creating recording instance...');
      const newRecording = new Audio.Recording();
      
             // Use more conservative recording options for Expo Go
       const recordingOptions = {
         android: {
           extension: '.m4a',
           outputFormat: 2,
           audioEncoder: 3,
           sampleRate: 22050, // Lower sample rate
           numberOfChannels: 1,
           bitRate: 64000, // Lower bitrate
         },
         ios: {
           extension: '.m4a',
           outputFormat: 2,
           audioQuality: 0, // Low quality for better compatibility
           sampleRate: 22050, // Lower sample rate
           numberOfChannels: 1,
           bitRate: 64000, // Lower bitrate
           linearPCMBitDepth: 16,
           linearPCMIsBigEndian: false,
           linearPCMIsFloat: false,
         },
       };

      console.log('📋 Recording options:', JSON.stringify(recordingOptions, null, 2));
      
      // Prepare recording
      console.log('⚙️ Preparing recording...');
      await newRecording.prepareToRecordAsync(recordingOptions);
      
      // Start recording
      console.log('▶️ Starting recording...');
      await newRecording.startAsync();
      
      setRecording(newRecording);
      setIsRecording(true);
      
      console.log('✅ Recording started successfully!');
      Alert.alert('Success', 'Microphone is working! Recording started.');
      
    } catch (error) {
      console.error('❌ Microphone test failed:', error);
      Alert.alert(
        'Microphone Test Failed',
        `Error: ${error instanceof Error ? error.message : 'Unknown error'}\n\nPlease check:\n1. Microphone permissions\n2. Close other audio apps\n3. Restart Expo Go`,
        [{ text: 'OK' }]
      );
    }
  };

  const stopRecording = async () => {
    try {
      if (recording) {
        console.log('⏹️ Stopping recording...');
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        console.log('📁 Recording saved to:', uri);
        setRecording(null);
        setIsRecording(false);
        Alert.alert('Recording Complete', `Recording saved successfully!\nURI: ${uri}`);
      }
    } catch (error) {
      console.error('❌ Error stopping recording:', error);
      Alert.alert('Error', 'Failed to stop recording');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Microphone Test</Text>
      
      <View style={styles.statusContainer}>
        <Text style={styles.statusLabel}>Permission Status:</Text>
        <Text style={[
          styles.statusValue,
          { color: hasPermission === null ? '#FFA500' : hasPermission ? '#4CAF50' : '#F44336' }
        ]}>
          {hasPermission === null ? 'Not Checked' : hasPermission ? 'Granted' : 'Denied'}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: isRecording ? '#F44336' : '#2196F3' }]}
        onPress={isRecording ? stopRecording : testMicrophone}
      >
        <Text style={styles.buttonText}>
          {isRecording ? 'Stop Recording' : 'Test Microphone'}
        </Text>
      </TouchableOpacity>

      <Text style={styles.instructions}>
        This test will help identify if the microphone access issue is with:
        {'\n'}• Permissions
        {'\n'}• Audio session configuration
        {'\n'}• Recording setup
        {'\n'}• Expo Go compatibility
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    margin: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 20,
  },
  statusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    padding: 12,
    backgroundColor: '#2a2a2a',
    borderRadius: 8,
  },
  statusLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  statusValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  instructions: {
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
  },
});

export default MicrophoneTest; 