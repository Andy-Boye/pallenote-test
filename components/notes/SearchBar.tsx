import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Keyboard, StyleSheet, TextInput, View } from 'react-native';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  value, 
  onChangeText, 
  placeholder = "Search notes..." 
}) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.searchContainer, { backgroundColor: colors.accent }]}>
      <Ionicons name="search-outline" size={20} color={colors.textSecondary} />
      <TextInput
        style={[styles.searchInput, { color: colors.text }]}
        placeholder={placeholder}
        placeholderTextColor={colors.textSecondary}
        value={value}
        onChangeText={onChangeText}
        returnKeyType="search"
        onSubmitEditing={Keyboard.dismiss}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 18,
    marginBottom: 10,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
});

export default SearchBar; 