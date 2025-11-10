import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface BreedOption {
  value: string;
  label: string;
}

interface BreedSelectionModalProps {
  visible: boolean;
  species: string;
  selectedBreed: string;
  breedOptions: BreedOption[];
  customBreed: string;
  onClose: () => void;
  onSelectBreed: (value: string, label: string) => void;
  onCustomBreedChange: (text: string) => void;
  onCustomBreedSubmit: () => void;
}

export const BreedSelectionModal: React.FC<BreedSelectionModalProps> = ({
  visible,
  species,
  selectedBreed,
  breedOptions,
  customBreed,
  onClose,
  onSelectBreed,
  onCustomBreedChange,
  onCustomBreedSubmit,
}) => {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity 
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>
              {species === 'dog' ? '🐕 강아지 품종' : species === 'cat' ? '🐱 고양이 품종' : '품종 선택'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scroll}>
            {breedOptions.map((breed) => (
              <TouchableOpacity
                key={breed.value}
                style={[
                  styles.option,
                  selectedBreed === breed.label && styles.optionSelected,
                ]}
                onPress={() => onSelectBreed(breed.value, breed.label)}>
                <Text
                  style={[
                    styles.optionText,
                    selectedBreed === breed.label && styles.optionTextSelected,
                  ]}>
                  {breed.label}
                </Text>
                {selectedBreed === breed.label && (
                  <Ionicons name="checkmark-circle" size={20} color="#C59172" />
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>

          {/* 직접 입력 영역 */}
          {(species === 'other' || selectedBreed === '') && (
            <View style={styles.customBreedContainer}>
              <TextInput
                style={styles.customBreedInput}
                placeholder="품종을 직접 입력해주세요"
                value={customBreed}
                onChangeText={onCustomBreedChange}
              />
              <TouchableOpacity
                style={[
                  styles.customBreedSubmit,
                  !customBreed.trim() && styles.customBreedSubmitDisabled,
                ]}
                onPress={onCustomBreedSubmit}
                disabled={!customBreed.trim()}>
                <Text style={styles.customBreedSubmitText}>확인</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  container: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scroll: {
    maxHeight: 400,
  },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  optionSelected: {
    backgroundColor: '#FFF5F0',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  optionTextSelected: {
    color: '#C59172',
    fontWeight: '600',
  },
  customBreedContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingTop: 15,
    gap: 10,
  },
  customBreedInput: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  customBreedSubmit: {
    backgroundColor: '#C59172',
    borderRadius: 10,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customBreedSubmitDisabled: {
    backgroundColor: '#CCC',
  },
  customBreedSubmitText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});






