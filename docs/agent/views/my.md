# My View Spec

## 1. 목적/KPI
- 목적: 사용자 본인 정보/선호도/보안 설정을 신뢰성 있게 관리
- KPI:
  - 프로필 완성도
  - 인증 완료율
  - 설정 저장 성공률

## 2. 사용자 시나리오
- 사용자가 내 정보 뷰에 진입한다.
- 기본 정보와 선호도를 수정한다.
- 알림 및 공개 범위를 조정한다.
- 보안 설정(계정/인증/차단)을 관리한다.

## 3. UI 구성
- 상단:
  - 프로필 카드 + 완성도/인증 배지
- 본문:
  - 기본정보 편집 섹션
  - 선호도 설정 섹션
  - 알림 설정 섹션
  - 계정/보안 섹션
- 하단:
  - 저장/취소/로그아웃 액션

## 4. 데이터 계약
- Query:
  - `my_profile`
  - `my_preferences`
  - `my_verifications`
  - `my_notification_settings`
- Mutation:
  - `update_profile`
  - `update_preferences`
  - `update_notification_settings`
  - `update_privacy_scope`
  - `logout`

## 5. 권한/프라이버시
- 본인 계정 데이터만 조회/수정 가능
- 민감 정보는 마스킹 및 최소 노출 원칙 적용
- 공개 범위 변경 시 매칭 노출 범위 즉시 재계산

## 6. 상태 정의
- Loading: 섹션별 스켈레톤
- Empty: 선택 항목 미입력 가이드
- Error: 저장 실패 원인 + 재시도

## 7. 이벤트 트래킹
- `my_viewed`
- `my_profile_updated`
- `my_preferences_updated`
- `my_notifications_updated`
- `my_privacy_updated`

## 8. 완료 기준
- 기본/선호/알림/보안 설정이 안정적으로 저장/조회
- 검증 실패 시 필드 단위 오류 표시
- 공개 범위 정책이 매칭/주선 화면에 반영
