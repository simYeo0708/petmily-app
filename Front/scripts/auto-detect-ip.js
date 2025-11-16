#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * 네트워크 인터페이스에서 사용 가능한 IP 주소를 자동으로 감지합니다.
 * WiFi 또는 이더넷 연결의 IP를 우선적으로 선택합니다.
 */
function detectLocalIP() {
  if (process.env.DEV_IP) {
    return process.env.DEV_IP;
  }
  try {
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
    
    candidates.sort((a, b) => a.priority - b.priority);
    const detected = candidates[0]?.ip;
    if (!detected) {
      console.warn('로컬 IP를 찾을 수 없어 localhost를 사용합니다.');
    }
    return detected || 'localhost';
  } catch (error) {
    console.warn('네트워크 인터페이스 조회 실패로 localhost를 사용합니다.', error.message);
    return 'localhost';
  }
}

/**
 * .env.local 파일을 업데이트합니다.
 * 기존 API 키는 보존합니다.
 */
function updateEnvFile(ip, port = process.env.EXPO_PUBLIC_API_PORT || '8083') {
  const envPath = path.join(__dirname, '..', '.env.local');
  
  // 기존 .env.local 파일 읽기 (존재하는 경우)
  let existingApiKey = 'your_kakao_map_api_key_here';
  if (fs.existsSync(envPath)) {
    const existingContent = fs.readFileSync(envPath, 'utf8');
    const apiKeyMatch = existingContent.match(/EXPO_PUBLIC_KAKAO_MAP_API_KEY=(.+)/);
    if (apiKeyMatch && apiKeyMatch[1].trim() !== 'your_kakao_map_api_key_here') {
      existingApiKey = apiKeyMatch[1].trim();
      console.log('기존 Kakao Maps API 키를 보존합니다');
    }
  }
  
  const envContent = `# 자동 생성된 환경 변수
# IP 주소는 자동으로 감지됩니다
# Kakao Maps API 키는 수동으로 설정하세요: https://developers.kakao.com/

EXPO_PUBLIC_API_HOST=${ip}
EXPO_PUBLIC_API_PORT=${port}
EXPO_PUBLIC_KAKAO_MAP_API_KEY=${existingApiKey}
`;

  try {
    fs.writeFileSync(envPath, envContent);
    console.log(`.env.local 업데이트 완료: ${ip}:${port}`);
    if (existingApiKey === 'your_kakao_map_api_key_here') {
      console.log('⚠️  Kakao Maps API 키가 설정되지 않았습니다. .env.local 파일을 수동으로 편집하세요.');
    }
    return true;
  } catch (error) {
    console.error('.env.local 업데이트 실패:', error.message);
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
  
  const targetPort = process.env.EXPO_PUBLIC_API_PORT || '8083';
  const success = updateEnvFile(detectedIP, targetPort);
  
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

