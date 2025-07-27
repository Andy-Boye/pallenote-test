import { createNotebook } from '@/api/notebooksApi';
import type { Notebook } from '@/api/types';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

interface CreateNotebookModalProps {
  visible: boolean;
  onClose: () => void;
  onNotebookCreated: (notebook: Notebook) => void;
}

const CreateNotebookModal: React.FC<CreateNotebookModalProps> = ({
  visible,
  onClose,
  onNotebookCreated,
}) => {
  const { colors } = useTheme();
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateNotebook = async () => {
    console.log('Create button pressed, title:', title);
    
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a notebook title');
      return;
    }

    if (title.trim().length < 2) {
      Alert.alert('Error', 'Notebook title must be at least 2 characters long');
      return;
    }

    setLoading(true);
    console.log('Creating notebook with title:', title.trim());
    
    try {
      const newNotebook = await createNotebook({
        title: title.trim(),
      });
      
      console.log('Notebook created successfully:', newNotebook);
      onNotebookCreated(newNotebook);
      setTitle('');
      onClose();
    } catch (error) {
      console.error('Error creating notebook:', error);
      Alert.alert('Error', 'Failed to create notebook. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        style={[styles.container, { backgroundColor: colors.background }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            disabled={loading}
          >
            <Ionicons name="close" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Create Notebook
          </Text>
          <TouchableOpacity
            onPress={() => {
              console.log('Create button TouchableOpacity pressed');
              handleCreateNotebook();
            }}
            style={[
              styles.createButton,
              { backgroundColor: loading ? colors.border : '#4E71FF' },
            ]}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Create</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={[styles.label, { color: colors.text }]}>
              Notebook Title
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: colors.surface,
                  color: colors.text,
                  borderColor: colors.border,
                },
              ]}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter notebook title..."
              placeholderTextColor={colors.textSecondary}
              autoFocus
              maxLength={50}
              editable={!loading}
            />
            <Text style={[styles.characterCount, { color: colors.textSecondary }]}>
              {title.length}/50
            </Text>
          </View>

          {/* Preview */}
          <View style={styles.previewContainer}>
            <Text style={[styles.previewLabel, { color: colors.textSecondary }]}>
              Preview
            </Text>
            <View style={[styles.previewCard, { backgroundColor: colors.surface }]}>
              <View style={styles.previewHeader}>
                <Ionicons name="book" size={20} color="#4E71FF" />
                <Text style={[styles.previewTitle, { color: colors.text }]}>
                  {title || 'Notebook Title'}
                </Text>
              </View>
              <View style={[styles.previewStats, { backgroundColor: '#4E71FF' + '15' }]}>
                <Ionicons name="document-text" size={14} color="#4E71FF" />
                <Text style={[styles.previewStatsText, { color: '#4E71FF' }]}>
                  0 notes
                </Text>
              </View>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
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
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  closeButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  createButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  characterCount: {
    fontSize: 12,
    textAlign: 'right',
    marginTop: 4,
  },
  previewContainer: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  previewHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  previewTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    flex: 1,
  },
  previewStats: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  previewStatsText: {
    fontSize: 12,
    fontWeight: '500',
  },
});

export default CreateNotebookModal; 