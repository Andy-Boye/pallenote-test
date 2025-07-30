import type { Note } from '@/api/types';
import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import NoteCard from './NoteCard';

interface NotesListProps {
  notes: Note[];
  onNotePress: (noteId: string) => void;
  onShare?: (note: Note) => void;
  searchText: string;
}

const NotesList: React.FC<NotesListProps> = ({ notes, onNotePress, onShare, searchText }) => {
  const { colors } = useTheme();

  // Filter notes by search text
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchText.toLowerCase()) ||
    note.content.toLowerCase().includes(searchText.toLowerCase())
  );

  const renderNoteCard = ({ item }: { item: Note }) => (
    <NoteCard note={item} onPress={onNotePress} onShare={onShare} />
  );

  const renderEmptyComponent = () => (
    <Text style={{ textAlign: "center", marginTop: 20, color: colors.textSecondary }}>
      No notes available.
    </Text>
  );

  return (
    <>
      {/* Total Notes Row */}
      <View style={styles.statsSimpleRow}>
        <Ionicons name="document-text-outline" size={20} color={colors.primary} style={{ marginRight: 6 }} />
        <Text style={{ color: colors.text, fontWeight: '600' }}>
          Total Notes: {filteredNotes.length}
        </Text>
      </View>
      
      <FlatList
        data={filteredNotes}
        keyExtractor={(item) => item.id}
        renderItem={renderNoteCard}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        contentContainerStyle={{ paddingVertical: 8, paddingHorizontal: 20, paddingBottom: 100 }}
        ListEmptyComponent={renderEmptyComponent}
      />
    </>
  );
};

const styles = StyleSheet.create({
  statsSimpleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 0,
  },
});

export default NotesList; 