# Home View Spec (Prototype Rebuild)

Last Updated: 2026-03-30

## 1. 화면 목적
- 앱 진입 즉시 "알림/추천/요약"을 확인하고 다음 액션으로 이동시키는 관제형 홈.

## 2. 핵심 구성
1) 상단 헤더
- 현재 화면명만 노출
- 불필요한 브랜드 문구 반복 제거

2) Alarm Feed 섹션
- 최신 알림 3~5건
- 아이콘 + 텍스트 1행 구조
- 읽지 않음 상태 강조

3) Today's Matches 섹션
- 추천 카드 2열
- 카드당 `프로필 2인 + 매칭률(%)`
- 탭 시 Matching 상세로 이동

4) Recent Summary 섹션
- 총 Cupidate 수
- 활성 매칭 수
- 주선 성공 수 배지

5) Readiness 섹션
- 아래 조건에서만 노출되는 상태 안내 카드
  - 등록된 cupidate가 없음
  - cupidate는 있지만 active가 없음
  - 연결된 cupid가 없음
- CTA는 `Manage Network`
- 홈에서 "왜 매칭이 안 뜨는지"를 바로 설명해야 함

6) 빠른 액션 버튼
- `Manage Network`
- `Review Matches`
- `My Settings`

7) 하단 고정 탭바
- `HOME / NETWORK / MATCH / MY`
- Home 활성 상태

## 3. 디자인 규칙
- 컨테이너는 모두 `PixelBox` 사용
- 배경: 네이비 계열(`bg.navy.*`) 또는 아트 배경 에셋
- 카드: `#F4E8D1`
- 버튼 기본: `#3B5998` (secondary)
- 강조 CTA: `#D84C73` (primary)

## 4. i18n 규칙
- 지원 언어: `en`, `ko`
- 알림 문구는 문자열 하드코딩이 아니라 `key + params` 방식으로 렌더링
- Home 화면에서 번역 대상:
  - 섹션 타이틀
  - 추천 카드 보조 카피
  - 요약 라벨
  - 버튼 문구
  - 상태 카드 문구

## 5. 데이터 계약
Queries:
- `home_notifications`
- `home_recommendations`
- `home_activity_summary`

Actions:
- 알림 클릭 -> 해당 화면 딥링크
- 추천 카드 클릭 -> Matching 상세
- readiness CTA -> Network
- 빠른 액션 -> Network/Matching/My 라우팅

## 6. 상태 정의
- Loading: 픽셀 스켈레톤 카드
- Empty: "표시할 알림/추천이 없습니다" + 액션 버튼
- Error: 재시도 버튼 포함 오류 카드

## 7. 완료 기준
- 홈 1화면에서 오늘의 핵심 상태와 막힌 이유를 함께 인지 가능
- 추천 카드/알림/버튼 라우팅 정상
- 영/한 전환 시 Home 카피 즉시 반영
- 픽셀 톤이 다른 뷰와 일관됨
