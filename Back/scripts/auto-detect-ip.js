#!/usr/bin/env node

const os = require('os');
const fs = require('fs');
const path = require('path');

/**
 * 네트워크 인터페이스에서 사용 가능한 IP 주소를 자동으로 감지합니다.
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
    
    // 우선순위 순으로 정렬
    candidates.sort((a, b) => a.priority - b.priority);
    
    const detected = candidates[0]?.ip;
    if (!detected) {
      console.warn('⚠️  로컬 IP를 찾을 수 없어 localhost를 사용합니다.');
    }
    return detected || 'localhost';
  } catch (error) {
    console.warn('⚠️  네트워크 인터페이스 조회 실패로 localhost를 사용합니다.', error.message);
    return 'localhost';
  }
}

/**
 * application.yml 파일을 업데이트합니다.
 */
function updateApplicationYml(ip, port = process.env.SERVER_PORT || '8083', frontPort = process.env.FRONT_WEB_PORT || '8082') {
  const ymlPath = path.join(__dirname, '..', 'src', 'main', 'resources', 'application.yml');
  
  const ymlContent = `server:
  port: ${port}
  servlet:
    context-path: /api

spring:
  datasource:
    url: jdbc:h2:mem:testdb
    driver-class-name: org.h2.Driver
    username: sa
    password: 
  jpa:
    hibernate:
      ddl-auto: create-drop
    show-sql: true
    properties:
      hibernate:
        format_sql: true
  h2:
    console:
      enabled: true
      path: /h2-console

# CORS 설정 - 자동 감지된 IP: ${ip}
cors:
  allowed-origins: 
    - "http://${ip}:${frontPort}"
    - "http://${ip}:19006"
    - "http://localhost:${frontPort}"
    - "http://localhost:19006"
  allowed-methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
  allowed-headers: ["*"]
  allow-credentials: true

logging:
  level:
    com.petmily.backend: DEBUG
    org.springframework.security: DEBUG
`;

  try {
    fs.writeFileSync(ymlPath, ymlContent);
    console.log(`✅ application.yml 업데이트 완료: ${ip}:${port}`);
    return true;
  } catch (error) {
    console.error('❌ application.yml 업데이트 실패:', error.message);
    return false;
  }
}

/**
 * 메인 실행 함수
 */
function main() {
  console.log('🔍 백엔드 네트워크 IP 자동 감지 중...');
  
  const detectedIP = detectLocalIP();
  
  if (detectedIP === 'localhost') {
    console.log('⚠️  로컬 IP를 찾을 수 없습니다. localhost를 사용합니다.');
  } else {
    console.log(`🎯 감지된 IP: ${detectedIP}`);
  }
  
  const targetPort = process.env.SERVER_PORT || '8083';
  const frontPort = process.env.FRONT_WEB_PORT || '8082';
  const success = updateApplicationYml(detectedIP, targetPort, frontPort);
  
  if (success) {
    console.log('🚀 이제 백엔드를 시작할 수 있습니다!');
    console.log('   ./gradlew bootRun');
  } else {
    process.exit(1);
  }
}

// 스크립트가 직접 실행된 경우에만 실행
if (require.main === module) {
  main();
}

module.exports = { detectLocalIP, updateApplicationYml };



