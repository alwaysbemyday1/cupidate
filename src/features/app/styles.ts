import { StyleSheet } from "react-native";

import { designTokens } from "./theme/tokens";

const c = designTokens.color;
const b = designTokens.border;
const s = designTokens.spacing;
const f = designTokens.font;

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.bg
  },
  container: {
    flex: 1,
    paddingHorizontal: s.lg,
    paddingBottom: s.lg
  },
  headerFrame: {
    marginTop: s.md,
    marginBottom: s.xs,
    borderWidth: b.heavy,
    borderColor: c.border,
    backgroundColor: c.panel,
    paddingHorizontal: s.md,
    paddingVertical: s.sm
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  title: {
    color: c.titleBlue,
    fontFamily: "monospace",
    fontSize: f.title,
    fontWeight: "800",
    letterSpacing: 1
  },
  titleAccent: {
    color: c.titleOrange
  },
  subtitle: {
    color: c.textSecondary,
    fontFamily: "monospace",
    fontSize: f.subtitle,
    marginTop: s.xxs
  },
  statusBadge: {
    borderWidth: b.heavy,
    borderColor: c.border,
    backgroundColor: c.statusOnlineBg,
    paddingHorizontal: s.xs,
    paddingVertical: s.xxs
  },
  statusText: {
    color: c.statusOnlineText,
    fontFamily: "monospace",
    fontWeight: "800",
    fontSize: 11
  },
  tabRow: {
    flexDirection: "row",
    gap: s.xs,
    marginBottom: s.sm,
    flexWrap: "wrap"
  },
  panel: {
    flex: 1,
    borderWidth: b.heavy,
    borderColor: c.border,
    backgroundColor: c.panelAlt
  },
  panelContent: {
    padding: s.md,
    gap: s.xs
  },
  heroCard: {
    borderWidth: b.heavy,
    borderColor: c.border,
    backgroundColor: c.surface,
    padding: s.md,
    marginBottom: s.xs
  },
  heroTitle: {
    color: c.titleBlue,
    fontFamily: "monospace",
    fontWeight: "800",
    fontSize: 24,
    letterSpacing: 1
  },
  heroTitleAccent: {
    color: c.titleOrange
  },
  heroSubtitle: {
    color: c.textPrimary,
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 13,
    marginTop: s.xxs
  },
  spriteRow: {
    marginTop: s.sm,
    flexDirection: "row",
    gap: s.xs,
    flexWrap: "wrap"
  },
  spriteFrame: {
    width: 22,
    height: 22,
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.bgAlt
  },
  fieldLabel: {
    color: c.textPrimary,
    fontFamily: "monospace",
    fontWeight: "700",
    marginTop: 2
  },
  input: {
    borderWidth: b.heavy,
    borderColor: c.border,
    backgroundColor: c.inputBg,
    color: c.inputText,
    paddingHorizontal: s.sm,
    paddingVertical: s.xs,
    fontFamily: "monospace"
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: "top"
  },
  buttonRow: {
    flexDirection: "row",
    gap: s.xs,
    flexWrap: "wrap"
  },
  pixelButton: {
    borderWidth: b.heavy,
    borderColor: c.border,
    paddingHorizontal: s.sm,
    paddingVertical: s.xs,
    minWidth: 92
  },
  pixelButtonNeutral: {
    backgroundColor: c.buttonNeutral
  },
  pixelButtonPrimary: {
    backgroundColor: c.buttonPrimary
  },
  pixelButtonSuccess: {
    backgroundColor: c.buttonSuccess
  },
  pixelButtonWarning: {
    backgroundColor: c.buttonWarning
  },
  pixelButtonDanger: {
    backgroundColor: c.buttonDanger
  },
  pixelButtonActiveOutline: {
    borderColor: c.textPrimary
  },
  pixelButtonText: {
    color: c.textPrimary,
    fontFamily: "monospace",
    fontWeight: "800"
  },
  errorText: {
    color: c.error,
    fontFamily: "monospace",
    fontWeight: "700"
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s.xs
  },
  summaryCard: {
    width: "48%",
    borderWidth: b.heavy,
    borderColor: c.border,
    backgroundColor: c.cardBgAccent,
    padding: s.sm
  },
  summaryLabel: {
    color: c.textSecondary,
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 12
  },
  summaryValue: {
    color: c.textPrimary,
    fontFamily: "monospace",
    fontWeight: "800",
    fontSize: f.metric,
    marginTop: s.xxs
  },
  sectionTitle: {
    marginTop: s.xs,
    color: c.textPrimary,
    fontFamily: "monospace",
    fontWeight: "800",
    fontSize: f.section
  },
  emptyCard: {
    borderWidth: b.heavy,
    borderColor: c.border,
    backgroundColor: c.cardBg,
    padding: s.md
  },
  emptyText: {
    color: c.textPrimary,
    fontFamily: "monospace",
    fontWeight: "700"
  },
  emptySubText: {
    color: c.textMuted,
    fontFamily: "monospace",
    marginTop: s.xxs
  },
  listCard: {
    borderWidth: b.heavy,
    borderColor: c.border,
    backgroundColor: c.cardBg,
    padding: s.md,
    marginBottom: s.sm
  },
  listName: {
    color: c.textPrimary,
    fontFamily: "monospace",
    fontWeight: "800"
  },
  listMeta: {
    color: c.textSecondary,
    fontFamily: "monospace",
    marginTop: s.xxs
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: b.heavy,
    borderColor: c.border,
    backgroundColor: c.cardBg,
    paddingHorizontal: s.sm,
    paddingVertical: s.xs
  }
});
