import { useTheme } from '@/contexts/ThemeContext';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface FormatPanelProps {
  visible: boolean;
  onClose: () => void;
}

const FormatPanel: React.FC<FormatPanelProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();

  const formatOptions = [
    { icon: 'text', label: 'Font', IconComponent: Ionicons },
    { icon: 'type', label: 'Font Type', IconComponent: Feather },
    { icon: 'bold', label: 'Bold', IconComponent: Feather },
    { icon: 'italic', label: 'Italic', IconComponent: Feather },
    { icon: 'underline', label: 'Underline', IconComponent: Feather },
    { icon: 'format-strikethrough-variant', label: 'Strikethrough', IconComponent: MaterialCommunityIcons },
    { icon: 'format-align-left', label: 'Align Left', IconComponent: MaterialCommunityIcons },
    { icon: 'format-align-center', label: 'Align Center', IconComponent: MaterialCommunityIcons },
    { icon: 'format-align-right', label: 'Align Right', IconComponent: MaterialCommunityIcons },
    { icon: 'link', label: 'Link', IconComponent: Feather },
    { icon: 'droplet', label: 'Font Color', IconComponent: Feather },
    { icon: 'type', label: 'Font Size', IconComponent: Feather },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable 
        style={styles.overlay} 
        onPress={onClose}
      >
        <View style={[styles.panel, { backgroundColor: colors.surface }]}>
          <Text style={[styles.title, { color: colors.text }]}>Formatting</Text>
          <View style={styles.optionsGrid}>
            {formatOptions.map((option, index) => (
              <View key={index} style={styles.optionItem}>
                <option.IconComponent 
                  name={option.icon as any} 
                  size={28} 
                  color={colors.primary} 
                />
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  {option.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  panel: {
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 24,
    minHeight: 180,
  },
  title: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 18,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 18,
  },
  optionItem: {
    alignItems: 'center',
    width: 80,
    marginBottom: 18,
  },
  optionLabel: {
    fontSize: 13,
    marginTop: 6,
  },
});

export default FormatPanel; 