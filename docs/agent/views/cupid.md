# Cupid View Spec

## 1. 목적/KPI
- 목적: 주선 진행 상태를 운영 관점에서 관리하고 성사율을 개선
- KPI:
  - 주선 성사율
  - 주선 취소율
  - 주선 평균 리드타임

## 2. 사용자 시나리오
- Cupid가 주선 뷰에 진입한다.
- 진행중/완료/취소 상태를 필터링한다.
- 특정 주선 건의 단계 상태를 업데이트한다.
- 성사 후 연락처 교환 단계를 진행한다.

## 3. UI 구성
- 상단:
  - 주선 KPI 카드(성사율/취소율/진행건수)
- 본문:
  - 상태 필터 탭 (진행중/완료/취소)
  - 주선 요청 리스트
  - 주선 상세 패널 (타임라인/피드백)
- 보조:
  - 연락처 교환 view (성사 후)

## 4. 데이터 계약
- Query:
  - `cupid_intro_summary`
  - `cupid_intro_list`
  - `cupid_intro_detail`
  - `cupid_intro_feedback`
- Mutation:
  - `update_intro_status`
  - `submit_intro_feedback`
  - `exchange_contact_info`

## 5. 권한/프라이버시
- 본인이 참여한 주선 건만 조회/수정 가능
- 연락처 교환은 성사 상태 + 상호 동의 조건에서만 허용
- 피드백은 권한 범위 내 익명/비익명 정책 준수

## 6. 상태 정의
- Loading: KPI/리스트/상세 개별 스켈레톤
- Empty: 상태별 빈 목록 안내
- Error: 구간별 재시도 버튼 제공

## 7. 이벤트 트래킹
- `cupid_viewed`
- `cupid_status_filter_changed`
- `cupid_intro_opened`
- `cupid_intro_status_updated`
- `cupid_contact_exchange_started`
- `cupid_feedback_submitted`

## 8. 완료 기준
- 상태 필터와 주선 진행 단계가 정확히 동기화
- KPI 계산이 히스토리 데이터와 일치
- 연락처 교환 조건이 정책대로 제한됨
