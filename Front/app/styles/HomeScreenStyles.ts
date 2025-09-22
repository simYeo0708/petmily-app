import { StyleSheet } from "react-native";

export const homeScreenStyles = StyleSheet.create({
  root: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 96,
  },
  section: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 20,
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
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 15,
  },
});

export const headerStyles = StyleSheet.create({
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(197, 145, 114, 0.2)",
  },
  logo: {
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
    fontSize: 14,
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
    gap: 12,
  },
  modeChip: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E0E0E0",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: "#FFF",
  },
  modeChipActive: {
    borderWidth: 2,
  },
  modeIcon: {
    fontSize: 24,
    marginRight: 12,
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
    borderRadius: 20,
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
    paddingBottom: 8,
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
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  backButtonText: {
    fontSize: 20,
    color: "#C59172",
    fontWeight: "bold",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileCard: {
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
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F0F0F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  ratingText: {
    fontSize: 14,
    color: "#FF8C00",
    fontWeight: "600",
  },
  walkCountText: {
    fontSize: 14,
    color: "#888",
  },
  earningsCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 16,
  },
  earningsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  earningsItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
  },
  earningsLabel: {
    fontSize: 12,
    color: "#888",
    marginBottom: 4,
  },
  earningsAmount: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#C59172",
  },
  statsCard: {
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
  statsGrid: {
    flexDirection: "row",
    gap: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#888",
  },
  matchingButton: {
    backgroundColor: "#C59172",
    borderRadius: 16,
    padding: 18,
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  matchingButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  quickActionsCard: {
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
  actionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    padding: 16,
    backgroundColor: "#F8F8F8",
    borderRadius: 12,
  },
  actionIcon: {
    fontSize: 20,
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    color: "#4A4A4A",
    fontWeight: "500",
  },
});

export const matchingScreenStyles = StyleSheet.create({
  backButton: {
    padding: 8,
    borderRadius: 8,
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
    fontSize: 14,
    width: 20,
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
    fontSize: 40,
    marginBottom: 16,
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
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#4A4A4A",
    marginBottom: 8,
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
