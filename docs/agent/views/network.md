# Network View Spec (Cupid-First QA Pass)

Last Updated: 2026-04-01

## 1. Screen Purpose
- Manage my cupid network first, then surface cupidates that become available through that network.
- Allow entry into profile detail for both cupid and cupidate entities.
- Make it obvious that:
  - every user is a cupid
  - not every cupid is an active cupidate
  - connected cupids with active cupidate profiles appear automatically in the cupidate list
  - cupidates are not added manually for other people

## 2. High-Level Layout
1. app header
- title: `Cupidate: Network`

2. primary segment row
- `Cupids`
- `Cupidates`

3. segment content
- `Cupids` segment:
  - compact guide card only
  - cupid roster directly visible without an extra sub-tab
  - floating add button at bottom-right opens the add-cupid composer
- `Cupidates` segment:
  - compact guide card only
  - `My Dating Profile`
  - `Active Cupidates in Network`

4. bottom dock tab bar
- Network tab active

## 3. Cupidates Segment Rules
### 3.1 My Dating Profile
- shows the current cupid's single self cupidate profile when it exists
- each row should include:
  - display name
  - age/gender/region summary
  - job title or fallback meta
  - activation badge (`Active` / `Inactive`)
  - profile visibility label (`Private` / `Basic` / `Public`)
  - must-have condition count
- row press opens `Cupidate Profile View`
- if the owner opens the profile, they can:
  - activate/deactivate the cupidate
  - change cupidate profile visibility
  - edit core public profile fields
  - edit core matching preference fields

### 3.2 Active Cupidates in Network
- shows only cupidates that belong to connected cupids and are currently active
- inactive or non-existent cupidate profiles do not appear here
- each row should include:
  - display name
  - owner cupid nickname
  - age/gender/region summary
  - visibility label
- row press opens `Cupidate Profile View`
- visibility rules still apply inside the profile view
- public cupidate profiles should use:
  - one merged top card for intro + basic facts
  - a compact fact grid instead of long vertical meta rows
  - a separate preferences card

## 4. Cupids Segment
### 4.1 Cupid List
- shows currently connected or pending cupids
- each row should include:
  - nickname
  - connection status badge
  - direction label for inbound/outbound pending requests
  - dating profile status badge (`Active` / `Inactive` / `No Dating Profile`)
- row press opens `Cupid Profile View`
- inbound pending requests must expose in-row `Accept` / `Decline` actions
- cupid profile should show:
  - `Cupid Activity` summary
  - when the user has an active cupidate, a swipe/tab transition between:
    - `Cupid Activity`
    - `Cupidate Profile`

### 4.2 Add Cupid Composer
- opened from a floating action button, not from a sub-tab
- dedicated registration/search view for finding another cupid
- floating action button should feel docked to the top-right edge of the bottom navigation, not like a loose content button
- should contain:
  - a short guidance card that explains:
    - adding a cupid is enough
    - connected users who already activated cupidate appear in `Cupidates` automatically
  - search input for `email or username`
  - search result list
  - select action
  - send connection request action
- empty/loading/error states must stay inside this composer only

## 5. Redundancy Cleanup Rules
- Remove dead controls that do not change real behavior.
- Do not surface a separate `Board` view.
- Do not surface a separate `Register Cupidate` flow for other people.
- Do not show a second layer of `Cupid List` / `Add Cupid` tabs inside the `Cupids` segment.
- Avoid duplicate titles where the selected primary tab already defines the mode.
- Keep one clear purpose per segment.
- Roster rows should explain both:
  - connection state
  - dating profile state

## 6. Design Rules
- Use the current `design_system.md` palette and dock navigation rules.
- Roster rows, explanation cards, and forms must all use `PixelBox` language.
- Text on dark shell background uses light text.
- Text on beige surfaces uses dark text.
- Status should be readable by color + label together.
- On compact Android widths, avoid strict `%` width grids that can collapse text into vertical character stacks.
- Prefer responsive `flexBasis + flexGrow + minWidth: 0` patterns for row cards and profile fact chips.

## 7. Data Contract
Queries:
- `network_connected_cupids`
- `network_connection_requests`
- `network_active_cupidates`
- `profile_detail_summary`

Mutations:
- `update_cupidate`
- `request_cupid_connection`
- `update_connection_status`

Structured persistence contract:
- `region`, `jobTitle`, `heightCm`, `smokingHabit`, `drinkingHabit`, `profileVisibility`
- `preferredAgeRange`, `preferredRegions`, `preferredJobGroups`
- `preferredSmoking`, `preferredDrinking`, `preferredGenders`, `preferredHeightRange`
- `mustHaveConditionKeys`
- repository hydrates those back into `preferences` for backward-safe reads
- repository create path for cupidate is an owner-based upsert, not multi-profile creation

## 8. States
- Loading:
  - search loading card
- Empty:
  - no self cupidate yet
  - no active cupidates in network
  - no connected cupids
  - no search results
- Error:
  - retry CTA inside Network only

## 9. i18n
When locale changes, these must switch together:
- segment labels
- subview labels
- form fields and validation messages
- search and action labels
- empty/loading/error copy

## 10. Definition of Done
- It is obvious that `Cupid` is the base relationship object in Network.
- It is obvious that `Cupidate` is an optional active dating profile, not a second user type to add manually.
- Connected cupids with active cupidates appear automatically in the cupidate list.
- Cupid registration/search is a clearly dedicated subview.
- Redundant blocks are removed.
- English and Korean both remain readable in the same layout.
- Users can tell at a glance which connected cupids are ready for matching and which cupidates are actually available in the network.
