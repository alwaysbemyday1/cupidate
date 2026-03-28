# Cupidate Project Rules & AI Agent Directives

## 1. Core Domain (Business Logic)

- **Roles:**
  - `Cupid` (주선자): 네트워크의 중심 노드. 지인을 초대하고 관리하며, 다른 Cupid와 네트워킹을 맺음.
  - `Cupidate` (소개받는 자): Cupid에게 종속된 엔티티. 매칭을 위한 사전 설문(Preference Data)을 보유함.
- **Matching System:**
  - Cupidate 간의 직접 검색이나 매칭은 불가함.
  - 반드시 서로 연결된(Connected) Cupid A와 Cupid B를 통해서만 양측의 Cupidate 매칭률(%)이 계산되고 제안됨.
- **Security:**
  - 모든 데이터는 Supabase RLS(Row Level Security)를 통해 격리됨. Cupid는 자신의 Cupidate와 연결된 타 Cupid의 Cupidate 정보만 조회 가능.

## 2. Design System & UI/UX (The Vibe: Retro Pixel Art)

- **Overall Theme:** 넥슨의 '데이브 더 다이버', 닌텐도 '포켓몬스터' 스타일의 8-bit / 16-bit 픽셀 아트 톤앤매너 적용.
- **Styling Rules:**
  - `Border Radius`: 둥근 모서리 절대 금지. 모든 컴포넌트의 모서리는 직각(0px) 또는 픽셀 계단 현상을 모방한 형태를 유지할 것.
  - `Borders`: 버튼이나 카드의 테두리는 굵고 대비가 강한 검은색(#000000) 실선을 사용하여 도트 그래픽 느낌을 강조할 것.
  - `Typography`: 'Galmuri(갈무리)', 'NeoDunggeunmo(네오둥근모)' 등 픽셀 전용 웹 폰트를 전역으로 적용할 것. 안티앨리어싱(Anti-aliasing) 최소화.
  - `Colors`: 파스텔톤이나 그라데이션을 지양하고, 명도와 채도가 뚜렷한 원색 계열의 픽셀 팔레트를 사용할 것.

## 3. High-Quality Pixel Asset & Component Guidelines

- **Asset Generation & Delegation:**
  - 큐피드 캐릭터, 복잡한 아이콘 등 고품질 픽셀 그래픽 파일(.png, .gif)은 코드 에이전트가 직접 생성(추론)하려 시도하지 말 것.
- **Asset Request Protocol (에셋 요청 프로토콜):**
  - 작업 중 새로운 픽셀 이미지 에셋이 필요하다고 판단되면, 작업을 멈추지 말고 임시 플레이스홀더(예: 배경색이 칠해진 View 또는 임시 로컬 경로)를 사용하여 코드 작성을 우선 완료할 것.
  - 해당 컴포넌트 코드 작성을 마친 직후, 사용자에게 **"다음과 같은 이미지를 외부 이미지 AI로 생성해서 `assets/images/...` 경로에 넣어주세요"**라고 명확히 요청할 것.
  - 요청 시 사용자가 이미지 AI(Midjourney, DALL-E 등)에 바로 복사/붙여넣기 할 수 있도록 **구체적인 프롬프트(예: "16-bit 픽셀 아트, 투명 배경, 데이브 더 다이버 스타일, 걷고 있는 큐피드 스프라이트 시트")를 함께 제안**할 것.
- **Component Rendering Rules:**
  - 에셋을 불러올 때 이미지가 흐려지지(Blurry) 않도록 반드시 안티앨리어싱을 비활성화하는 속성을 강제할 것 (예: `resizeMode="nearest"`, `imageRendering: 'pixelated'`).
  - 단순한 기하학적 픽셀 도형(예: 8x8 도트 하트)은 SVG 또는 CSS Grid(Box-shadow 조합)를 이용해 순수 코드로 작성하는 것을 허용함.
- **Pixel Animation (The Vibe):**
  - 캐릭터 모션은 '스프라이트 시트(Sprite Sheet)' 방식을 채택함.
  - `Reanimated 3`를 활용하되, 부드러운 전환(Linear, Spring) 대신 `Easing.steps()`를 사용하여 프레임이 뚝뚝 끊기는 레트로 감성을 모방할 것.

## 4. Tech Stack

- **Framework:** React Native (Expo Managed Workflow)
- **State Management:** Zustand (전역 상태), TanStack Query (서버 상태 및 캐싱)
- **Backend & Auth:** Supabase
- **Animation:** Reanimated 3

## 5. AI Agent Workflow (Harness Method)

- **Micro-Commits:** 한 번에 하나의 컴포넌트 또는 로직만 작성하고 검토를 요청할 것.
- **State Tracking:** 작업 시작 시 반드시 `docs/agent/feature_list.json`과 `docs/agent/progress.txt`를 읽고 현재 컨텍스트를 파악할 것. 작업 완료 후 진행 상태를 업데이트할 것.
- **No Assumptions:** 매칭 알고리즘이나 RLS 정책 작성 시, 추측하지 말고 `docs/agent/codexrules.md`의 도메인 룰을 최우선으로 따를 것.

## 6. Document Routing (What To Read When)

- **Top-level rulebook:** `docs/agent/codexrules.md`
  - 가장 먼저 읽는 문서다.
  - 도메인 불변 규칙, 디자인 원칙, 에이전트 작업 방식의 최상위 기준이다.
- **Project scope / current phase:** `docs/agent/feature_list.json`, `docs/agent/progress.txt`
  - 현재 서비스 범위, 뷰 구조, 진행 단계, 다음 작업 우선순위를 확인할 때 읽는다.
- **Design implementation guide:** `docs/agent/design_system.md`
  - 색상, 버튼, 그림자, 픽셀 폰트, 탭바, 컴포넌트 규칙, QA 체크포인트를 확인할 때 읽는다.
- **Prototype source images:** `docs/design/`
  - 디자인 레퍼런스 원본 이미지가 위치한 폴더다.
  - `docs/design/pt_home_network_260329.png`
  - `docs/design/pt_info_260329.png`
  - `docs/design/pt_matching_260329.png`
- **Domain / preference / match-rate / repository contracts:** `docs/agent/domain_data.md`
  - 선호도 데이터 구조, 프로필 입력 모델, 매칭률 계산 기준, 저장소 계약을 확인할 때 읽는다.
- **View-specific PRD:** `docs/agent/views/home.md`, `docs/agent/views/network.md`, `docs/agent/views/matching.md`, `docs/agent/views/my.md`
  - 특정 화면의 구성, 섹션 순서, 상태 정의, 완료 기준을 확인할 때 읽는다.
- **Recent implementation history:** `docs/agent/worklog.md`
  - 최근에 무엇을 바꿨는지, 어떤 의사결정이 있었는지 추적할 때 읽는다.

읽기 우선순위:
1. `docs/agent/codexrules.md`
2. `docs/agent/feature_list.json`
3. `docs/agent/progress.txt`
4. 필요한 경우 아래로 분기
5. 디자인 작업이면 `docs/agent/design_system.md` + `docs/design/`
6. 도메인/데이터 작업이면 `docs/agent/domain_data.md`
7. 특정 화면 작업이면 해당 `docs/agent/views/*.md`
8. 직전 변경 맥락이 필요하면 `docs/agent/worklog.md`
