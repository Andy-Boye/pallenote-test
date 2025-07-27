import { useTheme } from '@/contexts/ThemeContext';
import { Feather, Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface FormatPanelProps {
  visible: boolean;
  onClose: () => void;
  onFormatAction: (action: string) => void;
}


const FormatPanel: React.FC<FormatPanelProps> = ({ visible, onClose, onFormatAction }) => {
  const { colors } = useTheme();

  const formatOptions = [
    { icon: 'text', label: 'Font Family', IconComponent: Ionicons, action: 'fontFamily' },
    { icon: 'type', label: 'Font Size', IconComponent: Feather, action: 'fontSize' },
    { icon: 'droplet', label: 'Font Color', IconComponent: Feather, action: 'foreColor' },
    { icon: 'format-subscript', label: 'Subscript', IconComponent: MaterialCommunityIcons, action: 'subscript' },
    { icon: 'format-superscript', label: 'Superscript', IconComponent: MaterialCommunityIcons, action: 'superscript' },
    { icon: 'bold', label: 'Bold', IconComponent: Feather, action: 'bold' },
    { icon: 'italic', label: 'Italic', IconComponent: Feather, action: 'italic' },
    { icon: 'underline', label: 'Underline', IconComponent: Feather, action: 'underline' },
    { icon: 'format-strikethrough-variant', label: 'Strikethrough', IconComponent: MaterialCommunityIcons, action: 'strikethrough' },
    { icon: 'format-align-left', label: 'Align Left', IconComponent: MaterialCommunityIcons, action: 'alignLeft' },
    { icon: 'format-align-center', label: 'Align Center', IconComponent: MaterialCommunityIcons, action: 'alignCenter' },
    { icon: 'format-align-right', label: 'Align Right', IconComponent: MaterialCommunityIcons, action: 'alignRight' },
    { icon: 'link', label: 'Link', IconComponent: Feather, action: 'link' },
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
        <View style={[styles.panel, { backgroundColor: colors.surface }]}
          pointerEvents="box-none"
        >
          <Text style={[styles.title, { color: colors.text }]}>Formatting</Text>
          <View style={styles.optionsGrid}>
            {formatOptions.map((option, index) => (
              <Pressable
                key={index}
                style={styles.optionItem}
                onPress={() => onFormatAction(option.action)}
              >
                <option.IconComponent 
                  name={option.icon as any} 
                  size={28} 
                  color={colors.primary} 
                />
                <Text style={[styles.optionLabel, { color: colors.text }]}>
                  {option.label}
                </Text>
              </Pressable>
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