# Agent Worklog

## 2026-03-31

### Task 2026-03-31-01 - Profile View QA Hardening
Status: Completed

Changes:
- Removed redundant cupid summary stats that no longer make sense after the single self-profile rule:
  - removed `Managed`
  - removed `Active`
- Removed duplicate visibility metadata from the cupidate header/meta stack.
- Tightened inactive cupidate gating:
  - non-owner viewers now see an inactive-status notice only
  - detailed public snapshot and preference summary stay hidden until the cupidate is active again
- Removed the redundant owner-only `Access` pill from cupidate activity.
- Added direct component tests for:
  - inactive remote cupidate visibility gating
  - cupid summary focus on matchmaking outcomes

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand src/features/app/views/__tests__/ProfileView.test.tsx src/features/app/__tests__/profileOverlayFlow.test.tsx` passed.

Notes:
- This pass was aimed at making the profile sheet trustworthy: the UI now matches both profile visibility and cupidate activation state.

### Task 2026-03-31-02 - Matching QA Hardening
Status: Completed

Changes:
- Simplified request and suggestion cards so they now focus on:
  - pair row
  - match score
  - lifecycle state
  - one concise reason line
  - one balanced action row
- Removed redundant matching copy from the cards:
  - duplicate pair titles
  - duplicate status sentences
  - empty placeholder hobby lines
- Tightened visibility-safe insight behavior:
  - active requests are prioritized first
  - if there is no active request, suggestions are prioritized before old history
  - detailed breakdown and feedback are hidden when either side is not fully revealable
- Removed the fake-speaker feedback pattern and replaced it with plain bullet feedback.
- Disabled matching action buttons during mutation to avoid duplicate taps.
- Removed stale translation keys tied to the verbose pre-QA card layout.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed.

Notes:
- This pass was aimed at making Matching easier to scan on-device while keeping the privacy model consistent with Profile and Network.

### Task 2026-03-31-03 - Home View QA Hardening
Status: Completed

Changes:
- Removed redundant copy from Home feed and recommendation cards:
  - no extra notification status line under the main message
  - no generic `Suggested Pair` / `Cupidate` helper labels inside recommendation cards
- Recommendation cards now surface only the details that help action:
  - pair names
  - public region/job meta when available
  - match score
- Reworked the Home summary block to reflect the actual POC bottlenecks:
  - active cupidates
  - inactive cupidates
  - connected cupids
  - active requests
- Made quick-action emphasis dynamic so unresolved readiness states push the user toward Network first.
- Added a focused component test to keep the Home card/snapshot layout concise.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand src/features/app/views/__tests__/HomeView.test.tsx src/features/app/__tests__/i18nFlow.test.tsx` passed.

Notes:
- This pass was aimed at making Home read like a dashboard instead of a stack of repeated explanations.

### Task 2026-03-31-04 - My View QA Hardening
Status: Completed

Changes:
- Clarified My section roles so the screen now reads in three clean layers:
  - account identity
  - app settings
  - network snapshot
- Removed duplicated account-mode/status surfacing from Profile Overview and moved account mode into Account Details.
- Hid the dead `Refresh Session` CTA when there is no Supabase refresh action available.
- Fixed the lingering English section title mismatch:
  - `Matching Preferences` -> `App Settings`
- Reworked the bottom summary into a true network snapshot:
  - connections
  - cupidates
  - active
  - requests
- Added a focused component test to keep the My screen free of dead buttons and duplicated summary semantics.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand src/features/app/views/__tests__/MyView.test.tsx src/features/app/__tests__/i18nFlow.test.tsx` passed.

Notes:
- This pass was aimed at making My feel like a settings hub instead of a mixed dashboard/status dump.

## 2026-03-30

### Task 2026-03-30-07 - Network IA Simplification to Cupid-First Flow
Status: Completed

Changes:
- Removed the `Board` segment from Network and collapsed the screen into two clear domains:
  - `Cupids`
  - `Cupidates`
- Removed direct remote-cupidate registration flow from Network.
- Reframed the Network mental model around the rule:
  - every user is a `cupid`
  - only some users activate a `cupidate` self-profile
- Rebuilt Network state derivation so:
  - `My Dating Profile` comes from the current cupid's single self-profile
  - `Active Cupidates in Network` is derived automatically from connected cupids

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed.

Notes:
- This was the biggest UX correction in the Network QA pass because it removed the false impression that users manually add both cupids and cupidates as separate people.

### Task 2026-03-30-08 - Cupid Profile Linkage + Connection Inbox Handling
Status: Completed

Changes:
- Extended cupid rows so pending inbound requests can be accepted/declined directly from Network.
- Added cupid profile linkage to active cupidate profiles:
  - cupid profile now shows dating-profile status
  - active cupidate can be opened directly from the cupid profile overlay
- Updated tests for:
  - inbound request handling
  - linked cupidate entry from cupid profile

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed.

Notes:
- This tightened the real user flow: review cupid -> inspect dating-profile readiness -> jump to cupidate profile if available.

### Task 2026-03-30-09 - Single Self-Profile Enforcement
Status: Completed

Changes:
- Updated repository create behavior so cupidate creation is treated as a self-profile upsert per owner.
- Added migration:
  - `supabase/migrations/20260330160000_cupidate_single_profile_per_cupid.sql`
- Migration behavior:
  - canonicalizes duplicate cupidates per owner
  - preserves the best surviving preference row
  - remaps valid match candidates
  - adds a unique constraint on `cupidates.owner_cupid_id`
- Rewrote `supabase/seed.sql` to the cupid-first model and applied it to the live dev project.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed (`16` suites / `45` tests).
- Supabase verification confirmed:
  - no owners with duplicate cupidates
  - `Dohun`, `Jin`, `Yuna`, `Hana` in the expected final state

Notes:
- This closed the data-model bug that was making the Network surface feel inconsistent even after UI cleanup.

## 2026-03-29

### Task 2026-03-29-16 - Hybrid Cupidate Schema Rollout
Status: Completed

Changes:
- Promoted high-signal cupidate profile/preference fields from flexible JSON into structured database columns:
  - `cupidates.region`
  - `cupidates.job_title`
  - `cupidates.height_cm`
  - `cupidates.smoking_habit`
  - `cupidates.drinking_habit`
  - `cupidate_preferences.preferred_age_min/max`
  - `cupidate_preferences.preferred_height_min_cm/max`
  - `cupidate_preferences.preferred_regions`
  - `cupidate_preferences.preferred_job_groups`
  - `cupidate_preferences.preferred_smoking`
  - `cupidate_preferences.preferred_drinking`
  - `cupidate_preferences.preferred_genders`
- Added migration:
  - `supabase/migrations/20260329212000_cupidate_hybrid_profile_fields.sql`
- Updated seed data to populate structured fields while leaving flexible tags in `preferences`.
- Added repository hydration utilities so reads still expose a backward-safe merged `preferences` object.
- Fixed partial-update behavior so legacy nested inputs such as `preferences.location` are promoted into structured columns during updates.
- Updated app surfaces:
  - Network register form now saves structured job/lifestyle/preference fields
  - Profile overlay shows structured public snapshot and preference snapshot
  - Matching mini profiles show structured `region/jobTitle`
  - matching profile score now includes `preferredJobGroups`
- Rebuilt Korean override coverage for current screen-level i18n labels.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed (`14` suites / `37` tests).

Notes:
- Storage policy is now hybrid by default:
  - columns for filtering/scoring/rendering
  - json for flexible tags and optional extensions
  - repository hydration keeps current UI logic from fragmenting.

## 2026-03-28

### Task 2026-03-28-01 - App Modularization
Status: Completed

Changes:
- Split App UI and logic into feature modules under `src/features/app/`.
- Extracted state/logic from `App.tsx` into `useCupidateAppState`.
- Added per-view components (`HomeView`, `NetworkView`, `MatchingView`, `MyView`).
- Added reusable UI pieces (`PixelButton`, `SummaryCard`) and shared styles.

Verification:
- `npm.cmd test` passed.
- `npx.cmd tsc --noEmit` passed.

Notes:
- This sets up a clean boundary for upcoming repository/data-source integration.

### Task 2026-03-28-02 - Network Repository/Data Layer
Status: Completed

Changes:
- Added a repository abstraction for Network domain entities.
- Implemented two data sources:
  - in-memory repository for local/dev fallback
  - Supabase repository for production data path
- Added repository factory (`getNetworkRepository`) with lazy singleton behavior.
- Added React Query hooks for current cupid, cupidates, connections, and related mutations.
- Made Supabase bootstrap optional-safe when env vars are absent.

Verification:
- `npm.cmd test` passed (including new in-memory repository tests).
- `npx.cmd tsc --noEmit` passed.

Notes:
- App UI is still powered by local state; next task will wire this data layer into the app state and screens.

### Task 2026-03-28-03 - App State/Data Hook Wiring
Status: Completed

Changes:
- Connected app state to repository/query layer using `useNetworkData` hooks.
- Added `QueryClientProvider` to app root with test-friendly defaults.
- Replaced local-only cupidate/connection paths with mutation/query flow.
- Updated UI:
  - Network view connection request now accepts connected cupid ID.
  - My view now has explicit `Save Nickname` action.
- Stabilized tests with repository override helpers and query notify-manager setup.

Verification:
- `npm.cmd test` passed.
- `npx.cmd tsc --noEmit` passed.

Notes:
- Matching request lifecycle is still local-only; next task will persist it through repository/match tables.

### Task 2026-03-28-04 - Matching Request Persistence
Status: Completed

Changes:
- Added a dedicated matching repository abstraction (`src/features/matching/repository`).
- Implemented in-memory and Supabase backends for `match_candidates`.
- Added matching query/mutation hooks (`useMatchingData`).
- Wired app state so matching request/history is now repository-driven instead of local-only state.
- Added tests for in-memory matching repository behavior.

Verification:
- `npm.cmd test` passed.
- `npx.cmd tsc --noEmit` passed.

Notes:
- Request lifecycle now persists and can be shared across sessions/backends.

### Task 2026-03-28-05 - Docs/Data Contract Alignment
Status: Completed

Changes:
- Cleaned and rewrote `feature_list.json` to match current architecture and phase status.
- Added `data_contracts.md` with concrete app/repository contracts and mapping rules.
- Updated docs index (`README.md`) for discoverability.

Verification:
- JSON parse sanity check for `feature_list.json`.
- Full test/typecheck remained green after docs updates.

### Task 2026-03-28-06 - Matching Interaction Flow Test
Status: Completed

Changes:
- Added UI-flow test for persisted matching lifecycle:
  - `src/features/app/__tests__/matchingFlow.test.tsx`
- Scenario covers:
  - recommendation render from seeded network graph
  - request creation
  - accept transition
  - contact-shared completion transition

Verification:
- `npm.cmd test` passed (now 9 suites / 21 tests).
- `npx.cmd tsc --noEmit` passed.

### Task 2026-03-28-09 - Reference-Based Design Direction
Status: Completed

Changes:
- Added `docs/agent/design_direction.md` from provided visual references.
- Captured concrete rules for:
  - palette and semantic color usage
  - typography and border treatment
  - component behavior and motion cues
  - anti-generic checklist
- Updated docs index and feature metadata to include design direction.

Verification:
- JSON parse check for `feature_list.json` after metadata extension.

### Task 2026-03-28-10 - First-Pass Theme Application
Status: Completed

Changes:
- Added app design token module:
  - `src/features/app/theme/tokens.ts`
- Refactored `src/features/app/styles.ts` to token-driven pixel-console style.
- Upgraded `PixelButton` to semantic variants:
  - `neutral`, `primary`, `success`, `warning`, `danger`
- Applied visual hierarchy updates to all main views:
  - Home hero board and sprite-strip placeholder frames
  - semantic action coloring in Network/Matching/My
  - updated top header branding (`CUPIDATE ARCADE`)

Verification:
- `npm.cmd test` passed.
- `npx.cmd tsc --noEmit` passed.

### Task 2026-03-28-07 - Auth Session Bootstrap + Protected Data Gate
Status: Completed

Changes:
- Added auth session bootstrap hook:
  - `src/features/auth/hooks/useAuthSessionGate.ts`
- Added lock screen view for unauthenticated Supabase mode:
  - `src/features/app/views/AuthRequiredView.tsx`
- Updated app shell to enforce gate before protected views are rendered.
- Added `enabled` options to network/matching query hooks so protected queries do not run pre-auth.
- Updated app state hook to consume access flag and guard protected mutations.

Verification:
- `npm.cmd test` passed.
- `npx.cmd tsc --noEmit` passed.

### Task 2026-03-28-08 - Connected Cupid Discovery/Search Flow
Status: Completed

Changes:
- Replaced Network direct ID input with search-and-select flow for connected cupid requests.
- Extended network repository contract with `searchCupids(query)`.
- Implemented search on both backends:
  - `inMemoryNetworkRepository.ts`
  - `supabaseNetworkRepository.ts`
- Added `useSearchCupidsQuery` hook and key.
- Updated app-state and Network view props for:
  - search query input
  - result candidates
  - selected candidate state
- Added repository test for discovery search filtering behavior.

Verification:
- `npm.cmd test` passed (9 suites / 22 tests).
- `npx.cmd tsc --noEmit` passed.

### Task 2026-03-28-11 - Hero Sprite Asset Integration
Status: Completed

Changes:
- Generated a local cupid sprite sequence and added six PNG assets under `assets/sprites/cupid/`.
- Added sprite asset module:
  - `src/features/app/theme/sprites.ts`
- Updated Home hero strip to render actual sprites with `Image` instead of placeholder boxes:
  - `src/features/app/views/HomeView.tsx`
  - `src/features/app/styles.ts`

Verification:
- `npm.cmd test` passed.
- `npx.cmd tsc --noEmit` passed.

Notes:
- Hero strip now uses real visual identity and can be extended to frame-based animation in a follow-up task.

### Task 2026-03-28-12 - Locked State Direct Auth CTA
Status: Completed

Changes:
- Extended auth gate hook with interactive auth actions:
  - `signInWithPassword(email, password)`
  - `signUpWithPassword(email, password)`
- Upgraded lock screen UI from refresh-only to direct auth form:
  - email/password fields
  - Sign In and Create Account CTAs
  - inline input validation and auth feedback
- Wired app shell to provide auth callbacks to `AuthRequiredView`.

Verification:
- `npm.cmd test` passed.
- `npx.cmd tsc --noEmit` passed.

Notes:
- Users can now attempt login immediately from the lock state without leaving the app.

### Task 2026-03-28-13 - Network Discovery Interaction Tests
Status: Completed

Changes:
- Added app-level Network discovery flow tests:
  - `src/features/app/__tests__/networkDiscoveryFlow.test.tsx`
- Covered two scenarios:
  - empty discovery feedback when no cupid matches query
  - full interaction path: search -> select -> add connection request
- Assertions include UI state transitions for query reset and pending connection rendering.

Verification:
- `npm.cmd test -- networkDiscoveryFlow.test.tsx` passed.
- `npm.cmd test` passed.
- `npx.cmd tsc --noEmit` passed.

Notes:
- This closes a major S3 hardening gap for Network interaction reliability.

### Task 2026-03-28-14 - View State Card Hardening
Status: Completed

Changes:
- Added reusable `StateCard` component with semantic tones:
  - `loading`, `empty`, `error`
- Added token-aligned state-card styles in shared stylesheet.
- Integrated state cards in Home/Network/Matching/My views to replace plain text placeholders.
- Added app-state level error aggregation and loading flags for each view family:
  - `homeError`, `networkError`, `matchingError`, `myError`
  - `isHomeLoading`, `isMyLoading`
- Wired App shell prop flow for the new view-state surfaces.

Verification:
- `npm.cmd test` passed.
- `npx.cmd tsc --noEmit` passed.

Notes:
- Empty/loading/error experiences now follow the same pixel-console visual language as primary cards.

### Task 2026-03-28-15 - Home Hero Sprite Loop Animation
Status: Completed

Changes:
- Added lightweight frame-loop behavior to Home hero sprite strip.
- Implemented active-frame cycle (`180ms`) in `HomeView` with interval cleanup.
- Added current frame indicator text (`FRAME x/6`).
- Added active/inactive sprite visual states in styles for step-like motion feel.
- Added test-mode guard so loop timer is disabled during Jest runs.

Verification:
- `npm.cmd test` passed.
- `npx.cmd tsc --noEmit` passed.

Notes:
- This gives the home command center a living sprite identity while keeping implementation lightweight.

### Task 2026-03-28-16 - Auth Gate Interaction Tests
Status: Completed

Changes:
- Added dedicated Auth gate UI tests:
  - `src/features/app/views/__tests__/AuthRequiredView.test.tsx`
- Added coverage for:
  - invalid email validation
  - short password validation
  - successful sign-in input normalization
  - signup failure message handling
  - loading-state submit blocking
- Stabilized existing Network discovery suite by setting explicit timeout:
  - `src/features/app/__tests__/networkDiscoveryFlow.test.tsx`

Verification:
- `npm.cmd test -- AuthRequiredView.test.tsx` passed.
- `npm.cmd test` passed.
- `npx.cmd tsc --noEmit` passed.

Notes:
- Auth lock-screen flow now has direct behavior coverage before adding retry actions.

### Task 2026-03-28-17/18 - Retry Action Wiring
Status: Completed

Changes:
- Extended `StateCard` with optional action button support.
- Added per-view retry CTA on error cards:
  - Home, Network, Matching, My
- Added app-state retry handlers for each view domain:
  - `onRetryHome`, `onRetryNetwork`, `onRetryMatching`, `onRetryMy`
- Retry handlers reset mutation errors and refetch relevant queries.
- Wired retry callbacks through `App.tsx` into each view.

Verification:
- `npm.cmd test` passed.
- `npx.cmd tsc --noEmit` passed.

Notes:
- Recoverable sync failures now have immediate in-context recovery actions.

### Task 2026-03-28-22/23/24 - Navigation + Profile/Preference + Match-Rate Upgrade
Status: Completed

Changes:
- Added app-level 4-tab navigation test:
  - `src/features/app/__tests__/navigationTabs.test.tsx`
- Expanded Network cupidate form and app-state with profile/preference inputs:
  - profile: region, job title, height, smoking/drinking habit, hobbies
  - preference: preferred age range/regions/smoking/drinking/gender/height range
- Persisted the expanded payload through the existing Network repository `preferences` json path (Supabase + in-memory).
- Upgraded matching domain contracts and scoring logic:
  - `normalizePreferences.ts` now supports richer fields + legacy compatibility
  - `calculateMatchScore.ts` now computes `age/hobbies/lifestyle/location/profile`
  - score breakdown includes `profile` category
- Matching cards now render detailed breakdown lines in UI.

Verification:
- `npm.cmd test -- navigationTabs.test.tsx` passed.
- `npm.cmd test` passed.
- `npx.cmd tsc --noEmit` passed.

Notes:
- This closes the requested path from user input profile/preference data to match-rate computation and Supabase persistence.

## 2026-03-29

### Task 2026-03-29-01 - Prototype-Based UI Rebuild Spec Lock
Status: Completed

Changes:
- Re-analyzed latest visual prototypes:
  - `docs/design/pt_home_network_260329.png`
  - `docs/design/pt_info_260329.png`
  - `docs/design/pt_matching_260329.png`
- Rebuilt design governance docs for the new visual baseline:
  - `docs/agent/design_direction.md`
  - `docs/agent/design_tokens.md`
  - `docs/agent/component_spec.md`
  - `docs/agent/design_assets.md`
  - `docs/agent/rebuild_plan.md`
- Rewrote view-level specs in clean UTF-8 and aligned to Home/Network/Matching/My IA:
  - `docs/agent/views/home.md`
  - `docs/agent/views/network.md`
  - `docs/agent/views/matching.md`
  - `docs/agent/views/my.md`
- Updated agent docs index and feature metadata:
  - `docs/agent/README.md`
  - `docs/agent/feature_list.json`
  - `docs/agent/progress.txt`

Verification:
- `Get-Content -Raw` check for all updated docs.
- `feature_list.json` validated via `ConvertFrom-Json`.

Notes:
- Next implementation starts with D1 primitives, then D2(My view vertical slice), then Home/Network/Matching.

### Task 2026-03-29-01A - Palette Correction (Pink/Navy Lock)
Status: Completed

Changes:
- Removed ocean-specific assumptions from design direction and home spec.
- Updated color rules to pink/navy centered palette:
  - primary pink `#D84C73`
  - secondary navy `#3B5998`
  - deep navy base `#1F2A44`, `#2A3C66`
  - beige panel `#F4E8D1`
- Refined token map and style keywords to match the corrected direction.
- Extended PixelButton spec:
  - CTA semantics (`primary` pink / `secondary` navy)
  - bevel rule
  - minimum size guidance

Verification:
- `rg -n "ocean|오션|#4A90E2|blue-ocean|tropical" docs/agent` returned no matches.
- `feature_list.json` schema sanity rechecked.

### Task 2026-03-29-01B - Agent Docs Consolidation
Status: Completed

Changes:
- Consolidated fragmented design references into a single doc:
  - `docs/agent/design_system.md`
- Consolidated matching data spec + repository contracts into a single doc:
  - `docs/agent/domain_data.md`
- Updated docs entry points and metadata references:
  - `docs/agent/README.md`
  - `docs/agent/feature_list.json`
- Kept per-view spec docs separate as requested:
  - `docs/agent/views/home.md`
  - `docs/agent/views/network.md`
  - `docs/agent/views/matching.md`
  - `docs/agent/views/my.md`

Verification:
- `feature_list.json` parse check passed.
- consolidated docs read check passed.

### Task 2026-03-29-01C - Design System Fidelity Hardening
Status: Completed

Changes:
- Re-reviewed prototype screens with a stricter implementation lens.
- Upgraded `docs/agent/design_system.md` from summary doc to fidelity guide:
  - prototype-derived screen analysis
  - React Native-specific shadow/font/navigation directives
  - canonical pink/navy/beige color-role mapping
  - detailed pixel component rules for buttons, tab bar, slider, toggle, dropdown
  - anti-patterns and QA checkpoints for visual validation

Verification:
- `Get-Content -Raw docs/agent/design_system.md` check passed.

### Task 2026-03-29-01D - Prototype Source and Fidelity Clarification
Status: Completed

Changes:
- Added explicit prototype source folder reference:
  - `docs/design/`
- Clarified that the design target is:
  - same impression
  - same visual language
  - same interaction feel
  - not a pixel-perfect screenshot copy
- Updated:
  - `docs/agent/design_system.md`
  - `docs/agent/README.md`

Verification:
- UTF-8 read check passed for updated docs.

### Task 2026-03-29-01E - Codexrules Document Routing Guide
Status: Completed

Changes:
- Updated `docs/agent/codexrules.md` to explicitly document which file to read by task type.
- Added routing guidance for:
  - top-level rules
  - project scope / current phase
  - design implementation
  - prototype image source folder
  - domain data / preference / scoring rules
  - view-specific PRD
  - recent implementation history

Verification:
- UTF-8 read check passed for `docs/agent/codexrules.md`.

### Task 2026-03-29-02 - Pixel Primitives + App Shell Rebuild
Status: Completed

Changes:
- Added shared pixel UI primitives:
  - `src/features/app/components/PixelText.tsx`
  - `src/features/app/components/PixelBox.tsx`
  - `src/features/app/components/PixelTabBar.tsx`
- Rebuilt `PixelButton` around hard-shadow/bevel rules from the design system.
- Reworked app-wide tokens and shared styles for the pink/navy/beige system:
  - `src/features/app/theme/tokens.ts`
  - `src/features/app/styles.ts`
- Rebuilt the root shell/header/tab bar composition in `App.tsx`.
- Updated shared cards and all major views to use the new primitives:
  - `SummaryCard`, `StateCard`
  - `HomeView`, `NetworkView`, `MatchingView`, `MyView`, `AuthRequiredView`
- Stabilized navigation test selectors by adding explicit tab test IDs.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test` passed.

Notes:
- Jest still reports the React Native `SafeAreaView` deprecation warning; this is queued as a follow-up cleanup task rather than a blocker.

### Task 2026-03-29-03 - My View Vertical Slice + Auth Metadata Wiring
Status: Completed

Changes:
- Rebuilt `src/features/app/views/MyView.tsx` into prototype-aligned sections:
  - `Profile Overview`
  - `Account Details`
  - `Matching Preferences`
  - `Account Summary`
- Added profile avatar seed rendering from nickname and compact account summary cards.
- Wired Supabase/local auth session metadata into the screen through `App.tsx`:
  - account email
  - join date
  - auth mode
  - manual session refresh action
- Kept existing profile/settings behavior intact:
  - nickname save
  - visibility toggle
  - notification toggle

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test` passed.

Notes:
- This is a visual/data-structure upgrade for My view; full self-profile preference persistence remains a separate follow-up task.

### Task 2026-03-29-04 - Global i18n Scaffold + My Language Switching
Status: Completed

Changes:
- Added a lightweight app-wide i18n layer:
  - `src/features/i18n/context.tsx`
  - `src/features/i18n/messages.ts`
  - `src/features/i18n/types.ts`
- Wired i18n into the app shell so these now translate immediately:
  - header title
  - header status text
  - bottom tab labels
- Reworked `MyView` to become the current language-switch entry point:
  - added `Language Settings` section
  - added `English / 한국어` immediate toggle
  - localized My screen copy through translation keys
- Added app-level i18n interaction coverage:
  - `src/features/app/__tests__/i18nFlow.test.tsx`

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test` passed.

Notes:
- Current localized surface is focused on `My`, `Home`, `Auth`, header, and tab shell.
- `Network` and `Matching` static copy remain queued for follow-up expansion.

### Task 2026-03-29-05 - Safe-Area Modernization + Home/Auth Rebuild
Status: Completed

Changes:
- Added `react-native-safe-area-context` and migrated the app root shell:
  - `App.tsx`
  - `package.json`
  - `package-lock.json`
- Added Jest safe-area mocks in `jest.setup.ts` to keep test rendering stable.
- Rebuilt `HomeView` against the current docs rather than the earlier hero-strip layout:
  - `Alarm Feed`
  - `Today's Rec's`
  - `Recent Summary`
  - `Quick Actions`
- Reworked Home data display to use localized notification objects and recommendation cards.
- Rebuilt `AuthRequiredView` into prototype-aligned card groups:
  - intro card
  - sign-in form card
  - session status card
- Updated existing tests and added Korean-render coverage for Auth.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test` passed (13 suites / 32 tests).

Notes:
- This closes the SafeArea deprecation cleanup from the previous round and moves the rebuilt surface to Home/My/Auth + shell.

### Task 2026-03-29-06 - Network View Prototype Rebuild + i18n Expansion
Status: Completed

Changes:
- Rebuilt `src/features/app/views/NetworkView.tsx` around the current prototype PRD:
  - top `Network Board`
  - `MASTER CUPID` root card
  - connected node board with status badges
  - `Match Proposal` stat card
  - `Legend` card
  - segmented lower management area for `My Cupidates` / `Connected Cupids`
- Preserved functional management flows while moving them below the visual board:
  - cupidate registration form
  - connection search / select / request flow
- Expanded i18n coverage to Network:
  - added Network copy to `src/features/i18n/messages.ts`
  - moved network validation errors in `useCupidateAppState` to translation keys
- Updated app composition to pass Network-specific summary props from `App.tsx`.
- Extended shared style map for board/node/legend/roster layouts.
- Updated app tests to align with the rebuilt Network structure.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed (13 suites / 32 tests).

Notes:
- This closes the Network portion of the current rebuild track and moves the remaining visual focus to Matching.

### Task 2026-03-29-07 - Matching View Prototype Rebuild + Score Insight Redesign
Status: Completed

Changes:
- Rebuilt `src/features/app/views/MatchingView.tsx` around the current matching prototype PRD:
  - `Matching Manager`
  - `Pending Match Requests`
  - `User Suggested Matches`
  - `Matching Insights`
- Replaced the earlier flat recommendation/history layout with a decision-console structure:
  - active request cards with paired mini profiles
  - score chip + status chip
  - state-aware actions (`Approve`, `Reject`, `Mark Contact Shared`)
- Added a persistent insight panel driven by the current focus pair:
  - score breakdown chart (`age`, `hobbies`, `lifestyle`, `location`, `profile`)
  - request timeline (`Request`, `Approval`, `Contact Shared`)
  - feedback summary generated from shared hobbies and strongest score factors
- Expanded i18n coverage to Matching:
  - added localized copy to `src/features/i18n/messages.ts`
  - removed direct static UI copy from the rebuilt screen
- Extended shared style tokens in `src/features/app/styles.ts` for request cards, insight chart, timeline, and feedback list.
- Updated app-level tests to match the rebuilt flow:
  - `src/features/app/__tests__/matchingFlow.test.tsx`
  - `src/features/app/__tests__/navigationTabs.test.tsx`

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand src/features/app/__tests__/matchingFlow.test.tsx src/features/app/__tests__/navigationTabs.test.tsx` passed.

Notes:
- The current focus card falls back in this order:
  - active request
  - recent request
  - suggested match
- This keeps the insight panel populated even after a match reaches the completed state.

### Task 2026-03-29-08A - Locale Persistence with Device Storage
Status: Completed

Changes:
- Added device-level locale persistence for the app-wide i18n layer.
- Installed storage dependency:
  - `@react-native-async-storage/async-storage`
- Added locale storage helper:
  - `src/features/i18n/storage.ts`
- Updated `I18nProvider` to:
  - load the stored locale on mount
  - persist locale changes immediately when the user switches language
- Updated `MyView` language section to communicate that the selected language is saved on-device.
- Added AsyncStorage Jest mock wiring in `jest.setup.ts`.
- Extended i18n flow coverage to verify:
  - Korean switch applies immediately
  - the selected locale is written to storage
  - the locale survives an app remount

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand src/features/app/__tests__/i18nFlow.test.tsx src/features/app/__tests__/matchingFlow.test.tsx` passed.

Notes:
- Persistence is currently device-local.
- A later step can sync the locale into account-level preferences if we want cross-device continuity.

### Task 2026-03-29-11 - Dock Tab Bar + Network Register Split + Contrast Cleanup
Status: Completed

Changes:
- Refined `PixelTabBar` from a row of button-like tabs into a single dock-style bottom navigation bar:
  - full-width mount
  - shared light surface
  - strong top border
  - active top strip + icon chip treatment
- Updated core palette tokens to improve readability on dark shells:
  - darker navy shell kept for framing
  - lighter beige surfaces for readable content
  - improved light/dark text mapping for contrast
- Reworked app shell layout so the dock is visually attached to the bottom of the screen.
- Split Network into clearer dedicated flows:
  - top-level segments: `Board`, `My Cupidates`, `Connected Cupids`
  - cupidate subviews: `Cupidate List`, `Register Cupidate`
  - cupid subviews: `Cupid List`, `Register Cupid`
- Removed dead owner-type UI and trimmed redundant headings in registration modes.
- Synced docs with the new structure and cleaned `design_system.md` into a readable UTF-8 source of truth.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed.

Notes:
- The Network screen now behaves more like a small in-app workspace:
  - board for overview
  - list for review
  - dedicated register/search subviews for data entry

### Task 2026-03-29-12 - Slim Dock + Segmented Network Tabs + Supabase Fake Data
Status: Completed

Changes:
- Reordered the main bottom navigation to:
  - Home
  - Network
  - Match
  - My
- Slimmed the dock height and replaced letter-based icon chips with built-in pixel glyph icons.
- Simplified the app header so the rebuilt shell now shows:
  - current page title
  - optional locked chip only when auth-gated
- Added a reusable segmented-tab component:
  - `src/features/app/components/PixelSegmentTabs.tsx`
- Replaced Network segment controls with tab-like segmented rails instead of button rows:
  - top level: `Board / My Cupidates / My Cupids`
  - subviews: `Cupidate List / Register Cupidate`, `Cupid List / Register Cupid`
- Improved Network flow by returning to the cupid list subview after a successful connection request.
- Added and applied a Supabase policy migration so authenticated users can search other cupids by nickname:
  - `supabase/migrations/20260329173000_cupidate_cupids_directory_select.sql`
- Rewrote `supabase/seed.sql` into an idempotent POC seed.
- Applied equivalent seed data to the live `fuzuoehehnbcngvwoypd` dev project:
  - 3 auth users / 3 cupids
  - 4 cupidates
  - 4 preference rows
  - 1 accepted connection
  - 2 match candidates

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed.
- Supabase row-count verification confirmed the seeded records.

Notes:
- No separate icon asset handoff is required yet; the current dock icons are code-drawn pixel glyphs.
- If we later want more characterful branded icons, a custom sprite sheet would be the next upgrade.

### Task 2026-03-29-14 - Cupid/Cupidate Profile Overlay
Status: Completed

Changes:
- Added a reusable profile overlay view:
  - `src/features/app/views/ProfileView.tsx`
- Added app-state profile selection flow:
  - cupid profile summary
  - cupidate profile summary
  - open/close handlers in `useCupidateAppState`
- Wired Network and Matching entities so pressing cupid / cupidate items opens the profile overlay.
- Expanded local state types so cupidates now carry activation state into the UI model.
- Added UI test coverage:
  - `src/features/app/__tests__/profileOverlayFlow.test.tsx`

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed.

Notes:
- This first cut focused on making profile entry possible from the active screens before changing the activation business rules.

### Task 2026-03-29-15 - Cupidate Activation Gate + Profile Management
Status: Completed

Changes:
- Added editable owner controls inside the cupidate profile overlay:
  - activation / pause toggle
  - core profile field editing
  - core preference field editing
- Extended Network repository contract with cupidate update support:
  - `updateCupidate`
- Added update mutation hook and app-state save path for cupidate profile management.
- Changed new cupidate creation default to `inactive` in both in-memory and Supabase repository paths.
- Updated matching recommendation generation so only active cupidates are considered.
- Added Supabase migration:
  - `supabase/migrations/20260329193000_cupidate_activation_gate.sql`
  - changes:
    - `cupidates.is_active` default -> `false`
    - match-candidate trigger now rejects inactive cupidate pairs
    - added `(owner_cupid_id, is_active)` index
- Updated `supabase/seed.sql` and reseeded the live dev project with one inactive cupidate (`Hana`) for activation QA.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed.
- Supabase migration applied successfully to `fuzuoehehnbcngvwoypd`.
- Seed verification confirmed:
  - `Mina`, `Dohun`, `Yuna`, `Jin` active
  - `Hana` inactive

Notes:
- The current POC now matches the product rule that every user can be a cupid, but only activated cupidates participate in matching visibility and scoring.

### Task 2026-03-30-01 - Core View Copy Cleanup
Status: Completed

Changes:
- Removed clunky or inconsistent surface copy from the rebuilt views:
  - `Today's Rec's` -> `Today's Matches`
  - `MY INFO` -> `MY`
  - `Cupidate Hub` / `Cupid Hub` -> `My Cupidates` / `My Cupids`
  - matching status copy now uses user-facing phrases instead of raw state names
- Added missing Home quick action for direct Matching entry.
- Normalized unsafe separator glyphs to ASCII-safe `/` in Network and Matching meta rows.
- Replaced brittle center markers with safe pixel-style ASCII `<3` markers.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed.

Notes:
- This pass focused on what the user sees first: labels, headings, and state wording.

### Task 2026-03-30-02 - Cupidate Readiness Surfacing
Status: Completed

Changes:
- Added explicit readiness guidance to Home:
  - no cupidate
  - no active cupidate
  - no connected cupid
- Added `Cupidate Readiness` section to My:
  - active/inactive counts
  - Network jump CTA when action is needed
- Fixed My summary to count only my cupidates, not every cupidate in the loaded graph.
- Added explicit `Active` / `Inactive` badges to Network cupidate roster rows.
- Reworked Matching suggestion rows so both cupidate mini profiles are visible and directly pressable.
- Updated tests to cover the new readiness flow and new duplicate profile-entry surfaces.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed.

Notes:
- This pass was aimed at POC validation clarity: users should understand why matching is empty without needing explanation from outside the app.

### Task 2026-03-30-04 - Must-Have Preference Weighting
Status: Completed

Changes:
- Added `mustHaveConditionKeys` across the matching domain, repository contracts, app-state drafts, profile overlay, and Network registration flow.
- Added cap-of-five selection behavior:
  - users can mark up to 5 non-negotiable conditions
  - additional options become non-selectable once 5 are already chosen
- Extended structured persistence with `cupidate_preferences.must_have_condition_keys`.
- Updated score calculation so matched non-negotiables amplify the relevant scoring axis.
- Added explainability support:
  - `priorityMatches[]`
  - matching feedback now calls out aligned non-negotiables
- Applied the schema migration and refreshed the live dev seed.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed (`15` suites / `43` tests).

Notes:
- This keeps the POC close to the product promise that some preferences matter more than others, while still staying explainable.

### Task 2026-03-30-05 - Cupidate Profile Visibility Gating
Status: Completed

Changes:
- Added `profileVisibility` to cupidate storage and hydration:
  - `private`
  - `basic`
  - `public`
- Added a Supabase migration for `cupidates.profile_visibility` and refreshed the seed data.
- Updated Network registration and owner profile editing so each cupidate can set its own visibility scope.
- Reworked the profile overlay:
  - owner sees full management controls
  - non-owner sees only what the chosen visibility scope permits
- Tightened Matching card/profile surfaces so remote detail exposure respects visibility scope.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed.

Notes:
- Account-level cupid discovery and per-cupidate profile visibility are now separate concepts in both data and UI.

### Task 2026-03-30-06 - Visibility Surface Clarification
Status: Completed

Changes:
- Clarified wording in My so the app-level toggle is presented as cupid account discovery, not cupidate profile visibility.
- Added visibility and must-have summaries directly to Network cupidate roster rows.
- Updated translation keys in English/Korean so the two privacy layers are explained consistently.

Verification:
- `npx.cmd tsc --noEmit` passed.
- `npm.cmd test -- --runInBand` passed.

Notes:
- This pass focused on reducing user confusion before device QA.
