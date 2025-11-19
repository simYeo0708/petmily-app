# 여러 반려동물 관리 기능

MyPet 화면에서 여러 반려동물을 등록하고 관리할 수 있습니다.

## 🐾 구현된 기능

### 1. **PetContext 업데이트**
- `allPets`: 모든 반려동물 목록
- `petInfo`: 현재 선택된 반려동물
- `selectPet(petId)`: 반려동물 선택
- `deletePet(petId)`: 반려동물 삭제

### 2. **데이터 저장**
- `AsyncStorage`에 `allPets` 배열로 저장
- `selectedPetId`로 현재 선택된 펫 추적
- 서버 동기화 지원

### 3. **PetService**
- `deletePet(petId)`: 서버에서 반려동물 삭제

## 📱 MyPet 화면 수정 방법

### 상단에 반려동물 선택 UI 추가:

```typescript
import { usePet } from '../contexts/PetContext';

const MyPetScreen = () => {
  const { petInfo, allPets, selectPet, deletePet } = usePet();
  const [showPetSelector, setShowPetSelector] = useState(false);

  // 반려동물 선택 드롭다운
  const renderPetSelector = () => (
    <View style={styles.petSelectorContainer}>
      <TouchableOpacity 
        style={styles.petSelectorButton}
        onPress={() => setShowPetSelector(!showPetSelector)}
      >
        <Text style={styles.selectedPetName}>
          {petInfo?.name || '반려동물 선택'}
        </Text>
        <Ionicons name="chevron-down" size={20} color="#666" />
      </TouchableOpacity>

      {showPetSelector && (
        <View style={styles.petDropdown}>
          {allPets.map((pet) => (
            <TouchableOpacity
              key={pet.id}
              style={styles.petDropdownItem}
              onPress={() => {
                selectPet(pet.id!);
                setShowPetSelector(false);
              }}
            >
              <Text style={styles.petDropdownName}>{pet.name}</Text>
              {pet.id === petInfo?.id && (
                <Ionicons name="checkmark" size={20} color="#C59172" />
              )}
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.addPetButton}
            onPress={() => {
              // 새 반려동물 등록 로직
              setShowPetSelector(false);
            }}
          >
            <Ionicons name="add" size={20} color="#C59172" />
            <Text style={styles.addPetText}>새 반려동물 추가</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView>
      {renderPetSelector()}
      {/* 기존 UI */}
    </SafeAreaView>
  );
};
```

### 스타일:

```typescript
petSelectorContainer: {
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#e9ecef',
},
petSelectorButton: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 12,
  backgroundColor: '#f8f9fa',
  borderRadius: 8,
},
selectedPetName: {
  fontSize: 16,
  fontWeight: '600',
  color: '#333',
},
petDropdown: {
  marginTop: 8,
  backgroundColor: 'white',
  borderRadius: 8,
  borderWidth: 1,
  borderColor: '#e9ecef',
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
petDropdownItem: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 16,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},
petDropdownName: {
  fontSize: 15,
  color: '#333',
},
addPetButton: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 16,
  gap: 8,
},
addPetText: {
  fontSize: 15,
  color: '#C59172',
  fontWeight: '600',
},
```

## 🔧 사용 예시

### 반려동물 선택:
```typescript
selectPet(2); // ID가 2인 반려동물 선택
```

### 반려동물 삭제:
```typescript
await deletePet(3); // ID가 3인 반려동물 삭제
```

### 새 반려동물 추가:
```typescript
const newPet = {
  name: '뭉치',
  species: 'dog',
  breed: '시바견',
  age: '2',
  weight: '10',
  gender: 'male',
  isNeutered: true,
  description: '활발한 성격',
};

await updatePetInfo(newPet); // ID 없이 전달하면 새로 생성
```

## ✅ 완료된 작업

- [x] PetContext에 `allPets` 배열 추가
- [x] 반려동물 선택 기능 (`selectPet`)
- [x] 반려동물 삭제 기능 (`deletePet`)
- [x] PetService에 `deletePet` API 추가
- [x] AsyncStorage에 여러 반려동물 저장
- [x] MyPet 화면에 선택 UI 추가 ✅
- [x] 새 반려동물 추가 버튼 구현 ✅
- [x] 삭제 확인 다이얼로그 추가 ✅
- [x] 여러 반려동물 간 전환 UI/UX 개선 ✅

## 🎯 사용 방법

### 반려동물 선택
1. MyPet 화면 상단의 선택 버튼 클릭
2. 드롭다운에서 원하는 반려동물 선택
3. 선택된 반려동물 정보가 화면에 표시됨

### 새 반려동물 추가
1. 드롭다운에서 "새 반려동물 추가" 클릭
2. 폼이 초기화되고 새 반려동물 정보 입력
3. "정보 저장" 버튼으로 등록

### 반려동물 삭제
1. 드롭다운에서 삭제할 반려동물을 **길게 누르기**
2. 삭제 확인 다이얼로그에서 "삭제" 선택
3. 삭제된 반려동물은 목록에서 제거됨

