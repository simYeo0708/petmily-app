#!/usr/bin/env node

const path = require('path');

const { detectLocalIP, updateApplicationYml } = require('../Back/scripts/auto-detect-ip');
const { updateEnvFile } = require('../Front/scripts/auto-detect-ip');

function main() {
  const apiPort = process.env.SERVER_PORT || '8083';
  const frontPort = process.env.FRONT_WEB_PORT || '8082';
  const manualIp = process.env.DEV_IP || process.argv[2];

  console.log('🔄 개발 환경 IP/포트 동기화 중...');

  const ip = manualIp || detectLocalIP();
  console.log(`📍 사용할 IP: ${ip}`);

  const frontUpdated = updateEnvFile(ip, apiPort);
  const backUpdated = updateApplicationYml(ip, apiPort, frontPort);

  if (frontUpdated && backUpdated) {
    console.log(`✅ 프런트(.env.local)와 백엔드(application.yml)가 ${ip} 기준으로 업데이트되었습니다.`);
    console.log(`   - API 포트: ${apiPort}`);
    console.log(`   - 프런트 웹 포트: ${frontPort}`);
  } else {
    console.error('❌ 일부 파일이 업데이트되지 않았습니다. 위 로그를 확인하세요.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

