import { View, ScrollView } from 'react-native';

export interface PetInfo {
  name: string;
  breed: string;
  age: string;
  weight: string;
}

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'screen' | 'feature' | 'service';
  action: () => void;
}

export interface GuideStep {
  id: string;
  title: string;
  description: string;
  nextButtonText: string;
}

export interface HomeScreenState {
  serviceMode: 'PW' | 'PM';
  searchQuery: string;
  showWalkerModal: boolean;
  searchResults: SearchResult[];
  showSearchResults: boolean;
  showServiceGuide: boolean;
  hasPetInfo: boolean | null;
  isFirstTime: boolean | null;
  currentGuideStep: number;
  showGuideOverlay: boolean;
  showStepModal: boolean;
}

export interface HomeScreenRefs {
  petWalkerButtonRef: React.RefObject<View | null>;
  petMallButtonRef: React.RefObject<View | null>;
  walkBookingButtonRef: React.RefObject<View | null>;
  shopButtonRef: React.RefObject<View | null>;
  scrollViewRef: React.RefObject<ScrollView | null>;
}
