export interface WalkingRequestData {
  timeSlot: string;
  address: string;
  specialInstructions: string;
  duration: string;
  petId: string;
}

export interface PreviousWalker {
  id: string;
  name: string;
  rating: number;
  reviewCount: number;
  profileImage: string;
  lastWalkDate: string;
  walkCount: number;
}

export interface TimeSlot {
  value: string;
  label: string;
  available: boolean;
}

export interface Duration {
  value: string;
  label: string;
}

export interface WalkingRequestScreenState {
  requestData: WalkingRequestData;
  savedAddresses: string[];
  previousWalkers: PreviousWalker[];
  selectedPreviousWalker: string | null;
  showTimeSlotModal: boolean;
  showDurationModal: boolean;
  showAddressModal: boolean;
  showPreviousWalkerModal: boolean;
  isSubmitting: boolean;
}
