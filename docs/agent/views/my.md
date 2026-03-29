# My View Spec (Prototype Rebuild)

Last Updated: 2026-03-30

## 1. 화면 목적
- 내 계정 상태, 언어, 알림/공개 설정, cupidate 준비 현황을 확인하는 설정 허브.
- 현재 POC에서는 "내가 지금 매칭 가능한 상태인지"를 가장 빠르게 확인하는 화면이어야 한다.

## 2. 핵심 구성
1) 상단 헤더
- 현재 화면명만 노출

2) Profile Overview 섹션 (`PixelBox`)
- 아바타
- 닉네임
- Cupid ID
- 현재 계정 모드(local / supabase)
- 버튼:
  - `닉네임 저장`
  - `세션 새로고침`

3) Account Details 섹션 (`PixelBox`)
- 이메일
- 가입일
- 상태

4) Language Settings 섹션 (`PixelBox`)
- 앱 언어 전환
- `English / 한국어` 즉시 반영형 토글
- 변경 즉시 헤더/탭/Home/Auth/My 카피 갱신

5) App Settings 섹션 (`PixelBox`)
- 큐피드 계정 노출 토글
- 알림 토글
- 이 섹션의 공개 설정은 `cupid account discovery` 용도다
- 각 cupidate의 소개팅 프로필 공개범위(`private/basic/public`)는 각 프로필 overlay에서 별도 관리한다

6) Cupidate Readiness 섹션 (`PixelBox` 또는 StateCard`)
- 내가 소유한 cupidate 기준으로만 집계
- active / inactive count를 명확히 표시
- cupidate가 없으면 empty card + `Open Network`
- inactive가 있으면 Network로 이동하는 CTA 제공

7) Account Summary 섹션
- Connections
- Requests
- Visibility
- Notifications

8) 하단 탭바
- My 활성 상태

## 3. 기술 제약 반영
- `SafeAreaView` + `ScrollView` 기본
- 스타일은 `StyleSheet.create`만 사용
- 모든 텍스트는 `PixelText` 사용
- 모든 카드/섹션은 `PixelBox`로 하드 픽셀 섀도우 처리
- 하단 탭바는 `position: absolute` 고정

## 4. i18n 규칙
- 지원 언어: `en`, `ko`
- My 화면은 전역 언어 설정의 진입점
- 하드코딩된 카피 대신 번역 키 사용

## 5. 데이터 계약
Queries:
- `my_profile`
- `my_account_summary`
- `my_cupidate_activation_state`

Mutations:
- `update_profile`
- `activate_my_cupidate`
- `deactivate_my_cupidate`

## 6. 상태 정의
- Loading: 섹션별 placeholder
- Empty: cupidate 미등록 상태 안내 + Network 이동 CTA
- Error: 저장 실패/조회 실패 분리 표기 + 재시도

## 7. 완료 기준
- 닉네임/언어/토글이 즉시 UI에 반영
- 내 cupidate 집계가 "전체 cupidate"가 아니라 "내 cupidate" 기준으로 보임
- 영/한 언어 전환이 즉시 반영
- 모바일 스크롤과 하단 탭바 충돌 없음
- 내 cupidate 활성화 여부를 혼동하지 않게 표현
- 계정 노출 설정과 cupidate 프로필 공개범위를 혼동하지 않게 표현
