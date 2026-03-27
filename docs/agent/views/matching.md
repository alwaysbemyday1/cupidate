# Matching View Spec

## 1. 목적/KPI
- 목적: Cupidate 후보를 비교하고 빠르게 요청/수락/거절을 처리
- KPI:
  - 매칭 요청 전환율
  - 요청 수락률
  - 평균 응답 시간

## 2. 사용자 시나리오
- 사용자가 매칭 뷰에 진입한다.
- 필터(나이/지역/직업군)를 적용한다.
- 후보 카드의 매칭률과 설명 태그를 확인한다.
- 요청/수락/거절 액션을 수행한다.

## 3. UI 구성
- 상단:
  - 필터 바 (나이/지역/직업군)
  - 정렬 옵션 (매칭률/최근활동)
- 본문:
  - Cupidate 프로필 카드 리스트
  - 매칭률 배지 + 설명 태그
  - 원클릭 액션 버튼 (요청/수락/거절)
- 하단:
  - 매칭 히스토리 탭/패널

## 4. 데이터 계약
- Query:
  - `matching_candidates`
  - `matching_filters_options`
  - `matching_history`
- Mutation:
  - `create_match_request`
  - `accept_match_request`
  - `reject_match_request`
- 계산 데이터:
  - `match_score`
  - `score_breakdown`
  - `match_reason_tags`

## 5. 권한/프라이버시
- 연결된 Cupid 네트워크 범위 외 후보는 조회 불가
- 사용자 차단/비공개 조건 하드 필터 적용
- 민감 정보(전화번호/이메일)는 매칭 단계에서 마스킹

## 6. 상태 정의
- Loading: 카드 스켈레톤 + 필터 비활성
- Empty: 필터 조건 재설정 유도
- Error: 실패 원인/재시도/필터 초기화

## 7. 이벤트 트래킹
- `matching_viewed`
- `matching_filter_changed`
- `matching_candidate_opened`
- `matching_request_sent`
- `matching_request_accepted`
- `matching_request_rejected`

## 8. 완료 기준
- 필터 조합이 정확히 적용된 후보 리스트 제공
- 요청/수락/거절 액션이 상태/히스토리에 반영
- 매칭률 및 설명 태그가 정책 버전과 일치
