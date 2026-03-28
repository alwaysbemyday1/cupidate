# Data Contracts (Network + Matching)

This document defines current app-layer contracts used between UI state and repository implementations.

## 1) Network Repository Contract
Location: `src/features/network/repository/types.ts`

### Primary entities
- `CurrentCupid`
  - `id`, `nickname`
- `DiscoverableCupid`
  - `id`, `nickname`
- `NetworkCupidate`
  - `id`, `ownerCupidId`, `displayName`, `birthYear`, `gender`, `bio`, `preferences`, `createdAt`, `updatedAt`
  - `preferences` now carries richer profile/preference payload (jsonb passthrough):
    - profile-side: `region`, `jobTitle`, `heightCm`, `smokingHabit`, `drinkingHabit`, `hobbies`
    - ideal-side: `ageRange`, `preferredRegions`, `preferredSmoking`, `preferredDrinking`,
      `preferredGenders`, `preferredHeightRange`
- `NetworkConnection`
  - `id`, `requesterCupidId`, `addresseeCupidId`, `status`, `respondedAt`, `createdAt`, `updatedAt`
  - perspective fields: `direction`, `counterpartCupidId`, `counterpartNickname`

### Operations
- `getCurrentCupid()`
- `searchCupids(query)`
- `upsertCurrentCupidNickname(nickname)`
- `listCupidates()`
- `createCupidate(input)`
- `listConnections()`
- `createConnection(input)`
- `updateConnectionStatus(input)`

### Backends
- In-memory: `inMemoryNetworkRepository.ts`
- Supabase: `supabaseNetworkRepository.ts`
- Factory: `createNetworkRepository.ts`

## 2) Matching Repository Contract
Location: `src/features/matching/repository/types.ts`

### Primary entity
- `MatchingCandidate`
  - `id`, `sourceCupidateId`, `targetCupidateId`, `matchScore`, `status`, `reason`, `createdAt`, `updatedAt`

### Operations
- `listCandidates()`
- `upsertCandidate(input)`
- `updateCandidateStatus(input)`
- `markContactShared(input)`

### Backends
- In-memory: `inMemoryMatchingRepository.ts`
- Supabase: `supabaseMatchingRepository.ts`
- Factory: `createMatchingRepository.ts`

## 3) App-State Status Mapping
Location: `src/features/app/model/useCupidateAppState.ts`

### Connection status mapping (repository -> UI)
- `accepted` -> `connected`
- `pending` -> `pending`
- `rejected` / `blocked` -> `blocked`

### Matching status mapping (repository -> UI)
- `proposed` -> `requested`
- `accepted` -> `accepted`
- `dismissed` -> `rejected`
- `accepted + reason.contactSharedAt` -> `completed`

### Match-score breakdown shape
- `reason.breakdown` now includes:
  - `age`, `hobbies`, `lifestyle`, `location`, `profile`

## 4) Query Keys
- Network: `src/features/network/hooks/useNetworkData.ts`
- Matching: `src/features/matching/hooks/useMatchingData.ts`

Current policy: mutations invalidate relevant query keys instead of optimistic cache writes.
