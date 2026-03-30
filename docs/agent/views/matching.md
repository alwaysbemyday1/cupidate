# Matching View Spec (QA-Hardened POC)

Last Updated: 2026-03-31

## 1. 화면 목적
- 매칭 요청의 승인/거절/연락처 공유와 매칭률 근거 확인을 한 곳에서 처리하는 의사결정 화면.
- 사용자는 이 화면에서 현재 열린 요청을 즉시 처리하고, 추천 후보를 요청으로 전환하고, 점수 근거와 진행 단계를 함께 확인해야 한다.
- 사용자는 매칭 중 보이는 cupidate를 눌러 공개 프로필을 확인할 수 있어야 한다.

## 2. 핵심 구성
1) 상단 헤더
- 타이틀: `Cupidate: Matching`

2) Pending Match Requests 섹션
- 카드 리스트
- 카드 정보:
  - 양측 미니 아바타/이름
  - 매칭률
  - 현재 상태 (`Awaiting Approval`, `Reviewing`, `Contacts Shared` 등)
  - 핵심 근거 1줄(공통 취미 또는 우선조건 정렬)
- 양측 미니 프로필 press 시 `Cupidate Profile View` 오픈
- 상태별 액션:
  - `requested` -> `승인`, `거절`
  - `accepted` -> `연락처 공유 완료`
  - `completed` -> 완료 배지와 비활성 버튼
- 중복 규칙:
  - pair 제목과 상태 문장을 별도로 반복하지 않는다
  - 상단 pair row 자체가 누구의 매칭인지 설명해야 한다

3) Suggested Matches 섹션
- 아직 요청으로 전환되지 않은 추천 후보 카드 리스트
- 카드 정보:
  - 양측 미니 프로필(press 가능)
  - 매칭률
  - 기본 상태 (`New Suggestion`)
  - 공개범위를 통과한 경우에만 핵심 근거 1줄 노출
- 액션:
  - `매칭 요청`
- 추천 대상은 `active cupidate`만 포함한다.
- 사용자는 suggestion row 안에서도 곧바로 profile overlay를 열 수 있어야 한다.

4) Matching Insights 섹션
- 점수 분해 차트(카테고리별)
- 프로세스 타임라인(요청/검토/연락처 공유)
- 피드백 요약
- 인사이트 기준 카드는 우선순위로 선택:
  - 활성 요청
  - 추천 카드
  - 최근 요청
- visibility/inactive gating:
  - 총 매칭률, 현재 상태, 진행 타임라인은 계속 볼 수 있다
  - 상세 breakdown 차트와 상세 피드백은 두 cupidate 모두 `public + active` 이거나 owner가 포함될 때만 공개된다
  - 공개 범위를 넘는 경우에는 상세 차트 대신 제한 안내 문구를 보여주고, 상세 피드백 섹션은 숨긴다
- 점수 분해는 다음 5개 축으로 고정:
  - `Age`
  - `Hobbies`
  - `Lifestyle`
  - `Location`
  - `Profile`
- `Profile` 축은 현재 POC 기준으로 다음 입력을 사용한다:
  - preferred gender
  - preferred height range
  - preferred job groups
- 선택된 우선조건이 실제로 맞아떨어진 경우, 인사이트 피드백은 그 조건을 상단 근거로 우선 표시한다.
- 인사이트 헤더에 보이는 양측 프로필도 press 대상이어야 한다.

5) 하단 탭바
- Match 활성 상태

## 3. 디자인 규칙
- 승인 버튼: `success` 계열
- 거절 버튼: `danger` 계열
- 요청 처리 버튼은 카드 하단에서 한 줄 액션으로 묶고, 버튼 폭이 균형 있게 맞아야 한다
- 매칭률은 텍스트 + 상태로 빠르게 읽히게 한다
- 미니 프로필은 네트워크 화면과 같은 픽셀 아바타 규칙을 따른다
- 단, 원격 cupidate의 visibility가 `private/basic` 이거나 해당 cupidate가 inactive 이면 공개 범위 밖의 근거(상세 취미/선호/생활정보)는 숨긴다
- 피드백 리스트는 실제 출처가 없는 가짜 발화 UI를 만들지 않는다

## 4. 데이터 계약
Queries:
- `matching_candidate_list`
- `matching_requests_inbox`
- `matching_history_summary`
- `matching_score_breakdown`
- `matching_profile_snapshot`

Mutations:
- `send_matching_request`
- `accept_matching_request`
- `reject_matching_request`
- `confirm_contact_exchange`

## 5. 상태 정의
- Loading: 요청 카드/인사이트 로딩 상태
- Empty:
  - 요청 비어 있음: "처리할 매칭 요청이 없습니다"
  - 제안 비어 있음: "새 추천 후보가 없습니다"
  - 인사이트 비어 있음: "분석할 매칭 데이터가 없습니다"
- Error: 재시도 CTA 제공

## 6. 완료 기준
- 요청 처리(승인/거절)가 즉시 UI/저장소에 반영
- 연락처 공유 완료 처리까지 상태 흐름이 이어짐
- 매칭 카드가 pair row / score / state / reason / action 중심으로 간결하게 보임
- 인사이트는 활성 요청을 먼저, 없으면 추천 후보를 먼저 보여준다
- 진행 상태 타임라인이 실제 데이터와 일치
- 영/한 전환 시 Matching 전체 정적 카피가 함께 전환
- inactive cupidate는 추천/요청 생성 경로에 나타나지 않음
- visibility rule을 위반하는 상세 정보는 Matching에서 노출되지 않음
