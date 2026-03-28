export const designTokens = {
  color: {
    background: "#1F2A44",
    backgroundAlt: "#2A3C66",
    backgroundPanel: "#3B5998",
    surface: "#F4E8D1",
    surfaceAlt: "#EADBC2",
    surfaceRaised: "#FFF6E4",
    border: "#000000",
    shadow: "#000000",
    shadowSoft: "#1F1F1F",
    ink: "#111111",
    inkMuted: "#5A5144",
    inkInverse: "#FFFFFF",
    pink: "#D84C73",
    pinkDark: "#BC3D62",
    blue: "#4A76A8",
    blueDark: "#3B5998",
    navyDark: "#2A3C66",
    gold: "#E8B649",
    goldDark: "#B88020",
    success: "#6FAE63",
    successDark: "#45753D",
    warning: "#D8B46A",
    warningDark: "#96722A",
    danger: "#B8576F",
    dangerDark: "#7A3144",
    inputFill: "#FFF8EB",
    inputBorder: "#8E7E64",
    error: "#9D223E",
    switchTrack: "#CDBA93"
  },
  border: {
    thin: 1,
    normal: 2,
    heavy: 3
  },
  spacing: {
    xxs: 4,
    xs: 8,
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 32
  },
  font: {
    family: "PixelFont",
    title: 20,
    section: 18,
    body: 14,
    label: 13,
    caption: 12,
    metric: 24
  },
  size: {
    headerHeight: 56,
    tabBarHeight: 76,
    tabBarInset: 8,
    pixelShadow: 4,
    buttonHeight: 42,
    buttonHeightSmall: 34,
    avatarSm: 32,
    avatarMd: 48,
    avatarLg: 96
  }
} as const;

export type ButtonVariant = "neutral" | "primary" | "secondary" | "success" | "warning" | "danger";
