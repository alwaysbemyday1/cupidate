# Cupidate Design System

## 1. Design Direction
- 제품 정의: `지인 네트워크 기반 소개팅 서비스`
- 목표 톤: `신뢰 가능`, `귀엽고 장난감 같음`, `픽셀 게임 UI처럼 명확함`
- 핵심 콘셉트: `Nintendo handheld pixel menu`
- 결과물 정의: `서비스 앱이지만, 닌텐도/픽셀 샵 UI처럼 보이는 소개팅 앱`

## 2. Reference Interpretation
### 가져와야 하는 느낌
- `pixel shop / inventory screen`
- `console menu / handheld UI`
- `signboard, coin counter, sprite icon navigation`
- `white canvas + chunky black outline + playful accent color`

### Cupidate에 맞게 변환하는 방식
- 게임 상점처럼 보이되 기능은 소개팅 앱처럼 읽혀야 한다.
- 장식보다 정보 전달이 우선이다.
- `홈`, `매칭`, `네트워크`, `마이`는 각각 하나의 메뉴 보드처럼 보여야 한다.

## 3. Visual Language
### 3-1. Screen Formula
모든 메인 화면은 아래 구조를 따른다.
- `Shell Frame`: 밝은 컬러의 기기 셸
- `Status Strip`: 상단 상태 영역
- `Brick Band / Tile Band`: 화면 분위기를 만드는 픽셀 장식 영역
- `Signboard Header`: 큰 제목 간판
- `Window Cards`: 컨텐츠를 담는 보드형 카드
- `Sprite Nav`: 하단 픽셀 아이콘 네비게이션

### 3-2. Mood Keywords
- `pixel toy`
- `retro handheld`
- `shop menu`
- `cute but structured`
- `playful trust`

### 3-3. Shape Rules
- 모든 주요 컴포넌트는 `굵은 외곽선`을 가진다.
- 표면은 둥글지만 너무 현대적으로 부드럽지 않다.
- 버튼은 납작한 앱 버튼이 아니라 `카트리지` 또는 `간판 부품`처럼 보이게 만든다.
- 큰 카드에는 `작은 리본 라벨` 또는 `미니 간판`을 붙여 메뉴처럼 보이게 만든다.

## 4. Color System
### 4-1. Core
- `Ink`: `#201A17`
- `Paper`: `#FFFDF7`
- `Warm White`: `#FFF6E7`
- `Divider`: `#D8CCB6`
- `Panel Black`: `#2B2B2B`

### 4-2. Pixel Surface
- `Brick Brown 1`: `#764B32`
- `Brick Brown 2`: `#8F5E3D`
- `Brick Brown 3`: `#4D2F21`
- `Beige Frame`: `#E6C39B`
- `Gold Frame`: `#F2D34D`

### 4-3. Accent
- `Cupid Pink`: `#EE7E96`
- `Cupid Blue`: `#7CA8F7`
- `Cupid Mint`: `#93D28F`
- `Cupid Gold`: `#F3C85B`
- `Cupid Navy`: `#304A78`

### 4-4. Semantic
- `Success`: `#89C96B`
- `Info`: `#6F92C9`
- `Warning`: `#E7B55A`
- `Danger`: `#DB6C78`
- `Inactive`: `#B8B8B8`

### 4-5. Usage Rules
- 큰 정보 패널은 밝은 배경 위에 둔다.
- 픽셀 분위기는 `프레임`, `보더`, `아이콘`, `간판`, `상단 장식 밴드`에서 만든다.
- 검정에 가까운 외곽선을 적극 사용한다.
- 활성 상태는 `핑크`, `블루`, `골드`, `민트` 중 하나를 강하게 사용한다.

## 5. Typography
### 5-1. Font Roles
- `Pixel Display`: `IBM Plex Mono` 또는 유사 픽셀/모노 폰트
- `Body`: `Geist`, `Pretendard`, `SUIT`
- `Korean Headline`: `Geist Bold` 또는 `Pretendard Bold`

### 5-2. Rules
- 간판, 탭, 상태 칩, 버튼 라벨은 픽셀/모노 계열을 우선한다.
- 본문과 한국어 설명은 읽기 좋은 산세리프를 쓴다.
- 한 화면 안에서 텍스트 계층은 3단계를 넘기지 않는다.

### 5-3. Scale
- `Main Signboard`: 22-26
- `Screen Title`: 18-22
- `Card Title`: 15-18
- `Body`: 13-14
- `Pixel Label`: 9-11

## 6. Border, Radius, Shadow
### 6-1. Border
- 기본 외곽선은 `2~4px`
- 일반 앱보다 항상 두껍게 간다.
- 내부 구분선은 밝은 베이지/그레이로 약하게 처리한다.

### 6-2. Radius
- `Shell`: 32-38
- `Panel`: 22-28
- `Card`: 18-22
- `Button`: 14-18
- `Chip`: 10-14

### 6-3. Shadow
- 블러 기반 그림자는 거의 쓰지 않는다.
- 아래쪽으로 `2~4px` 짧게 떨어지는 진한 그림자를 사용한다.
- 그림자는 입체감보다 `장난감 버튼감`을 만드는 용도다.

## 7. Components
### 7-1. Signboard Header
- 바깥은 베이지 또는 골드 프레임
- 안쪽은 짙은 패널 컬러
- 텍스트는 픽셀/모노 화이트 또는 진한 네이비
- `HOME`, `MATCH`, `NETWORK`, `MY` 같은 화면 정체성을 명확하게 전달한다.

### 7-2. Window Card
- 카드 자체는 밝고 깨끗하다.
- 카드 왼쪽 위에 `TODAY`, `BEST`, `BOARD`, `PROFILE` 같은 작은 리본 간판을 붙인다.
- 카드 내용은 여전히 서비스 UX처럼 단순해야 한다.

### 7-3. Cartridge Button
- 버튼은 눌러보고 싶은 조각처럼 보여야 한다.
- 외곽선, 짧은 그림자, 진한 컬러 필이 필수다.
- 버튼 텍스트는 짧고 명령형으로 유지한다.

### 7-4. Counter Chip
- 예시 이미지의 코인/도넛 카운터처럼, 짧은 수치 정보는 작은 픽셀 칩으로 보여준다.
- 가능한 경우 아이콘 + 숫자 조합을 사용한다.

### 7-5. Sprite Navigation
- 하단 탭은 `텍스트 중심 탭`이 아니라 `픽셀 아이콘 중심 네비게이션`으로 만든다.
- 아이콘은 직접 픽셀 블록으로 만든 스프라이트 형태를 사용한다.
- 비활성 아이콘은 회색, 활성 아이콘은 컬러 처리한다.
- 필요하면 아주 작은 라벨을 곁들이되, 아이콘이 주인공이어야 한다.

### 7-6. Pixel Avatar Tile
- 사람 얼굴/실루엣/이니셜을 픽셀 타일처럼 표현한다.
- 프로필 카드나 추천 카드에서 `수집형 카드`처럼 보여야 한다.

### 7-7. Brick / Tile Decor
- 상단 일부 구간, 섹션 구분, 카운터 배경에 벽돌/타일 같은 반복 패턴을 사용한다.
- 지나치게 많은 텍스처는 피하고, 화면 분위기를 만드는 장치로만 쓴다.

## 8. Screen-Specific Direction
### Splash
- `새 게임 시작 화면`처럼 보여야 한다.
- 큰 간판 제목, 픽셀 커플, 하나의 강한 시작 버튼이 필요하다.

### Home
- `메인 메뉴 보드`처럼 보여야 한다.
- 오늘의 소개, 알림, 빠른 액션이 간판과 카드로 정리돼야 한다.

### Matching
- 대표 후보가 `베스트 페어 카드`처럼 보여야 한다.
- 추천률 바도 앱 차트보다 게임 HUD처럼 단순하고 또렷해야 한다.

### Network
- `네트워크 맵 보드`처럼 구성한다.
- 중앙 허브와 연결 노드를 게임판처럼 보여준다.

### My
- `캐릭터 상태창` 같은 느낌을 가져간다.
- 프로필, 선호도, 계정 관리가 메뉴판처럼 또렷해야 한다.

## 9. Copy Tone
- 짧고 명확하게 쓴다.
- 너무 세련된 마케팅 문장보다 `메뉴 라벨`처럼 바로 읽히는 문장을 쓴다.
- 예시:
  - `오늘 소개 3명`
  - `BEST PAIR`
  - `연결 구조`
  - `프로필 수정`
  - `연락처는 성사 후 교환`

## 10. Do / Don't
### Do
- 픽셀 아이콘을 실제로 사용한다.
- 네비게이션을 스프라이트 중심으로 만든다.
- 간판형 헤더와 보드형 카드를 적극 활용한다.
- UI를 더 장난감처럼, 더 닌텐도 메뉴처럼 만든다.

### Don't
- 단순한 텍스트 탭 바로 끝내지 않는다.
- 일반 모바일 SaaS 카드 UI처럼 보이게 두지 않는다.
- 지나치게 복잡한 게임 HUD처럼 만들지 않는다.
- 귀여움 때문에 정보가 흐려지게 하지 않는다.
