import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Pressable,
  Modal,
  SafeAreaView,
  TextInput,
  ScrollView,
} from 'react-native';
import RichTextEditor from '@/components/RichTextEditor';
import EditorToolbar from './EditorToolbar';

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
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(note.title);
  const [editedContent, setEditedContent] = useState(note.content);
  const [formatState, setFormatState] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikethrough: false,
    alignment: 'left' as 'left' | 'center' | 'right',
  });

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    if (onEdit) {
      onEdit({
        ...note,
        title: editedTitle,
        content: editedContent,
      });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedTitle(note.title);
    setEditedContent(note.content);
    setIsEditing(false);
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

  // Formatting functions
  const toggleBold = () => {
    setFormatState(prev => ({ ...prev, bold: !prev.bold }));
  };

  const toggleItalic = () => {
    setFormatState(prev => ({ ...prev, italic: !prev.italic }));
  };

  const toggleUnderline = () => {
    setFormatState(prev => ({ ...prev, underline: !prev.underline }));
  };

  const toggleStrikethrough = () => {
    setFormatState(prev => ({ ...prev, strikethrough: !prev.strikethrough }));
  };

  const setAlignmentLeft = () => {
    setFormatState(prev => ({ ...prev, alignment: 'left' }));
  };

  const setAlignmentCenter = () => {
    setFormatState(prev => ({ ...prev, alignment: 'center' }));
  };

  const setAlignmentRight = () => {
    setFormatState(prev => ({ ...prev, alignment: 'right' }));
  };

  if (isEditing) {
    return (
      <Modal
        visible={isEditing}
        animationType="slide"
        transparent={false}
        onRequestClose={handleCancel}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: colors.background }}>
          {/* Top Bar */}
          <View style={[styles.topBar, { borderBottomColor: colors.border }]}>
            <TouchableOpacity onPress={handleCancel} hitSlop={10} style={styles.topBarButton}>
              <Ionicons name="arrow-back" size={26} color={colors.text} />
            </TouchableOpacity>
            
            <View style={styles.topBarActions}>
              <TouchableOpacity hitSlop={10} style={styles.topBarButton}>
                <MaterialCommunityIcons name="undo-variant" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity hitSlop={10} style={styles.topBarButton}>
                <MaterialCommunityIcons name="redo-variant" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} hitSlop={10} style={styles.topBarButton}>
                <Feather name="share" size={22} color={colors.textSecondary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSave} hitSlop={10} style={styles.topBarButton}>
                <Ionicons name="checkmark" size={24} color={colors.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleDelete} hitSlop={10} style={styles.topBarButton}>
                <Ionicons name="trash-outline" size={22} color={colors.error} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Title Input */}
          <TextInput
            style={[styles.titleInput, { color: colors.text }]}
            placeholder="Title"
            placeholderTextColor={colors.textSecondary}
            maxLength={80}
            value={editedTitle}
            onChangeText={setEditedTitle}
          />

          {/* Content Input */}
          <View style={styles.contentContainer}>
            <RichTextEditor
              value={editedContent}
              onValueChange={setEditedContent}
              minHeight={120}
              placeholder="Start writing..."
              placeholderTextColor={colors.textSecondary}
              style={{ color: colors.text }}
            />
          </View>

          {/* Editor Toolbar */}
          <View style={styles.toolbarContainer}>
            <EditorToolbar
              formatState={formatState}
              onToggleBold={toggleBold}
              onToggleItalic={toggleItalic}
              onToggleUnderline={toggleUnderline}
              onToggleStrikethrough={toggleStrikethrough}
              onSetAlignmentLeft={setAlignmentLeft}
              onSetAlignmentCenter={setAlignmentCenter}
              onSetAlignmentRight={setAlignmentRight}
              onShowInsertPanel={() => {}}
              onShowFormatPanel={() => {}}
              editorFocused={true}
            />
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

  return (
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
          <ScrollView style={styles.contentScroll} showsVerticalScrollIndicator={false}>
            <Text style={[styles.fullContent, { color: colors.text }]} className="font-[Inter]">
              {note.content}
            </Text>
          </ScrollView>
          
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
  contentScroll: {
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
  // Modal styles
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  topBarActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  topBarButton: {
    padding: 6,
  },
  titleInput: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 18,
    marginHorizontal: 20,
    marginBottom: 4,
    paddingVertical: 0,
    borderBottomWidth: 0,
  },
  contentContainer: {
    marginHorizontal: 20,
    marginBottom: 8,
    minHeight: 120,
    flex: 1,
  },
  toolbarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 20,
    paddingBottom: 10,
    zIndex: 10,
  },
});

export default RichNoteCard; 