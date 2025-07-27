import { Audio } from "expo-av"
import * as FileSystem from "expo-file-system"
import { uploadRecording } from "../api/recordingApi"

export interface RecordingResult {
  uri: string
  duration: number
  size: number
}

export const requestAudioPermissions = async (): Promise<boolean> => {
  try {
    const { status } = await Audio.requestPermissionsAsync()
    return status === "granted"
  } catch (error) {
    console.error("Error requesting audio permissions:", error)
    return false
  }
}

export const startRecording = async (): Promise<Audio.Recording> => {
  try {
    console.log('=== Starting Recording Process ===');
    
    // First, check and request permissions
    const hasPermission = await requestAudioPermissions()
    if (!hasPermission) {
      throw new Error("Microphone permission denied")
    }
    console.log('✅ Permissions granted');

    // AGGRESSIVE AUDIO SESSION RESET for Expo Go compatibility
    console.log('🔄 Performing aggressive audio session reset...');
    
    // Step 1: Completely disable audio session
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: false,
      staysActiveInBackground: false,
      shouldDuckAndroid: false,
      playThroughEarpieceAndroid: false,
    })

    // Step 2: Wait longer for session to clear completely
    await new Promise(resolve => setTimeout(resolve, 500))
    console.log('✅ Audio session reset complete');

    // Configure audio mode for recording
    console.log('🎤 Configuring audio mode for recording...');
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      interruptionModeIOS: 1, // DO_NOT_MIX
      interruptionModeAndroid: 1, // DO_NOT_MIX
      shouldDuckAndroid: true,
      playThroughEarpieceAndroid: false,
    })
    console.log('✅ Audio mode configured');

    // Create new recording instance
    console.log('📱 Creating recording instance...');
    const recording = new Audio.Recording()
    
    // Use ultra-conservative recording options for Expo Go compatibility
    const recordingOptions: Audio.RecordingOptions = {
      android: {
        extension: ".m4a",
        outputFormat: 2, // MPEG_4
        audioEncoder: 3, // AAC
        sampleRate: 22050, // Lower sample rate for better compatibility
        numberOfChannels: 1, // Mono for better compatibility
        bitRate: 64000, // Lower bitrate for better compatibility
      },
      ios: {
        extension: ".m4a",
        outputFormat: 2, // MPEG4AAC
        audioQuality: 0, // Low quality for maximum compatibility
        sampleRate: 22050, // Lower sample rate for better compatibility
        numberOfChannels: 1, // Mono for better compatibility
        bitRate: 64000, // Lower bitrate for better compatibility
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {},
    }

    console.log('📋 Recording options:', JSON.stringify(recordingOptions, null, 2));
    
    // Add longer delay to ensure audio session is properly configured
    await new Promise(resolve => setTimeout(resolve, 300))
    
    // Prepare recording with options
    console.log('⚙️ Preparing recording...');
    await recording.prepareToRecordAsync(recordingOptions)
    console.log('✅ Recording prepared');
    
    console.log('▶️ Starting recording...');
    await recording.startAsync()
    
    console.log('🎉 Recording started successfully');
    return recording
  } catch (error) {
    console.error("❌ Failed to start recording:", error);
    
    // Provide more specific error messages for iOS
    let errorMessage = "Failed to start recording"
    if (error instanceof Error) {
      if (error.message.includes('NSOSStatusErrorDomain')) {
        errorMessage = "Audio session error. Please close other audio apps and try again."
      } else if (error.message.includes('permission')) {
        errorMessage = "Microphone permission is required. Please grant permission in Settings."
      } else if (error.message.includes('prepare')) {
        errorMessage = "Failed to prepare recording. Please try again."
      }
    }
    
    throw new Error(errorMessage)
  }
}

export const stopRecording = async (recording: Audio.Recording): Promise<RecordingResult | null> => {
  try {
    await recording.stopAndUnloadAsync()
    const uri = recording.getURI()

    if (!uri) {
      throw new Error("Recording URI is null")
    }

    // Get file info
    const fileInfo = await FileSystem.getInfoAsync(uri)
    if (!fileInfo.exists) {
      throw new Error("Recording file does not exist")
    }

    return {
      uri,
      duration: 0, // Duration would need to be calculated or stored during recording
      size: fileInfo.size || 0,
    }
  } catch (error) {
    console.error("Failed to stop recording:", error)
    throw new Error(`Failed to stop recording: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export const playAudio = async (uri: string): Promise<Audio.Sound> => {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri })
    await sound.playAsync()
    return sound
  } catch (error) {
    console.error("Failed to play audio:", error)
    throw new Error(`Failed to play audio: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export const pauseAudio = async (sound: Audio.Sound): Promise<void> => {
  try {
    await sound.pauseAsync()
  } catch (error) {
    console.error("Failed to pause audio:", error)
    throw new Error(`Failed to pause audio: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export const stopAudio = async (sound: Audio.Sound): Promise<void> => {
  try {
    await sound.stopAsync()
    await sound.unloadAsync()
  } catch (error) {
    console.error("Failed to stop audio:", error)
    throw new Error(`Failed to stop audio: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

export const getAudioDuration = async (uri: string): Promise<number> => {
  try {
    const { sound } = await Audio.Sound.createAsync({ uri })
    const status = await sound.getStatusAsync()
    await sound.unloadAsync()

    if (status.isLoaded) {
      return status.durationMillis || 0
    }
    return 0
  } catch (error) {
    console.error("Failed to get audio duration:", error)
    return 0
  }
}

export const uploadAudioRecording = async (uri: string, noteId?: string): Promise<any> => {
  try {
    return await uploadRecording(uri, noteId)
  } catch (error) {
    console.error("Failed to upload recording:", error)
    throw new Error(`Failed to upload recording: ${error instanceof Error ? error.message : "Unknown error"}`)
  }
}

// Audio format conversion utilities
export const isValidAudioFormat = (uri: string): boolean => {
  const validExtensions = [".m4a", ".mp3", ".wav", ".aac"]
  return validExtensions.some((ext) => uri.toLowerCase().endsWith(ext))
}

export const getAudioFileSize = async (uri: string): Promise<number> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri)
    return fileInfo.exists ? fileInfo.size || 0 : 0
  } catch (error) {
    console.error("Failed to get audio file size:", error)
    return 0
  }
}
