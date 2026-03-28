# Cupidate Design Direction (Reference-Based)

Last Updated: 2026-03-28

This guide captures the visual direction from the provided references and turns it into concrete implementation rules.

## 1) Visual DNA

Reference interpretation:
- Retro pixel-game UI with thick black outlines and beveled containers.
- Deep navy/purple base surfaces, with bright accent actions.
- Accent colors are functional and limited:
  - blue/cyan for primary progress/action
  - orange for high-attention CTA
  - green for positive/accepted states
  - red for destructive/rejected states
- Sprite-first identity: Cupid character and tiny iconography should feel like game assets, not generic mobile app stickers.
- Dense but readable panels, with strong hierarchy and scoreboard-like modules.

## 2) Core Design Rules

### Layout
- Border radius defaults to `0`.
- Use double-layer panel treatment:
  - outer: heavy border shell
  - inner: slightly lighter content panel
- Keep spacing grid in 4px increments.
- Do not rely on large blank whitespace; use framed sections.

### Typography
- Pixel-style Korean/Latin font is required in production builds.
- Fallback for development: `monospace`.
- Headings are short and uppercase where appropriate.
- One strong display style, one body style; avoid too many font sizes.

### Color System
- Background: deep navy spectrum.
- Surface: desaturated blue-violet panels.
- Borders/shadows: near-black.
- Text:
  - primary: light neutral
  - secondary: desaturated blue-gray
- Semantic:
  - primary action: cyan-blue
  - warning/attention: orange
  - success: green
  - danger: red

### Components
- Buttons must support semantic variants (`neutral`, `primary`, `success`, `warning`, `danger`).
- Tabs should look like game menu buttons, not plain text pills.
- Cards should always show:
  - title line
  - status/meta line(s)
  - explicit action area
- Inputs should have hard border shells and clear focused state.

### Motion & Feedback
- Sprite motion should use step-like timing rather than smooth easing.
- Interaction feedback must be immediate:
  - pressed states with slight darkening/offset
  - status transitions visible in labels/badges

## 3) Anti-Generic Checklist ("Not AI-looking")

Every screen must pass all checks:
- Has one clear signature motif (e.g., sprite strip, match-status board, console header).
- Uses semantic colors intentionally, not random gradients.
- Action hierarchy is obvious at first glance.
- Empty/loading/error states look designed, not default placeholders.
- Copy uses Cupidate domain terms consistently.

## 4) Screen-Specific Direction

### Home
- Should feel like command center + game lobby.
- Show hero board, summary counters, and recent event feed.

### Network
- Should feel like roster management.
- Inputs + list cards must read as "register + manage" workflow.

### Matching
- Should feel like match-status board.
- Recommendation cards must foreground score, reasons, and state transitions.

### My
- Should feel like profile terminal/settings panel.
- Toggle rows and save actions should remain compact and structured.

## 5) Implementation Plan

1. Establish global design tokens (colors/spacing/borders/type).
2. Upgrade reusable components (button/card/tab/input shells).
3. Apply first-pass redesign on Home/Network/Matching/My.
4. Replace placeholder graphics with sprite assets when available.
5. Run usability pass for empty/loading/error states.
