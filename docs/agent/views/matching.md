# Matching View Spec (Prototype Rebuild)

Last Updated: 2026-03-29

## 1. 화면 목적
- 매칭 요청의 승인/거절/연락처 공유와 매칭률 근거 확인을 한 곳에서 처리하는 의사결정 화면.
- 사용자는 이 화면에서 현재 대기 중인 요청을 즉시 처리하고, 추천 후보를 요청으로 전환하고, 점수 근거와 진행 단계를 함께 확인해야 한다.
- 사용자는 매칭 중 보이는 cupidate를 눌러 공개 프로필을 확인할 수 있어야 한다.

## 2. 핵심 구성
1) 상단 헤더
- 타이틀: `Cupidate: Matching`

2) Matching Manager 섹션
- 상단 섹션 라벨은 `Cupidate: Matching Manager`
- 현재 작업 대상이 되는 요청/제안을 묶는 상위 콘솔 역할
- 내부 순서:
  - `Pending Match Requests`
  - `User Suggested Matches`

3) Pending Match Requests 섹션
- 카드 리스트
- 카드 정보:
  - 양측 미니 아바타/이름
  - 요청 제목 (`A & B Request`)
  - 매칭률
  - 현재 상태 (`Awaiting Approval`, `Reviewing`, `Contacts Shared` 등)
  - 공유 취미 또는 핵심 근거
- 양측 미니 프로필 press 시 `Cupidate Profile View` 오픈
- 상태별 액션:
  - `requested` -> `승인`, `거절`
  - `accepted` -> `연락처 공유 완료`
  - `completed` -> 완료 배지와 비활성 버튼

4) User Suggested Matches 섹션
- 아직 요청으로 전환되지 않은 추천 후보 카드 리스트
- 카드 정보:
  - 제안 제목 (`A suggested for B`)
  - 매칭률
  - 기본 상태 (`New Suggestion`)
- 액션:
  - `매칭 요청`
- 추천 대상은 `active cupidate`만 포함한다.

5) Matching Insights 섹션
- 점수 분해 차트(카테고리별)
- 프로세스 타임라인(요청/검토/연락처 공유)
- 피드백 요약
- 인사이트 기준 카드는 우선순위로 선택:
  - 활성 요청
  - 최근 요청
  - 추천 카드
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
- 인사이트 헤더에 보이는 양측 프로필도 press 대상이어야 한다.

6) 하단 탭바
- Match 활성 상태

## 3. 디자인 규칙
- 승인 버튼: `secondary/success` 계열
- 거절 버튼: `danger` 계열
- 요청 처리 버튼은 카드 하단에서 한 줄 액션으로 묶는다
- 매칭률은 텍스트 + 차트/상태로 이중 표기
- 근거 시각화는 숫자만이 아니라 범례와 함께 표시
- 미니 프로필은 네트워크 화면과 같은 픽셀 아바타 규칙을 따른다

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
- Loading: 요청 카드/차트 스켈레톤
- Empty:
  - 요청 비어 있음: "처리할 매칭 요청이 없습니다"
  - 제안 비어 있음: "새 추천 후보가 없습니다"
  - 인사이트 비어 있음: "분석할 매칭 데이터가 없습니다"
- Error: 재시도 + 마지막 성공 동기화 시점 표시

## 6. 완료 기준
- 요청 처리(승인/거절)가 즉시 UI/저장소에 반영
- 연락처 공유 완료 처리까지 상태 흐름이 이어짐
- 매칭률 분해 근거가 사용자에게 읽히는 형태로 표시
- 진행 상태 타임라인이 실제 데이터와 일치
- 영/한 전환 시 Matching 전체 정적 카피가 함께 전환
- inactive cupidate는 추천/요청 생성 경로에 나타나지 않음
