# iOS 개발 워크플로우

## 문제
`npx expo run:ios`는 앱을 빌드하고 설치한 후 종료되어, Metro bundler 로그를 볼 수 없습니다.

## 올바른 워크플로우

### 방법 1: 두 개의 터미널 사용 (권장)

**터미널 1: Metro bundler 실행**
```bash
cd /Users/ieunho/Downloads/petmily-app/Front
npm run dev
# 또는
npx expo start --clear
```

**터미널 2: 앱 빌드 및 실행**
```bash
cd /Users/ieunho/Downloads/petmily-app/Front
npm run ios:build
# 또는
npx expo run:ios --no-bundler
```

### 방법 2: 한 번에 실행 (빌드만)

앱을 빌드하고 설치만 하려면:
```bash
cd /Users/ieunho/Downloads/petmily-app/Front
npm run ios
```

이 명령은:
1. IP 자동 감지
2. 앱 빌드 및 설치
3. 종료 (Metro bundler는 별도로 실행해야 함)

## 설명

- `npx expo run:ios`: 빌드 + 설치 + Metro bundler 대기 (하지만 Metro bundler가 실행 중이면 종료됨)
- `npx expo run:ios --no-bundler`: 빌드 + 설치만 (Metro bundler 시작 안 함)
- `npx expo start`: Metro bundler만 시작 (앱 빌드 안 함)

## 권장 방법

1. **첫 번째 터미널**: `npm run dev` 실행 (Metro bundler 로그 확인)
2. **두 번째 터미널**: `npm run ios:build` 실행 (앱 빌드 및 설치)
3. 시뮬레이터에서 앱이 Metro bundler에 자동 연결됨

## 문제 해결

### 앱이 Metro bundler에 연결되지 않을 때
1. Metro bundler가 실행 중인지 확인: `lsof -i :8081`
2. 앱을 완전히 종료하고 다시 실행
3. Metro bundler 재시작: `npx expo start --clear`




