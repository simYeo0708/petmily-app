#!/bin/bash

# Mac의 현재 IP 주소를 자동으로 감지하고 .env 파일을 업데이트하는 스크립트

echo "🔍 현재 Mac의 IP 주소를 찾는 중..."

# Mac의 IP 주소 찾기
IP_ADDRESS=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | awk '{print $2}' | head -1)

if [ -z "$IP_ADDRESS" ]; then
    echo "❌ IP 주소를 찾을 수 없습니다."
    exit 1
fi

echo "✅ 감지된 IP 주소: $IP_ADDRESS"

# .env.local 파일 생성/업데이트
ENV_FILE="$(dirname "$0")/../.env.local"

# 기존 API 키 보존
EXISTING_API_KEY="your_kakao_map_api_key_here"
if [ -f "$ENV_FILE" ]; then
  EXISTING_API_KEY=$(grep "^EXPO_PUBLIC_KAKAO_MAP_API_KEY=" "$ENV_FILE" | cut -d'=' -f2- | tr -d '\n' || echo "your_kakao_map_api_key_here")
  if [ "$EXISTING_API_KEY" = "your_kakao_map_api_key_here" ] || [ -z "$EXISTING_API_KEY" ]; then
    EXISTING_API_KEY="your_kakao_map_api_key_here"
  fi
fi

cat > "$ENV_FILE" << EOF
# 자동 생성된 환경 변수
# IP 주소는 자동으로 감지됩니다
# Kakao Maps API 키는 수동으로 설정하세요: https://developers.kakao.com/

EXPO_PUBLIC_API_HOST=$IP_ADDRESS
EXPO_PUBLIC_API_PORT=${EXPO_PUBLIC_API_PORT:-8083}
EXPO_PUBLIC_KAKAO_MAP_API_KEY=$EXISTING_API_KEY
EOF

echo "✅ .env.local 파일이 업데이트되었습니다"
echo "📡 API Base URL: http://$IP_ADDRESS:${EXPO_PUBLIC_API_PORT:-8083}/api"
echo ""
echo "🚀 Expo를 재시작하세요: npm start"


