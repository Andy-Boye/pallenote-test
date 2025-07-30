import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import SortModal, { SortOption } from './SortModal';

interface NotesHeaderProps {
  title?: string;
  subtitle?: string;
  onSort?: (option: SortOption) => void;
  currentSort?: SortOption;
  selectionMode?: boolean;
  selectedCount?: number;
  onToggleSelectionMode?: () => void;
  onDeleteSelected?: () => void;
}

const NotesHeader: React.FC<NotesHeaderProps> = ({ 
  title = "Notes", 
  subtitle = "Your recent notes and ideas",
  onSort,
  currentSort = 'dateCreated',
  selectionMode = false,
  selectedCount = 0,
  onToggleSelectionMode,
  onDeleteSelected
}) => {
  const { colors } = useTheme();
  const [sortModalVisible, setSortModalVisible] = React.useState(false);

  const handleSortPress = () => {
    setSortModalVisible(true);
  };

  const handleSort = (option: SortOption) => {
    onSort?.(option);
  };

  return (
    <View style={[styles.header, { backgroundColor: colors.background }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.headerTitle, { color: colors.text, textAlign: 'left' }]}>
          {title}
        </Text>
        <Text style={[styles.headerSubtitle, { color: colors.textSecondary, textAlign: 'left' }]}>
          {subtitle}
        </Text>
      </View>
      
             <View style={styles.headerButtons}>
         {selectionMode ? (
           <>
             <TouchableOpacity 
               style={styles.selectionButton} 
               onPress={onToggleSelectionMode}
             >
               <Ionicons name="close" size={24} color={colors.error} />
             </TouchableOpacity>
             {selectedCount > 0 && (
               <TouchableOpacity 
                 style={[styles.deleteButton, { backgroundColor: colors.error }]} 
                 onPress={onDeleteSelected}
               >
                 <Ionicons name="trash-outline" size={20} color={colors.background} />
                 <Text style={[styles.deleteButtonText, { color: colors.background }]}>
                   Delete ({selectedCount})
                 </Text>
               </TouchableOpacity>
             )}
           </>
         ) : (
           <>
             {onSort && (
               <TouchableOpacity 
                 style={styles.sortButton} 
                 onPress={handleSortPress}
               >
                 <Ionicons name="funnel-outline" size={24} color={colors.primary} />
               </TouchableOpacity>
             )}
           </>
         )}
       </View>

      <SortModal
        visible={sortModalVisible}
        onClose={() => setSortModalVisible(false)}
        onSort={handleSort}
        currentSort={currentSort}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 10,
    backgroundColor: "transparent",
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: 'left',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
    marginBottom: 2,
    textAlign: 'left',
  },
  sortButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectionButton: {
    padding: 8,
    borderRadius: 8,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 4,
  },
  deleteButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default NotesHeader; 