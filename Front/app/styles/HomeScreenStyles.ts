import { StyleSheet } from "react-native";
import { rf, wp, hp } from "../utils/responsive";

export const homeScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  root: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  content: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
  },
  fullWidthBanner: {
    width: "100%",
    paddingHorizontal: 0,
    marginBottom: 0,
  },
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 0,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: rf(20),
    fontWeight: "bold",
    color: "#4A4A4A",
  },
  modeContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  modeChip: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
    minHeight: 120,
  },
  modeIconContainer: {
    marginBottom: 8,
  },
  modeIcon: {
    fontSize: rf(32),
  },
  modeText: {
    fontSize: rf(16),
    fontWeight: "600",
    color: "#333333",
    textAlign: "center",
  },
  searchContainer: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    paddingHorizontal: wp(16),
    paddingVertical: hp(12),
    fontSize: rf(16),
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  walkBookingButton: {
    marginHorizontal: wp(16),
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  walkBookingButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  debugContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 20,
  },
  debugButton: {
    backgroundColor: "#ff6b6b",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  debugButtonText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  searchResultsOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
  },
  searchResultsContainer: {
    position: 'absolute',
    top: 100,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    maxHeight: 400,
  },
  searchResultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  searchResultItem: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchResultTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  searchResultDescription: {
    fontSize: 14,
    color: '#666',
  },
  searchCloseButton: {
    marginTop: 12,
    paddingVertical: 8,
    alignItems: 'center',
  },
  searchCloseButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});

export const headerStyles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: 16,
         // 마진 제거
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(197, 145, 114, 0.2)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  helperButton: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  helperButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "600",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    marginRight: 6,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "700",
    color: "#C59172",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flex: 1,
    marginLeft: 12,
  },
  petAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F6F1ED",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  petAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 20,
  },
  petAvatarPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100%",
  },
  petAvatarInitial: {
    fontSize: 16,
    color: "#C59172",
    fontWeight: "600",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 6,
    flex: 1,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 4,
    color: "#4A4A4A",
  },
});

export const modeStyles = StyleSheet.create({
  modeRow: {
    flexDirection: "row",
    gap: 30,
  },
  modeChip: {
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#FFF",
    minHeight: 120,
  },
  petWalker: {
    borderColor: "#4CAF50",
  },
  petMall: {
    borderColor: "#FF9800",
  },
  selected: {
    borderWidth: 3,
    backgroundColor: "#F0F8FF",
  },
  selectedText: {
    color: "#1976D2",
    fontWeight: "700",
  },
  modeIconContainer: {
    marginBottom: 8,
  },
  modeChipActive: {
    borderWidth: 2,
  },
  modeIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  modeIconImage: {
    width: 36,
    height: 36,
  },
  modeTextContainer: {
    flex: 1,
  },
  modeChipTitle: {
    fontWeight: "bold",
    fontSize: 16,
    color: "#4A4A4A",
  },
  modeChipSubtitle: {
    fontSize: 12,
    color: "#888",
    marginTop: 2,
  },
  modeChipTextActive: {
    color: "#FFF",
  },
});

export const modalStyles = StyleSheet.create({
  modalBox: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 0,
    padding: 20,
    marginBottom: 18,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#4A4A4A",
    marginBottom: 8,
  },
  modalBody: {
    color: "#6B6B6B",
    marginBottom: 15,
    lineHeight: 20,
  },
  modalCheckboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 10,
  },
  checkboxLabel: {
    color: "#6B6B6B",
  },
  modalButtonsRow: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "flex-end",
  },
  choiceBtn: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    backgroundColor: "#FFF",
  },
  choiceBtnText: {
    fontWeight: "bold",
  },
  primaryBtn: {
    borderColor: "#C59172",
  },
  primaryBtnText: {
    color: "#FFF",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
});

export const navigationStyles = StyleSheet.create({
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 70,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderTopWidth: 1,
    borderTopColor: "rgba(197, 145, 114, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingBottom: 6,
  },
  navBtn: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    minWidth: 60,
  },
  navBtnActive: {},
  navIcon: {
    width: 20,
    height: 20,
    marginBottom: 4,
  },
  navText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#999",
  },
  navTextActive: {
    color: "#FF8C00",
    fontWeight: "600",
  },
});

export const helperDashboardStyles = StyleSheet.create({
  headerBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F1ECE8",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F1ED",
  },
  backIcon: {
    fontSize: 18,
    color: "#C59172",
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3A2E2A",
  },
  headerSpacer: {
    width: 40,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    gap: 24,
  },
  heroCard: {
    backgroundColor: "#2F293E",
    borderRadius: 24,
    padding: 24,
  },
  heroLabel: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 13,
    marginBottom: 6,
  },
  heroAmount: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
  },
  heroMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 20,
  },
  heroMetaItem: {
    flex: 1,
  },
  heroMetaLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.6)",
    marginBottom: 4,
  },
  heroMetaValue: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
  heroMetaDivider: {
    width: 1,
    height: 40,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginHorizontal: 18,
  },
  heroBadgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 20,
  },
  heroBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  heroBadgeIcon: {
    marginRight: 6,
  },
  heroBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "500",
  },
  metricRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metricCard: {
    flexBasis: "48%",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  metricIcon: {
    marginBottom: 10,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3A2E2A",
    marginBottom: 6,
  },
  metricLabel: {
    fontSize: 12,
    color: "#8E857F",
  },
  chartCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#3A2E2A",
  },
  sectionSubtitle: {
    fontSize: 12,
    color: "#8E857F",
    marginTop: 4,
  },
  chartHighlight: {
    fontSize: 12,
    color: "#C59172",
    fontWeight: "600",
  },
  chartBody: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 16,
    minHeight: 160,
  },
  chartColumn: {
    flex: 1,
    alignItems: "center",
  },
  chartValueBadge: {
    marginBottom: 6,
  },
  chartValueText: {
    fontSize: 12,
    color: "#8E857F",
  },
  chartBar: {
    width: 28,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#C59172",
  },
  chartLabel: {
    fontSize: 12,
    color: "#8E857F",
    marginTop: 6,
  },
  tasksCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionLink: {
    fontSize: 12,
    color: "#C59172",
    fontWeight: "600",
  },
  taskItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  taskDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1ECE8",
  },
  taskIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F1ED",
    marginRight: 14,
  },
  taskIcon: {
    width: 18,
    height: 18,
  },
  taskInfo: {
    flex: 1,
  },
  taskTime: {
    fontSize: 12,
    color: "#8E857F",
    marginBottom: 4,
  },
  taskPet: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3A2E2A",
    marginBottom: 4,
  },
  taskNote: {
    fontSize: 12,
    color: "#8E857F",
  },
  taskChevron: {
    fontSize: 20,
    color: "#D0C4BC",
    paddingHorizontal: 6,
  },
  reviewCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  reviewItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 16,
  },
  reviewDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#F1ECE8",
  },
  reviewAvatar: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "#F6F1ED",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  reviewAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#C59172",
  },
  reviewInfo: {
    flex: 1,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  reviewName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3A2E2A",
  },
  reviewRating: {
    fontSize: 12,
    color: "#3A2E2A",
    fontWeight: "600",
    marginLeft: 4,
  },
  reviewRatingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  reviewRatingIcon: {
    marginRight: 2,
  },
  reviewComment: {
    fontSize: 13,
    color: "#5B514C",
    marginBottom: 6,
  },
  reviewDate: {
    fontSize: 11,
    color: "#8E857F",
  },
});

export const matchingScreenStyles = StyleSheet.create({
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitleIcon: {
    marginLeft: 4,
  },
  backButtonText: {
    fontSize: 20,
    color: "#C59172",
    fontWeight: "bold",
  },
  headerSection: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#888",
  },
  requestCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  petInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  petName: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A4A4A",
  },
  petBreed: {
    fontSize: 14,
    color: "#888",
  },
  paymentBadge: {
    backgroundColor: "#C59172",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  paymentText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  requestDetails: {
    gap: 8,
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detailIcon: {
    width: 16,
    height: 16,
  },
  detailText: {
    fontSize: 14,
    color: "#4A4A4A",
    flex: 1,
  },
  distanceText: {
    fontSize: 12,
    color: "#888",
  },
  cardFooter: {
    alignItems: "flex-end",
  },
  tapToView: {
    fontSize: 12,
    color: "#C59172",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    padding: 40,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  emptyIcon: {
    marginBottom: 16,
    width: 42,
    height: 42,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#888",
    textAlign: "center",
  },
  detailModal: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    maxHeight: "80%",
    width: "100%",
    maxWidth: 400,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A4A4A",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 18,
    color: "#888",
  },
  modalContent: {
    padding: 20,
  },
  modalSection: {
    marginBottom: 20,
  },
  modalSectionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  modalSectionIcon: {
    width: 18,
    height: 18,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A4A4A",
  },
  modalText: {
    fontSize: 14,
    color: "#4A4A4A",
    marginBottom: 4,
    lineHeight: 20,
  },
  paymentAmount: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#C59172",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#C59172",
  },
  acceptButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  declineButton: {
    backgroundColor: "#F0F0F0",
  },
  declineButtonText: {
    color: "#4A4A4A",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default homeScreenStyles;
