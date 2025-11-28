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

# JAVA_HOME 설정 (동적으로 찾기)
if [ -z "$JAVA_HOME" ]; then
    JAVA_HOME_PATH=$(/usr/libexec/java_home -v 17 2>/dev/null)
    if [ -n "$JAVA_HOME_PATH" ]; then
        export JAVA_HOME="$JAVA_HOME_PATH"
        echo "   - JAVA_HOME 자동 설정: $JAVA_HOME"
    else
        echo "   ⚠️  Java 17을 찾을 수 없습니다. JAVA_HOME을 수동으로 설정하세요."
        exit 1
    fi
else
    echo "   - JAVA_HOME 사용: $JAVA_HOME"
fi

# 백엔드 재빌드
echo "   - 백엔드 재빌드 중... (20초 소요)"
./gradlew clean build -x test --no-daemon --refresh-dependencies > /dev/null 2>&1

# 백엔드 시작
echo "   - 백엔드 서버 시작 중..."
./gradlew bootRun --no-daemon > backend.log 2>&1 &
BACKEND_PID=$!

# 백엔드 시작 대기 및 확인 (최대 30초, 2초마다 체크)
echo "   - 백엔드 시작 대기 중..."
MAX_WAIT=30
WAIT_COUNT=0
BACKEND_READY=false

while [ $WAIT_COUNT -lt $MAX_WAIT ]; do
    sleep 2
    WAIT_COUNT=$((WAIT_COUNT + 2))
    
    # 포트 확인
    if lsof -i :8083 > /dev/null 2>&1; then
        # API 엔드포인트 확인 (에러 응답이어도 서버가 실행 중임을 의미)
        if curl -s -f -o /dev/null http://localhost:8083/api/health 2>/dev/null || \
           curl -s http://localhost:8083/api/health 2>/dev/null | grep -q "status\|error\|Unauthorized" 2>/dev/null; then
            echo "   ✅ 백엔드가 정상적으로 시작되었습니다 (${WAIT_COUNT}초 소요)"
            BACKEND_READY=true
            break
        fi
    fi
    
    # 프로세스가 종료되었는지 확인
    if ! kill -0 $BACKEND_PID 2>/dev/null; then
        echo "   ❌ 백엔드 프로세스가 예기치 않게 종료되었습니다"
        echo "   📋 로그 확인: tail -50 Back/backend.log"
        BACKEND_READY=false
        break
    fi
done

if [ "$BACKEND_READY" = false ]; then
    echo "   ⚠️  백엔드 시작 확인 실패 (${MAX_WAIT}초 타임아웃)"
    echo "   📋 로그 확인: tail -50 Back/backend.log"
    echo "   💡 백엔드는 백그라운드에서 계속 실행 중일 수 있습니다. 로그를 확인하세요."
fi

# 2. 프론트엔드 시작
echo "프론트엔드 서버 시작 중..."
cd ../Front
npm run dev &
FRONTEND_PID=$!

# 3. 웹 프론트엔드 시작
echo "웹 프론트엔드 서버 시작 중..."
cd ../web
# node_modules가 없으면 설치
if [ ! -d "node_modules" ]; then
    echo "   - 의존성 설치 중..."
    npm install > /dev/null 2>&1
fi
# 환경 변수 설정
export NEXT_PUBLIC_API_BASE_URL="http://localhost:8083/api"
npm run dev &
WEB_PID=$!

echo ""
echo "개발 환경이 시작되었습니다!"
echo "   백엔드: http://localhost:8083/api"
echo "   프론트엔드 (모바일): http://localhost:8082"
echo "   웹 프론트엔드: http://localhost:3000"
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
    
    # 웹 프론트엔드 종료
    echo "   웹 프론트엔드 서버 종료 중..."
    if [ ! -z "$WEB_PID" ]; then
        kill $WEB_PID 2>/dev/null
    fi
    lsof -ti:3000 | xargs kill -9 2>/dev/null
    
    echo ""
    echo "✅ 종료 완료"
    exit 0
}

trap cleanup SIGINT SIGTERM

# 프로세스가 실행 중인 동안 대기
wait



