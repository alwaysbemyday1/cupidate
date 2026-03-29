# Cupidate Design System

Last Updated: 2026-03-29

## 1. Source of Truth
- Prototype folder: `docs/design/`
- Reference images:
  - `docs/design/pt_home_network_260329.png`
  - `docs/design/pt_info_260329.png`
  - `docs/design/pt_matching_260329.png`

## 2. Fidelity Target
- 목표는 프로토타입을 픽셀 단위로 복사하는 것이 아니다.
- 목표는 `같은 인상`, `같은 정보 구조`, `같은 버튼 감각`, `같은 16-bit 레트로 픽셀 톤`을 React Native 안에서 재현하는 것이다.
- 화면 배경 아트나 장식은 상황에 맞게 단순화할 수 있지만, 아래 요소는 반드시 유지한다.
  - 네이비 기반 셸
  - 베이지 본문 패널
  - 검은 픽셀 보더
  - 하드 픽셀 그림자
  - 핑크/네이비 CTA 구조
  - 하단 고정 4탭

## 3. Non-Negotiables
- `borderRadius: 0`
- `shadow*`, `elevation` 금지
- 모든 주요 카드/버튼/탭은 `PixelBox` 계열 하드 섀도우 사용
- 모든 사용자 노출 텍스트는 `PixelText` 또는 i18n key 기반 문자열만 사용
- 리빌드 중인 화면에서는 하드코딩된 영문/한글 카피를 직접 JSX 안에 두지 않는다
- 빈 상태 / 로딩 / 오류 상태도 같은 픽셀 컴포넌트 체계를 사용한다

## 4. React Native Implementation Rules
### 4.1 Hard Pixel Shadow
- RN 기본 그림자는 부드러워서 금지한다.
- `View`를 2겹으로 쌓아서 그림자를 만든다.
- 바깥 레이어:
  - `backgroundColor: #000`
  - `paddingRight: 3~4`
  - `paddingBottom: 3~4`
- 안쪽 레이어:
  - `borderWidth: 2`
  - `borderColor: #000`
  - `backgroundColor: #F4E8D1` 또는 역할 색상

### 4.2 Font
- 기본 폰트 후보:
  - `DungGeunMo`
  - `Galmuri`
  - fallback alias: `PixelFont`
- 모든 텍스트는 `PixelText`를 통해 렌더링한다.
- 실제 폰트 로딩은 프로젝트 설정에서 해결하고, 화면 컴포넌트는 `fontFamily: 'PixelFont'`를 기준으로 사용한다.

### 4.3 Navigation
- 현재 단계의 목표는 `UI 재현`이다.
- 따라서 하단 탭은 `react-navigation` 기본 탭보다 커스텀 `PixelTabBar`를 우선한다.
- 구조:
  - `position: 'absolute'`
  - `bottom: 0`
  - `HOME / MATCH / NETWORK / MY INFO`

### 4.4 Safe Area
- 루트는 `react-native-safe-area-context`를 사용한다.
- `SafeAreaView` deprecation warning이 남지 않도록 RN 기본 `SafeAreaView`는 신규 리빌드 코드에서 사용하지 않는다.

## 5. Color System
### 5.1 Core Colors
- `bg.navy.900 = #1F2A44`
- `bg.navy.700 = #2A3C66`
- `ui.blue.500 = #4A76A8`
- `ui.navy.500 = #3B5998`
- `surface.base = #F4E8D1`
- `surface.alt = #EADBC2`
- `brand.pink.500 = #D84C73`
- `brand.pink.700 = #BC3D62`
- `accent.gold = #E8B649`
- `state.success = #6FAE63`
- `state.warning = #D8B46A`
- `state.danger = #B8576F`
- `ink.primary = #111111`
- `ink.inverse = #FFFFFF`
- `shadow.pixel = #000000`

### 5.2 Role Mapping
- 매칭 / 감정 / 핵심 CTA: 핑크
- 기본 조작 / 보조 버튼 / 시스템성 액션: 블루 또는 네이비
- 헤더 / 탭 / 프레임: 딥 네이비
- 본문 패널 / 카드: 베이지

## 6. Layout Tokens
- spacing:
  - `4 / 8 / 12 / 16 / 20 / 24`
- border:
  - `1 / 2 / 3`
- pixel shadow offset:
  - `4`
- shell:
  - header `56`
  - tab bar `64~76`
- avatar:
  - `32 / 48 / 96`

## 7. Component Contracts
### `PixelText`
- variants:
  - `screenTitle`
  - `sectionTitle`
  - `body`
  - `label`
  - `caption`
  - `button`

### `PixelBox`
- 카드/패널/상태 박스의 기본 컨테이너
- radius 없음
- 하드 그림자 필수

### `PixelButton`
- 베벨형 버튼
- variants:
  - `primary`
  - `secondary`
  - `success`
  - `warning`
  - `danger`
  - `neutral`
- `pressed` 상태에서 살짝 눌리는 느낌 필요

### `PixelTabBar`
- 4등분 고정 탭
- active 탭은 배경색과 텍스트 색으로 강하게 구분
- inactive 탭도 눌리는 버튼처럼 보여야 함

## 8. i18n Rules
### 8.1 Scope
- 지원 언어: `en`, `ko`
- 현재 단계에서 우선 완성할 화면:
  - `My`
  - `Home`
  - `Auth`
- `Network`는 리빌드 완료 기준으로 같은 체계에 포함한다.
- `Matching`은 리빌드 완료 기준으로 같은 체계에 포함한다.

### 8.2 Implementation Policy
- 번역은 key 기반으로 관리한다.
- 리빌드된 화면에서 다음은 금지:
  - JSX 안에 직접 박힌 영문/한글 문구
  - locale 분기 하드코딩
- 허용 방식:
  - `useI18n()`
  - `t('key')`
  - `t('key', { value })`

### 8.3 Language Setting UX
- 언어 전환은 `My` 화면에서 수행한다.
- 변경 즉시 앱 헤더, 탭 라벨, My/Home/Auth/Network/Matching 카피에 반영되어야 한다.
- MVP 단계에서는 세션 내 상태로 관리해도 된다.
- 후속 단계에서 사용자 계정 또는 로컬 스토리지에 영속화한다.

### 8.4 Copy Rules
- 브랜드명 `Cupidate`는 번역하지 않는다.
- 뷰 이름, 버튼, 설명, 오류/성공 메시지는 번역한다.
- 추천 카드나 알림처럼 데이터 기반 텍스트도 key + param 방식으로 만든다.

## 9. Screen Structure Rules
### Home
- 순서:
  - `Alarm Feed`
  - `Today's Rec's`
  - `Recent Summary`
  - `Quick Actions`
- 추천 카드는 2열 카드형
- 요약은 숫자 인지가 빠르게 보여야 한다

### Network
- 상단은 `MASTER CUPID + Network Board + Match Proposal + Legend` 구조가 먼저 보인다
- 하단은 `My Cupidates / Connected Cupids` 세그먼트 아래에서 관리 액션이 이어진다
- 리스트보다 관계 구조와 상태 인지성이 우선이다
- 상태는 색 + 텍스트 + 배지 조합으로 표현한다

### Matching
- 순서:
  - `Matching Manager`
  - `Pending Match Requests`
  - `User Suggested Matches`
  - `Matching Insights`
- 요청 카드는 양측 미니 프로필, 점수, 상태, 취미 근거를 한 카드 안에서 읽을 수 있어야 한다
- 인사이트는 `점수 분해`, `타임라인`, `피드백 요약`이 한 흐름으로 이어져야 한다
- 승인/거절/연락처 공유 액션은 현재 상태에 따라 한 번에 이해되도록 바뀌어야 한다

### My
- 순서:
  - `Profile Overview`
  - `Account Details`
  - `Language Settings`
  - `Matching Preferences`
  - `Account Summary`
- 언어 설정은 즉시 반영형 UI여야 한다

### Auth
- 단일 로그인 폼이 아니라:
  - 안내 카드
  - 입력 카드
  - 세션 상태 카드
  구조로 나눈다
- 잠금 해제용 관문 화면처럼 보여야 한다

## 10. QA Checklist
- 그림자가 블러 없이 딱딱한가
- 버튼이 평면이 아니라 눌리는 박스처럼 보이는가
- 탭바가 하단에 안정적으로 고정되는가
- 영어/한국어 전환 시 잘린 문구가 없는가
- 리빌드된 화면들 사이에서 톤이 흔들리지 않는가
- prototype와 비교했을 때 “같은 앱 계열”로 느껴지는가

## 11. Current Rebuild Order
1. D1 공용 프리미티브
2. D2 My
3. D3 Home
4. D4 Network
5. D5 Matching
6. D6 Integration hardening

## 12. Rebuild Status
- `D1` 완료: 공용 픽셀 프리미티브
- `D2` 완료: My
- `D3` 완료: Home
- `D4` 완료: Network
- `D5` 완료: Matching
- 현재 포커스: `D6 Integration hardening`
