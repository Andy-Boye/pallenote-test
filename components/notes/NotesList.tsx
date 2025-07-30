import type { Note } from '@/api/types';
import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NoteCard from './NoteCard';
import { SortOption } from './SortModal';

interface NotesListProps {
  notes: Note[];
  onNotePress: (noteId: string) => void;
  onShare?: (note: Note) => void;
  searchText: string;
  sortOption?: SortOption;
  selectionMode?: boolean;
  selectedNotes?: string[];
  onNoteSelect?: (noteId: string, selected: boolean) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  onNoteLongPress?: (noteId: string) => void;
}

const NotesList: React.FC<NotesListProps> = ({ 
  notes, 
  onNotePress, 
  onShare, searchText, 
  sortOption = 'dateCreated',
  selectionMode = false,
  selectedNotes = [],
  onNoteSelect,
  onSelectAll,
  onDeselectAll,
  onNoteLongPress
}) => {
  const { colors } = useTheme();

  // Filter notes by search text
  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchText.toLowerCase()) ||
    note.content.toLowerCase().includes(searchText.toLowerCase())
  );

  // Helper function to parse dates consistently
  const parseDate = (dateString: string): Date => {
    // Handle different date formats
    if (dateString.includes('-')) {
      // Format: YYYY-MM-DD
      return new Date(dateString);
    } else if (dateString.includes('/')) {
      // Format: M/D/YYYY or MM/DD/YYYY
      const parts = dateString.split('/');
      if (parts.length === 3) {
        const month = parseInt(parts[0]) - 1; // Month is 0-indexed
        const day = parseInt(parts[1]);
        const year = parseInt(parts[2]);
        return new Date(year, month, day);
      }
    }
    // Fallback to default parsing
    return new Date(dateString);
  };

  // Sort notes based on sortOption
  const sortedNotes = React.useMemo(() => {
    const sorted = [...filteredNotes];
    switch (sortOption) {
      case 'dateCreated':
        return sorted.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
      case 'dateUpdated':
        return sorted.sort((a, b) => parseDate(b.date).getTime() - parseDate(a.date).getTime());
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      default:
        return sorted;
    }
  }, [filteredNotes, sortOption]);

  const renderNoteCard = ({ item }: { item: Note }) => (
    <NoteCard 
      note={item} 
      onPress={onNotePress} onShare={onShare}
      selectionMode={selectionMode}
      isSelected={selectedNotes.includes(item.id)}
      onSelect={onNoteSelect}
      onLongPress={onNoteLongPress}
    />
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
        <Text style={{ color: colors.text, fontWeight: '600' }}>
          Total Notes: {sortedNotes.length}
        </Text>
        {selectionMode && (
          <View style={styles.selectionControls}>
            <TouchableOpacity 
              style={[styles.selectionButton, { backgroundColor: colors.primary }]} 
              onPress={onSelectAll}
            >
              <Text style={[styles.selectionButtonText, { color: colors.background }]}>
                Select All
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.selectionButton, { backgroundColor: colors.error }]} 
              onPress={onDeselectAll}
            >
              <Text style={[styles.selectionButtonText, { color: colors.background }]}>
                Deselect All
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
      
      <FlatList
        data={sortedNotes}
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 10,
    marginTop: 0,
  },
  selectionControls: {
    flexDirection: 'row',
    gap: 8,
  },
  selectionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  selectionButtonText: {
    fontSize: 12,
    fontWeight: '600',
  },
});

export default NotesList; 