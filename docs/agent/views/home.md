# Home View Spec

## 1. 목적/KPI
- 목적: 사용자가 앱 접속 직후 매칭/주선 관련 핵심 상태를 빠르게 파악하고 즉시 액션하도록 유도
- KPI:
  - 홈 진입 후 액션 버튼 클릭률
  - 추천 카드 상세 진입률
  - 알림 확인률

## 2. 사용자 시나리오
- Cupid가 홈에 진입한다.
- 오늘의 추천과 알림을 확인한다.
- 빠른 액션으로 매칭 요청 또는 수락을 수행한다.
- 최근 활동 요약과 공지를 확인한다.

## 3. UI 구성
- 상단:
  - 사용자/네트워크 상태 배지
  - 공지 배너
- 본문:
  - 오늘의 추천 카드 섹션
  - 실시간 알림 피드
  - 최근 활동 요약 카드
  - 빠른 액션 버튼 그룹

## 4. 데이터 계약
- Query:
  - `home_notifications` (최근 N개)
  - `home_recommendations` (점수 상위 N개)
  - `home_activity_summary` (요청/수락/완료 지표)
  - `home_announcements`
- Mutation:
  - `accept_match_request`
  - `send_match_request`
  - `mark_notification_read`

## 5. 권한/프라이버시
- RLS 기준으로 본인 및 연결된 Cupid 네트워크 범위만 노출
- 차단 관계 데이터는 추천/알림에서 제외

## 6. 상태 정의
- Loading: 스켈레톤 카드/리스트
- Empty: 추천/알림 없음 상태 문구 + CTA
- Error: 재시도 버튼 + 오류 메시지

## 7. 이벤트 트래킹
- `home_viewed`
- `home_recommendation_clicked`
- `home_quick_action_clicked`
- `home_notification_clicked`

## 8. 완료 기준
- 홈에서 추천/알림/요약/빠른액션이 정상 렌더링
- 액션 수행 후 상태가 즉시 반영
- 연결되지 않은 사용자 데이터 노출 없음
