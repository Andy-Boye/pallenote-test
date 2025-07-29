import type { Notebook } from '@/api/types';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Alert, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

interface NotebookActionModalProps {
  visible: boolean;
  onClose: () => void;
  notebook: Notebook | null;
  onRename: (notebookId: string, newTitle: string) => Promise<void>;
  onShare: (notebook: Notebook) => void;
  onDeleteNotebookOnly: (notebookId: string) => Promise<void>;
  onDeleteNotebookAndContents: (notebookId: string) => Promise<void>;
  noteCount?: number;
}

const NotebookActionModal: React.FC<NotebookActionModalProps> = ({
  visible,
  onClose,
  notebook,
  onRename,
  onShare,
  onDeleteNotebookOnly,
  onDeleteNotebookAndContents,
  noteCount = 0,
}) => {
  const { colors } = useTheme();
  const [isRenaming, setIsRenaming] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleRename = async () => {
    if (!notebook || !newTitle.trim()) return;
    
    // Prevent renaming the default notebook
    if (notebook.id === 'default') {
      Alert.alert('Cannot Rename', 'The default notebook cannot be renamed.');
      setIsRenaming(false);
      setNewTitle('');
      return;
    }
    
    try {
      await onRename(notebook.id, newTitle.trim());
      setIsRenaming(false);
      setNewTitle('');
      onClose();
    } catch (error) {
      Alert.alert('Error', 'Failed to rename notebook');
    }
  };

  const handleDeleteNotebookOnly = () => {
    if (!notebook) return;
    
    Alert.alert(
      'Delete Notebook',
      `Are you sure you want to delete "${notebook.title}"? All notes will be moved to "My Notebook".`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDeleteNotebookOnly(notebook.id);
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notebook');
            }
          },
        },
      ]
    );
  };

  const handleDeleteNotebookAndContents = () => {
    if (!notebook) return;
    
    Alert.alert(
      'Delete Notebook and Contents',
      `Are you sure you want to delete "${notebook.title}" and ALL its notes? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete All',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDeleteNotebookAndContents(notebook.id);
              onClose();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete notebook and contents');
            }
          },
        },
      ]
    );
  };

  const handleShare = () => {
    if (!notebook) return;
    onShare(notebook);
    onClose();
  };

  if (!notebook) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={[styles.modal, { backgroundColor: colors.surface }]} pointerEvents="box-none">
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Notebook Actions</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <Text style={[styles.notebookTitle, { color: colors.text }]}>{notebook.title}</Text>
          <Text style={[styles.noteCount, { color: colors.textSecondary }]}>
            {noteCount} {noteCount === 1 ? 'note' : 'notes'}
          </Text>

          {isRenaming ? (
            <View style={styles.renameContainer}>
              <TextInput
                style={[styles.textInput, { 
                  backgroundColor: colors.background,
                  color: colors.text,
                  borderColor: colors.border 
                }]}
                value={newTitle}
                onChangeText={setNewTitle}
                placeholder="Enter new title"
                placeholderTextColor={colors.textSecondary}
                autoFocus
                onSubmitEditing={handleRename}
              />
              <View style={styles.renameButtons}>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    setIsRenaming(false);
                    setNewTitle('');
                  }}
                >
                  <Text style={[styles.buttonText, { color: colors.textSecondary }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.saveButton, { backgroundColor: colors.primary }]}
                  onPress={handleRename}
                >
                  <Text style={[styles.buttonText, { color: '#fff' }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.actionsContainer}>
              <TouchableOpacity
                style={[
                  styles.actionItem, 
                  { borderBottomColor: colors.border },
                  notebook.id === 'default' && { opacity: 0.5 }
                ]}
                onPress={() => {
                  if (notebook.id === 'default') {
                    Alert.alert('Cannot Rename', 'The default notebook cannot be renamed.');
                    return;
                  }
                  setNewTitle(notebook.title);
                  setIsRenaming(true);
                }}
                disabled={notebook.id === 'default'}
              >
                <Ionicons name="create-outline" size={24} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.text }]}>
                  {notebook.id === 'default' ? 'Rename Notebook (Disabled)' : 'Rename Notebook'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionItem, { borderBottomColor: colors.border }]}
                onPress={handleShare}
              >
                <Ionicons name="share-outline" size={24} color={colors.primary} />
                <Text style={[styles.actionText, { color: colors.text }]}>Share Notebook</Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionItem, 
                  { borderBottomColor: colors.border },
                  notebook.id === 'default' && { opacity: 0.5 }
                ]}
                onPress={() => {
                  if (notebook.id === 'default') {
                    Alert.alert('Cannot Delete', 'The default notebook cannot be deleted.');
                    return;
                  }
                  handleDeleteNotebookOnly();
                }}
                disabled={notebook.id === 'default'}
              >
                <Ionicons name="folder-open-outline" size={24} color="#FF9500" />
                <Text style={[styles.actionText, { color: colors.text }]}>
                  {notebook.id === 'default' ? 'Delete Notebook (Disabled)' : 'Delete Notebook (Keep Notes)'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.actionItem,
                  notebook.id === 'default' && { opacity: 0.5 }
                ]}
                onPress={() => {
                  if (notebook.id === 'default') {
                    Alert.alert('Cannot Delete', 'The default notebook cannot be deleted.');
                    return;
                  }
                  handleDeleteNotebookAndContents();
                }}
                disabled={notebook.id === 'default'}
              >
                <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                <Text style={[styles.actionText, { color: '#FF3B30' }]}>
                  {notebook.id === 'default' ? 'Delete Notebook & All Notes (Disabled)' : 'Delete Notebook & All Notes'}
                </Text>
                <Ionicons name="chevron-forward" size={20} color="#FF3B30" />
              </TouchableOpacity>
            </View>
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: '85%',
    borderRadius: 16,
    padding: 20,
    maxHeight: '70%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  notebookTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  noteCount: {
    fontSize: 14,
    marginTop: 8,
    textAlign: 'center',
  },
  renameContainer: {
    gap: 16,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  renameButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  saveButton: {
    // backgroundColor set dynamically
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  actionsContainer: {
    gap: 4,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
  },
});

export default NotebookActionModal; 