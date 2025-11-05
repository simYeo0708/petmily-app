#!/usr/bin/env node

const { spawn } = require('child_process');
const { detectLocalIP, updateEnvFile } = require('./auto-detect-ip');

/**
 * 개발 환경을 자동으로 시작합니다.
 * 1. IP 자동 감지 및 .env.local 업데이트
 * 2. Expo 개발 서버 시작
 */
function startDevelopment() {
  console.log('🚀 Petmily 개발 환경 시작 중...\n');
  
  // 1. IP 자동 감지 및 환경 변수 업데이트
  console.log('1️⃣ 네트워크 IP 자동 감지...');
  const detectedIP = detectLocalIP();
  updateEnvFile(detectedIP);
  
  console.log('\n2️⃣ Expo 개발 서버 시작...');
  console.log('   백엔드도 함께 시작하려면: cd ../Back && ./gradlew bootRun\n');
  
  // 2. Expo 개발 서버 시작
  const expoProcess = spawn('npx', ['expo', 'start', '--clear'], {
    stdio: 'inherit',
    shell: true
  });
  
  expoProcess.on('error', (error) => {
    console.error('❌ Expo 시작 실패:', error.message);
    process.exit(1);
  });
  
  expoProcess.on('close', (code) => {
    console.log(`\n📱 Expo 프로세스 종료 (코드: ${code})`);
    process.exit(code);
  });
  
  // 프로세스 종료 처리
  process.on('SIGINT', () => {
    console.log('\n🛑 개발 서버 종료 중...');
    expoProcess.kill('SIGINT');
  });
}

// 스크립트 실행
if (require.main === module) {
  startDevelopment();
}

