#!/bin/bash

echo "=================================="
echo "백엔드 서버 완전 재시작 중..."
echo "=================================="
echo ""

# 1. 모든 Gradle/Java 프로세스 종료
echo "1️⃣  기존 백엔드 프로세스 종료 중..."
pkill -9 -f "gradle" 2>/dev/null
pkill -9 -f "java.*petmily" 2>/dev/null
lsof -ti:8083 | xargs kill -9 2>/dev/null
echo "   ✅ 기존 프로세스 종료 완료"
echo ""

# 2. 캐시 폴더 완전 삭제
echo "2️⃣  빌드 캐시 및 Gradle 캐시 삭제 중..."
cd "$(dirname "$0")"
rm -rf build/ .gradle/ ~/.gradle/caches/
echo "   ✅ 캐시 삭제 완료"
echo ""

# 3. JAVA_HOME 설정
echo "3️⃣  JAVA_HOME 설정 중..."
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home
echo "   ✅ JAVA_HOME: $JAVA_HOME"
echo ""

# 4. 완전히 새로 빌드
echo "4️⃣  백엔드 프로젝트 새로 빌드 중..."
echo "   (시간이 다소 소요될 수 있습니다)"
./gradlew clean build --no-daemon --refresh-dependencies -x test

if [ $? -ne 0 ]; then
    echo ""
    echo "=================================="
    echo "❌ 빌드 실패"
    echo "=================================="
    echo "로그를 확인하세요."
    exit 1
fi

echo "   ✅ 빌드 성공"
echo ""

# 5. 백엔드 실행 (포그라운드)
echo "5️⃣  백엔드 서버 실행 중..."
echo ""
echo "=================================="
echo "✅ 백엔드 서버 시작!"
echo "=================================="
echo ""
echo "📱 접속 정보:"
echo "   백엔드 API: http://localhost:8083/api"
echo "   H2 콘솔: http://localhost:8083/api/h2-console"
echo ""
echo "🛑 종료: Ctrl+C"
echo ""
echo "=================================="
echo ""

./gradlew bootRun --no-daemon

echo ""
echo "=================================="
echo "백엔드 서버 종료됨"
echo "=================================="
