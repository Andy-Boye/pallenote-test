import type { Note } from '@/api/types';
import { useTheme } from '@/contexts/ThemeContext';
import { stripHtmlTags } from '@/utils/htmlUtils';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NoteCardProps {
  note: Note;
  onPress: (noteId: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  onSelect?: (noteId: string, selected: boolean) => void;
  onLongPress?: (noteId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ 
  note, 
  onPress, 
  selectionMode = false, 
  isSelected = false, 
  onSelect,
  onLongPress
}) => {
  const { colors } = useTheme();

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
    <TouchableOpacity
      onPress={handlePress}
      onLongPress={handleLongPress}
      style={[
        styles.noteCard, 
        { backgroundColor: colors.surface },
        selectionMode && isSelected && { borderColor: colors.primary, borderWidth: 2 }
      ]}
    >
             <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
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
           style={{ marginRight: 8 }} 
         />
         <Text 
           style={[styles.noteTitle, { color: colors.text, flex: 1 }]} 
           numberOfLines={1}
         >
           {note.title}
         </Text>
         <TouchableOpacity style={styles.shareButton}>
           <Ionicons 
             name="share-outline" 
             size={18} 
             color={colors.textSecondary} 
           />
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
  );
};

const styles = StyleSheet.create({
  noteCard: {
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  contentContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 4,
  },
  noteContent: {
    fontSize: 14,
    flex: 1,
    marginRight: 8,
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