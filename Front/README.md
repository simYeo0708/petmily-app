# Petmily Frontend 🐾

반려동물 케어 서비스 프론트엔드 애플리케이션

## 📱 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 3-1. IP 주소 자동 설정 및 앱 실행 (권장)

```bash
npm run dev
```

이 명령어는:
- 자동으로 Mac의 IP 주소를 감지합니다
- `.env.local` 파일을 생성/업데이트합니다
- Expo 개발 서버를 시작합니다

### 3-2. 또는 수동으로 IP 업데이트 후 실행

```bash
# IP 주소만 업데이트
npm run update-ip

# 일반 시작
npm start
```

### 4. IP 주소가 변경되었을 때

개발 장소를 옮긴 후:

```bash
npm run update-ip  # IP 자동 감지 및 업데이트
npm start          # Expo 재시작
```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.
