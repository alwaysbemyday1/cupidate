# Network View Spec (Prototype Rebuild)

Last Updated: 2026-03-29

## 1. 화면 목적
- 내 지인(Cupidate)과 연결된 Cupid 네트워크를 구조적으로 관리하는 화면.

## 2. 핵심 구성
1) 상단 헤더
- 타이틀: `Cupidate: Network`

2) Network Board
- 루트: `MASTER CUPID`
- 하위 노드: Cupidate/Cupid 프로필 썸네일
- 노드 연결선(수평/수직/코너)로 관계 시각화
- 상태 아이콘:
  - 매칭됨(체크)
  - 대기(모래시계)
  - 거절(X)

3) Side Stat Panel (모바일에서는 접이식)
- 매칭 제안 수
- 연결된 구심 수
- 성공한 주선 수
- 진행 매칭 수
- LEGEND 표기

4) 관리 액션
- 지인 등록
- 연결 요청
- 차단/해제

5) 하단 탭바
- Network 활성 상태

## 3. 디자인 규칙
- 그래프 노드도 `PixelBox`/검은 외곽선 스타일 유지
- 상태는 색상+아이콘 병행
- 작은 썸네일에서도 식별되도록 1px 이상 외곽선 유지

## 4. 데이터 계약
Queries:
- `network_my_cupidates`
- `network_connected_cupids`
- `network_connection_requests`

Mutations:
- `create_cupidate`
- `request_cupid_connection`
- `update_connection_status`

## 5. 상태 정의
- Loading: 네트워크 노드 자리 유지 스켈레톤
- Empty: "등록된 지인이 없습니다" + 등록 CTA
- Error: 재시도 + 실패한 작업 안내

## 6. 완료 기준
- 관계망 상태를 1스크린에서 파악 가능
- 노드 상태와 서버 상태가 일치
- 관리 액션 이후 네트워크 보드 즉시 갱신
