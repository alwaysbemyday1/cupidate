# Matching View Spec (Prototype Rebuild)

Last Updated: 2026-03-29

## 1. 화면 목적
- 매칭 요청의 승인/거절과 매칭률 근거 확인을 한 곳에서 처리하는 의사결정 화면.

## 2. 핵심 구성
1) 상단 헤더
- 타이틀: `Cupidate: Matching`

2) Matching Manager 섹션
- Pending Match Requests 카드 리스트
- 카드 정보:
  - 양측 썸네일/이름
  - 매칭률
  - 상태
- 액션:
  - `승인`
  - `거절`

3) User Suggested Matches 섹션
- 제안 카드 리스트
- 승인/제외 아이콘 버튼

4) Matching Insights 섹션
- 점수 분해 차트(카테고리별)
- 프로세스 타임라인(미팅/피드백/최종결정)
- 피드백 요약

5) 하단 탭바
- Match 활성 상태

## 3. 디자인 규칙
- 승인 버튼: `secondary/success` 계열
- 거절 버튼: `danger` 계열
- 매칭률은 텍스트 + 막대/아이콘으로 이중 표기
- 근거 시각화는 숫자만이 아니라 범례와 함께 표시

## 4. 데이터 계약
Queries:
- `matching_candidate_list`
- `matching_requests_inbox`
- `matching_history_summary`
- `matching_score_breakdown`

Mutations:
- `send_matching_request`
- `accept_matching_request`
- `reject_matching_request`
- `confirm_contact_exchange`

## 5. 상태 정의
- Loading: 요청 카드/차트 스켈레톤
- Empty: "처리할 매칭 요청이 없습니다"
- Error: 재시도 + 마지막 성공 동기화 시점 표시

## 6. 완료 기준
- 요청 처리(승인/거절)가 즉시 UI/저장소에 반영
- 매칭률 분해 근거가 사용자에게 읽히는 형태로 표시
- 진행 상태 타임라인이 실제 데이터와 일치
