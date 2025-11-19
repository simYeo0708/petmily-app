# 🚀 Petmily 개발 환경 가이드

## 📋 개요
이제 **IP 주소를 매번 수정할 필요 없이** 자동으로 네트워크를 감지하여 개발 환경을 시작할 수 있습니다!

## 🛠️ 자동 IP 감지 시스템

### ✨ 주요 기능
- **자동 IP 감지**: WiFi/이더넷 연결을 자동으로 감지
- **환경 변수 자동 업데이트**: `.env.local`과 `application.yml` 자동 설정
- **원클릭 시작**: 백엔드와 프론트엔드를 한 번에 시작

---

## 🚀 시작 방법

### 방법 1: 통합 시작 (추천)
```bash
# 프로젝트 루트에서
./start-dev.sh
```

### 방법 2: 백엔드 완전 재시작 (문제 발생 시)
```bash
# 백엔드가 자꾸 종료되거나 에러가 발생하는 경우
cd Back
bash restart-backend.sh
```
**이 방법은**:
- 모든 Gradle/Java 프로세스 종료
- 빌드 캐시 완전 삭제
- 새로 빌드 및 실행
- JWT 키 문제 해결

### 방법 3: 개별 시작
```bash
# 백엔드만 시작
cd Back
node scripts/start-backend.js

# 프론트엔드만 시작 (새 터미널에서)
cd Front
npm run dev
```

### 방법 4: 기존 방식
```bash
# IP만 업데이트
cd Front
npm run update-ip

# 또는
cd Back
node scripts/auto-detect-ip.js
```

---

## 📱 접속 정보

### 백엔드
- **API 서버**: `http://[자동감지IP]:8083/api`
- **H2 콘솔**: `http://localhost:8083/h2-console`
- **Swagger UI**: `http://[자동감지IP]:8083/swagger-ui.html`

### 프론트엔드
- **Expo 개발 서버**: QR 코드 스캔 또는 시뮬레이터
- **웹 버전**: `http://localhost:19006`

---

## 🔧 문제 해결

### ⚠️ 백엔드가 자꾸 종료되는 경우 (가장 흔한 문제)
**원인**: JWT 키 오류, 캐시 문제, 포트 충돌

**해결 방법**:
```bash
cd Back
bash restart-backend.sh
```

이 스크립트는:
1. 모든 백엔드 프로세스 강제 종료
2. 포트 8083 점유 프로세스 종료
3. Gradle 캐시 완전 삭제
4. 테스트 스킵하고 새로 빌드
5. 포그라운드로 백엔드 실행

**수동 방법**:
```bash
# 1. 모든 프로세스 종료
pkill -9 -f "gradle"
pkill -9 -f "java.*petmily"
lsof -ti:8083 | xargs kill -9

# 2. 캐시 삭제
cd Back
rm -rf build/ .gradle/

# 3. 재빌드 및 실행
./gradlew clean build -x test
./gradlew bootRun
```

### IP가 잘못 감지된 경우
```bash
# 수동으로 IP 설정
cd Front
echo "EXPO_PUBLIC_API_HOST=192.168.1.100" > .env.local
node scripts/sync-dev-config.js
```

### 백엔드 CORS 에러
```bash
# 백엔드 재시작
cd Back
node scripts/auto-detect-ip.js
./gradlew bootRun
```

### 프론트엔드 연결 실패
```bash
# 프론트엔드 재시작
cd Front
npm run update-ip
npm start
```

### Java 관련 에러
```bash
# JAVA_HOME 설정 확인
echo $JAVA_HOME

# 없으면 설정
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home

# ~/.zshrc 또는 ~/.bash_profile에 추가
echo 'export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home' >> ~/.zshrc
```

---

## 📁 파일 구조

```
petmily-app/
├── start-dev.sh              # 통합 시작 스크립트
├── Front/
│   ├── scripts/
│   │   ├── auto-detect-ip.js # IP 자동 감지
│   │   └── start-dev.js      # 프론트엔드 시작
│   └── .env.local            # 환경 변수 (자동 생성)
└── Back/
    ├── scripts/
    │   ├── auto-detect-ip.js # IP 자동 감지
    │   └── start-backend.js  # 백엔드 시작
    └── src/main/resources/
        └── application.yml    # 백엔드 설정 (자동 업데이트)
```

---

## 🎯 사용 팁

1. **첫 실행**: `./start-dev.sh`로 시작
2. **IP 변경 시**: 스크립트가 자동으로 감지하여 업데이트
3. **개발 중**: 백엔드만 재시작하려면 `cd Back && ./gradlew bootRun`
4. **프론트엔드만**: `cd Front && npm run dev`

---

## 🔍 로그 확인

### 백엔드 로그
```bash
cd Back
./gradlew bootRun --info
```

### 프론트엔드 로그
```bash
cd Front
npm start -- --verbose
```

---

이제 **매번 IP를 수정할 필요 없이** 개발을 시작할 수 있습니다! 🎉



