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
} from "react-native";
import ScreenBackground from "../../components/ScreenBackground";
import { useTheme } from "@/contexts/ThemeContext";

// Placeholder for actual OTP verification logic
async function verifyOtp(email: string, code: string): Promise<boolean> {
  // TODO: Implement real API call
  await new Promise((res) => setTimeout(res, 800));
  return code === "1234"; // Accept 1234 as demo code
}

const OTP_LENGTH = 4;

const OtpVerificationScreen = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; onSuccessRoute?: string }>();
  const email = params.email || "";
  const onSuccessRoute = params.onSuccessRoute || "/(auth)/login";

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const inputRefs = useRef<(TextInput | null)[]>([]);

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

  // Submit OTP
  const handleSubmit = async () => {
    setError("");
    if (otp.some((d) => d === "")) {
      setError("Please enter all 4 digits.");
      return;
    }
    setSubmitting(true);
    try {
      const code = otp.join("");
      const ok = await verifyOtp(email, code);
      if (ok) {
        // If navigating to reset-password, pass the email as parameter
        if (onSuccessRoute === "/(auth)/reset-password") {
          router.replace({
            pathname: "/(auth)/reset-password" as any,
            params: { email: email }
          });
        } else {
          router.replace(onSuccessRoute as any);
        }
      } else {
        setError("Invalid code. Please try again.");
      }
    } catch (err) {
      setError("Verification failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Resend OTP
  const handleResend = () => {
    setResendTimer(30);
    // TODO: Implement resend logic (API call)
    Alert.alert("Code sent", `A new code was sent to ${email}`);
  };

  // Timer effect
  React.useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  return (
    <ScreenBackground>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={60}
      >
        <View style={styles.container}>
          {/* Back button */}
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={[styles.backButtonText, { color: colors.primary }]}>← Back</Text>
          </TouchableOpacity>
          {/* Emoji at the top */}
          <Text style={styles.emoji}>🔐</Text>
          <Text style={[styles.title, { color: colors.primary }]}>Verify Code</Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Enter the 4-digit code sent to</Text>
          <Text style={[styles.email, { color: colors.text }]}>{email}</Text>

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
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: error ? colors.error : colors.primary,
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

          {error ? <Text style={[styles.error, { color: colors.error }]}>{error}</Text> : null}

          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary, opacity: submitting ? 0.7 : 1 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>{submitting ? "Verifying..." : "Verify"}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.resend, { opacity: resendTimer > 0 ? 0.5 : 1 }]}
            onPress={handleResend}
            disabled={resendTimer > 0}
          >
            <Text style={[styles.resendText, { color: colors.primary }]}>Resend Code{resendTimer > 0 ? ` (${resendTimer}s)` : ""}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emoji: {
    fontSize: 90,
    textAlign: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 15,
    marginBottom: 2,
    textAlign: "center",
  },
  email: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 24,
    textAlign: "center",
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 18,
    gap: 12,
  },
  otpInput: {
    width: 54,
    height: 54,
    borderRadius: 12,
    borderWidth: 2,
    fontSize: 24,
    fontWeight: "bold",
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    color: "#fff",
    fontWeight: "600",
  },
  resend: {
    marginTop: 8,
    marginBottom: 8,
    alignItems: "center",
  },
  resendText: {
    fontSize: 15,
    fontWeight: "500",
  },
  error: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: "center",
  },
  backButton: {
    position: 'absolute',
    top: 60,
    left: 24,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "500",
  },
});

export default OtpVerificationScreen; 