import { useTheme } from '@/contexts/ThemeContext';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

interface FormatState {
  bold: boolean;
  italic: boolean;
  underline: boolean;
  strikethrough: boolean;
  alignment: 'left' | 'center' | 'right';
}

interface EditorToolbarProps {
  formatState: FormatState;
  onToggleBold: () => void;
  onToggleItalic: () => void;
  onToggleUnderline: () => void;
  onToggleStrikethrough: () => void;
  onSetAlignmentLeft: () => void;
  onSetAlignmentCenter: () => void;
  onSetAlignmentRight: () => void;
  onShowInsertPanel: () => void;
  onShowFormatPanel: () => void;
  editorFocused: boolean;
}

const EditorToolbar: React.FC<EditorToolbarProps> = ({
  formatState,
  onToggleBold,
  onToggleItalic,
  onToggleUnderline,
  onToggleStrikethrough,
  onSetAlignmentLeft,
  onSetAlignmentCenter,
  onSetAlignmentRight,
  onShowInsertPanel,
  onShowFormatPanel,
  editorFocused,
}) => {
  const { colors } = useTheme();

  return (
    <View
      style={[
        styles.toolbar,
        {
          borderColor: colors.border,
          backgroundColor: colors.surface,
        },
      ]}
    >
      {/* Insertion Toolbar (left, horizontal scroll) */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.insertToolbar}
      >
        <Pressable onPress={onShowInsertPanel} style={styles.toolbarButton}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </Pressable>
        <Pressable style={styles.toolbarButton}>
          <Feather name="check-square" size={20} color={colors.text} />
        </Pressable>
        <Pressable style={styles.toolbarButton}>
          <Feather name="calendar" size={20} color={colors.text} />
        </Pressable>
        <Pressable style={styles.toolbarButton}>
          <Feather name="camera" size={20} color={colors.text} />
        </Pressable>
        <Pressable style={styles.toolbarButton}>
          <Feather name="image" size={20} color={colors.text} />
        </Pressable>
        <Pressable style={styles.toolbarButton}>
          <Feather name="mic" size={20} color={colors.text} />
        </Pressable>
      </ScrollView>

      {/* Vertical Divider */}
      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      {/* Formatting Toolbar (right, horizontal scroll) */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false} 
        contentContainerStyle={styles.formatToolbar}
      >
        <Pressable onPress={onShowFormatPanel} style={[styles.toolbarButton, styles.formatButton]}>
          <Ionicons name="text" size={22} color={colors.text} />
          <View style={{ width: 8 }} />
          <Ionicons name="chevron-down" size={14} color={colors.textSecondary} style={{ marginTop: 2 }} />
        </Pressable>

        <Pressable onPress={onToggleBold} style={styles.toolbarButton}>
          <Feather name="bold" size={20} color={formatState.bold ? colors.primary : colors.text} />
        </Pressable>

        <Pressable onPress={onToggleItalic} style={styles.toolbarButton}>
          <Feather name="italic" size={20} color={formatState.italic ? colors.primary : colors.text} />
        </Pressable>

        <Pressable onPress={onToggleUnderline} style={styles.toolbarButton}>
          <Feather name="underline" size={20} color={formatState.underline ? colors.primary : colors.text} />
        </Pressable>

        <Pressable onPress={onToggleStrikethrough} style={styles.toolbarButton}>
          <MaterialCommunityIcons 
            name="format-strikethrough-variant" 
            size={20} 
            color={formatState.strikethrough ? colors.primary : colors.text} 
          />
        </Pressable>

        <Pressable onPress={onSetAlignmentLeft} style={styles.toolbarButton}>
          <MaterialCommunityIcons 
            name="format-align-left" 
            size={20} 
            color={formatState.alignment === 'left' ? colors.primary : colors.text} 
          />
        </Pressable>

        <Pressable onPress={onSetAlignmentCenter} style={styles.toolbarButton}>
          <MaterialCommunityIcons 
            name="format-align-center" 
            size={20} 
            color={formatState.alignment === 'center' ? colors.primary : colors.text} 
          />
        </Pressable>

        <Pressable onPress={onSetAlignmentRight} style={styles.toolbarButton}>
          <MaterialCommunityIcons 
            name="format-align-right" 
            size={20} 
            color={formatState.alignment === 'right' ? colors.primary : colors.text} 
          />
        </Pressable>

        <Pressable style={styles.toolbarButton}>
          <Feather name="link" size={20} color={colors.text} />
        </Pressable>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  toolbar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    minHeight: 48,
    zIndex: 20,
    paddingVertical: 4,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  insertToolbar: {
    alignItems: 'center',
    paddingLeft: 10,
    paddingRight: 4,
  },
  formatToolbar: {
    alignItems: 'center',
    paddingLeft: 4,
    paddingRight: 10,
  },
  toolbarButton: {
    marginRight: 10,
    padding: 4,
  },
  formatButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: 32,
    opacity: 0.4,
    marginHorizontal: 6,
  },
});

export default EditorToolbar; 