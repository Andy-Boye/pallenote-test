import type { Note } from '@/api/types';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface NoteCardProps {
  note: Note;
  onPress: (noteId: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ note, onPress }) => {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(note.id)}
      style={[styles.noteCard, { backgroundColor: colors.surface }]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
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
        <Text style={[styles.noteDate, { color: colors.textSecondary }]}>
          {note.date}
        </Text>
      </View>
      <Text 
        style={[styles.noteContent, { color: colors.textSecondary }]} 
        numberOfLines={2}
      >
        {note.content}
      </Text>
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
  noteContent: {
    fontSize: 14,
    marginTop: 4,
  },
  noteDate: {
    fontSize: 12,
    marginLeft: 8,
  },
});

export default NoteCard; 