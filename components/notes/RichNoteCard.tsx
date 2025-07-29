import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import NoteEditor from './NoteEditor';

interface RichNoteCardProps {
  note: {
    id: string;
    title: string;
    content: string;
    date: string;
    notebookId: string;
  };
  onPress?: () => void;
  onEdit?: (note: any) => void;
  onDelete?: (noteId: string) => void;
  onShare?: (note: any) => void;
}

const RichNoteCard: React.FC<RichNoteCardProps> = ({
  note,
  onPress,
  onEdit,
  onDelete,
  onShare,
}) => {
  const { colors } = useTheme();
  const [isExpanded, setIsExpanded] = useState(false);
  const [editorVisible, setEditorVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingNote, setEditingNote] = useState<{
    id: string;
    title: string;
    content: string;
    notebookId: string;
    notebookTitle: string;
    date: string;
  } | null>(null);

  const handleEdit = () => {
    // Set the editing note data and open the editor modal
    setEditingNote({
      id: note.id,
      title: note.title,
      content: note.content,
      notebookId: note.notebookId,
      notebookTitle: 'My Notebook', // Default value since Note type doesn't have notebookTitle
      date: note.date,
    });
    setEditorVisible(true);
  };

  const closeNoteEditor = () => {
    setEditorVisible(false);
    setEditingNote(null);
  };

  const handleSaveNote = async (noteData: {
    id: string;
    title: string;
    content: string;
    notebookId: string;
    notebookTitle: string;
    date: string;
  }) => {
    setSaving(true);
    try {
      if (onEdit) {
        onEdit({
          ...note,
          title: noteData.title,
          content: noteData.content,
          notebookId: noteData.notebookId,
        });
      }
      closeNoteEditor();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleNotebookChange = async (noteId: string, newNotebookId: string, newNotebookTitle: string) => {
    // This would typically update the note's notebook in the API
    // For now, we'll just call the onEdit callback
    if (onEdit) {
      onEdit({
        ...note,
        notebookId: newNotebookId,
      });
    }
  };

  const handleDelete = () => {
    if (onDelete) {
      onDelete(note.id);
    }
  };

  const handleShare = () => {
    if (onShare) {
      onShare(note);
    }
  };

  return (
    <>
      <TouchableOpacity
        style={[styles.card, { backgroundColor: colors.surface }]}
        onPress={() => setIsExpanded(!isExpanded)}
        activeOpacity={0.8}
      >
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.titleContainer}>
            <Text style={[styles.title, { color: colors.text }]} className="font-[InterMedium]">
              {note.title}
            </Text>
            <Text style={[styles.date, { color: colors.textSecondary }]} className="font-[Inter]">
              {note.date}
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
              <Ionicons name="create-outline" size={18} color={colors.primary} />
            </TouchableOpacity>
            <TouchableOpacity onPress={handleShare} style={styles.actionButton}>
              <Ionicons name="share-outline" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
            <Ionicons 
              name={isExpanded ? "chevron-up" : "chevron-down"} 
              size={20} 
              color={colors.textSecondary} 
            />
          </View>
        </View>

        {/* Content Preview */}
        {!isExpanded && (
          <View style={styles.previewContainer}>
            <Text style={[styles.preview, { color: colors.textSecondary }]} className="font-[Inter]">
              {note.content.length > 100 ? note.content.slice(0, 100) + '...' : note.content}
            </Text>
          </View>
        )}

        {/* Expanded Content */}
        {isExpanded && (
          <View style={styles.expandedContent}>
            <View style={styles.contentContainer}>
              <Text style={[styles.fullContent, { color: colors.text }]} className="font-[Inter]">
                {note.content}
              </Text>
            </View>
            
            {/* Action Buttons */}
            <View style={styles.expandedActions}>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={handleEdit}
              >
                <Ionicons name="create" size={16} color="white" />
                <Text style={styles.actionButtonText}>Edit</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.success }]}
                onPress={handleShare}
              >
                <Ionicons name="share" size={16} color="white" />
                <Text style={styles.actionButtonText}>Share</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.actionButton, { backgroundColor: colors.error }]}
                onPress={handleDelete}
              >
                <Ionicons name="trash" size={16} color="white" />
                <Text style={styles.actionButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </TouchableOpacity>

      {/* Note Editor Modal */}
      <NoteEditor
        visible={editorVisible}
        onClose={closeNoteEditor}
        onSave={handleSaveNote}
        onNotebookChange={handleNotebookChange}
        saving={saving}
        editingNote={editingNote}
      />
    </>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleContainer: {
    flex: 1,
    marginRight: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  actionButton: {
    padding: 6,
  },
  previewContainer: {
    marginTop: 8,
  },
  preview: {
    fontSize: 14,
    lineHeight: 20,
  },
  expandedContent: {
    marginTop: 12,
  },
  contentContainer: {
    maxHeight: 200,
  },
  fullContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  expandedActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
    marginLeft: 4,
  },
});

export default RichNoteCard; 