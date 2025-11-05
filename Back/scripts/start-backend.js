#!/usr/bin/env node

const { spawn } = require('child_process');
const { detectLocalIP, updateApplicationYml } = require('./auto-detect-ip');

/**
 * 백엔드 개발 환경을 자동으로 시작합니다.
 * 1. IP 자동 감지 및 application.yml 업데이트
 * 2. Gradle로 백엔드 서버 시작
 */
function startBackend() {
  console.log('🚀 Petmily 백엔드 시작 중...\n');
  
  // 1. IP 자동 감지 및 설정 업데이트
  console.log('1️⃣ 네트워크 IP 자동 감지...');
  const detectedIP = detectLocalIP();
  updateApplicationYml(detectedIP);
  
  console.log('\n2️⃣ 백엔드 서버 시작...');
  console.log(`   서버 주소: http://${detectedIP}:8080/api`);
  console.log('   H2 콘솔: http://localhost:8080/h2-console\n');
  
  // 2. Gradle로 백엔드 시작
  const gradleProcess = spawn('./gradlew', ['bootRun'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
  });
  
  gradleProcess.on('error', (error) => {
    console.error('❌ 백엔드 시작 실패:', error.message);
    process.exit(1);
  });
  
  gradleProcess.on('close', (code) => {
    console.log(`\n🔧 백엔드 프로세스 종료 (코드: ${code})`);
    process.exit(code);
  });
  
  // 프로세스 종료 처리
  process.on('SIGINT', () => {
    console.log('\n🛑 백엔드 서버 종료 중...');
    gradleProcess.kill('SIGINT');
  });
}

// 스크립트 실행
if (require.main === module) {
  startBackend();
}

