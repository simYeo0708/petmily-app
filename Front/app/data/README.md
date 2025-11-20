# 📦 샘플 데이터 관리 폴더

이 폴더는 Petmily 앱에서 사용되는 모든 샘플 데이터를 중앙에서 관리합니다.

## 📁 파일 구조

```
/app/data/
├── index.ts              # 중앙 export 파일 (모든 데이터를 여기서 import)
├── products.ts           # 상품 샘플 데이터
├── walkers.ts            # 워커 샘플 데이터
├── walkingRequests.ts    # 산책 요청 샘플 데이터
├── advertisements.ts     # 광고 배너 샘플 데이터
└── README.md            # 이 파일
```

## 🎯 사용 방법

### 1. 기본 Import

```typescript
// index.ts를 통해 모든 데이터를 import
import { PRODUCTS, WALKER_SELECTION_DATA, WALKING_REQUESTS, ADVERTISEMENTS } from '@/app/data';
```

### 2. 개별 파일 Import

```typescript
// 특정 데이터만 필요한 경우
import { PRODUCTS } from '@/app/data/products';
import { WALKER_MATCHING_DATA } from '@/app/data/walkers';
```

### 3. 타입 Import

```typescript
// 타입 정의도 함께 export
import { Product, Walker, WalkingRequest } from '@/app/data';
```

## 📋 데이터 카테고리

### 🛍️ products.ts
- **목적**: 펫 쇼핑몰 상품 데이터
- **사용처**: `ShopScreen`, `PetMallContent`
- **주요 타입**: `Product`
- **포함 데이터**:
  - 사료, 간식, 장난감, 용품 등 12개 상품
  - 가격, 할인율, 평점, 리뷰 수, 브랜드 정보

### 🚶 walkers.ts
- **목적**: 워커 프로필 및 매칭 데이터
- **사용처**: `Step2WalkerSelection`, `WalkerMatchingScreen`, `WalkerDetailScreen`
- **주요 타입**: `Walker`, `WalkerReview`
- **포함 데이터**:
  - `WALKER_SELECTION_DATA`: 워커 선택용 상세 데이터 (3명)
  - `WALKER_MATCHING_DATA`: 워커 매칭용 데이터 (6명)

### 🐾 walkingRequests.ts
- **목적**: 산책 요청 및 현재 진행 중인 산책 데이터
- **사용처**: `PetWalkerContent`, `MatchingScreen`, `WalkingMapScreen`
- **주요 타입**: `WalkingRequest`, `CurrentWalking`
- **포함 데이터**:
  - `WALKING_REQUESTS`: 대기 중/진행 중인 산책 요청 (3건)
  - `CURRENT_WALKING`: 현재 진행 중인 산책 정보

### 🎉 advertisements.ts
- **목적**: 홈 화면 광고 배너 데이터
- **사용처**: `AdBanner` 컴포넌트
- **주요 타입**: `Advertisement`
- **포함 데이터**:
  - 4개의 광고 배너 (신규 회원 할인, 워커 서비스, 사료 특가, 건강 검진)

## 🔧 데이터 추가하기

새로운 샘플 데이터를 추가하려면:

1. **새 파일 생성** (예: `notifications.ts`)
```typescript
export interface Notification {
  id: string;
  title: string;
  message: string;
}

export const NOTIFICATIONS: Notification[] = [
  // 샘플 데이터
];
```

2. **index.ts에 export 추가**
```typescript
export {
  NOTIFICATIONS,
  type Notification
} from './notifications';
```

3. **README.md 업데이트**
- 새 데이터 카테고리 설명 추가

## 📝 주의사항

- ⚠️ **이 데이터는 개발/테스트용 샘플입니다**
- 실제 프로덕션에서는 API 호출로 대체되어야 합니다
- 데이터 구조 변경 시 사용하는 모든 컴포넌트를 확인하세요
- 타입 정의는 항상 함께 export하세요

## 🔄 마이그레이션 상태

### ✅ 완료
- [x] `ProductData.ts` → `data/products.ts`로 이동
- [x] AdBanner 샘플 데이터 → `data/advertisements.ts`
- [x] 워커 샘플 데이터 → `data/walkers.ts`
- [x] 산책 요청 샘플 데이터 → `data/walkingRequests.ts`
- [x] 모든 파일의 import 경로 업데이트 완료
  - `AdBanner.tsx` ✅
  - `PetWalkerContent.tsx` ✅
  - `ShopScreen.tsx` ✅
  - `Step2WalkerSelection.tsx` ✅
  - `WalkerMatchingScreen.tsx` ✅
- [x] 레거시 `ProductData.ts` 제거 완료

### 🎉 마이그레이션 100% 완료!

## 🤝 기여 가이드

샘플 데이터를 추가하거나 수정할 때는:
1. 타입을 명확히 정의하세요
2. JSDoc 주석으로 용도를 설명하세요
3. 실제 사용 시나리오를 고려하세요
4. 일관된 네이밍 컨벤션을 따르세요 (대문자 + 복수형)

