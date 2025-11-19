#!/bin/bash

# Petmily 개발 환경 통합 시작 스크립트
# 백엔드와 프론트엔드를 자동으로 시작합니다.

echo "Petmily 개발 환경 시작 중..."
echo "=================================="

# 현재 디렉토리 저장
ORIGINAL_DIR=$(pwd)

# 1. 백엔드 준비 및 시작 (백그라운드)
echo "백엔드 준비 중..."
cd Back

# 기존 프로세스 정리
echo "   - 기존 프로세스 정리 중..."
pkill -9 -f "gradle" 2>/dev/null
pkill -9 -f "java.*petmily" 2>/dev/null
lsof -ti:8083 | xargs kill -9 2>/dev/null
sleep 1

# 빌드 캐시 삭제
echo "   - 빌드 캐시 삭제 중..."
rm -rf build/ .gradle/
sleep 1

# JAVA_HOME 설정
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home

# 백엔드 재빌드
echo "   - 백엔드 재빌드 중... (20초 소요)"
./gradlew clean build -x test --no-daemon --refresh-dependencies > /dev/null 2>&1

# 백엔드 시작
echo "   - 백엔드 서버 시작 중..."
./gradlew bootRun --no-daemon > backend.log 2>&1 &
BACKEND_PID=$!

# 백엔드 시작 대기 (15초)
echo "   - 백엔드 시작 대기 중... (15초)"
sleep 15

# 백엔드 상태 확인
if lsof -i :8083 > /dev/null 2>&1; then
    echo "   ✅ 백엔드가 포트 8083에서 실행 중입니다"
else
    echo "   ⚠️  백엔드 시작 확인 실패. 로그를 확인하세요: Back/backend.log"
fi

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
    echo "=================================="
    echo "개발 환경 종료 중..."
    echo "=================================="
    
    # 백엔드 종료
    echo "   백엔드 서버 종료 중..."
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
    fi
    pkill -9 -f "gradle" 2>/dev/null
    pkill -9 -f "java.*petmily" 2>/dev/null
    lsof -ti:8083 | xargs kill -9 2>/dev/null
    
    # 프론트엔드 종료
    echo "   프론트엔드 서버 종료 중..."
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
    fi
    lsof -ti:8081 | xargs kill -9 2>/dev/null
    
    echo ""
    echo "✅ 종료 완료"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 프로세스가 실행 중인 동안 대기
wait



