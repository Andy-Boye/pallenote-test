import type { Note } from '@/api/types';
import { useTheme } from '@/contexts/ThemeContext';
import { stripHtmlTags } from '@/utils/htmlUtils';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import ShareNoteModal from '../ShareNoteModal';

interface NoteCardProps {
  note: Note;
  onPress: (noteId: string) => void;
  onShare?: (note: Note) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (noteId: string, selected: boolean) => void;
  onLongPress?: (noteId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onPress, onShare, 
  selectionMode = false, 
  isSelected = false, 
  onSelect,
  onLongPress
}) => {
  const { colors } = useTheme();
  const [shareModalVisible, setShareModalVisible] = useState(false);

  const handleShare = (e: any) => {
    e.stopPropagation();
    setShareModalVisible(true);
  };

  const closeShareModal = () => {
    setShareModalVisible(false);
  };

  // Clean the content by stripping HTML tags
  const cleanContent = stripHtmlTags(note.content);

  const handlePress = () => {
    if (selectionMode && onSelect) {
      onSelect(note.id, !isSelected);
    } else {
      onPress(note.id);
    }
  };

  const handleLongPress = () => {
    if (!selectionMode && onLongPress) {
      onLongPress(note.id);
    }
  };

  return (
    <>
      <TouchableOpacity
        onPress={handlePress}
        onLongPress={handleLongPress}
        style={[
          styles.noteCard, 
          { backgroundColor: colors.surface },
          selectionMode && isSelected && { borderColor: colors.primary, borderWidth: 2 }
        ]}
      >
        <View style={styles.headerRow}>
          {selectionMode && (
            <View style={[styles.selectionIndicator, { borderColor: colors.primary }]}>
              {isSelected && (
                <Ionicons 
                  name="checkmark" 
                  size={16} 
                  color={colors.primary} 
                />
              )}
            </View>
          )}
          <Ionicons 
            name="document-text-outline" 
            size={20} 
            color={colors.primary} 
            style={styles.noteIcon} 
          />
          <Text 
            style={[styles.noteTitle, { color: colors.text }]} 
            numberOfLines={1}
          >
            {note.title}
          </Text>
          <TouchableOpacity onPress={handleShare} style={styles.shareButton}>
            <Ionicons name="share-outline" size={18} color={colors.primary} />
          </TouchableOpacity>
        </View>
        <View style={styles.contentContainer}>
          <Text 
            style={[styles.noteContent, { color: colors.textSecondary }]} 
            numberOfLines={2}
          >
            {cleanContent}
          </Text>
          <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
            {note.date}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Share Note Modal */}
      <ShareNoteModal
        visible={shareModalVisible}
        onClose={closeShareModal}
        note={note}
      />
    </>
  );
};

const styles = StyleSheet.create({
  noteCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  noteIcon: {
    marginRight: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  noteContent: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
    lineHeight: 20,
  },
  noteDate: {
    fontSize: 12,
  },
  shareButton: {
    padding: 4,
  },
  selectionIndicator: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default NoteCard; 