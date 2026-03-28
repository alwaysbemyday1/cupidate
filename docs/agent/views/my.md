# My View Spec (Prototype Rebuild)

Last Updated: 2026-03-29

## 1. 화면 목적
- 내 프로필/계정정보/매칭 선호도를 한 화면군에서 관리하는 설정 허브.

## 2. 핵심 구성
1) 상단 헤더
- 타이틀: `Cupidate: My Info`

2) Profile Overview 섹션 (`PixelBox`)
- 아바타
- 이름
- 나이
- 지역
- 직업군
- 버튼: `프로필 수정`

3) Account Details 섹션 (`PixelBox`)
- 이메일
- 가입일
- 상태
- 좌우 버튼:
  - `비밀번호 변경`
  - `계정 비활성화`

4) Matching Preferences 섹션 (`PixelBox`)
- 연령 범위(커스텀 픽셀 슬라이더)
- 거리 범위(커스텀 픽셀 슬라이더)
- 성별 토글(남성/여성/모두)
- 직업군 드롭다운
- 관심사 태그
- 성격 타입 드롭다운
- 하단 CTA: `선호도 저장`

5) Language Settings 섹션 (`PixelBox`)
- 앱 언어 전환
- `English / 한국어` 즉시 반영형 토글
- 변경 즉시 헤더/탭/Home/Auth/My 카피 갱신

6) 하단 탭바
- My Info 활성 상태

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
- `my_preferences`
- `my_account_summary`

Mutations:
- `update_profile`
- `update_preferences`
- `change_password`
- `deactivate_account`

## 6. 상태 정의
- Loading: 섹션별 placeholder
- Empty: 프로필 미완성 안내 + 작성 CTA
- Error: 저장 실패/조회 실패 분리 표기 + 재시도

## 7. 완료 기준
- 프로필/선호도 조회값이 폼과 양방향 동기화
- 저장 성공 시 홈/매칭 점수에 반영
- 영/한 언어 전환이 즉시 반영
- 모바일 스크롤과 하단 탭바 충돌 없음
