import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type Recording = {
  id: string;
  title: string;
  duration: string;
  date: string;
  size: string;
};

const RecordingScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [transcription, setTranscription] = useState("");
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const waveformAnim = useRef(new Animated.Value(0)).current;
  const [recordings, setRecordings] = useState<Recording[]>([]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRecording && !isPaused) {
      interval = setInterval(() => {
        setRecordingTime((t) => t + 1);
        setTranscription((prev) => prev + (Math.random() > 0.9 ? "... " : "word "));
      }, 1000);
    }
    return () => { if (interval !== null) clearInterval(interval); };
  }, [isRecording, isPaused]);

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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setRecordingTime(0);
    setTranscription("");
  };

  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
  };

  const handleStopRecording = () => {
    if (recordingTime > 0) {
      Alert.alert("Save Recording", "Would you like to save this recording?", [
        { text: "Discard", style: "destructive", onPress: discardRecording },
        { text: "Save", onPress: saveRecording },
      ]);
    } else {
      discardRecording();
    }
  };

  const discardRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    setRecordingTime(0);
    setTranscription("");
  };

  const saveRecording = () => {
    const newRecording = {
      id: Date.now().toString(),
      title: `Recording ${new Date().toLocaleDateString()}`,
      duration: formatTime(recordingTime),
      date: new Date().toISOString().split("T")[0],
      size: "1.2 MB",
    };
    setRecordings([newRecording, ...recordings]);
    discardRecording();
    Alert.alert("Saved", "Recording saved successfully!");
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Custom dark blue gradient background */}
      <LinearGradient
        colors={['#070c18', '#101a2b', '#181f2e']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      {/* Decorative top arc with darker blue */}
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 80, backgroundColor: '#101a2b', borderBottomLeftRadius: 60, borderBottomRightRadius: 60, opacity: 0.12, zIndex: 1 }} />
      {/* Modern Header */}
      <View style={[styles.header, { backgroundColor: 'transparent', borderBottomColor: colors.border, borderBottomWidth: 1, shadowColor: colors.text, shadowOpacity: 0.04, shadowRadius: 4, elevation: 2, zIndex: 2 }]}> 
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Recording</Text>
        <View style={{ width: 30 }} />
      </View>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingBottom: 32 }}>
        <View style={styles.recordingSection}>
          {/* Animated waveform/motion effect above timer */}
          {isRecording && (
            <Animated.View style={[styles.waveformModern, { opacity: isPaused ? 0.3 : 1, transform: [{ scaleY: pulseAnim }], marginBottom: 18 }]}> 
              <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 60, marginBottom: 10 }}>
                {[...Array(32)].map((_, i) => (
                  <Animated.View
                    key={i}
                    style={{
                      width: 3,
                      height: Math.max(16, Math.abs(Math.sin((recordingTime + i) * 0.5)) * 54),
                      backgroundColor: colors.primary,
                      borderRadius: 2,
                      marginHorizontal: 1,
                      opacity: isPaused ? 0.2 : 0.8,
                    }}
                  />
                ))}
              </View>
            </Animated.View>
          )}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <TouchableOpacity
              style={[styles.recordingButton, { backgroundColor: isRecording ? colors.error : colors.primary, shadowColor: colors.text, shadowOpacity: 0.15, shadowRadius: 8, elevation: 8 }]}
              onPress={isRecording ? handleStopRecording : handleStartRecording}
            >
              <Ionicons name={isRecording ? "stop" : "mic"} size={44} color={colors.background} />
            </TouchableOpacity>
          </Animated.View>
          {/* Pause/Resume button below recording button */}
          {isRecording && (
            <TouchableOpacity
              style={[styles.pauseBelow, { backgroundColor: isPaused ? colors.warning : colors.surface, borderColor: colors.warning, borderWidth: 1 }]}
              onPress={handlePauseResume}
            >
              <Ionicons name={isPaused ? "play" : "pause"} size={22} color={colors.warning} />
              <Text style={{ color: colors.warning, marginLeft: 6 }}>{isPaused ? 'Resume' : 'Pause'}</Text>
            </TouchableOpacity>
          )}
          <Text style={[styles.recordingTime, { color: colors.text }]}>{formatTime(recordingTime)}</Text>
          <Text style={{ color: colors.text, marginBottom: 8 }}>{isRecording ? (isPaused ? "Paused" : "Recording...") : "Tap to start"}</Text>
          {isRecording && (
            <Text style={[styles.transcription, { color: colors.text }]}>{transcription}</Text>
          )}
        </View>
        <View style={styles.recordingsSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Recordings</Text>
          {recordings.length === 0 ? (
            <Text style={{ color: colors.textSecondary }}>No recordings yet</Text>
          ) : (
            recordings.map((r) => (
              <View key={r.id} style={[styles.recordingItem, { backgroundColor: colors.surface, shadowColor: colors.text, shadowOpacity: 0.08, shadowRadius: 4, elevation: 2 }]}> 
                <View style={styles.recordingInfo}>
                  <Text style={{ color: colors.text, fontWeight: "600", fontSize: 16 }}>{r.title}</Text>
                  <Text style={{ color: colors.textSecondary, fontSize: 12 }}>{r.duration} • {r.date} • {r.size}</Text>
                </View>
                <TouchableOpacity onPress={() => setRecordings(recordings.filter((rec) => rec.id !== r.id))} style={{ padding: 6 }}>
                  <Ionicons name="trash-outline" size={20} color={colors.error} />
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 48,
    paddingHorizontal: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "700",
    textAlign: "center",
    flex: 1,
  },
  recordingSection: { alignItems: "center", marginTop: 30, paddingHorizontal: 20 },
  recordingButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  pauseButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 10,
    marginTop: 2,
  },
  pauseAbove: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginBottom: 12,
  },
  pauseBelow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 22,
    marginTop: 14,
    marginBottom: 10,
  },
  recordingTime: { fontSize: 28, fontWeight: "bold", marginTop: 8 },
  waveform: { marginTop: 18 },
  waveformModern: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 2,
    marginTop: 10,
  },
  transcription: { marginTop: 12, fontStyle: "italic", textAlign: "center" },
  recordingsSection: { marginTop: 36, paddingHorizontal: 18 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 14 },
  recordingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  recordingInfo: { flex: 1, marginRight: 12 },
});

export default RecordingScreen;
