# Kakao 지도 기능 구현 메모

## 1. 지금까지 완료한 작업

| 구분 | 상세 내용 |
| --- | --- |
| 지도 렌더링 | Kakao SDK 초기화, API 키 전달, ATS 예외 허용, iOS Dev Client 재빌드 흐름 확립 |
| Swift ↔ React Native 브리지 | `KakaoMapViewManager`에 `apiKey`, `latitude`, `longitude`, `zoomLevel` props 노출 |
| 디버깅 로그 | `KakaoMapView.swift`에 카메라 좌표/엔진 상태 로그 추가 |
| 좌표 초기값 가드 | `WalkingMapScreen`에서 한국 범위 이탈 시 기본 좌표(서울)로 fallback |
| 실험 기록 | `Front/KakaoMapDebugLog.md`에 문제 해결 과정 정리 |

## 2. 남아 있는 TODO / 고려 사항

1. **사용자 위치 트래킹**
   - TrackingManager(`mapView.getTrackingManager()`) 래핑
   - POI 생성 (`LabelLayer`, `PoiOptions`) 및 현위치 아이콘 스타일 정의
   - Expo Location → KakaoMap 좌표 변환 및 주기적 업데이트
   - 트래킹 시작/중지에 대한 JS → Swift 명령 API 설계

2. **경로(Polyline) 그리기**
   - Kakao SDK의 Polyline/Shape API 확인 (예: `ShapeManager`, `MapPolyline`, `PolylineLayerOptions` 등)
   - 위치 히스토리를 기반으로 Path 생성/갱신하는 로직 설계
   - 성능 및 메모리 관리: 경로가 길어질 때 pruning, 최대 길이 지정 등

3. **사용자 제스처 제어**
   - Default는 활성화돼 있으나, 필요 시 `gestureManager` 관련 API 확인하여 특정 제스처를 켜고 끄는 방법 정리

4. **테스트/디버깅 환경**
   - Kakao SDK 샘플 프로젝트에서 Tracking & Polyline 구현 예제 확인
   - 시뮬레이터 위치를 한국으로 맞추는 워크플로우 문서화

5. **UI/UX 관련 추가 요청**
   - 워커 리스트 탭 UI/기능 구현
   - 전체 탭 화면의 SafeArea(상단 배터리·시간 표시 영역) 레이아웃 개선
   - 워커 상세 페이지 디자인 및 구현
   - 사용자 현재 위치를 실시간으로 조회·갱신하는 로직 구현 (Expo Location 권한, 주기적 업데이트, 오류 처리)

## 3. 참고로 가져올 샘플/자료

| 필요 자료 | 용도 |
| --- | --- |
| Kakao Maps SDK iOS 공식 샘플 (TrackingManager, Polyline) | Swift 구현 패턴 및 API 사용 예시 |
| Kakao SDK 헤더 파일 (Pods) | 정확한 클래스/메서드 시그니처 확인 |
| 기존 React Native 연동 사례 (예: GitHub 등) | 네이티브 명령 브리지 구현 참고 |
| Expo Location 샘플 | 위치 업데이트 주기/백그라운드 처리 참고 |

## 4. 다음 단계 제안

1. Kakao SDK 폴더(Pods)에서 Tracking/Polyline 관련 헤더를 조사 → 필요한 메서드 목록 작성  
2. Swift `KakaoMapView`에 Tracking/Polyline 관리용 메서드 추가 → `KakaoMapViewManager`에서 명령 노출  
3. React Native 측에서 위치 업데이트 로직과 지도 브리지 호출 흐름 설계 (hook 또는 context)  
4. 실제 디버깅을 위해 샘플 좌표 데이터를 이용해 Polyline 테스트 → 안정화  
5. 최종적으로 실시간 위치 추적과 경로 그리기가 동작하는지 통합 테스트  

> 위 항목이 모두 준비되면, 다음 개발 라운드에서 구현을 시작할 수 있습니다.

