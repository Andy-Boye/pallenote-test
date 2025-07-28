import React, { useRef, useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  StatusBar,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import ScreenBackground from "../../components/ScreenBackground";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";

const OTP_LENGTH = 4;

const OtpVerificationScreen = () => {
  const { colors } = useTheme();
  const { verifyOtp, resendOtp } = useAuth();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; onSuccessRoute?: string }>();
  const email = params.email || "";
  const onSuccessRoute = params.onSuccessRoute || "/(auth)/login";

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  // Handle OTP input change
  const handleChange = (text: string, idx: number) => {
    if (!/^[0-9]*$/.test(text)) return;
    const chars = text.split("");
    let newOtp = [...otp];
    if (chars.length === OTP_LENGTH) {
      // Handle paste
      newOtp = chars.slice(0, OTP_LENGTH);
      setOtp(newOtp);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      return;
    }
    newOtp[idx] = text.slice(-1);
    setOtp(newOtp);
    if (text && idx < OTP_LENGTH - 1) {
      inputRefs.current[idx + 1]?.focus();
    }
    if (!text && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyPress = (e: any, idx: number) => {
    if (e.nativeEvent.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs.current[idx - 1]?.focus();
    }
  };

  // Shake animation for error
  const shakeInputs = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Submit OTP
  const handleSubmit = async () => {
    setError("");
    if (otp.some((d) => d === "")) {
      setError("Please enter all 4 digits.");
      shakeInputs();
      return;
    }
    setSubmitting(true);
    try {
      const code = otp.join("");
      await verifyOtp(email, code);
      // If navigating to reset-password, pass the email as parameter
      if (onSuccessRoute === "/(auth)/reset-password") {
        router.replace({
          pathname: "/(auth)/reset-password" as any,
          params: { email: email }
        });
      } else {
        router.replace(onSuccessRoute as any);
      }
    } catch (err) {
      setError("Invalid code. Please try again.");
      shakeInputs();
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP
  const handleResend = async () => {
    try {
      await resendOtp(email);
      setResendTimer(30);
      Alert.alert("Code sent", `A new code was sent to ${email}`);
    } catch (err) {
      Alert.alert("Error", "Failed to resend code. Please try again.");
    }
  };

  // Timer effect
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  return (
    <>
      <ScreenBackground />
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={60}
      >
        <View style={styles.container}>
          {/* Enhanced Back button */}
          <TouchableOpacity
            style={[styles.backButton, { backgroundColor: colors.card }]}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={colors.text} />
          </TouchableOpacity>

          {/* Enhanced Header */}
          <View style={styles.header}>
            <View style={[styles.iconContainer, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="shield-checkmark" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.text }]}>Verify Code</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Enter the 4-digit code sent to
            </Text>
            <Text style={[styles.email, { color: colors.primary }]}>{email}</Text>
          </View>

          {/* Enhanced OTP Input */}
          <Animated.View 
            style={[
              styles.otpContainer,
              { transform: [{ translateX: shakeAnimation }] }
            ]}
          >
            <Text style={[styles.otpLabel, { color: colors.textSecondary }]}>
              Enter Code
            </Text>
            <View style={styles.otpRow}>
              {otp.map((digit, idx) => (
                <TextInput
                  key={idx}
                  ref={(ref) => {
                    inputRefs.current[idx] = ref;
                  }}
                  style={[
                    styles.otpInput,
                    {
                      backgroundColor: colors.surface,
                      color: colors.text,
                      borderColor: error ? colors.error : digit ? colors.primary : colors.border,
                      borderWidth: digit ? 2 : 1,
                    },
                  ]}
                  value={digit}
                  onChangeText={text => handleChange(text, idx)}
                  onKeyPress={e => handleKeyPress(e, idx)}
                  keyboardType="number-pad"
                  maxLength={1}
                  textAlign="center"
                  autoFocus={idx === 0}
                  returnKeyType="done"
                  importantForAutofill="yes"
                  accessible
                  accessibilityLabel={`OTP digit ${idx + 1}`}
                />
              ))}
            </View>
          </Animated.View>

          {/* Error Message */}
          {error ? (
            <View style={[styles.errorContainer, { backgroundColor: colors.error + '15' }]}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={[styles.error, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          {/* Enhanced Submit Button */}
          <TouchableOpacity
            style={[
              styles.button, 
              { 
                backgroundColor: colors.primary, 
                opacity: submitting ? 0.7 : 1,
                shadowColor: colors.primary,
              }
            ]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.buttonText}>Verifying...</Text>
              </View>
            ) : (
              <View style={styles.buttonContent}>
                <Text style={styles.buttonText}>Verify Code</Text>
                <Ionicons name="arrow-forward" size={20} color="white" />
              </View>
            )}
          </TouchableOpacity>

          {/* Enhanced Resend Section */}
          <View style={styles.resendContainer}>
            <Text style={[styles.resendLabel, { color: colors.textSecondary }]}>
              Didn't receive the code?
            </Text>
            <TouchableOpacity
              style={[
                styles.resendButton, 
                { 
                  opacity: resendTimer > 0 ? 0.5 : 1,
                  backgroundColor: resendTimer > 0 ? colors.border : colors.primary + '15',
                }
              ]}
              onPress={handleResend}
              disabled={resendTimer > 0}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="refresh" 
                size={16} 
                color={resendTimer > 0 ? colors.textSecondary : colors.primary} 
              />
              <Text style={[
                styles.resendText, 
                { color: resendTimer > 0 ? colors.textSecondary : colors.primary }
              ]}>
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend Code"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 4,
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  otpContainer: {
    width: '100%',
    marginBottom: 24,
  },
  otpLabel: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 12,
    textAlign: "center",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  otpInput: {
    width: 60,
    height: 60,
    borderRadius: 16,
    fontSize: 24,
    fontWeight: "bold",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 20,
    gap: 8,
  },
  error: {
    fontSize: 14,
    fontWeight: "500",
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  resendContainer: {
    alignItems: "center",
    gap: 12,
  },
  resendLabel: {
    fontSize: 14,
    textAlign: "center",
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 20,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "500",
  },
});

export default OtpVerificationScreen; 