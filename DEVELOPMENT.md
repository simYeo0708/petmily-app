# Petmily 개발 가이드

## 프로젝트 구조

```
Petmily/
├── Back/                    # Spring Boot 백엔드
│   ├── src/
│   └── build.gradle
├── Front/                   # React Native/Expo 프론트엔드
│   ├── app/
│   ├── services/           # API 통신 서비스
│   ├── package.json
│   └── build.gradle
├── settings.gradle         # 멀티모듈 설정
├── build.gradle           # 루트 프로젝트 설정
└── gradlew               # Gradle 래퍼
```

## 개발 환경 설정

### 1. 프로젝트 클론 및 IntelliJ 설정
```bash
# Petmily 루트 디렉토리 열기
# IntelliJ에서 /Users/simyeo/Desktop/Petmily 폴더를 프로젝트로 열기
```

### 2. 백엔드 실행
```bash
# 루트 디렉토리에서
./gradlew :petmily-backend:bootRun

# 또는 개발 서버 실행
./gradlew dev
```

### 3. 프론트엔드 실행
```bash
# 별도 터미널에서
./gradlew startFrontend

# 또는 Front 디렉토리에서 직접
cd Front
npm start
```

## API 연동 가이드

### 백엔드 API 설정
- **기본 URL**: `http://localhost:8080/api`
- **CORS**: 모든 origin 허용 (개발 환경)
- **인증**: JWT Bearer Token

### 프론트엔드 API 설정
- **설정 파일**: `Front/services/apiConfig.ts`
- **자동 토큰 관리**: AsyncStorage 기반
- **서비스 파일**:
  - `walkingService.ts`: 산책 관련 API
  - `bookingService.ts`: 예약 관리 API

### 주요 API 엔드포인트
```typescript
// 산책 관련
POST /api/walking/{bookingId}/start          // 산책 시작
POST /api/walking/{bookingId}/complete       // 산책 완료
POST /api/walking/{bookingId}/track          // 위치 추적
GET  /api/walking/{bookingId}/path           // 산책 경로 조회
GET  /api/walking/{bookingId}/realtime       // 실시간 위치

// 예약 관련
POST /api/bookings                           // 예약 생성
GET  /api/bookings                           // 예약 목록
POST /api/bookings/{bookingId}/change-request // 예약 변경 요청
```

## 개발 워크플로우

### 1. 백엔드 개발
```bash
# 테스트 실행
./gradlew :petmily-backend:test

# 애플리케이션 빌드
./gradlew :petmily-backend:build

# 개발 서버 실행 (핫 리로드)
./gradlew :petmily-backend:bootRun
```

### 2. 프론트엔드 개발
```bash
# 의존성 설치
./gradlew :petmily-frontend:installDependencies

# 개발 서버 시작
./gradlew :petmily-frontend:startDev

# 린트 검사
./gradlew :petmily-frontend:lint

# 빌드 (배포용)
./gradlew :petmily-frontend:buildFrontend
```

### 3. 전체 프로젝트 관리
```bash
# 전체 빌드
./gradlew buildAll

# 전체 클린
./gradlew cleanAll

# 전체 린트 검사
./gradlew lintAll
```

## API 사용 예제

### 프론트엔드에서 API 호출
```typescript
import { walkingService } from '../services/walkingService';

// 산책 시작
const startWalk = async (bookingId: number) => {
  try {
    const result = await walkingService.startWalk(bookingId);
    console.log('산책 시작됨:', result);
  } catch (error) {
    console.error('산책 시작 실패:', error);
  }
};

// 실시간 위치 조회
const getRealtimeLocation = async (bookingId: number) => {
  try {
    const locations = await walkingMonitorService.getRealtimeLocation(bookingId);
    console.log('현재 위치:', locations);
  } catch (error) {
    console.error('위치 조회 실패:', error);
  }
};
```

## 주의사항

1. **CORS 설정**: 개발 환경에서는 모든 origin을 허용하지만, 프로덕션에서는 특정 도메인만 허용해야 합니다.

2. **토큰 관리**: JWT 토큰은 AsyncStorage에 저장되며, 만료 시 자동으로 갱신됩니다.

3. **에러 처리**: API 호출 시 항상 try-catch문을 사용하여 에러를 처리하세요.

4. **실시간 기능**: 위치 추적이나 채팅 같은 실시간 기능은 WebSocket을 활용합니다.

## 트러블슈팅

### IntelliJ 프로젝트 인식 문제
- 루트 디렉토리(/Users/simyeo/Desktop/Petmily)를 프로젝트로 열어야 합니다
- `settings.gradle`이 멀티모듈 구조를 정의합니다
- 각 모듈의 `build.gradle`이 개별 빌드 설정을 담당합니다

### API 연결 실패
- 백엔드 서버가 실행 중인지 확인: `localhost:8080`
- CORS 설정이 올바른지 확인
- 토큰이 올바르게 전달되는지 확인

### 빌드 에러
- 의존성 충돌: `./gradlew cleanAll` 후 다시 빌드
- 포트 충돌: 8080 포트가 사용 중인지 확인