import { render, screen } from "@testing-library/react-native";

import { I18nProvider } from "../../../i18n/context";
import { ProfileView } from "../ProfileView";

describe("ProfileView", () => {
  it("hides detailed dating data for inactive remote cupidates", () => {
    render(
      <I18nProvider initialLocale="en">
        <ProfileView
          profile={{
            kind: "cupidate",
            cupidateId: "peer-inactive",
            ownerCupidId: "cupid-peer",
            ownerNickname: "quiet_hana",
            displayName: "Hana",
            birthYear: 1996,
            gender: "female",
            bio: "private note",
            isActive: false,
            profileVisibility: "public",
            region: "seoul",
            jobTitle: "Finance Manager",
            heightCm: 165,
            smokingHabit: "none",
            drinkingHabit: "social",
            preferredAgeRange: [29, 35],
            preferredRegions: ["seoul"],
            preferredJobGroups: ["finance"],
            preferredSmoking: "none_only",
            preferredDrinking: "social",
            preferredGenders: ["male"],
            preferredHeightRange: [175, 185],
            mustHaveConditionKeys: ["preferred_regions"],
            preferences: {
              hobbies: ["reading", "pilates"]
            },
            canEdit: false,
            stats: {
              totalRequests: 0,
              ongoingMatches: 0,
              completedMatches: 0
            }
          }}
          onClose={() => {}}
        />
      </I18nProvider>
    );

    expect(screen.getByText("Inactive Dating Profile")).toBeTruthy();
    expect(
      screen.getByText(
        "This cupidate profile is currently paused and does not reveal dating details until it is activated again."
      )
    ).toBeTruthy();
    expect(screen.queryByText("Public Snapshot")).toBeNull();
    expect(screen.queryByText("Dating Preferences")).toBeNull();
  });

  it("keeps cupid summary focused on matchmaking outcomes", () => {
    render(
      <I18nProvider initialLocale="en">
        <ProfileView
          profile={{
            kind: "cupid",
            cupidId: "cupid-peer",
            nickname: "pixel_jin",
            relationship: "connected",
            datingProfile: {
              status: "active",
              cupidateId: "peer-1",
              displayName: "Jin",
              visibility: "basic"
            },
            stats: {
              cupidateCount: 1,
              activeCupidateCount: 1,
              introductions: 7,
              ongoingMatches: 2,
              completedMatches: 1
            }
          }}
          onClose={() => {}}
          onOpenCupidateProfile={() => {}}
        />
      </I18nProvider>
    );

    expect(screen.getByText("Matches Guided")).toBeTruthy();
    expect(screen.getByText("Ongoing")).toBeTruthy();
    expect(screen.getByText("Romance Conversions")).toBeTruthy();
    expect(screen.queryByText("Managed")).toBeNull();
    expect(screen.queryByText("Active")).toBeNull();
  });
});
