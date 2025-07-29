"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useTheme } from "@/contexts/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import { yupResolver } from "@hookform/resolvers/yup";
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import * as yup from "yup";
import DarkGradientBackground from '../../components/DarkGradientBackground';

type FormData = {
  email: string;
  username: string;
  profile?: string;
};

const schema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email address")
    .required("Email is required"),
  username: yup
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .required("Username is required"),
  profile: yup
    .string()
    .optional(),
});

const EditProfileScreen = () => {
  const { colors } = useTheme();
  const { user, getAccountProfile, updateAccountProfile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const profile = await getAccountProfile();
      setProfileData(profile);
      
      // Set form values
      setValue("email", profile.email);
      setValue("username", profile.username);
      setValue("profile", profile.profile || "");
    } catch (error) {
      console.error("Error loading profile data:", error);
      Alert.alert("Error", "Failed to load profile data");
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Please grant permission to access your photo library.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setSelectedImage(imageUri);
        setValue("profile", imageUri);
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setValue("profile", "");
  };

  const getProfileImageSource = () => {
    if (selectedImage) {
      return { uri: selectedImage };
    }
    if (profileData?.profile) {
      return { uri: profileData.profile };
    }
    return null;
  };

  const onSubmit = async (data: FormData) => {
    try {
      const updateData: { email?: string; username?: string; profile?: string } = {};
      
      // Only include fields that have changed
      if (data.email !== profileData?.email) {
        updateData.email = data.email;
      }
      if (data.username !== profileData?.username) {
        updateData.username = data.username;
      }
      if (data.profile !== (profileData?.profile || "")) {
        updateData.profile = data.profile || undefined;
      }

      // If no changes, show message
      if (Object.keys(updateData).length === 0) {
        Alert.alert("No Changes", "No changes were made to your profile.");
        return;
      }

      await updateAccountProfile(updateData);
      Alert.alert(
        "Success", 
        "Profile updated successfully.", 
        [
          {
            text: "OK",
            onPress: () => {
              router.back();
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        "Error", 
        error.response?.data?.message || error.message || "Failed to update profile"
      );
    }
  };

  return (
    <DarkGradientBackground>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        {/* Header */}
        <View style={[styles.header, { backgroundColor: colors.surface }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Profile</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView 
          contentContainerStyle={styles.scrollContent} 
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Image */}
          {getProfileImageSource() && (
            <View style={styles.imageContainer}>
              <Image 
                source={getProfileImageSource()!} 
                style={styles.profileImage}
                resizeMode="cover"
              />
            </View>
          )}

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: colors.primary }]} 
              onPress={pickImage}
            >
              <Ionicons name="camera" size={20} color="white" />
              <Text style={styles.buttonText}>Select Image</Text>
            </TouchableOpacity>
            
            {getProfileImageSource() && (
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: '#d32f2f' }]} 
                onPress={removeImage}
              >
                <Ionicons name="trash" size={20} color="white" />
                <Text style={styles.buttonText}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Form Fields */}
          <View style={styles.formContainer}>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: errors.email ? 'red' : '#e0e0e0',
                    },
                  ]}
                  placeholder="Email address"
                  placeholderTextColor={colors.textSecondary}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.email && (
              <Text style={[styles.error, { color: 'red' }]}>
                {errors.email.message}
              </Text>
            )}

            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.card,
                      color: colors.text,
                      borderColor: errors.username ? 'red' : '#e0e0e0',
                    },
                  ]}
                  placeholder="Username"
                  placeholderTextColor={colors.textSecondary}
                  autoCapitalize="none"
                  value={value}
                  onChangeText={onChange}
                />
              )}
            />
            {errors.username && (
              <Text style={[styles.error, { color: 'red' }]}>
                {errors.username.message}
              </Text>
            )}
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton, 
              { backgroundColor: colors.primary },
              isSubmitting && { opacity: 0.7 }
            ]}
            onPress={handleSubmit(onSubmit)}
            disabled={isSubmitting}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? 'Updating...' : 'Update Profile'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </DarkGradientBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 30,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  formContainer: {
    marginBottom: 30,
  },
  input: {
    height: 54,
    borderRadius: 12,
    paddingHorizontal: 18,
    marginBottom: 16,
    fontSize: 15,
    borderWidth: 1.5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  error: {
    fontSize: 12,
    marginBottom: 8,
    marginLeft: 4,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  submitButtonText: {
    fontSize: 16,
    color: "white",
    fontWeight: "600",
  },
});

export default EditProfileScreen;