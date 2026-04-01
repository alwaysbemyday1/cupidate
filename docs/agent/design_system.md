# Cupidate Design System

Last Updated: 2026-04-01

## 1. Source of Truth
- Top-level rulebook: `docs/agent/codexrules.md`
- Design source of truth: `docs/agent/design_system.md`
- Domain/data source of truth: `docs/agent/domain_data.md`
- Prototype folder: `docs/design/`
- Reference images:
  - `docs/design/pt_home_network_260329.png`
  - `docs/design/pt_info_260329.png`
  - `docs/design/pt_matching_260329.png`

## 2. Fidelity Target
- Goal: recreate the same overall impression, hierarchy, emotional tone, and interaction feel as the prototypes.
- Goal: make the app feel like a polished retro 16-bit mobile service, not a generic React Native dashboard.
- Not the goal: copying the screenshots pixel-by-pixel.
- We are allowed to simplify layout mechanics when needed, as long as the following stay recognizable:
  - pink + navy + beige visual system
  - hard black pixel borders and hard pixel shadows
  - console-like panel hierarchy
  - fixed bottom dock navigation
  - chunky pixel CTA buttons

## 3. Visual Summary
- Overall mood: compact pixel-console UI with romantic/playful energy.
- Primary emotions:
  - friendly
  - playful
  - trustworthy
  - tactical
- Visual hierarchy:
  - dark navy shell/frame
  - light beige content cards
  - pink action accents for romance/matching
  - blue/navy utility accents for network/system actions
  - black borders everywhere important

## 4. Non-Negotiables
- `borderRadius: 0`
- Do not use soft mobile shadows.
- Do not use `shadowColor`, `shadowOpacity`, `shadowRadius`, or Android `elevation` for core UI.
- All major cards, panels, buttons, chips, and dock items must use the hard pixel-border language.
- All visible UI strings must come from i18n messages.
- All visible text must render through `PixelText`.
- Avoid duplicate headings and duplicate data blocks inside the same screen.
- If a section already explains itself through a selected sub-tab, do not repeat the same heading outside unless it adds orientation value.

## 5. React Native Implementation Rules
### 5.1 Hard Pixel Shadow
Use layered `View` composition instead of native soft shadow APIs.

Reference pattern:
- outer shadow layer
  - `backgroundColor: '#000000'`
  - `paddingRight: 3~4`
  - `paddingBottom: 3~4`
- inner content layer
  - `borderWidth: 2`
  - `borderColor: '#000000'`
  - `backgroundColor: beige or role color`

This rule applies to:
- `PixelBox`
- `PixelButton`
- summary cards
- dock/tab chips when visually elevated

### 5.2 Typography
- Primary pixel font candidates:
  - `DungGeunMo`
  - `Galmuri`
  - fallback alias: `PixelFont`
- All text should use `PixelText`.
- Avoid default RN typography directly in screen files.
- Korean and English must both remain legible at small sizes.

### 5.3 Navigation
- In the current POC stage, prioritize a custom dock-style bottom bar over `react-navigation`'s default tab visuals.
- The bottom navigation should feel like a fixed hardware dock:
  - pinned to bottom
  - full-width
  - shared surface background
  - strong top border
  - four evenly distributed items
- Tabs:
  - `HOME`
  - `NETWORK`
  - `MATCH`
  - `MY`
- Active tab treatment:
  - colored top strip
  - stronger card face
  - high-contrast label
- Inactive tab treatment:
  - still readable
  - not dark text on dark navy

### 5.4 Safe Areas
- Root shell uses `react-native-safe-area-context`.
- Bottom dock must respect bottom inset but still feel visually attached to the screen edge.

## 6. Color Palette
Use the live code palette below unless there is an explicit redesign task.

### 6.1 Core Tokens
- `background = #243552`
- `backgroundAlt = #31476F`
- `backgroundPanel = #47679F`
- `surface = #F8F0E4`
- `surfaceAlt = #EEDFCC`
- `surfaceRaised = #FFF9F1`
- `border = #000000`
- `ink = #161616`
- `inkMuted = #5C5448`
- `inkInverse = #FFFFFF`
- `pink = #D84C73`
- `pinkDark = #BC3D62`
- `blue = #5A84BC`
- `blueDark = #3E5E97`
- `navyDark = #263B63`
- `gold = #E8B649`
- `success = #6FAE63`
- `warning = #D8B46A`
- `danger = #B8576F`
- `inputFill = #FFF8EB`
- `inputBorder = #8E7E64`
- `error = #9D223E`

### 6.2 Role Mapping
- pink:
  - match action
  - romance CTA
  - active emphasis
- blue/navy:
  - network/system actions
  - utility buttons
  - dock inactive icon chips
- beige surfaces:
  - all main readable content
  - forms
  - cards
  - lists
- white text:
  - only on dark or saturated fills
- black/dark text:
  - default for beige/light surfaces

### 6.3 Contrast Rule
- Never place black text directly on dark navy unless the area is intentionally tiny and highly contrasted.
- If the background is navy/dark blue, use white or near-white text.
- If the text is black/dark, move it onto beige or other light surfaces.

## 7. Layout Tokens
- spacing: `4 / 8 / 12 / 16 / 20 / 24 / 32`
- border: `1 / 2 / 3`
- pixel shadow offset: `4`
- header height: `48`
- tab bar height: `62`
- button height: `42`
- avatars: `32 / 48 / 96`

### 7.1 Compact-Screen Guardrails
- Do not rely on strict `width: "48%"` grids for critical cards or fact chips.
- Prefer responsive layout rules:
  - `flexBasis`
  - `flexGrow`
  - `maxWidth: "100%"`
  - `minWidth: 0` on shrinking flex children
- Any row with text + badges + avatar must explicitly protect the text column with `minWidth: 0`.
- Avoid wrapping percentage-sized cards inside plain anonymous `View` nodes, because the percentage will then resolve against the wrapper instead of the row container and can produce broken ultra-thin columns.

## 8. Component Contracts
### 8.1 `PixelText`
Variants:
- `screenTitle`
- `sectionTitle`
- `body`
- `label`
- `caption`
- `button`

### 8.2 `PixelBox`
- Base container for cards and panels.
- Must keep black border + hard pixel shadow.
- Main card backgrounds should usually be `surface`, `surfaceAlt`, or `surfaceRaised`.

### 8.3 `PixelButton`
Variants:
- `primary`
- `secondary`
- `success`
- `warning`
- `danger`
- `neutral`

Rules:
- Use chunky rectangular button faces.
- Use bevel/highlight logic rather than modern soft gradients.
- Button labels must stay centered and legible in both `en` and `ko`.

### 8.4 `PixelTabBar`
- Full-width bottom dock.
- Shared dock surface rather than four isolated floating buttons.
- Items are evenly distributed in a single row.
- Each item may have:
  - top active strip
  - icon chip
  - label
- The whole bar should read as one navigation object, not a loose button pile.

### 8.5 Network FAB
- The Network action button is a dock-adjacent FAB, not a normal inline button.
- It should sit visually attached to the top-right of the bottom dock.
- Use:
  - hard pixel shadow
  - stronger silhouette than surrounding cards
  - round or rounded-square face
  - short visible label, full accessibility label

### 8.6 Icon Asset Brief
- We now need a real icon pack for the dock and small UI connectors.
- Do not use emoji-like hearts, soft gradients, or glossy app-store icon styling.
- Icons must feel like in-game UI glyphs, not marketing illustrations.

Required set:
- `tab-home`
- `tab-network`
- `tab-match`
- `tab-my`
- optional: one neutral `match-link` glyph for pair cards

Concept direction:
- `tab-home`
  - tiny pixel house / doorway / roof silhouette
- `tab-network`
  - two small busts or three linked nodes
- `tab-match`
  - two portrait cards facing inward with a tiny connector spark
  - do not use a floating heart
- `tab-my`
  - single bust / profile badge
- `match-link`
  - small neutral connector badge
  - use link / spark / bracket language, not a romantic heart

Production spec:
- base canvas: `32x32 px`
- target readable size in app: `16x16 ~ 18x18 px`
- transparent background
- hard black outline
- max `3~4` fill colors per icon, excluding outline
- no anti-aliasing
- no blur
- no semi-transparent glow
- no built-in drop shadow
- keep `2 px` safe padding so the silhouette survives scaling

State spec:
- provide two states per nav icon:
  - `inactive`
  - `active`
- the silhouette should stay the same across states
- only accent colors should change between states

Export spec:
- preferred: individual `png` files
- acceptable: one tightly packed sprite sheet with a clear index map
- scaling must use nearest-neighbor / pixel-perfect export

AI generation guidance:
- ask for:
  - `16-bit retro pixel UI icon`
  - `transparent background`
  - `hard black outline`
  - `no anti-aliasing`
  - `game HUD icon`
- after generation, clean up the icon in a pixel editor if the grid is muddy

Recommended tools:
- `Aseprite`
- `LibreSprite`
- `Piskel`
- `Photoshop` or `Photopea` with nearest-neighbor export
- The FAB should never float high enough to read like a random content card.

### 8.6 Section Titles
- `pageSectionTitle`: for section headings placed directly on dark shell background.
- `surfaceSectionTitle`: for headings inside beige/light cards.
- Never mix the two incorrectly.

### 8.7 Profile Sheets
- `Cupidate Profile` should not split `public summary` and `basic profile` into two stacked cards when the profile is public.
- Use one top card for:
  - avatar
  - display name
  - owner line
  - activation / visibility chips
  - short intro
  - compact basic facts
- Basic facts should use a compact two-column chip/grid layout, not a long vertical label stack.
- `Dating Preferences` stays as a separate card.
- Owner edit mode should be grouped into:
  - `Basics`
  - `About & Lifestyle`
  - `Dating Preferences`
- If a `Cupid Profile` includes a horizontal pager between `Cupid Activity` and `Cupidate Profile`, each page must own its own vertical scroll.
- Do not let one profile page inherit the height of the other page's content.

## 9. Screen Structure Rules
### Home
Required order:
1. `Alarm Feed`
2. `Today's Rec's`
3. `Recent Summary`
4. `Quick Actions`

Rules:
- No redundant hero banner if the page header already communicates the page identity.
- Recommendation cards should be compact, readable, and score-first.

### Network
Required structure:
1. primary segment row
   - `Cupids`
   - `Cupidates`
2. `Cupids` segment
   - cupid roster directly visible
   - add-cupid composer opened from a docked FAB
3. `Cupidates` segment
   - `My Dating Profile`
   - `Active Cupidates in Network`

Redundancy cleanup rule:
- Do not surface a separate board-only segment.
- Do not surface a separate cupidate-registration flow for remote people.
- Cupid connection search/request content lives only in the cupid add subview.
- Do not repeat the same helper copy across all segments.

### Matching
Required order:
1. `Matching Manager`
2. `Pending Match Requests`
3. `User Suggested Matches`
4. `Matching Insights`

Rules:
- Score explanation must be visible.
- Request status must be obvious at a glance.
- Keep action buttons short and state-aware.

### My
Required order:
1. `Profile Overview`
2. `Account Details`
3. `Language Settings`
4. `Matching Preferences`
5. `Account Summary`

Rules:
- Language switch must feel immediate.
- Profile/account/preference information should not duplicate the same labels in multiple cards.

### Auth
Required structure:
- intro card
- auth form card
- session status card

Rules:
- This is not a generic login page.
- It should feel like a themed in-app terminal/panel.

## 10. i18n Rules
- Supported locales: `en`, `ko`
- All rebuilt screens must use i18n messages.
- Brand name `Cupidate` does not need translation.
- Locale switching is controlled in `My`.
- Locale persists on-device.
- New UI work must add both English and Korean strings in the same task.

## 11. QA Checklist
- Does the bottom bar feel like a single dock fixed to the screen bottom?
- Are tab labels readable against their actual background?
- Are there any soft RN shadows left in the core UI?
- Are page titles using the correct contrast style?
- Are there duplicate headings or duplicate data blocks inside the same screen?
- Is it obvious that Network adds `cupids`, while `cupidates` appear automatically from active connected profiles?
- Does the cupid list clearly separate connection state from dating-profile state?
- Does the UI still match the prototype impression without trying to clone screenshots 1:1?

## 12. Current Rebuild Status
- `D1` complete: shared pixel primitives
- `D2` complete: My
- `D3` complete: Home
- `D4` complete: Network
- `D5` complete: Matching
- Current focus: `D6 Integration Hardening`
