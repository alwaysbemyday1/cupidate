# Matching View Spec (QA-Hardened POC)

Last Updated: 2026-04-02

## 1. Screen Goal
- Matching is the action board for pairing cupidates across connected cupids.
- The screen must help the user do three things quickly:
  - process requests that need a decision now
  - review request-ready suggestions
  - understand just enough score context to decide confidently

## 2. Layout
1. Header
- Title only: `Matching`

2. Pending Match Requests
- Show only requests that still need action:
  - `requested`
  - `accepted`
- Each card should feel operational, not descriptive.
- Required card structure:
  - left/right mini profile row
  - score chip
  - current status chip
  - one short hint line
  - action row
- Hint line priority:
  - `requested` -> approval is next
  - `accepted` -> contact sharing is next
  - fallback to one concise matching reason only if needed
- Actions:
  - `requested` -> `Approve`, `Reject`
  - `accepted` -> `Mark Contact Shared`

3. Suggested Matches
- Show only suggestion cards with no existing request.
- Limit the list to the top few candidates so the section stays compact.
- Required card structure:
  - left/right mini profile row
  - score chip
  - one short matching reason
  - single CTA: `Request Match`
- Do not repeat low-value state labels such as `New Suggestion` on every card.

4. Matching Insights
- This section is a compact decision aid, not a full report view.
- Focus pair priority:
  - first active request
  - else first suggestion
  - else latest request
- Required structure:
  - pair summary row
  - score + status + created date row
  - `Score` block
  - `Flow` block
  - `Why It Fits` block when visibility allows
- Keep the vertical footprint smaller than the older prototype-rebuild version.

## 3. Visibility and Privacy Rules
- Detailed score context is visible only when both cupidates are:
  - active
  - public, or owned by the current cupid
- If either side is `private`, `basic`, or inactive:
  - keep score/status/timeline visible
  - hide detailed breakdown reasoning
  - hide detailed feedback bullets
  - show a short visibility notice instead

## 4. UX Rules
- Matching cards should read in this order:
  - who the pair is
  - how strong the score is
  - what decision is needed
- Avoid repeating the same meaning in:
  - section titles
  - chips
  - helper copy
- Use short operational language over dashboard language.
- Buttons should sit at the bottom of the card and stay easy to scan on narrow screens.
- Mini profile cards must stay pressable and open the relevant profile overlay.

## 5. Score Breakdown Rules
- Current POC breakdown axes:
  - `Age`
  - `Hobbies`
  - `Lifestyle`
  - `Location`
  - `Profile`
- `Profile` fit currently includes:
  - preferred gender
  - preferred height range
  - preferred job groups
- Must-have conditions take precedence in explanation text when matched.

## 6. Data Contracts
Queries:
- `matching_candidate_list`
- `matching_requests_inbox`
- `matching_history_summary`
- `matching_score_breakdown`
- `matching_profile_snapshot`

Mutations:
- `send_matching_request`
- `accept_matching_request`
- `reject_matching_request`
- `confirm_contact_exchange`

## 7. States
- Loading:
  - show sync/loading state card
- Empty:
  - no pending requests
  - no suggestions
  - no insight focus pair
- Error:
  - show retry CTA

## 8. QA Checklist
- Request cards do not carry duplicate explanation text.
- Suggestion cards do not repeat a meaningless `new` state chip.
- Insight card stays readable on compact Android widths.
- Hidden-profile cases do not leak hobbies, lifestyle, or detailed preference data.
- Inactive cupidates never generate actionable suggestions.
- Request -> approve -> contact shared state transitions update the screen immediately.
