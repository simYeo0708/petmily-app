# 🔐 iOS .entitlements 파일 가이드

## 📖 .entitlements 파일이란?

`.entitlements` 파일은 iOS 앱이 사용할 수 있는 **시스템 기능과 권한**을 명시적으로 선언하는 설정 파일입니다.

### 비유로 이해하기
- **Info.plist**: 사용자에게 보여주는 권한 요청 메시지 ("앱이 위치 정보를 사용하려고 합니다")
- **.entitlements**: Apple이 앱의 진짜 능력을 확인하는 내부 문서 ("이 앱은 위치 서비스를 사용할 수 있어요")

---

## 🎯 주요 역할

### 1. **시스템 기능 선언**
앱이 사용할 수 있는 iOS 시스템 기능을 Apple에 명시적으로 알림

### 2. **프레임워크 충돌 방지**
명시적인 선언으로 여러 프레임워크 간 클래스 충돌을 완화

### 3. **코드 서명 시 검증**
앱을 빌드할 때 Apple이 이 파일을 확인하여 앱의 권한이 유효한지 검증

### 4. **App Store 심사 기준**
App Store에 제출할 때 이 파일의 내용이 실제 사용하는 기능과 일치해야 함

---

## 📁 현재 Petmily.entitlements 파일 분석

```xml
<?xml version="1.0" encoding="UTF-8"?>
<plist version="1.0">
  <dict>
    <key>com.apple.developer.location-services</key>
    <array>
      <string>always</string>
      <string>when-in-use</string>
    </array>
  </dict>
</plist>
```

### 각 항목 설명

#### `com.apple.developer.location-services`
- **의미**: 위치 서비스 기능을 사용한다고 선언
- **필요한 이유**: Petmily 앱이 산책 경로 추적 기능을 사용하기 때문

#### `always`와 `when-in-use`
- **`when-in-use`**: 앱이 화면에 보일 때만 위치 정보 사용 (포그라운드)
- **`always`**: 앱이 백그라운드에 있어도 위치 정보 사용 가능

**Petmily 앱에서의 사용:**
- `when-in-use`: 사용자가 산책 화면을 보고 있을 때 위치 추적
- `always`: 백그라운드에서도 산책 경로를 계속 추적 (앱을 껐다 켜도 경로 유지)

---

## 🔍 Info.plist vs .entitlements 차이점

| 파일 | 역할 | 사용자 | 시점 |
|------|------|--------|------|
| **Info.plist** | 사용자에게 보여줄 권한 요청 메시지 | 일반 사용자 | 앱 실행 중 |
| **.entitlements** | Apple에게 앱의 실제 능력 선언 | Apple 시스템 | 빌드/심사 시 |

### 예시

**Info.plist** (사용자에게 보여지는 메시지):
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>산책 경로를 추적하기 위해 위치 권한이 필요합니다.</string>
```
→ 앱 실행 시: "Petmily가 위치 정보에 액세스하려고 합니다"

**.entitlements** (Apple에게 선언하는 내용):
```xml
<key>com.apple.developer.location-services</key>
<array>
  <string>when-in-use</string>
</array>
```
→ 빌드 시: "이 앱은 위치 서비스를 사용할 권리가 있어요"

---

## 🛠️ 일반적인 .entitlements 항목들

### 위치 서비스
```xml
<key>com.apple.developer.location-services</key>
<array>
  <string>when-in-use</string>
  <string>always</string>
</array>
```

### 푸시 알림
```xml
<key>aps-environment</key>
<string>development</string>
<!-- 또는 -->
<string>production</string>
```

### App Groups (앱 확장 간 데이터 공유)
```xml
<key>com.apple.security.application-groups</key>
<array>
  <string>group.com.petmily.app</string>
</array>
```

### Keychain Sharing
```xml
<key>keychain-access-groups</key>
<array>
  <string>$(AppIdentifierPrefix)com.petmily.app</string>
</array>
```

### Associated Domains (Universal Links)
```xml
<key>com.apple.developer.associated-domains</key>
<array>
  <string>applinks:petmily.com</string>
</array>
```

### Background Modes
```xml
<key>com.apple.developer.background-modes</key>
<array>
  <string>location</string>
  <string>fetch</string>
</array>
```

---

## ⚠️ 주의사항

### 1. **Xcode에서 자동 생성됨** ⚙️

Xcode의 **Capabilities** 탭을 사용하면 `.entitlements` 파일이 자동으로 생성되고 관리됩니다.

#### 📝 단계별 가이드

**1단계: Xcode에서 프로젝트 열기**
```
1. Front/ios/Petmily.xcworkspace 파일을 더블클릭하여 Xcode 열기
2. 또는 터미널에서: open Front/ios/Petmily.xcworkspace
```

**2단계: 프로젝트 설정 열기**
```
1. 왼쪽 네비게이터에서 최상단 프로젝트 파일(Petmily) 선택
2. 가운데 Targets 섹션에서 "Petmily" 타겟 선택
3. 상단 탭에서 "Signing & Capabilities" 선택
```

**3단계: Capability 추가**
```
1. "+ Capability" 버튼 클릭 (왼쪽 상단)
2. 원하는 기능 선택 (예: "Background Modes", "Push Notifications" 등)
3. 자동으로 .entitlements 파일에 추가됨
```

**4단계: Capability 설정**
```
예: Background Modes 추가 시
- "Background Modes" 체크박스 선택
- 하위 옵션 선택 (예: "Location updates", "Background fetch")
- 자동으로 .entitlements 파일에 반영됨
```

#### 🔍 실제 예시: 위치 서비스 추가

```
1. Xcode에서 프로젝트 열기
2. Signing & Capabilities 탭 선택
3. "+ Capability" 클릭
4. "Background Modes" 선택
5. "Location updates" 체크
6. 자동으로 .entitlements에 추가됨:

   <key>com.apple.developer.background-modes</key>
   <array>
     <string>location</string>
   </array>
```

#### ✅ Xcode 자동 관리의 장점

1. **자동 동기화**: Xcode가 .entitlements 파일을 자동으로 업데이트
2. **오타 방지**: 수동 편집 시 발생할 수 있는 오타 방지
3. **검증**: Xcode가 잘못된 설정을 사전에 검증
4. **UI 기반**: 코드를 직접 수정하지 않고 UI에서 관리

#### ⚠️ 수동 편집 시 주의사항

- Xcode에서 관리하는 기능을 수동으로 편집하면 Xcode가 다시 덮어쓸 수 있음
- 수동 편집 후 Xcode에서 Capabilities를 다시 열면 경고가 표시될 수 있음
- 가능하면 Xcode의 Capabilities 탭을 사용하는 것을 권장

---

### 2. **Bundle Identifier와 연결** 🔗

`.entitlements` 파일의 내용은 반드시 **Apple Developer Portal**의 **App ID** Capabilities와 일치해야 합니다.

#### 📝 연결 과정 이해하기

**비유로 이해하기:**
```
.entitlements 파일 = 내가 쓴 숙제 (로컬 파일)
Apple Developer Portal = 선생님이 확인하는 숙제 (Apple 서버)

→ 둘이 일치해야 통과!
```

#### 🔄 전체 흐름

```
1. Apple Developer Portal
   ↓
   App ID 생성 (com.petmily.app)
   ↓
   Capabilities 활성화 (위치 서비스)
   ↓
2. Xcode 프로젝트
   ↓
   .entitlements 파일에 동일한 Capabilities 선언
   ↓
3. 빌드 시
   ↓
   Apple이 두 곳을 비교하여 일치하는지 확인
```

#### 📋 단계별 설정 가이드

**A. Apple Developer Portal에서 설정**

```
1. https://developer.apple.com 접속
2. Account 탭 → Certificates, Identifiers & Profiles
3. Identifiers 섹션에서 App ID 선택
4. 해당 App ID (com.petmily.app) 선택
5. Capabilities 섹션에서 필요한 기능 활성화
   - Location Services ✅
   - Background Modes ✅
   - Push Notifications ✅ (필요시)
6. Save 클릭
```

**B. Xcode에서 확인**

```
1. Xcode → Signing & Capabilities 탭
2. Xcode가 자동으로 Developer Portal과 동기화
3. 동기화 실패 시:
   - "Automatically manage signing" 체크 확인
   - Team 선택 확인
   - Bundle Identifier가 일치하는지 확인
```

#### ⚠️ 불일치 시 발생하는 문제

```
❌ 문제 예시:
- Developer Portal: 위치 서비스 활성화 ✅
- .entitlements: 위치 서비스 없음 ❌
→ 결과: 빌드 실패 또는 런타임 에러

❌ 문제 예시:
- Developer Portal: 위치 서비스 없음 ❌
- .entitlements: 위치 서비스 있음 ✅
→ 결과: 빌드 시 "Entitlements not supported" 에러
```

---

### 3. **프로비저닝 프로파일 필요** 📜

`.entitlements`에 선언한 기능은 **프로비저닝 프로파일(Provisioning Profile)**에도 포함되어야 합니다.

#### 📖 프로비저닝 프로파일이란?

**비유로 이해하기:**
```
프로비저닝 프로파일 = 앱을 실제 디바이스에서 실행할 수 있는 "출입증"
.entitlements = 출입증에 적힌 "권한 목록"

→ 출입증(프로파일)에 권한(entitlements)이 명시되어 있어야 앱이 동작함
```

**역할:**
- 앱을 실제 iOS 디바이스에서 실행할 수 있게 해주는 인증서
- 특정 디바이스, 특정 개발자, 특정 기능 권한을 포함

#### 🔄 프로비저닝 프로파일 생성 과정

**자동 모드 (Xcode가 자동으로 처리):**

```
1. Xcode에서 "Automatically manage signing" 체크 ✅
   ↓
2. Xcode가 자동으로:
   - Developer Portal의 App ID 확인
   - .entitlements 파일 확인
   - 필요한 Capabilities 확인
   ↓
3. 자동으로 프로비저닝 프로파일 생성/업데이트
   - 포함된 Capabilities: .entitlements와 동일
   - 디바이스 등록: 연결된 디바이스 자동 추가
   ↓
4. 빌드 시 자동으로 사용
```

**수동 모드 (직접 관리):**

```
1. Apple Developer Portal에서 수동으로 생성:
   - Certificates, Identifiers & Profiles → Profiles
   - "+" 버튼 클릭
   - Development 또는 Distribution 선택
   - App ID 선택 (com.petmily.app)
   - Certificates 선택
   - Devices 선택
   ↓
2. 프로파일 다운로드
   ↓
3. Xcode에서 수동으로 설정:
   - Signing & Capabilities 탭
   - "Automatically manage signing" 체크 해제
   - Provisioning Profile 드롭다운에서 선택
```

#### 🔍 프로비저닝 프로파일 확인 방법

**Xcode에서 확인:**

```
1. Signing & Capabilities 탭 열기
2. "Provisioning Profile" 섹션 확인
3. 프로파일 이름 클릭하면 상세 정보 확인 가능:
   - App ID: com.petmily.app
   - Capabilities: Location Services, Background Modes
   - Devices: 등록된 디바이스 목록
```

**터미널에서 확인:**

```bash
# 프로파일 위치 확인
security find-identity -v -p codesigning

# 프로파일 내용 확인 (예시)
cat ~/Library/MobileDevice/Provisioning\ Profiles/*.mobileprovision
```

#### ⚠️ 프로파일과 .entitlements 불일치 시

```
❌ 문제 상황:
프로비저닝 프로파일: 위치 서비스 없음
.entitlements: 위치 서비스 있음

→ 빌드 시 에러:
"Entitlement 'com.apple.developer.location-services' 
is not supported in provisioning profile"
```

**해결 방법:**

```
1. Xcode 자동 모드:
   - "Automatically manage signing" 체크
   - Xcode가 자동으로 프로파일 업데이트

2. 수동 모드:
   - Developer Portal에서 프로파일 삭제
   - 새로 생성 (Capabilities 포함)
   - Xcode에서 새 프로파일 선택
```

#### ✅ 권장 사항

**자동 모드 사용 (권장):**
- ✅ Xcode가 모든 것을 자동으로 관리
- ✅ .entitlements 변경 시 자동으로 프로파일 업데이트
- ✅ 개발 중에는 가장 편리한 방법

**수동 모드 사용 (고급):**
- ⚠️ 엔터프라이즈 배포 시
- ⚠️ 특정 프로파일 관리가 필요한 경우
- ⚠️ CI/CD 파이프라인 구축 시

---

### 4. **Info.plist와의 관계** 📋

`.entitlements`와 `Info.plist`는 서로 다른 역할을 하지만 함께 작동해야 합니다.

#### 🔄 역할 비교

| 항목 | .entitlements | Info.plist |
|------|---------------|------------|
| **대상** | Apple 시스템 | 일반 사용자 |
| **시점** | 빌드/심사 시 | 앱 실행 중 |
| **내용** | "무엇을 사용할 수 있나?" | "왜 필요한가?" |
| **형식** | XML (플리스트) | XML (플리스트) |
| **필수** | 기능 사용 시 필수 | 권한 요청 시 필수 |

#### 📝 실제 예시: 위치 서비스

**`.entitlements` 파일:**
```xml
<key>com.apple.developer.location-services</key>
<array>
  <string>always</string>
  <string>when-in-use</string>
</array>
```
→ Apple에게: "이 앱은 위치 서비스를 사용할 권리가 있어요"

**`Info.plist` 파일:**
```xml
<key>NSLocationWhenInUseUsageDescription</key>
<string>산책 경로를 추적하기 위해 위치 권한이 필요합니다.</string>

<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>백그라운드에서도 산책 경로를 추적하기 위해 위치 권한이 필요합니다.</string>
```
→ 사용자에게: "왜 위치 정보가 필요한지 설명"

#### 🔗 함께 작동하는 과정

```
1. 앱 빌드 시:
   .entitlements 확인 → "위치 서비스 사용 권한 있음" ✅
   ↓
2. 앱 실행 시:
   위치 정보 사용 시도
   ↓
3. iOS 시스템:
   Info.plist 확인 → 사용자에게 메시지 표시
   "산책 경로를 추적하기 위해 위치 권한이 필요합니다."
   ↓
4. 사용자 승인:
   권한 부여 → 앱이 위치 정보 사용 가능
```

#### ⚠️ 둘 다 필요합니다!

```
❌ .entitlements만 있고 Info.plist 없음:
→ 빌드는 성공하지만 앱 실행 시 크래시
→ iOS가 사용자에게 권한 요청 메시지를 보여줄 수 없음

❌ Info.plist만 있고 .entitlements 없음:
→ 빌드 시 에러 발생
→ Apple이 해당 기능을 사용할 권리가 없다고 판단
```

#### ✅ 완전한 설정 예시

**위치 서비스를 위한 완전한 설정:**

1. **Apple Developer Portal**
   - App ID의 Capabilities에서 Location Services 활성화

2. **`.entitlements`**
   ```xml
   <key>com.apple.developer.location-services</key>
   <array>
     <string>always</string>
     <string>when-in-use</string>
   </array>
   ```

3. **`Info.plist`**
   ```xml
   <key>NSLocationWhenInUseUsageDescription</key>
   <string>산책 경로를 추적하기 위해 위치 권한이 필요합니다.</string>
   
   <key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
   <string>백그라운드에서도 산책 경로를 추적하기 위해 위치 권한이 필요합니다.</string>
   ```

4. **프로비저닝 프로파일**
   - Location Services Capability 포함

→ 이렇게 모두 설정되어야 위치 서비스가 정상 작동합니다!

---

## 🎯 Petmily 앱에서 .entitlements가 해결한 문제

### 문제: 중복 클래스 경고
```
Class XXX is implemented in both Xcode framework and React Native framework
```

### 해결: 명시적 선언
- `.entitlements` 파일에 위치 서비스 권한을 명시적으로 선언
- Apple 시스템이 앱의 구조를 더 명확히 파악
- 프레임워크 간 클래스 충돌 완화

**왜 도움이 되는가?**
- 명시적인 선언 → 시스템이 앱의 의도를 명확히 이해
- 프레임워크 충돌 → 시스템이 각 프레임워크의 역할을 구분
- 코드 서명 검증 → Apple이 앱의 권한을 정확히 검증

---

## 📝 요약

### .entitlements 파일은...

1. ✅ **Apple에게 앱의 능력을 선언하는 문서**
   - "이 앱은 위치 서비스를 사용할 수 있어요"

2. ✅ **빌드 시 검증되는 권한 설정**
   - 실제 사용하는 기능과 일치해야 함

3. ✅ **프레임워크 충돌 완화**
   - 명시적 선언으로 시스템이 앱 구조를 명확히 이해

4. ✅ **App Store 심사 기준**
   - 선언한 기능과 실제 구현이 일치해야 함

### 현재 Petmily.entitlements는...

- 위치 서비스(`always`, `when-in-use`) 선언
- 산책 경로 추적 기능을 위한 필수 설정
- 중복 클래스 경고 문제 완화에 도움

---

## 🔗 관련 파일

- **Info.plist**: 사용자에게 보여지는 권한 요청 메시지
- **App ID (Developer Portal)**: Apple Developer Portal에서 설정한 앱의 Capabilities
- **Provisioning Profile**: 실제 디바이스에서 실행하기 위한 프로파일

---

## 💡 참고 자료

- [Apple Developer Documentation - Entitlements](https://developer.apple.com/documentation/bundleresources/entitlements)
- [Xcode Capabilities Guide](https://developer.apple.com/documentation/xcode/managing-capabilities)

