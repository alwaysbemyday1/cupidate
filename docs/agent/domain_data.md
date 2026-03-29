# Cupidate Domain & Data Contract

Last Updated: 2026-03-30

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
- 각 cupidate는 소개팅 프로필 공개범위 `profileVisibility` 를 가진다:
  - `private`: 본인(owner)만 상세 열람 가능
  - `basic`: 비소유자는 기본 메타만 열람 가능
  - `public`: 비소유자도 공개 소개팅 프로필/선호 요약 열람 가능
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
- social pref: `preferredJobGroups[]`, `preferredMbti[]`
- relation intent: `marriageIntent`, `childrenIntent`, `datingPurpose`
- distance: `maxDistanceKm`
- custom conditions: `customConditions[]`
- non-negotiables: `mustHaveConditionKeys[]`
  - 최대 5개까지 선택 가능
  - 선호도 입력 중 체크하면 해당 조건이 `true` 성격의 우선조건으로 승격된다
  - 이미 5개가 선택된 상태에서는 추가 체크 불가
  - 현재 POC 지원 키:
    - `age_range`
    - `preferred_gender`
    - `preferred_regions`
    - `preferred_job_groups`
    - `preferred_height_range`
    - `preferred_smoking`
    - `preferred_drinking`
    - `shared_hobbies`

## 3.1) Hybrid Storage Policy
Goal:
- 자주 필터링/정렬/점수 계산/카드 렌더링에 직접 쓰는 필드는 relational column으로 승격한다.
- 형태가 자주 바뀌거나 선택적인 확장 정보는 `jsonb`에 남긴다.

Structured columns:
- `public.cupidates`
  - `region`
  - `job_title`
  - `height_cm`
  - `smoking_habit`
  - `drinking_habit`
  - `profile_visibility`
- `public.cupidate_preferences`
  - `preferred_age_min`
  - `preferred_age_max`
  - `preferred_height_min_cm`
  - `preferred_height_max_cm`
  - `preferred_regions`
  - `preferred_job_groups`
  - `preferred_smoking`
  - `preferred_drinking`
  - `preferred_genders`
  - `must_have_condition_keys`

Flexible json payload:
- `preferences.hobbies`
- `preferences.mbti`
- future optional profile tags / narrative fields

Repository rule:
- repository는 structured columns + flexible json을 읽어 하나의 hydrated `preferences` view로 합친다.
- update 시에는 top-level structured input이 우선이고, 없으면 merged preferences payload에서 승격 가능한 값을 다시 추출한다.
- legacy payload (`preferences.location`, `preferences.jobTitle` 등)를 보내더라도 구조화 컬럼으로 흡수해야 한다.

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

Current POC profile-preference fit inputs:
- preferred gender
- preferred height range
- preferred job groups

### Priority weighting
- `mustHaveConditionKeys`는 일반 선호도보다 높은 우선순위를 가진다.
- 선택된 우선조건이 실제 후보와 맞을 경우 해당 축의 점수에 추가 가중치를 준다.
- 우선조건이 explainability payload에 그대로 남아야 한다.
- 현재 UI/저장소는 `priorityMatches[]` 로 실제 매칭된 우선조건 키를 전달한다.

### Bonuses
- verification completeness: up to +5
- profile completeness: up to +5
- recent activity signal: up to +3

### Explainability payload
- `matchScore`
- `breakdown` (`age`, `hobbies`, `lifestyle`, `location`, `profile`)
- `reasonTags[]`
- `priorityMatches[]`
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
  - public snapshot: age / gender / region / job / height / hobbies / lifestyle
  - preference snapshot: preferred age / gender / regions / job groups / lifestyle / height
- owner가 보는 cupidate profile에서는 활성화 토글과 핵심 프로필/선호도 수정 가능
- visibility gating:
  - `private`: 비소유자는 비공개 안내만 본다
  - `basic`: 비소유자는 이름/상태/기본 메타까지만 본다
  - `public`: 비소유자는 공개 소개팅 프로필 요약 + 공개 선호도 요약을 본다
- Matching/Network에서 remote profile을 열었을 때 상세 사유나 취미, 선호 요약은 visibility rule을 통과한 범위 안에서만 노출한다

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

## 11) Current App Surface Mapping
- Network register view:
  - structured profile input: region / job title / height / smoking / drinking / profile visibility
  - structured preference input: age range / preferred regions / preferred job groups / preferred smoking / preferred drinking / preferred genders / preferred height / must-have conditions
  - roster rows surface: activation state / visibility / must-have count
- Matching view:
  - recommendation subtitles use structured public profile info (`region`, `jobTitle`)
  - profile score includes job-group preference fit
  - priority alignment is surfaced through `priorityMatches` feedback when visibility permits
- Profile overlay:
  - cupid profile = matchmaking stats
  - cupidate profile = visibility-gated public snapshot + preference snapshot + owner-only edit controls
- My view:
  - account-level visibility toggle controls cupid account discovery only
  - per-cupidate profile visibility is managed inside each cupidate profile
