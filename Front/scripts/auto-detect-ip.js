#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * 네트워크 인터페이스에서 사용 가능한 IP 주소를 자동으로 감지합니다.
 * WiFi 또는 이더넷 연결의 IP를 우선적으로 선택합니다.
 */
function detectLocalIP() {
  const interfaces = os.networkInterfaces();
  const candidates = [];
  
  // 우선순위: WiFi > 이더넷 > 기타
  const priorityOrder = ['en0', 'en1', 'eth0', 'wlan0'];
  
  for (const [name, addresses] of Object.entries(interfaces)) {
    if (!addresses) continue;
    
    for (const addr of addresses) {
      // IPv4이고 내부 IP인 경우만 선택
      if (addr.family === 'IPv4' && !addr.internal) {
        const priority = priorityOrder.indexOf(name);
        candidates.push({
          ip: addr.address,
          interface: name,
          priority: priority >= 0 ? priority : 999
        });
      }
    }
  }
  
  // 우선순위 순으로 정렬
  candidates.sort((a, b) => a.priority - b.priority);
  
  return candidates[0]?.ip || 'localhost';
}

/**
 * .env.local 파일을 업데이트합니다.
 */
function updateEnvFile(ip, port = '8080') {
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = `# 자동 생성된 환경 변수 (수정하지 마세요)
EXPO_PUBLIC_API_HOST=${ip}
EXPO_PUBLIC_API_PORT=${port}
EXPO_PUBLIC_KAKAO_MAP_API_KEY=your_kakao_map_api_key_here
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`✅ .env.local 업데이트 완료: ${ip}:${port}`);
    return true;
  } catch (error) {
    console.error('❌ .env.local 업데이트 실패:', error.message);
    return false;
  }
}

/**
 * 메인 실행 함수
 */
function main() {
  console.log('🔍 네트워크 IP 자동 감지 중...');
  
  const detectedIP = detectLocalIP();
  
  if (detectedIP === 'localhost') {
    console.log('⚠️  로컬 IP를 찾을 수 없습니다. localhost를 사용합니다.');
  } else {
    console.log(`🎯 감지된 IP: ${detectedIP}`);
  }
  
  const success = updateEnvFile(detectedIP);
  
  if (success) {
    console.log('🚀 이제 백엔드와 프론트엔드를 시작할 수 있습니다!');
    console.log('   백엔드: cd Back && ./gradlew bootRun');
    console.log('   프론트엔드: npm start');
  } else {
    process.exit(1);
  }
}

// 스크립트가 직접 실행된 경우에만 실행
if (require.main === module) {
  main();
}

module.exports = { detectLocalIP, updateEnvFile };

