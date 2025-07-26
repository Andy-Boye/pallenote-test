import { useTheme } from '@/contexts/ThemeContext';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface InsertPanelProps {
  visible: boolean;
  onClose: () => void;
}

const InsertPanel: React.FC<InsertPanelProps> = ({ visible, onClose }) => {
  const { colors } = useTheme();

  const insertOptions = [
    { icon: 'check-square', label: 'Task', IconComponent: Feather },
    { icon: 'calendar', label: 'Calendar', IconComponent: Feather },
    { icon: 'camera', label: 'Camera', IconComponent: Feather },
    { icon: 'table', label: 'Table', IconComponent: MaterialCommunityIcons },
    { icon: 'check-square', label: 'Checkbox', IconComponent: Feather },
    { icon: 'image', label: 'Image', IconComponent: Feather },
    { icon: 'mic', label: 'Audio', IconComponent: Feather },
    { icon: 'calendar', label: 'Current Date', IconComponent: Feather },
    { icon: 'function-variant', label: 'Formula', IconComponent: MaterialCommunityIcons },
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
          <Text style={[styles.title, { color: colors.text }]}>Insert</Text>
          <View style={styles.optionsGrid}>
            {insertOptions.map((option, index) => (
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
    minHeight: 260,
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

export default InsertPanel; 