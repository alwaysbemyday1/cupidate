# Cupidate Design System

Last Updated: 2026-03-29
Prototype Folder:
- `docs/design/`

Reference Prototype Files:
- `docs/design/pt_home_network_260329.png`
- `docs/design/pt_info_260329.png`
- `docs/design/pt_matching_260329.png`

## 1) Purpose of This Document
이 문서는 "비슷한 무드"가 아니라, 제공된 프로토타입과 최대한 같은 인상의 React Native 화면을 만들기 위한 기준 문서다.

중요 원칙:
- 이 문서는 프로토타입을 픽셀 단위로 그대로 복사하기 위한 문서가 아니다.
- 목표는 `같은 인상`, `같은 계열의 시각 언어`, `같은 수준의 정보 밀도와 버튼/패널 감각`을 재현하는 것이다.
- 실제 모바일 앱 제약, Safe Area, RN 렌더링 차이, 데이터 구조 차이 때문에 1:1 복제보다 "높은 유사도의 재해석"이 올바른 방향이다.

목표:
- 색감, 폰트, 그림자, 버튼, 여백, 탭 구조를 프로토타입 수준으로 고정
- React Native 기본 그림자/폰트/네비게이션이 레트로 감각을 깨지 않도록 사전 차단
- 이후 어떤 에이전트가 작업해도 같은 시각 언어를 유지

## 2) Reference Analysis
프로토타입 전반에서 반복되는 핵심 패턴:
- 스마트폰 화면 내부는 `딥 네이비 헤더 + 베이지 본문 패널 + 하단 고정 탭바` 구조다.
- 모든 카드와 패널은 각진 모서리, 검은 외곽선, 하드한 그림자를 가진다.
- 버튼은 평면 박스가 아니라 "픽셀 베벨 버튼"처럼 상단 하이라이트와 하단 음영이 있다.
- 텍스트는 일반 앱 타이포가 아니라 픽셀 게임 UI 같은 강한 밀도와 무게감을 가진다.
- 상태는 색상만으로 처리하지 않고 아이콘, 텍스트, 위치까지 같이 사용한다.

화면별 시각 성격:
- Home: 알림 보드, 추천 카드, 요약 카드가 순서대로 쌓이는 대시보드
- Network: 프로필 노드와 연결선이 중심인 관계도 보드
- Matching: 승인/거절 액션과 점수 근거를 함께 보여주는 판정 센터
- My: 프로필/계정/선호도가 수직 섹션으로 정리된 설정 콘솔

중요 해석:
- 프로토타입 바깥의 파란 배경은 외부 연출에 가깝다. 실제 앱 구현에서 중요한 것은 내부 패널/헤더/버튼/탭바다.
- 프로토타입 사이에 끼워진 파란 통계 패널과 범례 패널은 참고용 콜아웃 성격이 강하다. 1차 구현에서는 화면 내부 UI 복제에 집중한다.
- 따라서 구현 판단이 갈릴 때는 "스크린샷 복사"보다 "동일한 인상과 사용감 유지"를 우선한다.

## 3) React Native Implementation Directives
### 3.1 Hard Pixel Shadow
React Native의 `shadowColor`, `shadowOpacity`, `shadowRadius`, `elevation`은 기본적으로 부드러운 그림자를 만든다. 프로토타입과 같은 레트로 픽셀 감성에는 부적합하다.

필수 규칙:
- 주요 UI 박스에 `shadow*` 계열과 `elevation`을 사용하지 않는다.
- `View` 2개를 겹쳐서 하드 그림자를 만든다.
- 바깥 Wrapper는 검은색 또는 짙은 그림자색 배경을 가지며 우하단 오프셋을 담당한다.
- 안쪽 Wrapper가 실제 배경색과 콘텐츠를 가진다.

권장 구조:
- Outer Shadow Layer
  - `backgroundColor: #000000`
  - `paddingRight: 3~4`
  - `paddingBottom: 3~4`
- Inner Content Layer
  - `borderWidth: 2`
  - `borderColor: #000000`
  - `borderRadius: 0`

### 3.2 Pixel Font
기본 `Text`에 직접 `fontFamily`를 흩뿌리지 않는다. 모든 텍스트는 `PixelText` 래퍼로 통일한다.

권장 폰트:
- `DungGeunMo`
- `Galmuri`
- fallback alias: `PixelFont`

실제 적용 지침:
- Expo/React Native에서는 폰트를 asset으로 포함하고 로드해야 한다.
- bare RN이라면 `ios/Info.plist`와 Android font asset 경로 설정이 필요하다.
- 코드에는 `fontFamily: 'PixelFont'` 같은 추상 이름을 쓰고, 실제 프로젝트 설정에서 이 이름에 대응하는 `.ttf`를 연결한다.

### 3.3 Bottom Navigation
최종 앱에서 `react-navigation` Bottom Tabs를 쓰더라도, 현재 목표는 "화면 UI를 그대로 재현하는 것"이다.

우선 구현 원칙:
- 하단 탭은 커스텀 뷰로 직접 만든다.
- `position: 'absolute'`, `bottom: 0`, `left: 0`, `right: 0`
- 탭은 4개 고정: `HOME / MATCHING / NETWORK / MY INFO`
- 각 탭은 텍스트만이 아니라 픽셀 아이콘과 개별 배경 셀을 가진다.

## 4) Visual DNA
- 헤더는 딥 네이비 바탕, 중앙 정렬 타이틀, 강조 단어는 골드 또는 핑크
- 본문은 연한 베이지/크림 박스가 수직으로 정렬되는 구조
- 섹션 제목은 큼직하고 검은색이며 좌측 정렬
- 카드 간 간격은 넓지 않고 촘촘하다
- 정보 밀도는 높되 정렬선은 매우 안정적이어야 한다

## 5) Color System
### 5.1 Canonical Colors
Base:
- `bg.navy.900 = #1F2A44`
- `bg.navy.700 = #2A3C66`
- `bg.navy.500 = #3B5998`
- `surface.base = #F4E8D1`
- `surface.alt = #EADBC2`
- `ink.primary = #000000`
- `ink.inverse = #FFFFFF`

Accent:
- `brand.pink.500 = #D84C73`
- `brand.pink.700 = #BC3D62`
- `brand.blue.500 = #4A76A8`
- `brand.navy.500 = #3B5998`
- `brand.navy.700 = #2A3C66`
- `accent.title = #E8B649`

State:
- `state.success = #6FAE63`
- `state.warning = #D8B46A`
- `state.danger = #B8576F`
- `shadow.pixel = #1F1F1F`

### 5.2 Role Mapping
- 매칭/하트/핵심 CTA: `brand.pink.500`
- 기본 버튼/네트워크/일반 조작: `brand.blue.500` 또는 `brand.navy.500`
- 헤더/탭 배경/깊은 레이어: `bg.navy.900`, `bg.navy.700`
- 카드/폼/본문 패널: `surface.base`

### 5.3 Color Usage Rules
- 한 화면에서 강한 포인트 색은 2개를 넘기지 않는다.
- 베이지 패널 위 텍스트는 검은색 위주로 유지한다.
- 분홍색은 장식용이 아니라 "행동"과 "매칭 감정"에 연결한다.
- 파란색은 "기본 조작", "네트워크", "안정감"에 연결한다.

## 6) Layout and Sizing Tokens
Spacing:
- `space.1 = 4`
- `space.2 = 8`
- `space.3 = 12`
- `space.4 = 16`
- `space.5 = 20`
- `space.6 = 24`

Borders / Shadows:
- `border.thin = 1`
- `border.base = 2`
- `border.strong = 3`
- `radius.none = 0`
- `pixelShadow.offsetX = 4`
- `pixelShadow.offsetY = 4`

Typography:
- `font.family.pixel = DungGeunMo`
- `font.family.fallback = PixelFont`
- `font.size.xs = 12`
- `font.size.sm = 14`
- `font.size.md = 16`
- `font.size.lg = 20`
- `font.size.xl = 28`
- `font.weight.regular = 400`
- `font.weight.bold = 700`

Shell:
- `header.height = 56`
- `tabBar.height = 64`
- `card.minHeight = 72`
- `avatar.sm = 32`
- `avatar.md = 48`
- `avatar.lg = 96`

## 7) Pixel Component Contract
### `PixelText`
목적:
- 앱 텍스트의 폰트, 색상, 줄간격, variant를 일원화

규칙:
- 일반 `Text` 직접 사용 금지
- variants:
  - `screenTitle`
  - `sectionTitle`
  - `body`
  - `label`
  - `caption`
  - `button`
- 한국어 텍스트에서 과한 letter spacing 금지

### `PixelBox`
목적:
- 모든 카드/패널/폼 컨테이너의 공통 외형

필수 구조:
- Shadow Layer
- Content Layer

필수 규칙:
- `borderRadius: 0`
- `borderWidth >= 2`
- `shadow*`, `elevation` 금지
- 패널 안쪽 여백은 `12~16` 범위 기본값

### `PixelButton`
프로토타입 버튼의 공통 인상:
- 짙은 외곽선
- 상단 하이라이트
- 하단 음영
- 살짝 눌리는 듯한 pressed 이동

variants:
- `primary`: pink CTA
- `secondary`: blue/navy default action
- `success`: 승인/확정
- `danger`: 거절/비활성화

세부 규칙:
- 기본 높이 `40` 이상
- 소형 버튼도 `32` 미만 금지
- 라벨은 모두 uppercase로 강제하지 않는다. 한국어 중심 UI이므로 가독성 우선
- `pressed` 상태는 y축으로 `1~2` 이동하고 shadow offset을 줄인다
- disabled는 투명도만 낮추지 말고 배경/텍스트 대비도 함께 낮춘다

### `PixelTabBar`
구조:
- 하단 고정
- 4등분 flex row
- 상단 2px black border
- 탭 셀마다 별도 배경색과 active 상태

규칙:
- 활성 탭은 골드/오렌지 또는 분홍 계열로 확실히 구분
- 비활성 탭도 눌릴 수 있는 버튼처럼 보여야 한다
- 탭 텍스트는 너무 작지 않게 유지 (`12~14`)

### `PixelSectionCard`
용도:
- Alarm Feed
- Recent Summary
- Account Details
- Matching Insights

규칙:
- 섹션 제목과 내부 내용은 같은 카드 안에서도 시각적으로 분리
- 필요 시 1px 내부 separator line 사용

### `PixelSliderShell`
목적:
- 연령 범위, 거리 범위

규칙:
- 기본 시스템 Slider 외형을 그대로 노출하지 않는다
- track는 픽셀 라인형 막대
- thumb는 회색 사각형 손잡이
- 현재 값 칩 또는 우측 값 박스와 함께 표시

### `PixelToggleGroup`
목적:
- 성별 필터, 상태 토글

규칙:
- 각 토글 셀 자체가 버튼처럼 보여야 한다
- 활성 옵션은 배경색이 분명히 달라야 한다

### `PixelDropdownShell`
목적:
- 직업군, 성격유형

규칙:
- 우측에 픽셀 화살표 아이콘 배치
- 값 없을 때 `--`
- 드롭다운 열림 전에도 입력창이 아니라 "선택 박스"처럼 보여야 한다

## 8) Screen-Specific Structural Rules
### Home
- 위에서 아래로 `Alarm Feed -> Today's Rec's -> Recent Summary -> CTA buttons`
- 추천 카드는 2개가 나란히 들어가는 2-column 압축 카드
- 요약 카드는 숫자와 라벨이 한 번에 읽혀야 한다

### Network
- 프로필 노드와 연결선이 핵심
- 인물 카드보다 관계 구조가 먼저 보여야 한다
- 노드 상태는 체크/대기/X로 즉시 식별 가능해야 한다

### Matching
- 승인/거절 대상 카드가 가장 먼저 보여야 한다
- 그 아래 인사이트 보드가 따라온다
- 매칭률은 숫자만이 아니라 시각 근거도 같이 보여야 한다

### My
- `Profile Overview -> Account Details -> Matching Preferences` 순서 고정
- 프로필 카드와 선호도 폼이 같은 언어로 보여야 한다
- 저장 버튼은 화면 하단 가까이에 충분한 무게감으로 배치

## 9) Asset Guidelines
Directory:
- `assets/pixel/sprites/`
- `assets/pixel/icons/`
- `assets/pixel/nav/`
- `assets/pixel/backgrounds/`
- `assets/pixel/ornaments/`

Naming:
- `sprite_<entity>_<action>_<frame>.png`
- `icon_<name>_<state>.png`
- `bg_<scene>_<variant>.png`

Required MVP assets:
- Home: alarm/recommend/activity icons + avatar set
- Network: node avatars + `matched/wait/reject` badges + line tiles
- Matching: approve/reject icons + chart/timeline icons
- My: avatar frame + dropdown/slider handles
- Global: 4-tab icons

Technical rules:
- format: png 우선
- 최소 2x export
- nearest-neighbor 계열 유지
- 검은 외곽선 두께 일관성 유지

## 10) Anti-Patterns
절대 금지:
- `elevation: 5` 같은 기본 그림자 처리
- 둥근 모서리 카드
- 시스템 기본 폰트 그대로 사용
- 기본 Bottom Tab을 프로토타입 대체품 없이 바로 사용
- 파스텔톤 다색 남용
- 여백만 많고 정보 밀도가 없는 평범한 앱 UI

## 11) QA Checkpoints
구현 후 반드시 확인:
- 그림자가 부드럽게 번지지 않고 픽셀처럼 딱딱한가
- 폰트가 실제 픽셀 폰트로 적용되었는가
- 하단 탭이 화면에 고정되고 Safe Area와 충돌하지 않는가
- 버튼이 평면 직사각형이 아니라 베벨 느낌을 가지는가
- 베이지 패널, 검은 보더, 네이비 헤더의 대비가 유지되는가
- 프로토타입과 비교했을 때 정보 밀도와 정렬감이 충분한가

## 12) Rebuild Roadmap
1. D0 Spec Lock: 이 문서 + view specs 확정
2. D1 Primitives: `PixelText`, `PixelBox`, `PixelButton`, `PixelTabBar`
3. D2 My view vertical slice + Supabase preference binding
4. D3 Home rebuild
5. D4 Network rebuild
6. D5 Matching rebuild
7. D6 Integration hardening

## 13) Non-Negotiables
- `borderRadius: 0` 기본
- 픽셀 보더 + 하드 그림자 유지
- 상태 표현은 색상 + 아이콘 병행
- empty/loading/error도 동일한 픽셀 컴포넌트 체계 유지
- 한국어 UI 카피 기본
