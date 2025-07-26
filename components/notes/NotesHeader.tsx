import { useTheme } from '@/contexts/ThemeContext';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface NotesHeaderProps {
  title?: string;
  subtitle?: string;
}

const NotesHeader: React.FC<NotesHeaderProps> = ({ 
  title = "Notes", 
  subtitle = "Your recent notes and ideas" 
}) => {
  const { colors } = useTheme();

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
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
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
});

export default NotesHeader; 