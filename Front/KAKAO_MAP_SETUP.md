# 🗺️ Kakao Maps API 설정 가이드

## 📋 목차
1. [API 키 발급](#api-키-발급)
2. [환경 변수 설정](#환경-변수-설정)
3. [iOS 설정](#ios-설정)
4. [사용 방법](#사용-방법)

---

## 🔑 API 키 발급

### 1. Kakao Developers 계정 생성
https://developers.kakao.com/ 접속하여 카카오 계정으로 로그인

### 2. 애플리케이션 추가
1. **내 애플리케이션** > **애플리케이션 추가하기** 클릭
2. 앱 이름: `Petmily` (원하는 이름)
3. 사업자명: 개인 또는 회사명 입력
4. **저장**

### 3. 플랫폼 설정 (iOS) ⚠️ 중요
1. **앱 설정** > **플랫폼** 메뉴
2. **iOS 플랫폼 등록** 클릭
3. 번들 ID 입력: `com.petmily.app`
4. **저장**

**⚠️ 참고:**
- iOS 네이티브 앱은 **웹 플랫폼 도메인 설정이 필요 없습니다**
- 웹 플랫폼(`https://localhost:8082` 등)은 웹 브라우저에서 사용하는 경우에만 필요합니다
- iOS 네이티브 앱은 번들 ID만 등록하면 됩니다

### 4. 지도 서비스 활성화
1. **제품 설정** > **지도** 메뉴
2. **활성화 설정** 켜기
3. 저장

### 5. API 키 복사
1. **앱 키** 탭으로 이동
2. **Native App Key** 복사 ⚠️ (JavaScript 키가 아님!)
   - 예: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
   
**중요:**
- iOS 네이티브 앱은 **Native App Key**를 사용합니다
- JavaScript 키는 웹 브라우저용입니다
- Native App Key는 iOS/Android 네이티브 앱 전용입니다

---

## 🔧 환경 변수 설정

### 방법 1: .env.local 파일 직접 편집 (권장)

`.env.local` 파일을 열어서 다음 줄을 추가:

```bash
# Kakao Maps API Key
EXPO_PUBLIC_KAKAO_MAP_API_KEY=발급받은-API-키를-여기에-붙여넣기
```

**예시:**
```bash
EXPO_PUBLIC_API_HOST=10.50.235.215
EXPO_PUBLIC_API_PORT=8083

# Kakao Maps API Key
EXPO_PUBLIC_KAKAO_MAP_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 방법 2: update-ip.sh 스크립트 수정

`scripts/update-ip.sh` 파일에 API 키 추가 로직 포함 (선택사항)

---

## 📱 iOS 설정

### Info.plist에 이미 추가됨 ✅

`ios/Petmily/Info.plist`에 위치 권한이 설정되어 있습니다:
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>산책 경로를 추적하기 위해 위치 권한이 필요합니다.</string>
```

### Podfile에 이미 추가됨 ✅

`ios/Podfile`:
```ruby
pod 'KakaoMapsSDK', '2.12.10'
```

---

## 🚀 사용 방법

### 기본 사용

```typescript
import KakaoMapView from '@/app/components/KakaoMapView';
import { KAKAO_MAP_API_KEY } from '@/app/config/api';

<KakaoMapView
  apiKey={KAKAO_MAP_API_KEY}
  latitude={37.5665}
  longitude={126.9780}
  zoomLevel={15}
  style={{ flex: 1 }}
/>
```

### 마커 추가

```typescript
import { useRef } from 'react';
import KakaoMapView, { KakaoMapViewHandle } from '@/app/components/KakaoMapView';

const MyComponent = () => {
  const mapRef = useRef<KakaoMapViewHandle>(null);
  
  const addMarker = () => {
    mapRef.current?.addMarker(37.5665, 126.9780, '서울시청');
  };
  
  return (
    <KakaoMapView
      ref={mapRef}
      apiKey={KAKAO_MAP_API_KEY}
      latitude={37.5665}
      longitude={126.9780}
      zoomLevel={15}
      style={{ flex: 1 }}
    />
  );
};
```

---

## ✅ 체크리스트

설정 전:
- [ ] Kakao Developers 계정 생성
- [ ] 애플리케이션 등록
- [ ] iOS 플랫폼 등록 (번들 ID: `com.petmily.app`)
- [ ] 지도 서비스 활성화
- [ ] Native App Key 발급
- [ ] `.env.local`에 API 키 추가

설정 후 확인:
- [ ] `.env.local` 파일에 `EXPO_PUBLIC_KAKAO_MAP_API_KEY` 있음
- [ ] `app/config/api.ts`에서 `KAKAO_MAP_API_KEY` export됨
- [ ] Xcode에 Swift 파일 3개 추가됨
- [ ] `pod install` 완료

빌드 및 실행:
- [ ] `npx expo run:ios` 실행
- [ ] 지도가 정상적으로 렌더링됨
- [ ] 마커 추가 테스트 성공

---

## 🐛 트러블슈팅

### 문제: "Invalid API Key" 에러
**해결**: 
1. API 키가 올바른지 확인
2. Native App Key를 사용하는지 확인 (JavaScript 키 X)
3. `.env.local` 파일 저장 후 앱 재시작

### 문제: 지도가 안 보임
**해결**:
1. Xcode에서 Swift 파일들이 추가되었는지 확인
2. `pod install` 재실행
3. Xcode에서 Clean Build Folder (Cmd + Shift + K)
4. 앱 재빌드

### 문제: "KakaoMapView not found"
**해결**:
1. Xcode에서 Target Membership 확인
2. Bridging Header 경로 확인
3. 프로젝트 클린 후 재빌드

---

## 📚 참고 문서

- [Kakao Maps SDK for iOS 공식 문서](https://apis.map.kakao.com/ios_v2/docs/)
- [Kakao Developers](https://developers.kakao.com/)
- [React Native Native Modules](https://reactnative.dev/docs/native-modules-ios)

---

## 🔐 보안 주의사항

⚠️ **중요**: `.env.local` 파일은 절대 Git에 커밋하지 마세요!

이미 `.gitignore`에 추가되어 있습니다:
```
.env*.local
```

팀원과 API 키를 공유할 때는:
1. `.env.example` 파일 참고
2. 개별적으로 API 키 발급
3. 각자 `.env.local` 파일에 설정


