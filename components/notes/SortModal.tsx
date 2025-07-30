import { useTheme } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export type SortOption = 'dateCreated' | 'dateUpdated' | 'title';

interface SortModalProps {
  visible: boolean;
  onClose: () => void;
  onSort: (option: SortOption) => void;
  currentSort: SortOption;
}

const SortModal: React.FC<SortModalProps> = ({
  visible,
  onClose,
  onSort,
  currentSort,
}) => {
  const { colors } = useTheme();

  const sortOptions = [
    { key: 'dateCreated' as SortOption, label: 'Date Created', icon: 'calendar-outline' },
    { key: 'dateUpdated' as SortOption, label: 'Date Updated', icon: 'time-outline' },
    { key: 'title' as SortOption, label: 'Title', icon: 'text-outline' },
  ];

  const handleSort = (option: SortOption) => {
    onSort(option);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableOpacity
        style={styles.overlay}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.modalContainer, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>Sort By</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.optionsContainer}>
            {sortOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.option,
                  currentSort === option.key && { backgroundColor: colors.primary + '20' }
                ]}
                onPress={() => handleSort(option.key)}
              >
                <View style={styles.optionContent}>
                  <Ionicons 
                    name={option.icon as any} 
                    size={20} 
                    color={currentSort === option.key ? colors.primary : colors.textSecondary} 
                  />
                  <Text style={[
                    styles.optionText, 
                    { 
                      color: currentSort === option.key ? colors.primary : colors.text,
                      fontWeight: currentSort === option.key ? '600' : '400'
                    }
                  ]}>
                    {option.label}
                  </Text>
                </View>
                {currentSort === option.key && (
                  <Ionicons name="checkmark" size={20} color={colors.primary} />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '80%',
    maxWidth: 300,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
  },
  closeButton: {
    padding: 4,
  },
  optionsContainer: {
    gap: 8,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  optionText: {
    fontSize: 16,
  },
});

export default SortModal; 