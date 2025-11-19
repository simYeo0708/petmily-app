import { StyleSheet } from 'react-native';

export const myPetScreenStyles = StyleSheet.create({
  // 컨테이너 스타일
  root: {
    flex: 1,
    backgroundColor: '#FFF5F0',
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // 헤더 스타일
  header: {
    // backgroundColor: '#C59172',
    paddingVertical: 15,
    paddingHorizontal: 20,
    alignItems: 'center',
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 4,
    // elevation: 3,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoIcon: {
    tintColor: '#FFFFFF',
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  
  // 섹션 스타일
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4A4A4A',
    marginBottom: 15,
  },
  
  // 사진 섹션
  photoSection: {
    marginBottom: 20,
  },
  photoWrapper: {
    alignItems: 'center',
    marginBottom: 20,
  },
  photoContainer: {
    position: 'relative',
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  petPhoto: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#E0E0E0',
  },
  successPhoto: {
    borderColor: '#4CAF50',
    borderWidth: 3,
  },
  deleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  photoPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#E8E8E8',  // 연한 회색
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#D0D0D0',
  },
  photoPlaceholderText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 4,
  },
  photoPlaceholderSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    marginTop: 5,
  },
  addPhotoButton: {
    backgroundColor: '#C59172',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addPhotoButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  
  // 메시지 스타일
  successMessage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successMessageText: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    color: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  deleteMessage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  deleteMessageText: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    color: 'white',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confetti: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  confettiText: {
    fontSize: 48,
  },
  
  // 입력 필드 스타일
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  
  // 옵션 컨테이너 스타일
  optionContainer: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    minWidth: 80,
  },
  optionButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    minWidth: 80,
  },
  selectedOption: {
    backgroundColor: '#C59172',
    borderColor: '#C59172',
  },
  optionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  selectedOptionText: {
    color: '#FFFFFF',
  },
  
  // 선택기 버튼 스타일
  selectorButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectorButtonText: {
    fontSize: 16,
    color: '#333',
  },
  selectorArrow: {
    fontSize: 12,
    color: '#666',
  },
  
  // 선택된 성격 표시
  selectedTemperaments: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  temperamentTag: {
    backgroundColor: '#C59172',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  temperamentTagText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  
  // 모달 스타일
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalCloseButton: {
    padding: 5,
  },
  modalCloseButtonText: {
    fontSize: 18,
    color: '#666',
  },
  modalScrollView: {
    maxHeight: 300,
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedModalOption: {
    backgroundColor: '#F8F9FA',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedModalOptionText: {
    color: '#C59172',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#C59172',
    fontWeight: 'bold',
  },
  
  // 사진 버튼 스타일
  photoButton: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  
  // 누락된 스타일들 추가
  successMessageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  successMessageBox: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  inputField: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputFieldWithButton: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  speciesContainer: {
    flexDirection: 'row',
    justifyContent:'space-around',
    flexWrap: 'wrap',
    gap: 10,
  },
  speciesButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
    minWidth: 80,
  },
  speciesButtonSelected: {
    backgroundColor: '#C59172',
    borderColor: '#C59172',
  },
  speciesIcon: {
    marginBottom: 6,
  },
  speciesLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  speciesLabelSelected: {
    color: '#FFFFFF',
  },
  speciesLabelUnselected: {
    color: '#666',
  },
  breedSelectButton: {
    backgroundColor: '#C59172',
    borderWidth: 0,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    shadowColor: '#C59172',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
    marginLeft: 10,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  breedSelectButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  genderContainer: {
    flexDirection: 'row',
    gap: 15,
  },
  genderButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
    alignItems: 'center',
  },
  genderButtonSelected: {
    backgroundColor: '#C59172',
    borderColor: '#C59172',
  },
  genderIcon: {
    marginBottom: 6,
  },
  genderLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  genderLabelSelected: {
    color: '#FFFFFF',
  },
  genderLabelUnselected: {
    color: '#666',
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  temperamentContainer: {
    marginBottom: 20,
  },
  temperamentGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  temperamentButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#F8F9FA',
  },
  temperamentButtonSelected: {
    backgroundColor: '#C59172',
    borderColor: '#C59172',
  },
  temperamentButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  temperamentButtonTextSelected: {
    color: '#FFFFFF',
  },
  textArea: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    height: 80,
    textAlignVertical: 'top',
  },
  saveButtonContainer: {
    marginTop: 30,
    paddingHorizontal: 20,
  },
  saveButton: {
    backgroundColor: '#C59172',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  // 추가 누락된 스타일들
  breedList: {
    maxHeight: 200,
  },
  breedItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  breedItemText: {
    fontSize: 16,
    color: '#333',
  },
  photoButtonSuccess: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  photoImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  photoDeleteButton: {
    position: 'absolute',
    top: -5,
    right: -5,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoDeleteText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  photoPlaceholderIcon: {
    fontSize: 32,
    marginBottom: 5,
  },
  deleteMessageContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  deleteMessageBox: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 20,
  },
});

// 모달 스타일
export const modalStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    maxHeight: '80%',
    width: '90%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
  },
  content: {
    maxHeight: 300,
  },
  option: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectedOption: {
    backgroundColor: '#F8F9FA',
  },
  optionText: {
    fontSize: 16,
    color: '#333',
  },
  selectedOptionText: {
    color: '#C59172',
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 16,
    color: '#C59172',
    fontWeight: 'bold',
  },
  modalBox: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalBody: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
    lineHeight: 20,
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceBtn: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryBtn: {
    backgroundColor: '#C59172',
  },
  primaryBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryBtn: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  secondaryBtnText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  deleteMessageBox: {
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    alignItems: 'center',
  },
  deleteMessageText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  breedList: {
    maxHeight: 200,
  },
  breedItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  breedItemText: {
    fontSize: 16,
    color: '#333',
  },
});

// Default export for the main styles
export default myPetScreenStyles;