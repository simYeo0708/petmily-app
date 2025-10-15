# GPS 기반 실시간 위치 추적 미니맵 구현 가이드

## 📋 개요

Nike Run Club 앱과 유사한 GPS 기반 실시간 위치 추적 시스템을 구현했습니다. 대리 산책자의 위치를 실시간으로 추적하고, 이동 거리, 시간, 속도 등의 통계를 제공합니다.

## 🚀 주요 기능

### 1. **실시간 GPS 위치 추적**
- `expo-location`을 사용한 고정밀 위치 추적
- 1초마다 위치 업데이트
- 5미터 이동 시 자동 업데이트
- 배터리 효율적인 추적 방식

### 2. **산책 통계**
- **거리**: 총 이동 거리 (미터/킬로미터)
- **시간**: 총 소요 시간 (HH:MM:SS)
- **평균 속도**: 전체 평균 속도 (km/h)
- **현재 속도**: 실시간 속도 (km/h)
- **페이스**: 분/km 단위 페이스

### 3. **인터랙티브 미니맵**
- Kakao Map API 기반 지도
- 실시간 경로 그리기
- 사용자 위치 마커 (펫 이미지 포함)
- 시작점/현재 위치 표시
- 펄스 애니메이션 효과

### 4. **산책 제어**
- 시작/일시정지/재개
- 산책 종료
- 기록 초기화

## 📁 파일 구조

```
Front/
├── app/
│   ├── hooks/
│   │   └── useLocationTracking.ts          # GPS 위치 추적 커스텀 훅
│   ├── utils/
│   │   └── LocationUtils.ts                # 거리/속도 계산 유틸리티
│   ├── components/
│   │   └── WalkingMiniMap.tsx              # 미니맵 컴포넌트
│   └── screen/
│       └── WalkingMapScreenEnhanced.tsx    # 개선된 산책 화면
└── app.json                                 # 위치 권한 설정
```

## 🔧 핵심 구현

### 1. useLocationTracking Hook

```typescript
// 사용 예시
const {
  currentLocation,    // 현재 위치
  path,              // 이동 경로 배열
  stats,             // 통계 정보
  isTracking,        // 추적 상태
  error,             // 에러 메시지
  permissionStatus,  // 권한 상태
  startTracking,     // 추적 시작
  stopTracking,      // 추적 중지
  resetTracking,     // 초기화
} = useLocationTracking();
```

**주요 기능:**
- 자동 위치 권한 요청
- Haversine formula를 사용한 정확한 거리 계산
- 비정상적인 GPS 데이터 필터링 (정확도 50m 이하만 허용)
- 메모리 효율적인 위치 히스토리 관리

### 2. WalkingMiniMap Component

```typescript
<WalkingMiniMap
  currentLocation={currentLocation}
  path={path}
  petImageUrl={petImageUrl}
  mapApiKey={mapConfig.appKey}
  style={styles.map}
/>
```

**주요 기능:**
- WebView 기반 Kakao Map 렌더링
- 실시간 위치/경로 업데이트
- 커스텀 SVG 마커 (펫 이미지 + 펄스 애니메이션)
- 동적 경로 그리기

### 3. LocationUtils 유틸리티

```typescript
// 거리 계산
calculateDistance(coord1, coord2)        // 미터 단위

// 포맷팅 함수
formatDistance(meters)                    // "1.23 km" 또는 "123 m"
formatDuration(seconds)                   // "1:23:45"
formatSpeed(kmh)                          // "5.4 km/h"
calculatePace(kmh)                        // "11:05 /km"

// 지도 헬퍼
getPathCenter(path)                       // 경로 중심점
getPathBounds(path)                       // 경로 경계
```

## 🎨 UI/UX 특징

### 1. **통계 카드**
- 큰 숫자로 주요 정보 표시
- 실시간 업데이트
- 그림자와 둥근 모서리로 현대적인 디자인

### 2. **컨트롤 버튼**
- Gradient 배경
- 직관적인 아이콘
- 상태에 따른 색상 변경

### 3. **에러 핸들링**
- 위치 권한 거부 시 안내
- GPS 신호 약함 경고
- 사용자 친화적인 에러 메시지

## 📱 사용 방법

### 1. 화면 이동

```typescript
// WalkingMapScreenEnhanced로 이동
navigation.navigate('WalkingMapEnhanced', {
  bookingId: 123,
  walkerName: '김산책',
  petName: '뽀삐',
  petImageUrl: 'https://...',
});
```

### 2. 권한 설정

**iOS (Info.plist):**
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>산책 경로를 추적하기 위해 위치 권한이 필요합니다.</string>
```

**Android (AndroidManifest.xml):**
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

### 3. 빌드 및 실행

```bash
# 의존성 설치 (이미 완료)
npx expo install expo-location

# 개발 서버 실행
npx expo start

# iOS
npx expo run:ios

# Android
npx expo run:android
```

## 🔍 기술적 세부사항

### GPS 정확도 최적화

```typescript
// 최고 정확도 설정
Location.Accuracy.BestForNavigation

// 업데이트 간격
{
  timeInterval: 1000,      // 1초
  distanceInterval: 5,     // 5미터
}
```

### 거리 계산 알고리즘

Haversine Formula를 사용하여 구면 거리를 계산합니다:

```typescript
const R = 6371e3; // 지구 반지름 (미터)
const a = sin²(Δφ/2) + cos(φ1)⋅cos(φ2)⋅sin²(Δλ/2)
const c = 2⋅atan2(√a, √(1−a))
const distance = R × c
```

### 데이터 필터링

부정확한 GPS 데이터를 필터링합니다:

```typescript
// 조건:
1. 정확도 < 50m
2. 이동 거리 < 100m (비정상적으로 큰 점프 방지)
3. 시간차 > 0 (중복 데이터 방지)
```

## 🎯 성능 최적화

### 1. **메모리 관리**
- useRef로 구독 객체 관리
- 컴포넌트 언마운트 시 자동 정리
- 경로 데이터 효율적 관리

### 2. **배터리 절약**
- 정확도 기반 조건부 업데이트
- 불필요한 렌더링 방지
- WebView 최적화

### 3. **네트워크 효율**
- 로컬 계산 우선
- 필요시에만 서버 통신
- 경로 데이터 압축

## 🚨 주의사항

### 1. **권한 관리**
- 앱 시작 시 위치 권한 요청
- 권한 거부 시 적절한 안내
- 백그라운드 위치 권한 선택적 사용

### 2. **배터리 소모**
- 장시간 사용 시 배터리 영향 안내
- 저전력 모드 옵션 제공 고려
- 산책 종료 시 자동으로 추적 중지

### 3. **데이터 정확도**
- 실내에서는 GPS 신호 약함
- 터널/지하에서 추적 불가
- 날씨/건물 영향 받을 수 있음

## 🔄 향후 개선 사항

### 1. **기능 추가**
- [ ] 백그라운드 위치 추적
- [ ] 경로 저장/불러오기
- [ ] 칼로리 계산
- [ ] 고도 정보 표시
- [ ] 경로 공유 기능

### 2. **UI/UX 개선**
- [ ] 다크 모드 지원
- [ ] 지도 스타일 커스터마이징
- [ ] 음성 안내
- [ ] 진동 피드백

### 3. **성능 최적화**
- [ ] 경로 데이터 압축
- [ ] 오프라인 지도 캐싱
- [ ] 더 정교한 GPS 필터링

## 📚 참고 자료

- [Expo Location 문서](https://docs.expo.dev/versions/latest/sdk/location/)
- [Kakao Map API](https://apis.map.kakao.com/)
- [Haversine Formula](https://en.wikipedia.org/wiki/Haversine_formula)
- [Nike Run Club](https://www.nike.com/nrc-app)

## 🤝 기여

버그 리포트나 기능 제안은 이슈로 등록해주세요!

