# Network View PRD (네트워크)

## 1. Overview
- Network View는 사용자 네트워크 자산(내 Cupidate, 연결 Cupid)을 관리하는 관계 중심 화면이다.
- 매칭 실행 기능은 포함하지 않으며, 매칭에 필요한 데이터 준비/관리 책임을 가진다.

## 2. 목표
- 내 Cupidate와 연결 Cupid 리스트를 한 곳에서 관리
- 네트워크 품질(신뢰/최신성/연결상태) 유지
- 매칭 가능한 데이터셋 준비 시간 단축

## 3. 사용자 플로우
- 내 Cupidate 등록/수정/비활성
- 연결 Cupid 탐색/연결 요청/차단
- 리스트 필터링(상태/지역/최근활동)
- 상세 보기에서 프로필 완성도와 인증 상태 확인

## 4. UI 구성
- 상단 세그먼트:
  - `내 Cupidate`
  - `연결 Cupid`
- 공통 기능:
  - 검색
  - 필터
  - 정렬
- 리스트 카드:
  - 기본 정보
  - 상태 배지(활성/비활성/연결상태)
  - 빠른 액션(수정/비활성/연결요청/차단)

## 5. 데이터 계약
- Query:
  - `network_my_cupidates`
  - `network_connected_cupids`
  - `network_connection_requests`
- Mutation:
  - `create_cupidate`
  - `update_cupidate`
  - `deactivate_cupidate`
  - `request_cupid_connection`
  - `accept_cupid_connection`
  - `block_cupid_connection`

## 6. 권한/보안
- 본인 소유 Cupidate만 수정 가능
- 연결 Cupid 정보는 공개 범위 정책 준수
- 차단 관계는 리스트/검색에서 즉시 제외

## 7. 완료 기준
- 두 세그먼트 모두 검색/필터/정렬 동작
- 소유권/연결권한 위반 없이 액션 수행
- Matching View가 Network 데이터셋을 정상 참조
