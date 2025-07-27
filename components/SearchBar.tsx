import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onClear?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = "Search...",
  onClear
}) => {
  const { colors } = useTheme();

  return (
    <View style={styles.searchContainer}>
      <View style={[styles.searchBar, { backgroundColor: colors.surface }]}>
        <Ionicons name="search" size={20} color={colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={[styles.searchInput, { color: colors.text }]}
          placeholder={placeholder}
          placeholderTextColor={colors.textSecondary}
          value={value}
          onChangeText={onChangeText}
        />
        {value.length > 0 && onClear && (
          <TouchableOpacity onPress={onClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  clearButton: {
    marginLeft: 8,
  },
});

export default SearchBar; 