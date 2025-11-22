# Kakao 지도 렌더링 문제 해결 기록

## 개요
iOS Dev Client에서 Kakao 지도가 회색/미색 화면과 Kakao 로고만 표시되고 타일이 렌더링되지 않는 문제를 해결한 과정을 기록합니다. 초보자도 따라 할 수 있도록 순서대로 정리했습니다.

---

## 1. 환경 변수와 API 키 전달 확인
1. **`.env.local` 확인**  
   - 경로: `Front/.env.local`  
   - 반드시 `EXPO_PUBLIC_KAKAO_MAP_API_KEY=실제_네이티브_키` 형태로 기입.
2. **Expo 구성 파일 추가**  
   ```text
   Front/app.config.js
   ```
   ```js
   import 'dotenv/config';

   export default ({ config }) => ({
     ...config,
     extra: {
       ...config.extra,
       kakaoMapApiKey: process.env.EXPO_PUBLIC_KAKAO_MAP_API_KEY,
     },
   });
   ```
   - Expo Dev Client는 `app.config.js` → `extra`에 넣은 값을 넘겨받는다.
3. **프론트 JS에서 로그로 검증**
   - `Front/app/config/api.ts` 상단에 임시로 아래를 출력해 키가 정상 전달되는지 확인.
   ```ts
   console.log('KakaoMap API key (process.env)', process.env.EXPO_PUBLIC_KAKAO_MAP_API_KEY);
   console.log('KakaoMap API key (extra)', Constants.expoConfig?.extra?.kakaoMapApiKey);
   console.log('KakaoMap API key (final)', KAKAO_MAP_API_KEY);
   ```
   - 세 값 모두 실제 키 문자열이 찍혀야 한다. `dummy-key` 등이 찍히면 앞 단계를 다시 확인.

---

## 2. 네이티브 브리지 설정
1. **View Manager에서 prop 명시**  
   ```text
   Front/ios/Petmily/KakaoMapViewManager.m
   ```
   ```objc
   RCT_EXPORT_VIEW_PROPERTY(apiKey, NSString)
   RCT_EXPORT_VIEW_PROPERTY(latitude, NSNumber)
   RCT_EXPORT_VIEW_PROPERTY(longitude, NSNumber)
   RCT_EXPORT_VIEW_PROPERTY(zoomLevel, NSNumber)
   ```
   - Expo Dev Client(React Native) → Swift `KakaoMapView`로 props가 전달되도록 브리지 선언.
2. **Swift 측에서 로그 추가 (선택)**  
   ```text
   Front/ios/Petmily/KakaoMapView.swift
   ```
   - `apiKey didSet`, `addViews`, `updateMapPosition` 등에서 `NSLog`로 상태 확인.
   - `KMController.getStateDescMessage()`를 호출해 엔진 상태를 출력하면 진단에 도움.

---

## 3. Info.plist (ATS) 설정
Kakao 지도 타일은 다양한 도메인을 사용하므로 iOS App Transport Security 예외를 허용해야 한다.

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key>
  <true/>
  <key>NSAllowsArbitraryLoadsInWebContent</key>
  <true/>
  <key>NSAllowsLocalNetworking</key>
  <true/>
  <key>NSExceptionDomains</key>
  <dict>
    <key>apis.map.kakao.com</key>
    <dict>
      <key>NSIncludesSubdomains</key><true/>
      <key>NSExceptionAllowsInsecureHTTPLoads</key><true/>
      <key>NSExceptionRequiresForwardSecrecy</key><false/>
    </dict>
    <key>dapi.kakao.com</key>
    <dict>…</dict>
    <key>map.kakao.com</key>
    <dict>…</dict>
    <key>map.daumcdn.net</key>
    <dict>…</dict>
  </dict>
</dict>
```

**중요:** `Info.plist`를 수정했다면 Dev Client를 반드시 다시 빌드해야 한다.

```bash
cd /Users/ieunho/Downloads/petmily-app/Front
npx expo start --dev-client          # Metro 서버 실행
# 새 터미널
cd /Users/ieunho/Downloads/petmily-app/Front
npx expo run:ios                     # iOS Dev Client 재빌드
```

---

## 4. iOS 시뮬레이터 위치 설정
Kakao 지도는 한국 지역 타일만 제공한다. 시뮬레이터 기본 위치가 미국(쿠퍼티노)인 경우 밝은 배경만 보인다.

1. 시뮬레이터 창 활성화 → 상단 메뉴 `Features > Location > Custom Location…`.
2. 위도/경도 입력  
   - Latitude: `37.5665`  
   - Longitude: `126.9780`  
3. 확인 후 지도가 정상 렌더링 되는지 확인.

---

## 5. 코드에서 한국 범위 체크 (추가 안전장치)
시뮬레이터가 미국 좌표를 재차 반환해도 서울로 고정되도록 프론트 코드를 보완했다.

```text
Front/app/screen/WalkingMapScreen.tsx
```

```ts
const isWithinKorea = (latitude: number, longitude: number) =>
  latitude >= 33 && latitude <= 39 && longitude >= 124 && longitude <= 132;

const defaultLatitude = parseFloat(mapConfig?.mapCenterLat ?? '37.5665');
const defaultLongitude = parseFloat(mapConfig?.mapCenterLon ?? '126.9780');

const mapLatitude =
  currentLocation && isWithinKorea(currentLocation.latitude, currentLocation.longitude)
    ? currentLocation.latitude
    : defaultLatitude;

const mapLongitude =
  currentLocation && isWithinKorea(currentLocation.latitude, currentLocation.longitude)
    ? currentLocation.longitude
    : defaultLongitude;
```

이제 iOS 시뮬레이터가 미국 좌표를 반환해도 기본값(서울)로 대체되어 항상 지도가 보인다.

---

## 6. 확인 방법
1. Dev Client를 실행하고 Kakao 지도 화면으로 이동.
2. Xcode 콘솔에서 다음과 같은 로그가 순서대로 출력되는지 확인.
   ```
   KakaoMapView: apiKey didSet (length: 32)
   KakaoMapView: SDK 초기화 완료
   KakaoMapView: addViews - defaultPosition lat=...
   KakaoMapView: addViewSucceeded - 지도 뷰 획득 성공
   KakaoMapView: updateMapPosition -> lat=37.5665 ...
   ```
3. 화면에서 타일이 정상적으로 표시되면 완료.

---

## 요약
- API 키 전달 경로와 ATS 설정을 먼저 점검한다.
- Dev Client는 변경 사항마다 `npx expo run:ios`로 재빌드해야 한다.
- Kakao 지도는 한국 좌표 기준으로 데이터가 제공되므로 시뮬레이터 위치를 서울로 맞추거나 코드에서 범위를 제한한다.
- Xcode 콘솔 로그를 활용하면 SDK 내부 상태를 쉽게 추적할 수 있다.

이 절차를 따르면 Kakao 지도 SDK가 iOS Dev Client에서 정상 렌더링되는지 빠르게 확인하고 문제를 해결할 수 있다.

