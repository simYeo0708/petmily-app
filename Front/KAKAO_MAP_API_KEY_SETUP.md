# 🔑 Kakao Maps API 키 설정 방법

## 현재 상태
`.env.local` 파일에 API 키가 `your_kakao_map_api_key_here`로 설정되어 있습니다.
**실제 Kakao Maps JavaScript 키로 변경해야 지도가 렌더링됩니다.**

## 설정 방법

### 1. Kakao Developers에서 JavaScript 키 복사
1. https://developers.kakao.com/ 접속
2. **내 애플리케이션** → 앱 선택
3. **앱 키** 탭 클릭
4. **JavaScript 키** 복사
   - 예: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### 2. .env.local 파일 수정
```bash
cd /Users/ieunho/Downloads/petmily-app/Front
```

`.env.local` 파일을 열어서 다음 줄을 수정:
```bash
EXPO_PUBLIC_KAKAO_MAP_API_KEY=여기에_실제_JavaScript_키_붙여넣기
```

**예시:**
```bash
# 자동 생성된 환경 변수 (수정하지 마세요)
EXPO_PUBLIC_API_HOST=10.50.215.125
EXPO_PUBLIC_API_PORT=8083
EXPO_PUBLIC_KAKAO_MAP_API_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

### 3. 앱 재시작
환경 변수를 변경한 후에는 **반드시 앱을 재시작**해야 합니다:

```bash
# Metro bundler 종료 (Ctrl+C)
# 그 다음 다시 시작
cd /Users/ieunho/Downloads/petmily-app/Front
npx expo start --clear

# 또는 iOS 시뮬레이터에서 앱 재시작
```

## 확인 방법

Xcode 콘솔에서 다음 로그를 확인하세요:
- ✅ `🗺️ KakaoMapView: SDK 초기화 시작 - API Key: 설정됨`
- ✅ `🗺️ KakaoMapView: 지도 생성 시작`
- ✅ `✅ KakaoMapView: 지도 뷰 생성 성공`

만약 에러가 발생하면:
- ❌ `Invalid API Key` → API 키가 잘못됨
- ❌ `지도 뷰를 가져올 수 없습니다` → SDK 초기화 문제

## 주의사항

⚠️ **중요:**
- JavaScript 키를 사용해야 합니다 (Native App Key 아님!)
- API 키는 공개 저장소에 커밋하지 마세요
- `.gitignore`에 `.env*.local`이 포함되어 있는지 확인



