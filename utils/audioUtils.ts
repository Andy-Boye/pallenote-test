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
    const hasPermission = await requestAudioPermissions()
    if (!hasPermission) {
      throw new Error("Microphone permission denied")
    }

    await Audio.setAudioModeAsync({
      allowsRecordingIOS: true,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
    })

    const recording = new Audio.Recording()
    const recordingOptions = {
      android: {
        extension: ".m4a",
        outputFormat: 2, // MediaRecorder.OutputFormat.MPEG_4
        audioEncoder: 3, // MediaRecorder.AudioEncoder.AAC
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: ".m4a",
        outputFormat: 2, // MPEG4AAC = 2
        audioQuality: 2, // High = 2
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
      web: {}, // Add empty web property to satisfy RecordingOptions type
    }
    await recording.prepareToRecordAsync(recordingOptions)
    await recording.startAsync()
    return recording
  } catch (error) {
    console.error("Failed to start recording:", error)
    throw new Error(`Failed to start recording: ${error instanceof Error ? error.message : "Unknown error"}`)
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
