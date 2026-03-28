export const designTokens = {
  color: {
    bg: "#131A2D",
    bgAlt: "#1A2440",
    shell: "#0A0E1D",
    border: "#080B14",
    panel: "#222F4F",
    panelAlt: "#2A3A61",
    surface: "#334875",
    textPrimary: "#F3F6FF",
    textSecondary: "#B8C3E0",
    textMuted: "#8EA0C7",
    titleBlue: "#49A9FF",
    titleOrange: "#FF9A3C",
    statusOnlineBg: "#2FB66F",
    statusOnlineText: "#0A3A22",
    buttonNeutral: "#566387",
    buttonPrimary: "#3E9DFF",
    buttonSuccess: "#58C96A",
    buttonWarning: "#F68B30",
    buttonDanger: "#DF4D4D",
    inputBg: "#1A2544",
    inputText: "#F0F4FF",
    cardBg: "#1B2848",
    cardBgAccent: "#202F54",
    error: "#FF7A7A"
  },
  border: {
    heavy: 3,
    normal: 2
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 10,
    md: 12,
    lg: 14,
    xl: 18
  },
  font: {
    title: 26,
    subtitle: 12,
    body: 13,
    section: 14,
    metric: 22
  }
} as const;

export type ButtonVariant = "neutral" | "primary" | "success" | "warning" | "danger";
