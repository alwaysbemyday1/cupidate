# Cupidate Domain & Data Contract

Last Updated: 2026-03-29

## 1) Domain Overview
Roles:
- `Cupid`: 지인 네트워크를 관리하고 소개를 주선하는 사용자
- `Cupidate`: Cupid가 관리하는 소개 대상 프로필
- `Active Cupidate`: 소개팅 프로필/선호도를 공개하고 매칭 계산 및 탐색에 포함되는 cupidate

Core constraints:
- 모든 유저는 `cupid` 역할을 가진다.
- 모든 `cupid`가 `active cupidate`인 것은 아니다.
- `inactive cupidate`는 네트워크에는 보일 수 있지만 매칭 후보 계산에는 포함되지 않는다.
- 직접적인 cupidate-to-cupidate 검색은 기본 플로우가 아님
- 연결 승인된 cupid 네트워크 범위 안에서 추천/매칭 수행
- Supabase RLS 기반 접근 제어 필수

## 2) Profile Input Schema
Profile ownership:
- `cupid`는 여러 cupidate 프로필을 관리할 수 있다.
- 각 cupidate는 `isActive` 상태를 가진다.
- `isActive = true` 인 경우에만:
  - Matching 추천 대상에 포함
  - 검색 가능한 dating profile로 취급
  - 프로필/선호도 기반 점수 계산 대상으로 사용

### Required basic fields
- `displayName`
- `birthYear`
- `gender`
- `region`
- `phone` (verification state)
- `email` (verification state)

### Extended profile fields
- appearance: `heightCm`, `bodyType`, `styleTags`, `photos`
- personal: `jobTitle`, `education`, `incomeRange`, `marriageHistory`, `childrenPlan`
- lifestyle: `religion`, `smokingHabit`, `drinkingHabit`, `exercise`, `pets`, `housingType`
- personality: `mbti`, `personalityTags`, `hobbies`, `datingIntent`, `marriageIntent`
- social/privacy: `privacyScope`, `blockedContacts`

## 3) Preference Schema
- age range: `ageMin`, `ageMax`
- region: `preferredRegions[]`
- height range: `heightMinCm`, `heightMaxCm`
- profile pref: `preferredGenders[]`, `preferredBodyTypes[]`, `preferredStyles[]`
- lifestyle pref: `preferredSmoking`, `preferredDrinking`, `preferredReligion`
- social pref: `preferredOccupationalGroups[]`, `preferredMbti[]`
- relation intent: `marriageIntent`, `childrenIntent`, `datingPurpose`
- distance: `maxDistanceKm`
- custom conditions: `customConditions[]`

## 4) Normalization & Validation Rules
- 텍스트 태그: trim + lowercase + dedupe
- range 필드: min/max 자동 정렬, 경계값 검증
- birthYear -> age 계산은 기준 연도 고정 로직 사용
- 공개 범위/차단 조건은 후보 생성 전에 하드 필터 적용
- optional 인증 필드: `isVerified` + `verifiedAt`

## 5) Matching Scoring Policy
### Hard filters (fail-fast)
- network access rule 불충족
- privacy/block rule 충돌
- 필수 성별/연령 조건 불충족

### Weighted scoring (0-100)
- age fit: 25
- lifestyle fit: 20
- personality/value fit: 20
- hobby overlap: 15
- social condition fit: 10
- profile preference fit: 10

### Bonuses
- verification completeness: up to +5
- profile completeness: up to +5
- recent activity signal: up to +3

### Explainability payload
- `matchScore`
- `breakdown` (`age`, `hobbies`, `lifestyle`, `location`, `profile`)
- `reasonTags[]`
- `scoringVersion`
- `scoredAt`

## 6) App Repository Contracts
Location:
- Network: `src/features/network/repository/types.ts`
- Matching: `src/features/matching/repository/types.ts`

### Network entities
- `CurrentCupid`
- `DiscoverableCupid`
- `NetworkCupidate`
- `NetworkConnection`

### Network operations
- `getCurrentCupid`
- `searchCupids`
- `upsertCurrentCupidNickname`
- `listCupidates`
- `createCupidate`
- `updateCupidate`
- `listConnections`
- `createConnection`
- `updateConnectionStatus`

### Profile access rule
- `Cupid profile`: 해당 cupid가 관리 중인 cupidate 수, active cupidate 수, 주선 수, 진행/완료 통계 노출
- `Cupidate profile`: 공개 가능한 소개팅 프로필 요약 + 선호도 요약 노출
- owner가 보는 cupidate profile에서는 활성화 토글과 핵심 프로필/선호도 수정 가능

### Matching entity
- `MatchingCandidate`

### Matching operations
- `listCandidates`
- `upsertCandidate`
- `updateCandidateStatus`
- `markContactShared`

## 7) Status Mapping (Repository -> UI)
Connections:
- `accepted -> connected`
- `pending -> pending`
- `rejected/blocked -> blocked`

Matching:
- `proposed -> requested`
- `accepted -> accepted`
- `dismissed -> rejected`
- `accepted + contactSharedAt -> completed`

## 8) Query Key Policy
- Network keys: `src/features/network/hooks/useNetworkData.ts`
- Matching keys: `src/features/matching/hooks/useMatchingData.ts`
- mutation 성공 후 관련 query key invalidate 전략 사용

## 9) MVP Data Completeness Gate
- 필수 기본정보 100%
- 핵심 생활정보(흡연/음주/종교) 최소 입력
- 취미 태그 3개 이상
- 선호도 필수 조건(연령/지역/흡연/성별) 입력

## 10) Activation Rule
- database default: new cupidates start as `inactive`
- frontend default: registration creates an inactive cupidate first
- activation happens from the cupidate profile management view
- Supabase trigger must reject match candidate creation if either cupidate is inactive
