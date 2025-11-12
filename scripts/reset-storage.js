#!/usr/bin/env node

/**
 * AsyncStorage 초기화 스크립트
 * 헬퍼 상태 등 저장된 데이터를 초기화합니다.
 */

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log("🔧 Petmily AsyncStorage 초기화 도구");
console.log("=====================================");
console.log("이 스크립트는 다음 데이터를 초기화합니다:");
console.log("- 헬퍼 상태 (petmily_helper_status)");
console.log("- 기타 앱 설정들");
console.log("");

const resetInstructions = `
📱 AsyncStorage 초기화 방법:

1. React Native Debugger 사용:
   - 앱 실행 후 React Native Debugger 열기
   - Console에서 다음 명령어 실행:
   
   // 헬퍼 상태만 초기화
   AsyncStorage.removeItem('petmily_helper_status')
   
   // 모든 저장소 초기화
   AsyncStorage.clear()

2. Expo 개발 도구 사용:
   - 터미널에서 앱 실행 중일 때 'shift + m' 입력
   - Metro bundler 메뉴에서 "Open React Native debugger" 선택
   - Console에서 위 명령어 실행

3. 개발 빌드에서:
   - 앱 실행 후 개발자 메뉴 열기 (기기 흔들기)
   - "Debug" 선택
   - Console에서 명령어 실행

4. 시뮬레이터/에뮬레이터 초기화:
   - iOS 시뮬레이터: Device → Erase All Content and Settings
   - Android 에뮬레이터: Settings → Apps → Petmily → Storage → Clear Data

명령어 예시:
-----------
// 특정 키만 삭제
import AsyncStorage from '@react-native-async-storage/async-storage';
AsyncStorage.removeItem('petmily_helper_status').then(() => {
  console.log('헬퍼 상태가 초기화되었습니다.');
});

// 모든 저장소 초기화
AsyncStorage.clear().then(() => {
  console.log('모든 데이터가 초기화되었습니다.');
});

// 저장된 모든 키 확인
AsyncStorage.getAllKeys().then(keys => {
  console.log('저장된 키들:', keys);
});
`;

rl.question("초기화 방법을 확인하시겠습니까? (Y/n): ", (answer) => {
  const userInput = answer.trim().toLowerCase() || "y";

  if (userInput === "y" || userInput === "yes") {
    console.log(resetInstructions);
  }

  console.log("\n✅ 스크립트 완료");
  console.log("앱을 다시 시작하면 변경사항이 적용됩니다.");
  rl.close();
});
