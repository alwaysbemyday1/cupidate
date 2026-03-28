# Cupidate Design System

Last Updated: 2026-03-29
Reference Prototype:
- `docs/design/pt_home_network_260329.png`
- `docs/design/pt_info_260329.png`
- `docs/design/pt_matching_260329.png`

## 1) Design North Star
Cupidate는 핑크/네이비 기반 16-bit 픽셀 콘솔 UI를 핵심 시각언어로 사용한다.

핵심 원칙:
- 정보 밀도 우선: 카드/패널 구조로 상태를 빠르게 인지.
- 하드 픽셀 감성: soft shadow 금지, 보더/오프셋 기반 입체감.
- 4-View 역할 분리: Home / Network / Matching / My.

## 2) Visual DNA
- 배경: 네이비 계열 단색 또는 상황형 아트 배경.
- 패널: 라이트 베이지/크림 + 두꺼운 검은 보더.
- 헤더: 딥 네이비, 강조 단어는 핑크/골드.
- 하단 탭: 4개 고정, 활성 탭은 강한 대비 색상.

## 3) Color Tokens
Base:
- `bg.navy.900 = #1F2A44`
- `bg.navy.700 = #2A3C66`
- `bg.navy.500 = #3B5998`
- `surface.base = #F4E8D1`
- `surface.alt = #EADBC2`
- `ink.primary = #000000`
- `ink.inverse = #FFFFFF`

Brand / Semantic:
- `brand.pink.500 = #D84C73`
- `brand.pink.700 = #BC3D62`
- `brand.navy.500 = #3B5998`
- `brand.navy.700 = #2A3C66`
- `state.success = #6FAE63`
- `state.warning = #D8B46A`
- `state.danger = #B8576F`
- `accent.title = #E8B649`
- `shadow.pixel = #1F1F1F`

## 4) Layout / Type Tokens
Spacing (4px grid):
- `4, 8, 12, 16, 20, 24`

Borders / Shadows:
- `border.thin=1`, `border.base=2`, `border.strong=3`
- `radius.none=0`
- `pixelShadow.offsetX=4`, `pixelShadow.offsetY=4`

Typography:
- Font: `DungGeunMo` (fallback `PixelFont`)
- Sizes: `12, 14, 16, 20, 28`
- Weights: `400, 700`

Layout:
- `header.height=56`
- `tabBar.height=64`
- `card.minHeight=72`
- `avatar.sm=32`, `avatar.md=48`, `avatar.lg=96`

## 5) Component Contract
### `PixelText`
- 앱 텍스트 기본 래퍼.
- variants: `title | section | body | caption | button`.
- 일반 `Text` 직접 사용 금지(서드파티 내부 제외).

### `PixelBox`
- 하드 픽셀 그림자 박스.
- 구조:
  - Outer: black background + right/bottom padding
  - Inner: content background + `borderWidth:2`, `borderColor:#000`
- RN `shadow*`, `elevation` 금지.

### `PixelButton`
- variants:
  - `primary` (pink CTA)
  - `secondary` (navy default)
  - `success`
  - `danger`
- states: `default | pressed | disabled | loading`
- 규칙:
  - pressed는 밝기보다 위치/오프셋 변화 우선
  - bevel(상단 하이라이트/하단 다크 라인) 유지
  - 기본 높이 `>=40`, 소형 `>=32`

### `PixelTabBar`
- `HOME / NETWORK / MATCH / MY INFO` 고정.
- 하단 절대 고정 + 상단 2px 보더.
- 탭마다 아이콘 + 라벨, 활성 탭 강조.

### Form UI Shell
- `PixelSliderShell`: 나이/거리.
- `PixelToggleGroup`: 성별 선택.
- `PixelDropdownShell`: 직업군/성격 타입.

## 6) Asset Guidelines
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

MVP Required:
- Home: alarm/recommend/activity icons + avatar set
- Network: node avatars + `matched/wait/reject` badges + line tiles
- Matching: approve/reject icons + chart/timeline icons
- My: avatar frame + dropdown/slider handles
- Global: 4-tab icons

Technical:
- format: png 우선
- 최소 2x export
- nearest-neighbor 리샘플링 유지

## 7) View Tone Guide
- Home: 알림/추천/요약 관제판
- Network: 관계망 보드
- Matching: 승인/거절 판정 센터
- My: 프로필/선호 설정 콘솔

## 8) Rebuild Roadmap
1. D0 Spec Lock (this document + view specs)
2. D1 Primitives (`PixelText`, `PixelBox`, `PixelButton`, `PixelTabBar`)
3. D2 My view vertical slice + Supabase preference binding
4. D3 Home rebuild
5. D4 Network rebuild
6. D5 Matching rebuild
7. D6 Integration hardening (loading/empty/error/perf/test)

## 9) Non-Negotiables
- `borderRadius: 0` 기본
- 픽셀 보더 + 하드 섀도우 유지
- 상태 표현은 색상 + 아이콘 병행
- empty/loading/error도 동일한 픽셀 컴포넌트 체계
- 한국어 UI 카피 기본
