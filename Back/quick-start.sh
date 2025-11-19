#!/bin/bash

echo "=================================="
echo "백엔드 빠른 시작"
echo "=================================="

# JAVA_HOME 설정
export JAVA_HOME=/Library/Java/JavaVirtualMachines/jdk-17.jdk/Contents/Home

# 기존 프로세스 종료
echo "기존 프로세스 종료 중..."
pkill -9 -f "gradle" 2>/dev/null
pkill -9 -f "java.*petmily" 2>/dev/null
lsof -ti:8083 | xargs kill -9 2>/dev/null
sleep 2

# 백엔드 실행
echo "백엔드 실행 중..."
cd "$(dirname "$0")"
./gradlew bootRun --no-daemon

