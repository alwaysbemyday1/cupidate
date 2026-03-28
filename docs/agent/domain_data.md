# Cupidate Domain & Data Contract

Last Updated: 2026-03-29

## 1) Domain Overview
Roles:
- `Cupid`: 지인 네트워크를 관리하고 소개를 주선하는 사용자
- `Cupidate`: Cupid가 관리하는 소개 대상 프로필

Core constraints:
- 직접적인 cupidate-to-cupidate 검색은 기본 플로우가 아님
- 연결 승인된 cupid 네트워크 범위 안에서 추천/매칭 수행
- Supabase RLS 기반 접근 제어 필수

## 2) Profile Input Schema
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
- `listConnections`
- `createConnection`
- `updateConnectionStatus`

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
