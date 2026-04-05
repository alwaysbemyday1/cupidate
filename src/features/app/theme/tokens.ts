import { Platform } from "react-native";

const pixelFallbackFamily =
  Platform.select({
    ios: "Menlo",
    android: "monospace",
    default: "monospace"
  }) ?? "monospace";

export const designTokens = {
  color: {
    background: "#243552",
    backgroundAlt: "#31476F",
    backgroundPanel: "#47679F",
    backgroundGlowA: "rgba(233, 182, 93, 0.16)",
    backgroundGlowB: "rgba(93, 142, 203, 0.22)",
    backgroundGlowC: "rgba(216, 76, 115, 0.14)",
    surface: "#F8F0E4",
    surfaceAlt: "#EEDFCC",
    surfaceRaised: "#FFF9F1",
    border: "#000000",
    shadow: "#000000",
    shadowSoft: "#1F1F1F",
    ink: "#161616",
    inkMuted: "#5C5448",
    inkInverse: "#FFFFFF",
    pink: "#D84C73",
    pinkDark: "#BC3D62",
    blue: "#5A84BC",
    blueDark: "#3E5E97",
    navyDark: "#263B63",
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
    family: pixelFallbackFamily,
    title: 20,
    section: 18,
    body: 14,
    label: 13,
    caption: 12,
    metric: 24
  },
  size: {
    headerHeight: 48,
    tabBarHeight: 62,
    tabBarInset: 4,
    pixelShadow: 4,
    buttonHeight: 42,
    buttonHeightSmall: 34,
    avatarSm: 32,
    avatarMd: 48,
    avatarLg: 96
  }
} as const;

export type ButtonVariant = "neutral" | "primary" | "secondary" | "success" | "warning" | "danger";
