import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View, Dimensions, Vibration, TextInput, Modal, KeyboardAvoidingView, Platform, ActivityIndicator } from "react-native";
import Slider from '@react-native-community/slider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Audio } from 'expo-av';
import { startRecording, stopRecording, requestAudioPermissions } from '../utils/audioUtils';
import AsyncStorage from '@react-native-async-storage/async-storage';


const { width: screenWidth } = Dimensions.get('window');

type Recording = {
  id: string;
  title: string;
  duration: string;
  date: string;
  size: string;
  transcription?: string;
  quality?: 'high' | 'medium' | 'low';
  category?: string;
  template?: string;
  format?: string;
  sampleRate?: number;
  bitrate?: number;
  cloudSynced?: boolean;
  bookmarks?: number[];
  playbackSpeed?: number;
  waveform?: number[];
  linkedNoteId?: string | null;
  linkedNoteTitle?: string;
  uri?: string; // Added uri for playback
};

type RecordingQuality = 'high' | 'medium' | 'low';
type RecordingFormat = 'mp3' | 'wav' | 'm4a';
type RecordingTemplateType = 'meeting' | 'interview' | 'lecture' | 'podcast' | 'voice_memo' | 'custom';

interface RecordingTemplate {
  id: RecordingTemplateType;
  name: string;
  icon: string;
  color: string;
  defaultQuality: RecordingQuality;
  defaultFormat: RecordingFormat;
  defaultSampleRate: number;
  defaultBitrate: number;
}

const RECORDING_TEMPLATES: RecordingTemplate[] = [
  {
    id: 'meeting',
    name: 'Meeting',
    icon: 'people',
    color: '#0078d4',
    defaultQuality: 'high',
    defaultFormat: 'mp3',
    defaultSampleRate: 44100,
    defaultBitrate: 192,
  },
  {
    id: 'interview',
    name: 'Interview',
    icon: 'mic',
    color: '#107C10',
    defaultQuality: 'high',
    defaultFormat: 'wav',
    defaultSampleRate: 48000,
    defaultBitrate: 320,
  },
  {
    id: 'lecture',
    name: 'Lecture',
    icon: 'school',
    color: '#D13438',
    defaultQuality: 'medium',
    defaultFormat: 'mp3',
    defaultSampleRate: 44100,
    defaultBitrate: 128,
  },
  {
    id: 'podcast',
    name: 'Podcast',
    icon: 'radio',
    color: '#FF8C00',
    defaultQuality: 'high',
    defaultFormat: 'm4a',
    defaultSampleRate: 48000,
    defaultBitrate: 256,
  },
  {
    id: 'voice_memo',
    name: 'Voice Memo',
    icon: 'document-text',
    color: '#9B59B6',
    defaultQuality: 'medium',
    defaultFormat: 'mp3',
    defaultSampleRate: 44100,
    defaultBitrate: 128,
  },
  {
    id: 'custom',
    name: 'Custom',
    icon: 'settings',
    color: '#666666',
    defaultQuality: 'high',
    defaultFormat: 'wav',
    defaultSampleRate: 48000,
    defaultBitrate: 320,
  },
];

const RECORDING_CATEGORIES = [
  { id: 'work', name: 'Work', color: '#0078d4', icon: 'briefcase' },
  { id: 'personal', name: 'Personal', color: '#107C10', icon: 'person' },
  { id: 'education', name: 'Education', color: '#D13438', icon: 'school' },
  { id: 'creative', name: 'Creative', color: '#FF8C00', icon: 'brush' },
  { id: 'health', name: 'Health', color: '#9B59B6', icon: 'medical' },
  { id: 'finance', name: 'Finance', color: '#E74C3C', icon: 'card' },
];

const RecordingScreen = () => {
  const { colors, isDarkMode } = useTheme();
  const router = useRouter();

  // Recording state
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState("");
  const [recordingTitle, setRecordingTitle] = useState("");
  const [currentRecordingUri, setCurrentRecordingUri] = useState<string | null>(null);
  const [currentRecording, setCurrentRecording] = useState<Audio.Recording | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [noiseReduction, setNoiseReduction] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);

  // Playback state
  const [currentPlayingId, setCurrentPlayingId] = useState<string | null>(null);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  // Bottom drawer state
  const [showBottomDrawer, setShowBottomDrawer] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<RecordingTemplate>(RECORDING_TEMPLATES[0]);
  const [selectedCategory, setSelectedCategory] = useState(RECORDING_CATEGORIES[0]);
  const [recordingFormat, setRecordingFormat] = useState<RecordingFormat>('mp3');
  const [sampleRate, setSampleRate] = useState(44100);
  const [bitrate, setBitrate] = useState(192);
  const [microphoneGain, setMicrophoneGain] = useState(1.0);
  const [recordingQuality, setRecordingQuality] = useState<RecordingQuality>('high');
  const [cloudSyncEnabled, setCloudSyncEnabled] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [linkedNoteId, setLinkedNoteId] = useState<string | null>(null);
  const [linkedNoteTitle, setLinkedNoteTitle] = useState<string>("");
  
  // Modal states
  const [showTemplates, setShowTemplates] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showNoteLink, setShowNoteLink] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showNameRecording, setShowNameRecording] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [recordings, setRecordings] = useState<Recording[]>([]);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnim = useRef(new Animated.Value(0)).current;
  const audioLevelAnim = useRef(new Animated.Value(0)).current;

  // Enhanced haptic feedback
  const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (type === 'light') Vibration.vibrate(50);
    else if (type === 'medium') Vibration.vibrate(100);
    else Vibration.vibrate(200);
  };

  // Apply template settings
  const applyTemplate = (template: RecordingTemplate) => {
    setSelectedTemplate(template);
    setRecordingQuality(template.defaultQuality);
    setRecordingFormat(template.defaultFormat);
    setSampleRate(template.defaultSampleRate);
    setBitrate(template.defaultBitrate);
    triggerHaptic('light');
    console.log('Template applied:', template.name, 'Quality:', template.defaultQuality, 'Format:', template.defaultFormat);
  };

  // Generate recording title based on template
  const generateRecordingTitle = () => {
    const now = new Date();
    const timeString = now.toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit' 
    });
    const dateString = now.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    });
    return `${selectedTemplate.name} - ${dateString} ${timeString}`;
  };

  // Initialize template settings and audio session on component mount
  useEffect(() => {
    // Set initial template without triggering applyTemplate to avoid conflicts
    setSelectedTemplate(RECORDING_TEMPLATES[0]);
    setRecordingQuality(RECORDING_TEMPLATES[0].defaultQuality);
    setRecordingFormat(RECORDING_TEMPLATES[0].defaultFormat);
    setSampleRate(RECORDING_TEMPLATES[0].defaultSampleRate);
    setBitrate(RECORDING_TEMPLATES[0].defaultBitrate);
    
    // Load recordings from local storage
    const loadRecordingsFromStorage = async () => {
      try {
        const storedRecordings = await AsyncStorage.getItem('user_recordings');
        if (storedRecordings) {
          const parsedRecordings = JSON.parse(storedRecordings);
          setRecordings(parsedRecordings);
          console.log('Loaded recordings from local storage:', parsedRecordings.length);
        }
      } catch (error) {
        console.error('Error loading recordings from storage:', error);
      }
    };
    
    loadRecordingsFromStorage();
    
    // Initialize audio session with better error handling
    const initializeAudioSession = async () => {
      try {
        // First reset the audio session to clear any conflicts
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          playsInSilentModeIOS: false,
          staysActiveInBackground: false,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });
        
        // Wait a moment for the session to reset
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Then configure for recording
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          interruptionModeIOS: 1, // DO_NOT_MIX
          interruptionModeAndroid: 1, // DO_NOT_MIX
          shouldDuckAndroid: true,
          playThroughEarpieceAndroid: false,
        });
        console.log('Audio session initialized successfully');
      } catch (error) {
        console.error('Failed to initialize audio session:', error);
      }
    };
    
    initializeAudioSession();
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((t) => t + 1);
        // Simulate real-time transcription with better text
        const words = ['Hello', 'world', 'this', 'is', 'a', 'test', 'recording', 'for', 'the', 'app', 'development', 'process', 'continues', 'with', 'improvements'];
        if (Math.random() > 0.7) {
          const randomWord = words[Math.floor(Math.random() * words.length)];
          setTranscription((prev) => prev + (prev.endsWith(' ') ? '' : ' ') + randomWord + ' ');
        }
        
        // Simulate audio level changes with gain control
        const baseLevel = Math.random() * 100;
        const adjustedLevel = Math.min(100, baseLevel * microphoneGain);
        setAudioLevel(adjustedLevel);
        Animated.timing(audioLevelAnim, {
          toValue: adjustedLevel / 100,
          duration: 100,
          useNativeDriver: false,
        }).start();
      }, 1000);
    }
    return () => { if (interval !== null) clearInterval(interval); };
  }, [isRecording, isPaused, audioLevelAnim, microphoneGain]);

  useEffect(() => {
    if (isRecording && !isPaused) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      Animated.loop(
        Animated.sequence([
          Animated.timing(waveformAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: false,
          }),
          Animated.timing(waveformAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isRecording, isPaused, pulseAnim, waveformAnim]);

  // Clean up sound and audio session on unmount
  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
      // Clean up audio session
      Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
      }).catch(console.error);
    };
  }, [sound]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Add a helper to reset playback state
  const resetPlayback = async () => {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
    }
    setCurrentPlayingId(null);
  };

  // Retry recording function
  const retryRecording = async () => {
    if (isRetrying) return;
    
    setIsRetrying(true);
    try {
      // Reset audio session completely
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });
      
      // Wait longer for session reset
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Try recording again
      await handleStartRecording();
    } catch (error) {
      console.error('Retry failed:', error);
    } finally {
      setIsRetrying(false);
    }
  };

  // Update handleStartRecording with improved error handling
  const handleStartRecording = async () => {
    try {
      await resetPlayback(); // Unload any playing sound
      triggerHaptic('medium');
      
      console.log('Starting recording with template:', selectedTemplate.name);
      console.log('Recording settings - Quality:', recordingQuality, 'Format:', recordingFormat, 'Sample Rate:', sampleRate, 'Bitrate:', bitrate);
      
      // Set recording state first
      setIsRecording(true);
      setIsPaused(false);
      setRecordingTime(0);
      setTranscription("");
      setRecordingTitle(generateRecordingTitle());
      
      // Request permissions and start recording
      const recording = await startRecording();
      setCurrentRecording(recording);
      setCurrentRecordingUri(null);
      console.log('Recording started successfully');
    } catch (error) {
      console.error('Failed to start recording:', error);
      
      // Reset recording state on error
      setIsRecording(false);
      setIsPaused(false);
      
      // Show more specific error message based on the error type
      let errorMessage = 'Failed to start recording. Please try again.';
      let showSettingsButton = false;
      let showRetryButton = false;
      
      if (error instanceof Error) {
        if (error.message.includes('permission')) {
          errorMessage = 'Microphone permission is required. Please grant permission in Settings and try again.';
          showSettingsButton = true;
        } else if (error.message.includes('audio session') || error.message.includes('NSOSStatusErrorDomain')) {
          errorMessage = 'Audio session error. Please close other audio apps (music, calls, etc.) and try again.';
          showRetryButton = true;
        } else if (error.message.includes('prepare')) {
          errorMessage = 'Failed to prepare recording. Please try again in a moment.';
          showRetryButton = true;
        }
      }
      
      const alertButtons: any[] = [
        { text: 'OK', style: 'default' }
      ];
      
      if (showRetryButton) {
        alertButtons.unshift({ 
          text: 'Retry', 
          onPress: retryRecording,
          style: 'default'
        });
      }
      
      if (showSettingsButton) {
        alertButtons.push({ 
          text: 'Open Settings', 
          onPress: () => {
            console.log('User wants to open settings');
            // On iOS, you can use Linking.openSettings() here
          }
        });
      }
      
      Alert.alert('Recording Error', errorMessage, alertButtons);
    }
  };

  const handlePauseResume = async () => {
    try {
      triggerHaptic('light');
      if (currentRecording) {
        if (isPaused) {
          await currentRecording.startAsync();
          console.log('Recording resumed');
        } else {
          await currentRecording.pauseAsync();
          console.log('Recording paused');
        }
        setIsPaused((prev) => !prev);
      }
    } catch (error) {
      console.error('Failed to pause/resume recording:', error);
      Alert.alert('Recording Error', 'Failed to pause/resume recording. Please try again.');
    }
  };

  const handleStopRecording = async () => {
    try {
      triggerHaptic('heavy');
      if (isRecording && currentRecording) {
        console.log('Stopping recording...');
        // Stop actual recording
        const result = await stopRecording(currentRecording);
        if (result) {
          setCurrentRecordingUri(result.uri);
          console.log('Recording stopped, URI:', result.uri);
        }
        setCurrentRecording(null);
        setIsRecording(false);
        setIsPaused(false);
        setShowSaveDialog(true);
      } else {
        discardRecording();
      }
    } catch (error) {
      console.error('Failed to stop recording:', error);
      Alert.alert('Recording Error', 'Failed to stop recording. Please try again.');
      setIsRecording(false);
      setIsPaused(false);
    }
  };

  // Update discardRecording
  const discardRecording = async () => {
    try {
      await resetPlayback();
      if (currentRecording) {
        await currentRecording.stopAndUnloadAsync();
      }
      setIsRecording(false);
      setIsPaused(false);
      setRecordingTime(0);
      setTranscription("");
      setRecordingTitle("");
      setLinkedNoteId(null);
      setLinkedNoteTitle("");
      setCurrentRecordingUri(null);
      setCurrentRecording(null);
    } catch (error) {
      console.error('Failed to discard recording:', error);
    }
  };

  const togglePlayback = async (recordingId: string, uri?: string) => {
    console.log('togglePlayback called:', { recordingId, uri, currentPlayingId, sound: !!sound });
    
    if (isLoading === recordingId) return;
    
    if (currentPlayingId === recordingId) {
      // Pause current recording
      console.log('Pausing current recording');
      if (sound) {
        await sound.pauseAsync();
        setCurrentPlayingId(null);
      }
      return;
    }
    
    // Stop any currently playing sound
    if (sound) {
      console.log('Stopping current sound');
      await sound.unloadAsync();
      setSound(null);
    }
    
    if (!uri) {
      console.log('No URI provided');
      return;
    }
    
    console.log('Starting playback for:', recordingId);
    setIsLoading(recordingId);
    try {
      const { sound: newSound } = await Audio.Sound.createAsync({ uri });
      console.log('Sound created successfully');
      setSound(newSound);
      setCurrentPlayingId(recordingId);
      setIsLoading(null);
      await newSound.playAsync();
      console.log('Sound started playing');
      
      // Set up status update to handle when audio finishes
      newSound.setOnPlaybackStatusUpdate((status: any) => {
        if (status.isLoaded && status.didJustFinish) {
          console.log('Audio finished playing');
          setCurrentPlayingId(null);
          setSound(null);
        }
      });
    } catch (e) {
      console.error('Playback error:', e);
      setIsLoading(null);
      setCurrentPlayingId(null);
      setSound(null);
      Alert.alert('Playback Error', 'Could not play this recording.');
    }
  };

  // Update saveRecording
  const saveRecording = async () => {
    await resetPlayback();
    setIsRecording(false);
    setIsPaused(false);
    
    const newRecording = {
      id: Date.now().toString(),
      title: recordingTitle || generateRecordingTitle(),
      duration: formatTime(recordingTime),
      date: new Date().toISOString().split("T")[0],
      size: `${(recordingTime * bitrate / 8 / 1024).toFixed(1)} KB`,
      transcription: transcription.trim(),
      quality: recordingQuality,
      category: selectedCategory.id,
      template: selectedTemplate.id,
      format: recordingFormat,
      sampleRate: sampleRate,
      bitrate: bitrate,
      cloudSynced: cloudSyncEnabled,
      bookmarks: [],
      playbackSpeed: 1.0,
      waveform: Array.from({ length: 100 }, () => Math.random() * 100),
      linkedNoteId: linkedNoteId,
      linkedNoteTitle: linkedNoteTitle,
      uri: currentRecordingUri || undefined,
    };
    
    // Save to local storage first
    try {
      const existingRecordings = await AsyncStorage.getItem('user_recordings');
      const recordingsArray = existingRecordings ? JSON.parse(existingRecordings) : [];
      recordingsArray.unshift(newRecording);
      await AsyncStorage.setItem('user_recordings', JSON.stringify(recordingsArray));
      console.log('Recording saved to local storage');
    } catch (error) {
      console.error('Error saving recording to local storage:', error);
    }
    
    // Update state
    setRecordings([newRecording, ...recordings]);
    await discardRecording();
    setShowSaveDialog(false);
    Alert.alert("Saved", "Recording saved successfully!");
  };

  const deleteRecording = (recordingId: string) => {
    triggerHaptic('medium');
    Alert.alert("Delete Recording", "Are you sure you want to delete this recording?", [
      { text: "Cancel", style: "cancel" },
      { 
        text: "Delete", 
        style: "destructive", 
        onPress: () => setRecordings(recordings.filter((rec) => rec.id !== recordingId))
      },
    ]);
  };

  const getQualityColor = (quality: RecordingQuality) => {
    switch (quality) {
      case 'high': return colors.success;
      case 'medium': return colors.warning;
      case 'low': return colors.error;
    }
  };

  const getQualityIcon = (quality: RecordingQuality) => {
    switch (quality) {
      case 'high': return 'checkmark-circle';
      case 'medium': return 'alert-circle';
      case 'low': return 'close-circle';
    }
  };

  const getFormatIcon = (format: RecordingFormat) => {
    switch (format) {
      case 'mp3': return 'musical-notes';
      case 'wav': return 'pulse';
      case 'm4a': return 'radio';
    }
  };

  const filteredRecordings = recordings.filter(recording =>
    recording.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recording.transcription?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    recording.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        {/* Enhanced gradient background */}
        <LinearGradient
          colors={isDarkMode ? ['#070c18', '#0a1420', '#0f1a28'] : ['#FFFFFF', '#F5F5F5', '#E5E5E5']}
          style={StyleSheet.absoluteFill}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        
        {/* Enhanced decorative elements */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120, backgroundColor: isDarkMode ? '#0a1420' : '#F5F5F5', borderBottomLeftRadius: 80, borderBottomRightRadius: 80, opacity: isDarkMode ? 0.15 : 0.3, zIndex: 1 }} />
        <View style={{ position: 'absolute', top: 40, left: 20, right: 20, height: 60, backgroundColor: colors.primary, borderRadius: 30, opacity: isDarkMode ? 0.08 : 0.1, zIndex: 1 }} />
        
        {/* Enhanced Header */}
        <View style={[styles.header, { backgroundColor: 'transparent', borderBottomColor: colors.border, borderBottomWidth: 1, shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(0, 0, 0, 0.08)', shadowOpacity: 0.08, shadowRadius: 8, elevation: 4, zIndex: 2 }]}> 
          <TouchableOpacity onPress={() => router.back()} style={[styles.headerButton, { backgroundColor: colors.surface }]}>
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Audio Studio</Text>
          <TouchableOpacity 
            style={[styles.headerButton, { backgroundColor: colors.surface }]}
            onPress={() => setShowAdvancedSettings(true)}
          >
            <Ionicons name="settings-outline" size={20} color={colors.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
          {/* Template Selection */}
          <View style={[styles.templateSection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recording Template</Text>
              <TouchableOpacity onPress={() => setShowTemplates(true)}>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.selectedTemplate, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setShowTemplates(true)}
            >
              <View style={[styles.templateIcon, { backgroundColor: selectedTemplate.color }]}>
                <Ionicons name={selectedTemplate.icon as any} size={20} color="white" />
              </View>
              <View style={styles.templateInfo}>
                <Text style={[styles.templateName, { color: colors.text }]}>{selectedTemplate.name}</Text>
                <Text style={[styles.templateDetails, { color: colors.textSecondary }]}>
                  {selectedTemplate.defaultFormat.toUpperCase()} • {Math.round(selectedTemplate.defaultSampleRate/1000)}kHz • {selectedTemplate.defaultBitrate}kbps
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Category Selection */}
          <View style={[styles.categorySection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Category</Text>
              <TouchableOpacity onPress={() => setShowCategories(true)}>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.selectedCategory, { backgroundColor: colors.background, borderColor: colors.border }]}
              onPress={() => setShowCategories(true)}
            >
              <View style={[styles.categoryIcon, { backgroundColor: selectedCategory.color }]}>
                <Ionicons name={selectedCategory.icon as any} size={16} color="white" />
              </View>
              <View style={styles.categoryInfo}>
                <Text style={[styles.categoryName, { color: colors.text }]}>{selectedCategory.name}</Text>
                <Text style={[styles.categoryDescription, { color: colors.textSecondary }]}>Organize your recordings</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>





          {/* Recording Quality Controls */}
          <View style={[styles.qualitySection, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Recording Settings</Text>
            <View style={styles.qualityControls}>
              <TouchableOpacity 
                style={[styles.qualityButton, { backgroundColor: recordingQuality === 'high' ? colors.primary : colors.surface, borderColor: colors.border }]}
                onPress={() => setRecordingQuality('high')}
              >
                <Ionicons name="checkmark-circle" size={16} color={recordingQuality === 'high' ? colors.background : colors.success} />
                <Text style={[styles.qualityText, { color: recordingQuality === 'high' ? colors.background : colors.text }]}>High</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.qualityButton, { backgroundColor: recordingQuality === 'medium' ? colors.primary : colors.surface, borderColor: colors.border }]}
                onPress={() => setRecordingQuality('medium')}
              >
                <Ionicons name="alert-circle" size={16} color={recordingQuality === 'medium' ? colors.background : colors.warning} />
                <Text style={[styles.qualityText, { color: recordingQuality === 'medium' ? colors.background : colors.text }]}>Medium</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.qualityButton, { backgroundColor: recordingQuality === 'low' ? colors.primary : colors.surface, borderColor: colors.border }]}
                onPress={() => setRecordingQuality('low')}
              >
                <Ionicons name="close-circle" size={16} color={recordingQuality === 'low' ? colors.background : colors.error} />
                <Text style={[styles.qualityText, { color: recordingQuality === 'low' ? colors.background : colors.text }]}>Low</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity 
              style={[styles.noiseReductionButton, { backgroundColor: noiseReduction ? colors.primary : colors.surface, borderColor: colors.border }]}
              onPress={() => setNoiseReduction(!noiseReduction)}
            >
              <Ionicons name="mic-outline" size={16} color={noiseReduction ? colors.background : colors.text} />
              <Text style={[styles.noiseReductionText, { color: noiseReduction ? colors.background : colors.text }]}>Noise Reduction</Text>
            </TouchableOpacity>
          </View>

          {/* Enhanced Microphone Test Component - Temporary for debugging */}


          {/* Enhanced Recording Section */}
          <View style={styles.recordingSection}>
            {/* Audio Level Meter */}
            {isRecording && (
              <View style={[styles.audioMeter, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <Text style={[styles.audioMeterLabel, { color: colors.textSecondary }]}>Audio Level</Text>
                <View style={[styles.audioMeterBar, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)' }]}>
                  <Animated.View 
                    style={[
                      styles.audioMeterFill, 
                      { 
                        backgroundColor: colors.primary,
                        width: audioLevelAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0%', '100%']
                        })
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.audioMeterValue, { color: colors.textSecondary }]}>{Math.round(audioLevel)}%</Text>
              </View>
            )}

            {/* Enhanced Waveform */}
            {isRecording && (
              <Animated.View style={[styles.waveformModern, { opacity: isPaused ? 0.3 : 1, transform: [{ scaleY: pulseAnim }], marginBottom: 24 }]}> 
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 80, marginBottom: 16 }}>
                  {[...Array(40)].map((_, i) => (
                    <Animated.View
                      key={i}
                      style={{
                        width: 4,
                        height: Math.max(20, Math.abs(Math.sin((recordingTime + i) * 0.3)) * 60),
                        backgroundColor: colors.primary,
                        borderRadius: 2,
                        marginHorizontal: 1,
                        opacity: isPaused ? 0.2 : 0.9,
                      }}
                    />
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Enhanced Recording Button */}
            <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
              <TouchableOpacity
                style={[styles.recordingButton, { 
                  backgroundColor: isRecording ? colors.error : (isRetrying ? colors.warning : colors.primary), 
                  shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.4)' : 'rgba(0, 0, 0, 0.2)', 
                  shadowOpacity: 0.2, 
                  shadowRadius: 12, 
                  elevation: 12,
                  borderWidth: 2,
                  borderColor: isRecording ? colors.error : (isRetrying ? colors.warning : colors.primary)
                }]}
                onPress={isRecording ? handleStopRecording : handleStartRecording}
                activeOpacity={0.8}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <ActivityIndicator size={48} color={colors.background} />
                ) : (
                  <Ionicons name={isRecording ? "stop" : "mic"} size={48} color={colors.background} />
                )}
              </TouchableOpacity>
            </Animated.View>

            {/* Enhanced Pause/Resume Button */}
            {isRecording && (
              <TouchableOpacity
                style={[styles.pauseBelow, { backgroundColor: isPaused ? colors.warning : colors.surface, borderColor: colors.warning, borderWidth: 1 }]}
                onPress={handlePauseResume}
              >
                <Ionicons name={isPaused ? "play" : "pause"} size={24} color={colors.warning} />
                <Text style={[styles.pauseText, { color: colors.warning }]}>{isPaused ? 'Resume' : 'Pause'}</Text>
              </TouchableOpacity>
            )}

            {/* Enhanced Timer */}
            <Text style={[styles.recordingTime, { color: colors.text }]}>{formatTime(recordingTime)}</Text>
            <Text style={[styles.recordingStatus, { color: colors.textSecondary }]}>
              {isRetrying ? "🔄 Retrying..." : 
               isRecording ? (isPaused ? "⏸️ Paused" : "🔴 Recording...") : 
               "🎤 Ready to record"}
            </Text>
            {!isRecording && (
              <Text style={[styles.recordingHint, { color: colors.textDim }]}>
                Using {selectedTemplate.name} template • {recordingQuality} quality
              </Text>
            )}

            {/* Enhanced Transcription Area */}
            {isRecording && transcription && (
              <View style={[styles.transcriptionContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                <View style={styles.transcriptionHeader}>
                  <Ionicons name="text-outline" size={16} color={colors.primary} />
                  <Text style={[styles.transcriptionTitle, { color: colors.text }]}>Live Transcription</Text>
                  <View style={[styles.transcriptionIndicator, { backgroundColor: colors.success }]} />
                </View>
                <ScrollView style={styles.transcriptionScroll} showsVerticalScrollIndicator={false}>
                  <Text style={[styles.transcription, { color: colors.text }]}>{transcription}</Text>
                </ScrollView>
                <View style={[styles.transcriptionActions, { borderTopColor: colors.border }]}>
                  <TouchableOpacity style={styles.transcriptionAction}>
                    <Ionicons name="copy-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.transcriptionActionText, { color: colors.textSecondary }]}>Copy</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.transcriptionAction}>
                    <Ionicons name="share-outline" size={16} color={colors.textSecondary} />
                    <Text style={[styles.transcriptionActionText, { color: colors.textSecondary }]}>Share</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>

          {/* Enhanced Recordings Section */}
          <View style={styles.recordingsSection}>
            <View style={styles.recordingsHeader}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Recordings</Text>
              <TouchableOpacity 
                style={[styles.searchButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
                onPress={() => setShowSearch(true)}
              >
                <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            
            {recordings.length === 0 ? (
              <View style={[styles.emptyState, { backgroundColor: colors.surface, borderColor: colors.border, borderStyle: 'dashed' }]}>
                <Ionicons name="mic-off-outline" size={48} color={colors.textSecondary} />
                <Text style={[styles.emptyStateText, { color: colors.textSecondary }]}>No recordings yet</Text>
                <Text style={[styles.emptyStateSubtext, { color: colors.textDim }]}>Start recording to see your audio files here</Text>
              </View>
            ) : (
              filteredRecordings.map((r) => (
                <View key={r.id} style={[styles.recordingItem, { backgroundColor: colors.surface, shadowColor: isDarkMode ? 'rgba(0, 0, 0, 0.3)' : 'rgba(0, 0, 0, 0.1)', shadowOpacity: 0.1, shadowRadius: 8, elevation: 4 }]}> 
                  <View style={styles.recordingInfo}>
                    <View style={styles.recordingHeader}>
                      <Text style={[styles.recordingTitle, { color: colors.text }]}>{r.title}</Text>
                      <View style={[styles.qualityBadge, { backgroundColor: getQualityColor(r.quality || 'high') }]}>
                        <Ionicons name={getQualityIcon(r.quality || 'high')} size={12} color={colors.background} />
                      </View>
                    </View>
                    <Text style={[styles.recordingMeta, { color: colors.textSecondary }]}>{r.duration} • {r.date} • {r.size}</Text>
                    <View style={styles.recordingTags}>
                      {r.category && (
                        <View style={[styles.tag, { backgroundColor: RECORDING_CATEGORIES.find(c => c.id === r.category)?.color || colors.primary }]}>
                          <Text style={[styles.tagText, { color: 'white' }]}>{RECORDING_CATEGORIES.find(c => c.id === r.category)?.name}</Text>
                        </View>
                      )}
                      {r.format && (
                        <View style={[styles.tag, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                          <Text style={[styles.tagText, { color: colors.text }]}>{r.format.toUpperCase()}</Text>
                        </View>
                      )}
                      {r.cloudSynced && (
                        <View style={[styles.tag, { backgroundColor: colors.success }]}>
                          <Ionicons name="cloud" size={12} color="white" />
                          <Text style={[styles.tagText, { color: 'white' }]}>Synced</Text>
                        </View>
                      )}
                    </View>
                    {r.transcription && (
                      <Text style={[styles.recordingTranscription, { color: colors.textDim }]} numberOfLines={2}>
                        {r.transcription}
                      </Text>
                    )}
                  </View>
                  <View style={styles.recordingActions}>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: colors.primary }]}
                      onPress={() => togglePlayback(r.id, r.uri)}
                      disabled={isLoading === r.id}
                    >
                      {isLoading === r.id ? (
                        <ActivityIndicator color={colors.background} size={16} />
                      ) : (
                        <Ionicons
                          name={sound && currentPlayingId === r.id ? "pause" : "play"}
                          size={16}
                          color={colors.background}
                        />
                      )}
                    </TouchableOpacity>
                    {sound && currentPlayingId === r.id && r.linkedNoteId && (
                      <TouchableOpacity
                        style={[styles.actionButton, { backgroundColor: colors.accent }]}
                        onPress={() => router.push({ pathname: '/(tabs)/notes', params: { id: r.linkedNoteId } })}
                      >
                        <Ionicons name="document-text-outline" size={16} color={colors.background} />
                        <Text style={{ color: colors.background, marginLeft: 4, fontSize: 12 }}>Open Linked Note</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity 
                      style={[styles.actionButton, { backgroundColor: colors.surface, borderColor: colors.border }]}
                      onPress={() => deleteRecording(r.id)}
                    >
                      <Ionicons name="trash-outline" size={16} color={colors.error} />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        </ScrollView>

        {/* Template Selection Modal */}
        <Modal
          visible={showTemplates}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowTemplates(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.templateModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Template</Text>
                <TouchableOpacity onPress={() => setShowTemplates(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.templateList} showsVerticalScrollIndicator={false}>
                {RECORDING_TEMPLATES.map((template) => (
                  <TouchableOpacity
                    key={template.id}
                    style={[styles.templateOption, { 
                      backgroundColor: selectedTemplate.id === template.id ? colors.primary : colors.background,
                      borderColor: colors.border 
                    }]}
                    onPress={() => {
                      applyTemplate(template);
                      setShowTemplates(false);
                    }}
                  >
                    <View style={[styles.templateOptionIcon, { backgroundColor: template.color }]}>
                      <Ionicons name={template.icon as any} size={24} color="white" />
                    </View>
                    <View style={styles.templateOptionInfo}>
                      <Text style={[styles.templateOptionName, { 
                        color: selectedTemplate.id === template.id ? colors.background : colors.text 
                      }]}>
                        {template.name}
                      </Text>
                      <Text style={[styles.templateOptionDetails, { 
                        color: selectedTemplate.id === template.id ? colors.background : colors.textSecondary 
                      }]}>
                        {template.defaultFormat.toUpperCase()} • {Math.round(template.defaultSampleRate/1000)}kHz • {template.defaultBitrate}kbps
                      </Text>
                    </View>
                    {selectedTemplate.id === template.id && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.background} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Category Selection Modal */}
        <Modal
          visible={showCategories}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowCategories(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.categoryModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Select Category</Text>
                <TouchableOpacity onPress={() => setShowCategories(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.categoryList} showsVerticalScrollIndicator={false}>
                {RECORDING_CATEGORIES.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={[styles.categoryOption, { 
                      backgroundColor: selectedCategory.id === category.id ? colors.primary : colors.background,
                      borderColor: colors.border 
                    }]}
                    onPress={() => {
                      setSelectedCategory(category);
                      setShowCategories(false);
                      triggerHaptic('light');
                      console.log('Category selected:', category.name);
                    }}
                  >
                    <View style={[styles.categoryOptionIcon, { backgroundColor: category.color }]}>
                      <Ionicons name={category.icon as any} size={20} color="white" />
                    </View>
                    <Text style={[styles.categoryOptionName, { 
                      color: selectedCategory.id === category.id ? colors.background : colors.text 
                    }]}>
                      {category.name}
                    </Text>
                    {selectedCategory.id === category.id && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.background} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Save Recording Dialog */}
        <Modal
          visible={showSaveDialog}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSaveDialog(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.saveDialogModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Save Recording</Text>
                <TouchableOpacity onPress={() => setShowSaveDialog(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.saveDialogContent} showsVerticalScrollIndicator={false}>
                {/* Recording Name Section */}
                <View style={[styles.saveDialogSection, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderColor: colors.border }]}>
                  <View style={styles.saveDialogSectionHeader}>
                    <Ionicons name="create-outline" size={20} color={colors.primary} />
                    <Text style={[styles.saveDialogSectionTitle, { color: colors.text }]}>Recording Name</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.saveDialogInput, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', borderColor: colors.border }]}
                    onPress={() => {
                      setShowSaveDialog(false);
                      setShowNameRecording(true);
                    }}
                  >
                    <Text style={[styles.saveDialogInputText, { color: recordingTitle ? colors.text : colors.textSecondary }]}>
                      {recordingTitle || generateRecordingTitle()}
                    </Text>
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Link to Note Section */}
                <View style={[styles.saveDialogSection, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderColor: colors.border }]}>
                  <View style={styles.saveDialogSectionHeader}>
                    <Ionicons name="document-text-outline" size={20} color={colors.primary} />
                    <Text style={[styles.saveDialogSectionTitle, { color: colors.text }]}>Link to Note</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.saveDialogInput, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)', borderColor: colors.border }]}
                    onPress={() => {
                      setShowSaveDialog(false);
                      setShowNoteLink(true);
                    }}
                  >
                    <Text style={[styles.saveDialogInputText, { color: linkedNoteTitle ? colors.text : colors.textSecondary }]}>
                      {linkedNoteTitle || "Select a note to link..."}
                    </Text>
                    {linkedNoteId && (
                      <View style={[styles.linkedIndicator, { backgroundColor: colors.success }]}>
                        <Ionicons name="checkmark" size={12} color="white" />
                      </View>
                    )}
                    <Ionicons name="chevron-forward" size={16} color={colors.textSecondary} />
                  </TouchableOpacity>
                </View>

                {/* Recording Info */}
                <View style={[styles.saveDialogSection, { backgroundColor: isDarkMode ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.02)', borderColor: colors.border }]}>
                  <View style={styles.saveDialogSectionHeader}>
                    <Ionicons name="information-circle-outline" size={20} color={colors.primary} />
                    <Text style={[styles.saveDialogSectionTitle, { color: colors.text }]}>Recording Info</Text>
                  </View>
                  <View style={styles.recordingInfoGrid}>
                    <View style={styles.recordingInfoItem}>
                      <Text style={[styles.recordingInfoLabel, { color: colors.textSecondary }]}>Duration</Text>
                      <Text style={[styles.recordingInfoValue, { color: colors.text }]}>{formatTime(recordingTime)}</Text>
                    </View>
                    <View style={styles.recordingInfoItem}>
                      <Text style={[styles.recordingInfoLabel, { color: colors.textSecondary }]}>Quality</Text>
                      <Text style={[styles.recordingInfoValue, { color: colors.text }]}>{recordingQuality}</Text>
                    </View>
                    <View style={styles.recordingInfoItem}>
                      <Text style={[styles.recordingInfoLabel, { color: colors.textSecondary }]}>Format</Text>
                      <Text style={[styles.recordingInfoValue, { color: colors.text }]}>{recordingFormat.toUpperCase()}</Text>
                    </View>
                    <View style={styles.recordingInfoItem}>
                      <Text style={[styles.recordingInfoLabel, { color: colors.textSecondary }]}>Category</Text>
                      <Text style={[styles.recordingInfoValue, { color: colors.text }]}>{selectedCategory.name}</Text>
                    </View>
                  </View>
                </View>
              </ScrollView>

              <View style={[styles.saveDialogActions, { borderTopColor: colors.border }]}>
                <TouchableOpacity 
                  style={[styles.saveDialogButton, styles.discardButton, { backgroundColor: colors.error, borderColor: colors.error }]}
                  onPress={() => {
                    setShowSaveDialog(false);
                    // Stop recording first, then discard
                    setIsRecording(false);
                    setIsPaused(false);
                    discardRecording();
                  }}
                >
                  <Ionicons name="trash-outline" size={20} color="white" />
                  <Text style={[styles.saveDialogButtonText, { color: "white" }]}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveDialogButton, styles.saveButton, { backgroundColor: colors.primary, borderColor: colors.primary }]}
                  onPress={saveRecording}
                >
                  <Ionicons name="save-outline" size={20} color="white" />
                  <Text style={[styles.saveDialogButtonText, { color: "white" }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Recording Name Modal */}
        <Modal
          visible={showNameRecording}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNameRecording(false)}
        >
          <KeyboardAvoidingView 
            style={styles.modalOverlay} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <View style={[styles.nameRecordingModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Name Recording</Text>
                <TouchableOpacity onPress={() => {
                  setShowNameRecording(false);
                  setShowSaveDialog(true);
                }}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <View style={[styles.nameInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="create-outline" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.nameInput, { color: colors.text }]}
                  placeholder="Enter recording name..."
                  placeholderTextColor={colors.textSecondary}
                  value={recordingTitle}
                  onChangeText={setRecordingTitle}
                  autoFocus={true}
                />
              </View>
              <View style={styles.modalActions}>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: colors.background, borderColor: colors.border }]}
                  onPress={() => {
                    setShowNameRecording(false);
                    setShowSaveDialog(true);
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: colors.text }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.modalButton, { backgroundColor: colors.primary }]}
                  onPress={() => {
                    if (!recordingTitle.trim()) {
                      setRecordingTitle(generateRecordingTitle());
                    }
                    setShowNameRecording(false);
                    setShowSaveDialog(true);
                  }}
                >
                  <Text style={[styles.modalButtonText, { color: colors.background }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        {/* Note Link Modal */}
        <Modal
          visible={showNoteLink}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowNoteLink(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.noteLinkModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Link to Note</Text>
                <TouchableOpacity onPress={() => {
                  setShowNoteLink(false);
                  setShowSaveDialog(true);
                }}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <ScrollView style={styles.noteList} showsVerticalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.noteOption, { 
                    backgroundColor: !linkedNoteId ? colors.primary : colors.background,
                    borderColor: colors.border 
                  }]}
                  onPress={() => {
                    setLinkedNoteId(null);
                    setLinkedNoteTitle("");
                    setShowNoteLink(false);
                    setShowSaveDialog(true);
                  }}
                >
                  <Ionicons name="close-circle" size={20} color={!linkedNoteId ? colors.background : colors.text} />
                  <Text style={[styles.noteOptionText, { 
                    color: !linkedNoteId ? colors.background : colors.text 
                  }]}>
                    No Link
                  </Text>
                  {!linkedNoteId && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.background} />
                  )}
                </TouchableOpacity>
                
                {/* Sample notes - replace with actual notes from API */}
                {[
                  { id: "1", title: "Meeting Notes - Project Alpha", content: "Discussion about..." },
                  { id: "2", title: "Study Notes - React Native", content: "Key concepts..." },
                  { id: "3", title: "Ideas - App Features", content: "New features to implement..." },
                ].map((note) => (
                  <TouchableOpacity
                    key={note.id}
                    style={[styles.noteOption, { 
                      backgroundColor: linkedNoteId === note.id ? colors.primary : colors.background,
                      borderColor: colors.border 
                    }]}
                    onPress={() => {
                      setLinkedNoteId(note.id);
                      setLinkedNoteTitle(note.title);
                      setShowNoteLink(false);
                      setShowSaveDialog(true);
                    }}
                  >
                    <Ionicons name="document-text-outline" size={20} color={linkedNoteId === note.id ? colors.background : colors.text} />
                    <View style={styles.noteOptionInfo}>
                      <Text style={[styles.noteOptionTitle, { 
                        color: linkedNoteId === note.id ? colors.background : colors.text 
                      }]}>
                        {note.title}
                      </Text>
                      <Text style={[styles.noteOptionContent, { 
                        color: linkedNoteId === note.id ? colors.background : colors.textSecondary 
                      }]}>
                        {note.content}
                      </Text>
                    </View>
                    {linkedNoteId === note.id && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.background} />
                    )}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Search Modal */}
        <Modal
          visible={showSearch}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setShowSearch(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.searchModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.searchHeader}>
                <Text style={[styles.searchTitle, { color: colors.text }]}>Search Recordings</Text>
                <TouchableOpacity onPress={() => setShowSearch(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              <View style={[styles.searchInputContainer, { backgroundColor: colors.background, borderColor: colors.border }]}>
                <Ionicons name="search" size={20} color={colors.textSecondary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Search by title, transcription, or category..."
                  placeholderTextColor={colors.textSecondary}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus={true}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
                  </TouchableOpacity>
                )}
              </View>
              <ScrollView style={styles.searchResults} showsVerticalScrollIndicator={false}>
                {filteredRecordings.length === 0 && searchQuery.length > 0 ? (
                  <View style={styles.noResults}>
                    <Ionicons name="search-outline" size={48} color={colors.textSecondary} />
                    <Text style={[styles.noResultsText, { color: colors.textSecondary }]}>No recordings found</Text>
                    <Text style={[styles.noResultsSubtext, { color: colors.textDim }]}>Try different keywords</Text>
                  </View>
                ) : (
                  filteredRecordings.map((r) => (
                    <TouchableOpacity 
                      key={r.id} 
                      style={[styles.searchResultItem, { backgroundColor: colors.background, borderColor: colors.border }]}
                      onPress={() => {
                        setShowSearch(false);
                        // Scroll to the recording item
                      }}
                    >
                      <View style={styles.searchResultInfo}>
                        <Text style={[styles.searchResultTitle, { color: colors.text }]}>{r.title}</Text>
                        <Text style={[styles.searchResultMeta, { color: colors.textSecondary }]}>{r.duration} • {r.date}</Text>
                        {r.transcription && (
                          <Text style={[styles.searchResultTranscription, { color: colors.textDim }]} numberOfLines={1}>
                            {r.transcription}
                          </Text>
                        )}
                      </View>
                      <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                  ))
                )}
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Advanced Settings Modal */}
        <Modal
          visible={showAdvancedSettings}
          transparent
          animationType="slide"
          onRequestClose={() => setShowAdvancedSettings(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.advancedSettingsModal, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>Advanced Settings</Text>
                <TouchableOpacity onPress={() => setShowAdvancedSettings(false)}>
                  <Ionicons name="close" size={24} color={colors.text} />
                </TouchableOpacity>
              </View>
              
              <ScrollView style={styles.advancedSettingsContent} showsVerticalScrollIndicator={false}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Audio Settings</Text>
                
                {/* Recording Format */}
                <View style={styles.settingRow}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Format</Text>
                  <View style={styles.formatOptions}>
                    {(['mp3', 'wav', 'm4a'] as RecordingFormat[]).map((format) => (
                      <TouchableOpacity
                        key={format}
                        style={[styles.formatOption, { 
                          backgroundColor: recordingFormat === format ? colors.primary : colors.background,
                          borderColor: colors.border 
                        }]}
                        onPress={() => setRecordingFormat(format)}
                      >
                        <Ionicons 
                          name={getFormatIcon(format) as any} 
                          size={16} 
                          color={recordingFormat === format ? colors.background : colors.text} 
                        />
                        <Text style={[styles.formatText, { 
                          color: recordingFormat === format ? colors.background : colors.text 
                        }]}>
                          {format.toUpperCase()}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Sample Rate */}
                <View style={styles.settingRow}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Sample Rate: {sampleRate/1000}kHz</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={22050}
                    maximumValue={96000}
                    step={22050}
                    value={sampleRate}
                    onValueChange={setSampleRate}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                </View>

                {/* Bitrate */}
                <View style={styles.settingRow}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Bitrate: {bitrate}kbps</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={64}
                    maximumValue={320}
                    step={64}
                    value={bitrate}
                    onValueChange={setBitrate}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                </View>

                {/* Microphone Gain */}
                <View style={styles.settingRow}>
                  <Text style={[styles.settingLabel, { color: colors.text }]}>Microphone Gain: {microphoneGain.toFixed(1)}x</Text>
                  <Slider
                    style={styles.slider}
                    minimumValue={0.5}
                    maximumValue={3.0}
                    step={0.1}
                    value={microphoneGain}
                    onValueChange={setMicrophoneGain}
                    minimumTrackTintColor={colors.primary}
                    maximumTrackTintColor={colors.border}
                    thumbTintColor={colors.primary}
                  />
                </View>

                {/* Cloud Sync & Auto Save */}
                <View style={styles.settingRow}>
                  <TouchableOpacity 
                    style={[styles.toggleButton, { backgroundColor: cloudSyncEnabled ? colors.primary : colors.background, borderColor: colors.border }]}
                    onPress={() => setCloudSyncEnabled(!cloudSyncEnabled)}
                  >
                    <Ionicons name="cloud" size={16} color={cloudSyncEnabled ? colors.background : colors.text} />
                    <Text style={[styles.toggleText, { color: cloudSyncEnabled ? colors.background : colors.text }]}>Cloud Sync</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.toggleButton, { backgroundColor: autoSaveEnabled ? colors.primary : colors.background, borderColor: colors.border }]}
                    onPress={() => setAutoSaveEnabled(!autoSaveEnabled)}
                  >
                    <Ionicons name="save" size={16} color={autoSaveEnabled ? colors.background : colors.text} />
                    <Text style={[styles.toggleText, { color: autoSaveEnabled ? colors.background : colors.text }]}>Auto Save</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 48,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  templateSection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedTemplate: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  templateIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  templateInfo: {
    flex: 1,
  },
  templateName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  templateDetails: {
    fontSize: 12,
  },
  categorySection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },

  linkedIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  selectedCategory: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  categoryIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: '600',
  },
  categoryInfo: {
    flex: 1,
    marginRight: 12,
  },
  categoryDescription: {
    fontSize: 12,
    marginTop: 2,
  },
  advancedToggleSection: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  advancedToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  advancedToggleLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  qualitySection: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  qualityControls: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
    marginBottom: 16,
  },
  qualityButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: "center",
  },
  qualityText: {
    fontSize: 12,
    fontWeight: "600",
    marginLeft: 4,
  },
  noiseReductionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
  },
  noiseReductionText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  audioMeter: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  audioMeterLabel: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  audioMeterBar: {
    height: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  audioMeterFill: {
    height: '100%',
    borderRadius: 4,
  },
  audioMeterValue: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "right",
  },
  recordingSection: { 
    alignItems: "center", 
    marginTop: 20, 
    paddingHorizontal: 20 
  },
  recordingButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  pauseBelow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginTop: 16,
    marginBottom: 16,
  },
  pauseText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  recordingTime: { 
    fontSize: 32, 
    fontWeight: "700", 
    marginTop: 8,
    letterSpacing: 2,
  },
  recordingStatus: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 8,
  },
  recordingHint: {
    fontSize: 12,
    fontWeight: "400",
    marginBottom: 16,
    textAlign: "center",
  },
  waveformModern: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 2,
    marginTop: 10,
  },
  transcriptionContainer: {
    width: '100%',
    marginTop: 20,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    maxHeight: 200,
  },
  transcriptionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  transcriptionTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
    flex: 1,
  },
  transcriptionIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  transcriptionScroll: {
    maxHeight: 100,
  },
  transcription: { 
    fontSize: 14,
    lineHeight: 20,
    fontStyle: "italic",
  },
  transcriptionActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  transcriptionAction: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  transcriptionActionText: {
    fontSize: 12,
    marginLeft: 4,
  },
  recordingsSection: { 
    marginTop: 40, 
    paddingHorizontal: 20 
  },
  recordingsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: "700",
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    padding: 40,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  emptyStateText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  emptyStateSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  recordingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  recordingInfo: { 
    flex: 1, 
    marginRight: 16 
  },
  recordingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  recordingTitle: {
    fontSize: 16,
    fontWeight: "600",
    flex: 1,
  },
  qualityBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  recordingMeta: {
    fontSize: 12,
    marginBottom: 4,
  },
  recordingTranscription: {
    fontSize: 12,
    lineHeight: 16,
  },
  recordingActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
     actionButton: {
     width: 36,
     height: 36,
     borderRadius: 18,
     justifyContent: 'center',
     alignItems: 'center',
     marginLeft: 8,
     borderWidth: 1,
   },
   modalOverlay: {
     flex: 1,
     backgroundColor: 'rgba(0, 0, 0, 0.5)',
     justifyContent: 'flex-end',
   },
   templateModal: {
     height: '70%',
     borderTopLeftRadius: 24,
     borderTopRightRadius: 24,
     borderWidth: 1,
     padding: 20,
   },
   modalHeader: {
     flexDirection: 'row',
     justifyContent: 'space-between',
     alignItems: 'center',
     marginBottom: 20,
   },
   modalTitle: {
     fontSize: 20,
     fontWeight: '700',
   },
   templateList: {
     flex: 1,
   },
   templateOption: {
     flexDirection: 'row',
     alignItems: 'center',
     padding: 16,
     borderRadius: 12,
     borderWidth: 1,
     marginBottom: 12,
   },
   templateOptionIcon: {
     width: 40,
     height: 40,
     borderRadius: 20,
     justifyContent: 'center',
     alignItems: 'center',
     marginRight: 12,
   },
   templateOptionInfo: {
     flex: 1,
   },
   templateOptionName: {
     fontSize: 16,
     fontWeight: '600',
     marginBottom: 4,
   },
   templateOptionDetails: {
     fontSize: 12,
   },
   categoryList: {
    flex: 1,
  },
  categoryOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  categoryOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  categoryOptionName: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  categoryModal: {
    height: '70%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  advancedToggleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  advancedSettings: {
    margin: 20,
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
  },
  settingRow: {
    marginBottom: 20,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  formatOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
  },
  formatOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  formatText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  toggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  recordingTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  searchModal: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  searchHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  searchTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  searchResults: {
    flex: 1,
  },
  noResults: {
    alignItems: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
  },
  noResultsSubtext: {
    fontSize: 14,
    marginTop: 4,
    textAlign: 'center',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchResultInfo: {
    flex: 1,
    marginRight: 12,
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  searchResultMeta: {
    fontSize: 12,
    marginBottom: 4,
  },
  searchResultTranscription: {
    fontSize: 12,
    lineHeight: 16,
  },
  nameRecordingModal: {
    maxHeight: '60%',
    minHeight: 200,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    justifyContent: 'space-between',
  },
  nameInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  nameInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  modalButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  noteLinkModal: {
    height: '70%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  noteList: {
    flex: 1,
  },
  noteOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  noteOptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  noteOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  noteOptionContent: {
    fontSize: 12,
    lineHeight: 16,
  },
  noteOptionText: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 12,
  },
  saveDialogModal: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
    // Add subtle shadow for depth
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  saveDialogContent: {
    flex: 1,
    marginTop: 20,
  },
  saveDialogSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    // Add subtle background for better section distinction
  },
  saveDialogSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  saveDialogSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  saveDialogInput: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    // Add subtle background for better input visibility
  },
  saveDialogInputText: {
    flex: 1,
    fontSize: 14,
    marginRight: 8,
  },
  recordingInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  recordingInfoItem: {
    width: '48%',
    marginBottom: 12,
    // Add subtle padding for better spacing
    paddingHorizontal: 4,
  },
  recordingInfoLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 4,
    opacity: 0.8,
  },
  recordingInfoValue: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveDialogActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
    paddingTop: 20,
    borderTopWidth: 1,
  },
  saveDialogButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    // Add subtle shadow for button depth
    shadowColor: 'rgba(0, 0, 0, 0.1)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  saveDialogButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  discardButton: {
    // Styles will be applied inline
  },
  saveButton: {
    // Styles will be applied inline
  },
  advancedSettingsModal: {
    height: '80%',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    padding: 20,
  },
  advancedSettingsContent: {
    flex: 1,
    marginTop: 20,
  },
});

export default RecordingScreen;
