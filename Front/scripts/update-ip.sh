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

cat > "$ENV_FILE" << EOF
# 자동 생성된 파일 - 수동으로 편집하지 마세요
# 생성 시간: $(date)
# IP 주소는 자동으로 감지됩니다

EXPO_PUBLIC_API_HOST=$IP_ADDRESS
EXPO_PUBLIC_API_PORT=8080
EOF

echo "✅ .env.local 파일이 업데이트되었습니다"
echo "📡 API Base URL: http://$IP_ADDRESS:8080/api"
echo ""
echo "🚀 Expo를 재시작하세요: npm start"


