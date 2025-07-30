import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/contexts/ThemeContext';
import { shareNote } from '@/api/notesApi';

const ShareNoteTest: React.FC = () => {
  const { colors } = useTheme();
  const [noteId, setNoteId] = useState('2');
  const [recipientEmail, setRecipientEmail] = useState('kendrickarthur9@gmail.com');
  const [accessType, setAccessType] = useState<'Viewer' | 'Editor'>('Viewer');
  const [isSharing, setIsSharing] = useState(false);

  const handleShareTest = async () => {
    if (!noteId.trim()) {
      Alert.alert('Error', 'Please enter a note ID.');
      return;
    }

    if (!recipientEmail.trim()) {
      Alert.alert('Error', 'Please enter a recipient email.');
      return;
    }

    setIsSharing(true);
    try {
      const shareData = {
        recipientEmail: recipientEmail.trim(),
        accessType,
      };

      console.log('Sharing note with data:', {
        noteId: parseInt(noteId),
        ...shareData,
      });

      const result = await shareNote(parseInt(noteId), shareData);
      
      Alert.alert(
        'Success!',
        `Note shared successfully!\n\nShare URL: ${result.shareUrl}\nShare ID: ${result.shareId}`,
        [
          {
            text: 'Copy URL',
            onPress: () => {
              console.log('Share URL copied:', result.shareUrl);
            },
          },
          {
            text: 'OK',
          },
        ]
      );
    } catch (error) {
      console.error('Error sharing note:', error);
      Alert.alert(
        'Error',
        'Failed to share note. Please check your connection and try again.'
      );
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Note Sharing Test
      </Text>
      
      <Text style={[styles.description, { color: colors.textSecondary }]}>
        Test the note sharing functionality with the provided JSON structure
      </Text>

      {/* Note ID Input */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Note ID</Text>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Enter note ID"
          placeholderTextColor={colors.textSecondary}
          value={noteId}
          onChangeText={setNoteId}
          keyboardType="numeric"
        />
      </View>

      {/* Recipient Email Input */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Recipient Email</Text>
        <TextInput
          style={[
            styles.input,
            { 
              backgroundColor: colors.surface,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder="Enter recipient email"
          placeholderTextColor={colors.textSecondary}
          value={recipientEmail}
          onChangeText={setRecipientEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {/* Access Type Selection */}
      <View style={styles.inputContainer}>
        <Text style={[styles.label, { color: colors.text }]}>Access Type</Text>
        <View style={styles.accessTypeContainer}>
          <TouchableOpacity
            style={[
              styles.accessTypeButton,
              {
                backgroundColor: accessType === 'Viewer' 
                  ? colors.primary + '20' 
                  : colors.surface,
                borderColor: accessType === 'Viewer' 
                  ? colors.primary 
                  : colors.border,
              },
            ]}
            onPress={() => setAccessType('Viewer')}
          >
            <Ionicons 
              name="eye-outline" 
              size={20} 
              color={accessType === 'Viewer' ? colors.primary : colors.textSecondary} 
            />
            <Text style={[
              styles.accessTypeText,
              { color: accessType === 'Viewer' ? colors.primary : colors.text }
            ]}>
              Viewer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.accessTypeButton,
              {
                backgroundColor: accessType === 'Editor' 
                  ? colors.primary + '20' 
                  : colors.surface,
                borderColor: accessType === 'Editor' 
                  ? colors.primary 
                  : colors.border,
              },
            ]}
            onPress={() => setAccessType('Editor')}
          >
            <Ionicons 
              name="create-outline" 
              size={20} 
              color={accessType === 'Editor' ? colors.primary : colors.textSecondary} 
            />
            <Text style={[
              styles.accessTypeText,
              { color: accessType === 'Editor' ? colors.primary : colors.text }
            ]}>
              Editor
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* JSON Preview */}
      <View style={[styles.jsonContainer, { backgroundColor: colors.surface }]}>
        <Text style={[styles.jsonTitle, { color: colors.text }]}>JSON Structure:</Text>
        <Text style={[styles.jsonText, { color: colors.textSecondary }]}>
          {JSON.stringify({
            recipientEmail,
            accessType,
            noteId: parseInt(noteId),
          }, null, 2)}
        </Text>
      </View>

      {/* Share Button */}
      <TouchableOpacity
        style={[
          styles.shareButton,
          { 
            backgroundColor: colors.primary,
            opacity: isSharing ? 0.7 : 1,
          },
        ]}
        onPress={handleShareTest}
        disabled={isSharing}
      >
        <Ionicons name="share-outline" size={20} color="#fff" />
        <Text style={styles.shareButtonText}>
          {isSharing ? 'Sharing...' : 'Test Share Note'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    marginBottom: 24,
    lineHeight: 22,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  accessTypeContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  accessTypeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  accessTypeText: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 8,
  },
  jsonContainer: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  jsonTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  jsonText: {
    fontSize: 14,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
    borderRadius: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ShareNoteTest; 