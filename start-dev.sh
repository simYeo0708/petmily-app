#!/bin/bash

# Petmily 개발 환경 통합 시작 스크립트
# 백엔드와 프론트엔드를 자동으로 시작합니다.

echo "Petmily 개발 환경 시작 중..."
echo "=================================="

# 현재 디렉토리 저장
ORIGINAL_DIR=$(pwd)

# 1. 백엔드 시작 (백그라운드)
echo "백엔드 서버 시작 중..."
cd Back
node scripts/start-backend.js &
BACKEND_PID=$!

# 백엔드 시작 대기 (10초)
echo "   백엔드 시작 대기 중... (10초)"
sleep 10

# 2. 프론트엔드 시작
echo "프론트엔드 서버 시작 중..."
cd ../Front
npm run dev &
FRONTEND_PID=$!

echo ""
echo "개발 환경이 시작되었습니다!"
echo "   백엔드: http://localhost:8083/api"
echo "   프론트엔드: http://localhost:8082"
echo ""
echo "종료하려면 Ctrl+C를 누르세요."

# 프로세스 종료 처리
cleanup() {
    echo ""
    echo "개발 환경 종료 중..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "종료 완료"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 프로세스가 실행 중인 동안 대기
wait



