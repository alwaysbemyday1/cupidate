import { StyleSheet } from "react-native";

import { designTokens } from "./theme/tokens";

const c = designTokens.color;
const b = designTokens.border;
const s = designTokens.spacing;
const f = designTokens.font;
const z = designTokens.size;

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: c.background
  },
  container: {
    flex: 1,
    backgroundColor: c.background,
    paddingHorizontal: s.md,
    paddingTop: s.md
  },
  screenBody: {
    flex: 1,
    paddingBottom: z.tabBarHeight + z.tabBarInset + s.sm
  },
  panel: {
    flex: 1
  },
  panelContent: {
    gap: s.md,
    paddingBottom: z.tabBarHeight + z.tabBarInset + s.lg
  },
  centerPanel: {
    flex: 1,
    justifyContent: "center"
  },

  headerFrame: {
    marginBottom: s.md
  },
  headerContent: {
    minHeight: z.headerHeight,
    backgroundColor: c.backgroundAlt,
    paddingHorizontal: s.md,
    paddingVertical: s.sm,
    justifyContent: "center"
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: s.md
  },
  title: {
    color: c.inkInverse
  },
  titleAccent: {
    color: c.gold
  },
  subtitle: {
    color: c.surfaceAlt,
    marginTop: 2
  },
  statusBadge: {
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.surface,
    paddingHorizontal: s.xs,
    paddingVertical: 4
  },
  statusText: {
    color: c.ink
  },

  gateCard: {
    marginHorizontal: s.xs
  },
  gateCardContent: {
    backgroundColor: c.surface,
    padding: s.md,
    gap: s.sm
  },
  gateTitle: {
    color: c.pink
  },
  gateText: {
    color: c.inkMuted
  },
  gateForm: {
    gap: s.xs
  },
  gateHint: {
    color: c.blueDark
  },

  heroCard: {},
  heroCardContent: {
    backgroundColor: c.surface,
    padding: s.md
  },
  heroTitle: {
    color: c.ink
  },
  heroTitleAccent: {
    color: c.pink
  },
  heroSubtitle: {
    color: c.inkMuted,
    marginTop: s.xxs
  },
  heroFrameMeta: {
    color: c.blueDark,
    marginTop: s.xxs
  },
  spriteRow: {
    marginTop: s.sm,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s.xs
  },
  spriteFrame: {
    width: 40,
    height: 40,
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.surfaceAlt,
    alignItems: "center",
    justifyContent: "center"
  },
  spriteFrameActive: {
    backgroundColor: c.gold,
    borderColor: c.border
  },
  spriteImage: {
    width: 30,
    height: 30,
    opacity: 0.78
  },
  spriteImageActive: {
    opacity: 1,
    transform: [{ translateY: -1 }]
  },
  sectionCard: {},
  sectionCardContent: {
    backgroundColor: c.surface,
    padding: s.md,
    gap: s.sm
  },
  feedRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: s.sm
  },
  feedBadge: {
    minWidth: 52,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.pink,
    paddingHorizontal: s.xs,
    paddingVertical: 6
  },
  feedBadgeAccepted: {
    backgroundColor: c.success
  },
  feedBadgeRejected: {
    backgroundColor: c.danger
  },
  feedBadgeCompleted: {
    backgroundColor: c.gold
  },
  feedBadgeText: {
    color: c.inkInverse
  },
  feedBody: {
    flex: 1,
    gap: s.xxs
  },
  feedDescription: {
    color: c.inkMuted
  },
  recommendationRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s.xs
  },
  recommendationPressable: {
    width: "48%"
  },
  recommendationCard: {},
  recommendationCardContent: {
    minHeight: 128,
    backgroundColor: c.surface,
    padding: s.sm,
    justifyContent: "space-between",
    gap: s.sm
  },
  recommendationHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: s.xs
  },
  recommendationMiniCard: {
    flex: 1,
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.surfaceAlt,
    paddingHorizontal: s.xs,
    paddingVertical: s.xs,
    gap: 2
  },
  recommendationMiniName: {
    color: c.ink
  },
  recommendationMiniMeta: {
    color: c.inkMuted
  },
  recommendationHeart: {
    color: c.pink
  },
  recommendationRateChip: {
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.blueDark,
    paddingHorizontal: s.xs,
    paddingVertical: 6,
    alignSelf: "flex-start"
  },
  recommendationRateText: {
    color: c.inkInverse
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s.xs
  },
  metricPill: {
    width: "48%",
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.surfaceAlt,
    padding: s.sm,
    gap: 2
  },
  metricValue: {
    color: c.ink
  },
  metricLabel: {
    color: c.inkMuted
  },

  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s.xs
  },
  summaryCard: {
    width: "48%"
  },
  summaryCardContent: {
    minHeight: 86,
    backgroundColor: c.surface,
    padding: s.sm,
    justifyContent: "space-between"
  },
  summaryLabel: {
    color: c.inkMuted
  },
  summaryValue: {
    color: c.ink
  },

  stateCard: {},
  stateCardContent: {
    padding: s.md,
    gap: s.xs
  },
  stateCardLoading: {
    backgroundColor: c.surfaceAlt
  },
  stateCardEmpty: {
    backgroundColor: c.surface
  },
  stateCardError: {
    backgroundColor: "#F7DFE4"
  },
  stateCardTitle: {
    color: c.ink
  },
  stateCardTitleLoading: {
    color: c.blueDark
  },
  stateCardTitleEmpty: {
    color: c.ink
  },
  stateCardTitleError: {
    color: c.error
  },
  stateCardDescription: {
    color: c.inkMuted
  },
  stateCardActionRow: {
    flexDirection: "row",
    gap: s.xs,
    marginTop: s.xxs
  },

  sectionTitle: {
    marginTop: s.xxs,
    color: c.ink
  },
  fieldLabel: {
    color: c.ink,
    marginBottom: 2
  },
  fieldHint: {
    color: c.inkMuted
  },
  input: {
    minHeight: 44,
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.inputFill,
    color: c.ink,
    paddingHorizontal: s.sm,
    paddingVertical: s.xs,
    fontFamily: f.family
  },
  halfInput: {
    width: "48%"
  },
  multilineInput: {
    minHeight: 92,
    textAlignVertical: "top"
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s.xs
  },
  errorText: {
    color: c.error
  },

  listCard: {
    marginBottom: s.xs
  },
  listCardContent: {
    backgroundColor: c.surface,
    padding: s.md,
    gap: s.xxs
  },
  listName: {
    color: c.ink
  },
  listMeta: {
    color: c.inkMuted
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: s.sm
  },
  avatarBox: {
    width: z.avatarLg,
    height: z.avatarLg,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.blueDark
  },
  avatarText: {
    color: c.inkInverse
  },
  profileInfo: {
    flex: 1,
    gap: s.xxs
  },
  profileDivider: {
    height: b.thin,
    backgroundColor: c.inputBorder,
    marginVertical: s.xxs
  },
  profileMetaText: {
    color: c.inkMuted
  },
  languageButtonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s.xs
  },
  networkHeroRow: {
    gap: s.sm
  },
  networkHeroRowWide: {
    flexDirection: "row",
    alignItems: "flex-start"
  },
  networkBoardCard: {
    flex: 1
  },
  networkBoardContent: {
    backgroundColor: c.surface,
    padding: s.sm,
    gap: s.sm
  },
  networkBoardHeader: {
    gap: s.xxs
  },
  networkBoardCaption: {
    color: c.inkMuted
  },
  networkBoardCanvas: {
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.surfaceRaised,
    padding: s.sm,
    gap: s.sm
  },
  networkMasterBlock: {
    alignItems: "center",
    gap: s.xs
  },
  networkMasterLabel: {
    color: c.blueDark
  },
  networkMasterCard: {
    width: "100%",
    maxWidth: 220
  },
  networkMasterCardContent: {
    backgroundColor: c.surfaceRaised,
    flexDirection: "row",
    alignItems: "center",
    gap: s.sm,
    padding: s.sm
  },
  networkMasterInfo: {
    flex: 1,
    gap: 2
  },
  networkMasterName: {
    color: c.ink
  },
  networkConnectorVertical: {
    width: 2,
    height: 14,
    alignSelf: "center",
    backgroundColor: c.inputBorder
  },
  networkConnectorHorizontal: {
    height: 2,
    backgroundColor: c.inputBorder,
    marginHorizontal: s.lg
  },
  networkFeaturedRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: s.xs
  },
  networkFeaturedNode: {
    width: "48%"
  },
  networkNodeContent: {
    backgroundColor: c.surface,
    minHeight: 116,
    padding: s.xs,
    gap: s.xs
  },
  networkNodeHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: s.xs
  },
  networkNodeAvatar: {
    width: 42,
    height: 42,
    borderWidth: b.normal,
    borderColor: c.border,
    alignItems: "center",
    justifyContent: "center"
  },
  networkMiniAvatar: {
    width: 26,
    height: 26,
    borderWidth: b.normal,
    borderColor: c.border,
    alignItems: "center",
    justifyContent: "center"
  },
  networkAvatarMaster: {
    backgroundColor: c.gold
  },
  networkAvatarCupidate: {
    backgroundColor: "#E7B7C6"
  },
  networkAvatarCupid: {
    backgroundColor: "#A9C0DE"
  },
  networkAvatarText: {
    color: c.ink
  },
  networkNodeName: {
    color: c.ink
  },
  networkNodeMeta: {
    color: c.inkMuted
  },
  networkNodeBadge: {
    minWidth: 38,
    borderWidth: b.normal,
    borderColor: c.border,
    paddingHorizontal: 6,
    paddingVertical: 4,
    alignItems: "center"
  },
  networkNodeBadgeMatched: {
    backgroundColor: c.success
  },
  networkNodeBadgeWait: {
    backgroundColor: c.warning
  },
  networkNodeBadgeReject: {
    backgroundColor: c.danger
  },
  networkNodeBadgeText: {
    color: c.inkInverse
  },
  networkMiniGrid: {
    gap: s.xs
  },
  networkMiniRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: s.xs
  },
  networkMiniNode: {
    flex: 1
  },
  networkMiniNodeContent: {
    backgroundColor: c.surfaceAlt,
    minHeight: 78,
    padding: s.xs,
    gap: s.xs,
    alignItems: "center"
  },
  networkSideStack: {
    gap: s.sm
  },
  networkSideStackWide: {
    width: 144
  },
  networkInfoCard: {
    flexGrow: 1
  },
  networkInfoCardContent: {
    backgroundColor: c.surface,
    padding: s.sm,
    gap: s.xs
  },
  networkStatItem: {
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.surfaceAlt,
    paddingHorizontal: s.sm,
    paddingVertical: s.xs,
    gap: 2
  },
  networkLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: s.xs
  },
  networkLegendSwatch: {
    width: 18,
    height: 18,
    borderWidth: b.normal,
    borderColor: c.border
  },
  networkSegmentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: s.xs
  },
  networkRosterCard: {},
  networkRosterContent: {
    backgroundColor: c.surface,
    padding: s.sm,
    gap: s.xs
  },
  networkRosterItem: {
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.surfaceAlt,
    padding: s.sm
  },
  networkRosterItemHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: s.sm
  },
  networkRosterMain: {
    flex: 1,
    gap: 2
  },
  networkRosterMeta: {
    color: c.inkMuted
  },
  networkStatusChip: {
    borderWidth: b.normal,
    borderColor: c.border,
    paddingHorizontal: s.xs,
    paddingVertical: 6
  },
  networkStatusNeutral: {
    backgroundColor: c.blueDark
  },
  networkStatusMatched: {
    backgroundColor: c.success
  },
  networkStatusPending: {
    backgroundColor: c.warning
  },
  networkStatusBlocked: {
    backgroundColor: c.danger
  },
  networkStatusText: {
    color: c.inkInverse
  },
  networkFormCard: {},
  networkFormContent: {
    backgroundColor: c.surface,
    padding: s.md,
    gap: s.sm
  },
  networkSearchResults: {
    gap: s.xs
  },

  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.surfaceAlt,
    paddingHorizontal: s.sm,
    paddingVertical: s.xs
  },
  authStack: {
    gap: s.md
  },
  authHeroCard: {
    marginHorizontal: s.xs
  },
  authHeroContent: {
    backgroundColor: c.surface,
    padding: s.md,
    gap: s.sm
  },
  authPanelCard: {
    marginHorizontal: s.xs
  },
  authPanelContent: {
    backgroundColor: c.surface,
    padding: s.md,
    gap: s.sm
  },
  authStatusRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: s.sm
  },
  authStatusChip: {
    borderWidth: b.normal,
    borderColor: c.border,
    backgroundColor: c.blueDark,
    paddingHorizontal: s.sm,
    paddingVertical: s.xs
  },
  authStatusChipText: {
    color: c.inkInverse
  },
  authCaption: {
    color: c.inkMuted
  },

  textBody: {
    color: c.ink
  },
  textCaption: {
    color: c.inkMuted
  }
});
