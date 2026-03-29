# Network View Spec (Prototype Rebuild)

Last Updated: 2026-03-29

## 1. Screen Purpose
- Manage the relationship graph between my cupidates and connected cupids.
- Keep the overview board separate from registration/detail management.
- Allow entry into profile detail for both cupid and cupidate entities.
- Make it clear where the user should go for:
  - board overview
  - cupidate list
  - cupidate registration
  - connected cupid list
  - connected cupid registration/search

## 2. High-Level Layout
1. app header
- title: `Cupidate: Network`

2. primary segment row
- `Board`
- `My Cupidates`
- `Connected Cupids`

3. segment content
- `Board` segment:
  - `MASTER CUPID`
  - relationship board
  - match proposal stats
  - legend
- `My Cupidates` segment:
  - sub-toggle: `Cupidate List` / `Register Cupidate`
- `Connected Cupids` segment:
  - sub-toggle: `Cupid List` / `Register Cupid`

4. bottom dock tab bar
- Network tab active

## 3. Board Segment Rules
- This is the summary/overview mode.
- It should answer, at a glance:
  - how many proposals exist
  - how many cupids are connected
  - how many introductions succeeded
  - how many matches are active
- The board is the only place that should show the large relationship graph.
- Do not repeat the same stats again inside the list/register segments.

## 4. My Cupidates Segment
### 4.1 Cupidate List Subview
- shows registered cupidates owned by the current cupid
- each row should include:
  - display name
  - age/gender/region summary
  - job title or fallback meta
  - current match status badge
- row press opens `Cupidate Profile View`
- if the owner opens the profile, they can:
  - activate/deactivate the cupidate
  - edit core public profile fields
  - edit core matching preference fields

### 4.2 Register Cupidate Subview
- dedicated registration view for cupidate creation
- must collect the profile fields needed for the current POC:
  - name
  - birth year
  - height
  - gender
  - region
  - job title
  - hobbies
  - bio / matching notes
  - smoking habit
  - drinking habit
- must collect the preference fields needed for scoring:
  - preferred age min/max
  - preferred regions
  - preferred job groups
  - preferred gender
  - preferred height min/max
  - preferred smoking
  - preferred drinking
- structured fields should be saved into top-level columns first, not only nested json
- flexible tags like hobbies remain json-backed
- save CTA must still allow submission-driven validation feedback
- save CTA should be disabled only while the mutation is actively running
- newly created cupidates should default to `inactive`
- user should be guided to open the profile detail and activate when ready

## 5. Connected Cupids Segment
### 5.1 Cupid List Subview
- shows currently connected or pending cupids
- each row should include:
  - nickname
  - cupid id
  - region or fallback meta
  - connection status badge
- row press opens `Cupid Profile View`
- cupid profile should show accumulated introduction / completion stats

### 5.2 Register Cupid Subview
- dedicated registration/search view for finding another cupid by nickname
- should contain:
  - search input
  - search result list
  - select action
  - send connection request action
- empty/loading/error states must stay inside this subview only

## 6. Redundancy Cleanup Rules
- Remove dead controls that do not change real behavior.
- Do not show cupidate registration form inside the board view.
- Do not show cupid connection search inside the cupid list view.
- Avoid duplicate titles where the selected sub-tab already defines the mode.
- Keep one clear purpose per subview.

## 7. Design Rules
- Use the current `design_system.md` palette and dock navigation rules.
- Board nodes, roster rows, and forms must all use `PixelBox` language.
- Text on dark shell background uses light text.
- Text on beige surfaces uses dark text.
- Status should be readable by color + label together.

## 8. Data Contract
Queries:
- `network_my_cupidates`
- `network_connected_cupids`
- `network_connection_requests`
- `profile_detail_summary`

Mutations:
- `create_cupidate`
- `update_cupidate`
- `request_cupid_connection`
- `update_connection_status`

Structured persistence contract:
- `region`, `jobTitle`, `heightCm`, `smokingHabit`, `drinkingHabit`
- `preferredAgeRange`, `preferredRegions`, `preferredJobGroups`
- `preferredSmoking`, `preferredDrinking`, `preferredGenders`, `preferredHeightRange`
- repository hydrates those back into `preferences` for backward-safe reads

## 9. States
- Loading:
  - board sync card
  - search loading card
- Empty:
  - no board nodes
  - no cupidates
  - no connected cupids
  - no search results
- Error:
  - retry CTA inside Network only

## 10. i18n
When locale changes, these must switch together:
- segment labels
- subview labels
- board labels and legend
- form fields and validation messages
- search and action labels
- empty/loading/error copy

## 11. Definition of Done
- The board feels like an overview screen, not a data-entry page.
- Cupidate registration is a clearly dedicated subview.
- Cupid registration/search is a clearly dedicated subview.
- Redundant blocks are removed.
- English and Korean both remain readable in the same layout.
