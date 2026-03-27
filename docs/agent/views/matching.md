# Matching View PRD (매칭)

## 1. Overview
- Matching View는 Cupid가 Network에서 준비된 데이터셋을 기반으로 매칭을 실행하는 서비스 핵심 인터페이스다.
- 이 화면은 매칭률 계산 결과를 실시간으로 전달하고, 최소한의 조작으로 결정할 수 있게 설계한다.
- 도메인 제약:
  - 연결된 Cupid 네트워크 내 후보만 조회 가능
  - Cupidate 간 직접 매칭 기능은 제공하지 않음

## 2. 목표
- 매칭 탐색 피로도 최소화
- 매칭 요청 전환율과 수락률 향상
- 신뢰 기반(지인 네트워크) 매칭 품질 보장
- 매칭 의사결정의 설명가능성 확보

## 3. 사용자 경험 정의

### 3.1 페르소나
- Cupid(주선자): 본인 지인을 위한 매칭 결정을 수행
- Cupidate(소개 대상): 간접적으로 매칭 추천의 대상이 되는 엔티티

### 3.2 핵심 플로우
- 탐색:
  - 필터/검색으로 후보를 축소
  - 카드 기반으로 빠르게 탐색
- 판단:
  - 매칭률, 근거 태그, 상세 프로필 확인
- 실행:
  - 요청/수락/거절 원클릭 처리
- 추적:
  - 진행 상태 및 히스토리 확인
  - 개인/전체 매칭률 분석 확인
  - 성사 후 연락처 교환 단계 확인

## 4. UI/UX 상세

### 4.1 상단 제어 영역
- 검색 입력
- 스마트 필터:
  - 나이 범위
  - 지역
  - 직업군
  - 상태(요청 가능/대기/완료)
- 정렬:
  - 매칭률 높은 순
  - 최신 활동 순

### 4.2 후보 카드 영역
- 카드 필수 정보:
  - 사진
  - 이름/나이/지역
  - 직업/학력(공개 범위 내)
  - 매칭률(%)
  - 매칭 근거 태그(예: 취미 일치, 거리 근접)
- 액션:
  - 요청
  - 관심 저장(북마크)
  - 상세 보기
- 인터랙션:
  - 좌우 스와이프(관심/제외)
  - 스와이프 확정 임계치 피드백

### 4.3 상세 패널
- 프로필 사진 갤러리(최대 6장)
- 기본 정보
- 취미/성향 태그
- 자기소개
- 점수 분해 정보:
  - 카테고리별 부분 점수
  - 강점/약점 태그

### 4.4 진행/히스토리/통계 패널
- 요청 상태별 목록
- 응답 시간
- 최근 매칭 성과 요약
- 연락처 교환 상태

## 5. 기능 요구사항

### 5.1 후보 탐색/필터
- 기본 필터:
  - 나이 범위
  - 지역(복수 선택)
  - 직업군
- 추가 필터:
  - 흡연/음주
  - 결혼 의사
  - 자녀 계획
- 필터는 후보 집합과 매칭률 계산 양쪽에 일관되게 적용

### 5.2 매칭률 계산 및 표시
- 매칭률은 0~100 정수 또는 소수점 둘째 자리까지 표시
- 점수 정책:
  - 하드 필터 통과 후 가중치 계산
  - 보정치(인증, 완성도, 활동성) 반영
- 결과 표시:
  - 최종 점수
  - 부분 점수
  - 핵심 근거 태그

### 5.3 요청/수락/거절
- 요청 생성 시 중복 요청 방지
- 수락/거절 즉시 상태 반영
- 상태 변화 실시간 알림
- 수락된 건은 `진행` 그룹으로 이동
- 조건 충족 시 연락처 교환 액션 활성화

### 5.4 행동 기반 개인화
- 스와이프 히스토리
- 후보 상세 체류 시간
- 최근 수락/거절 패턴
- 개인화는 추천 순서에만 반영하고, 하드 필터/권한 정책은 항상 우선

## 6. 데이터 계약

### 6.1 Query
- `matching_candidate_list`
- `matching_candidate_detail`
- `matching_filter_options`
- `matching_requests_inbox`
- `matching_requests_outbox`
- `matching_history_summary`
- `matching_progress_cases`
- `matching_contact_exchange_status`

### 6.2 Mutation
- `send_matching_request`
- `accept_matching_request`
- `reject_matching_request`
- `bookmark_candidate`
- `mark_candidate_dismissed`
- `confirm_contact_exchange`

### 6.3 응답 필드(핵심)
- `match_score`
- `score_breakdown`
- `reason_tags`
- `hard_filter_flags`
- `last_activity_at`
- `request_status`

## 7. 정책/보안
- RLS 강제:
  - 본인 및 연결된 Cupid 네트워크 데이터만 접근
- 민감 정보 보호:
  - 연락처/이메일은 매칭 단계 마스킹
- 안전장치:
  - 차단 관계 후보 제외
  - 신고 누적 후보 노출 제한

## 8. 성능 요구사항
- 최초 리스트 표시: p95 1.5초 이내
- 필터 변경 반영: p95 700ms 이내
- 요청/응답 액션 반영: p95 500ms 이내

## 9. 이벤트 트래킹
- `matching_viewed`
- `matching_filter_changed`
- `matching_card_swiped`
- `matching_candidate_detail_opened`
- `matching_request_sent`
- `matching_request_accepted`
- `matching_request_rejected`
- `matching_score_explanation_opened`

## 10. 완료 기준
- 연결 네트워크 기반 후보 제한이 정확히 동작
- 필터/정렬/카드 액션이 UX 지연 없이 동작
- 매칭률/근거 태그가 정책 버전과 일치
- 요청 상태가 히스토리와 실시간 동기화
- 수락 후 진행/연락처 교환 단계가 정책대로 동작
