import { Animated } from 'react-native';

export interface PetFormData {
  name: string;
  species: string;
  breed: string;
  age: string;
  weight: string;
  gender: string;
  isNeutered: boolean;
  description: string;
  photoUri: string | undefined;
  hasPhoto: boolean;
  temperaments: string[];
}

export interface BreedOption {
  value: string;
  label: string;
}

export interface TemperamentOption {
  value: string;
  label: string;
}

export interface MyPetScreenState {
  localPetInfo: PetFormData;
  selectedImage: string | null;
  showBreedModal: boolean;
  showTemperamentModal: boolean;
  selectedBreed: string;
  selectedTemperaments: string[];
  showSuccessMessage: boolean;
  showDeleteMessage: boolean;
  hasSuccessfullyAddedPhoto: boolean;
  isAnimating: boolean;
  fadeAnim: Animated.Value;
  scaleAnim: Animated.Value;
  confettiAnim: Animated.Value;
  successMessageAnim: Animated.Value;
  deleteMessageAnim: Animated.Value;
}

export interface AnimationConfig {
  duration: number;
  toValue: number;
  useNativeDriver: boolean;
}
