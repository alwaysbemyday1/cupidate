import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111827"
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 14
  },
  headerRow: {
    marginTop: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  title: {
    color: "#FDE047",
    fontFamily: "monospace",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 1
  },
  subtitle: {
    color: "#60A5FA",
    fontFamily: "monospace",
    fontSize: 12,
    marginTop: 4
  },
  statusBadge: {
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#34D399",
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  statusText: {
    color: "#064E3B",
    fontFamily: "monospace",
    fontWeight: "800",
    fontSize: 11
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap"
  },
  panel: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#93C5FD"
  },
  panelContent: {
    padding: 12,
    gap: 8
  },
  fieldLabel: {
    color: "#111827",
    fontFamily: "monospace",
    fontWeight: "700",
    marginTop: 2
  },
  input: {
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#E0E7FF",
    color: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: "monospace"
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: "top"
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  pixelButton: {
    borderWidth: 3,
    borderColor: "#000000",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  pixelButtonIdle: {
    backgroundColor: "#BFDBFE"
  },
  pixelButtonActive: {
    backgroundColor: "#FDE047"
  },
  pixelButtonText: {
    color: "#111827",
    fontFamily: "monospace",
    fontWeight: "800"
  },
  errorText: {
    color: "#B91C1C",
    fontFamily: "monospace",
    fontWeight: "700"
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  summaryCard: {
    width: "48%",
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#FEF08A",
    padding: 10
  },
  summaryLabel: {
    color: "#92400E",
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 12
  },
  summaryValue: {
    color: "#7C2D12",
    fontFamily: "monospace",
    fontWeight: "800",
    fontSize: 20,
    marginTop: 4
  },
  sectionTitle: {
    marginTop: 8,
    color: "#111827",
    fontFamily: "monospace",
    fontWeight: "800"
  },
  emptyCard: {
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#E0F2FE",
    padding: 12
  },
  emptyText: {
    color: "#111827",
    fontFamily: "monospace",
    fontWeight: "700"
  },
  emptySubText: {
    color: "#334155",
    fontFamily: "monospace",
    marginTop: 4
  },
  listCard: {
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#E0E7FF",
    padding: 12,
    marginBottom: 10
  },
  listName: {
    color: "#111827",
    fontFamily: "monospace",
    fontWeight: "800"
  },
  listMeta: {
    color: "#334155",
    fontFamily: "monospace",
    marginTop: 4
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 10,
    paddingVertical: 8
  }
});
