import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import App from "../../../../App";
import { setMatchingRepositoryForTest } from "../../matching/repository/createMatchingRepository";
import { createInMemoryMatchingRepository } from "../../matching/repository/inMemoryMatchingRepository";
import { setNetworkRepositoryForTest } from "../../network/repository/createNetworkRepository";
import { createInMemoryNetworkRepository } from "../../network/repository/inMemoryNetworkRepository";

describe("Profile overlay flow", () => {
  beforeEach(() => {
    setNetworkRepositoryForTest(
      createInMemoryNetworkRepository({
        currentCupid: {
          id: "local-cupid-me",
          nickname: "owner_me"
        },
        cupids: [
          {
            id: "local-cupid-a",
            nickname: "connected_a"
          }
        ],
        cupidates: [
          {
            id: "mine-1",
            ownerCupidId: "local-cupid-me",
            displayName: "Mina",
            birthYear: 1998,
            gender: "female",
            bio: "coffee lover",
            isActive: true,
            profileVisibility: "public",
            region: "seoul",
            jobTitle: "Brand Strategist",
            heightCm: 164,
            smokingHabit: "none",
            drinkingHabit: "social",
            preferredAgeRange: [25, 34],
            preferredRegions: ["seoul"],
            preferredJobGroups: ["engineer"],
            preferredSmoking: "none_only",
            preferredDrinking: "social",
            preferredGenders: ["male"],
            preferredHeightRange: [172, 184],
            mustHaveConditionKeys: ["preferred_job_groups", "preferred_regions"],
            preferences: {
              ageRange: [25, 34],
              hobbies: ["coffee", "books"],
              location: "seoul"
            },
            createdAt: "2026-03-28T00:00:00.000Z",
            updatedAt: "2026-03-28T00:00:00.000Z"
          },
          {
            id: "peer-1",
            ownerCupidId: "local-cupid-a",
            displayName: "Joon",
            birthYear: 1997,
            gender: "male",
            bio: "music and travel",
            isActive: true,
            profileVisibility: "basic",
            region: "seoul",
            jobTitle: "Engineer",
            heightCm: 180,
            smokingHabit: "none",
            drinkingHabit: "social",
            preferredAgeRange: [24, 35],
            preferredRegions: ["seoul"],
            preferredJobGroups: ["brand"],
            preferredSmoking: "any",
            preferredDrinking: "social",
            preferredGenders: ["female"],
            preferredHeightRange: [158, 172],
            mustHaveConditionKeys: ["shared_hobbies"],
            preferences: {
              ageRange: [24, 35],
              hobbies: ["coffee", "music"],
              location: "seoul"
            },
            createdAt: "2026-03-28T00:00:00.000Z",
            updatedAt: "2026-03-28T00:00:00.000Z"
          },
          {
            id: "peer-2",
            ownerCupidId: "local-cupid-a",
            displayName: "Sora",
            birthYear: 1995,
            gender: "female",
            bio: "quiet reader",
            isActive: true,
            profileVisibility: "private",
            region: "incheon",
            jobTitle: "Analyst",
            heightCm: 167,
            smokingHabit: "none",
            drinkingHabit: "social",
            preferredAgeRange: [27, 35],
            preferredRegions: ["seoul"],
            preferredJobGroups: ["strategy"],
            preferredSmoking: "none_only",
            preferredDrinking: "social",
            preferredGenders: ["male"],
            preferredHeightRange: [172, 185],
            mustHaveConditionKeys: ["preferred_regions"],
            preferences: {
              ageRange: [27, 35],
              hobbies: ["reading", "movie"],
              location: "incheon"
            },
            createdAt: "2026-03-28T00:00:00.000Z",
            updatedAt: "2026-03-28T00:00:00.000Z"
          }
        ],
        connections: [
          {
            id: "conn-1",
            requesterCupidId: "local-cupid-me",
            addresseeCupidId: "local-cupid-a",
            status: "accepted",
            respondedAt: "2026-03-28T00:00:00.000Z",
            createdAt: "2026-03-28T00:00:00.000Z",
            updatedAt: "2026-03-28T00:00:00.000Z"
          }
        ]
      })
    );

    setMatchingRepositoryForTest(createInMemoryMatchingRepository());
  });

  afterEach(() => {
    setNetworkRepositoryForTest(null);
    setMatchingRepositoryForTest(null);
  });

  it("opens cupidate profile from network", async () => {
    render(<App />);

    fireEvent.press(screen.getByTestId("tab-network"));
    fireEvent.press(screen.getByTestId("network-segment-cupidates"));

    await waitFor(() => {
      expect(screen.getByTestId("profile-open-cupidate-mine-1")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("profile-open-cupidate-mine-1"));

    await waitFor(() => {
      expect(screen.getByTestId("profile-sheet-title")).toHaveTextContent("Cupidate Profile");
      expect(screen.getByTestId("profile-sheet")).toBeTruthy();
      expect(screen.getByText("ACTIVE CUPIDATE")).toBeTruthy();
      expect(screen.getByText("This is the simple public dating profile visible to matching participants.")).toBeTruthy();
    });
  });

  it("opens cupidate profile from matching", async () => {
    render(<App />);

    fireEvent.press(screen.getByTestId("tab-matching"));

    await waitFor(() => {
      expect(screen.getAllByTestId("profile-open-cupidate-mine-1").length).toBeGreaterThan(0);
    });

    fireEvent.press(screen.getAllByTestId("profile-open-cupidate-mine-1")[0]);

    await waitFor(() => {
      expect(screen.getByTestId("profile-sheet-title")).toHaveTextContent("Cupidate Profile");
      expect(screen.getByTestId("profile-sheet")).toBeTruthy();
      expect(screen.getByText("Dating Preferences")).toBeTruthy();
    });
  });

  it("gates non-owner cupidate detail by visibility scope", async () => {
    render(<App />);

    fireEvent.press(screen.getByTestId("tab-matching"));

    await waitFor(() => {
      expect(screen.getAllByTestId("profile-open-cupidate-peer-1").length).toBeGreaterThan(0);
    });

    fireEvent.press(screen.getAllByTestId("profile-open-cupidate-peer-1")[0]);

    await waitFor(() => {
      expect(screen.getByText("This cupidate shares only basic profile information. Detailed lifestyle notes and preference weights stay private.")).toBeTruthy();
      expect(screen.queryByText("Public Snapshot")).toBeNull();
      expect(screen.queryByText("Dating Preferences")).toBeNull();
      expect(screen.queryByText("Height")).toBeNull();
    });

    fireEvent.press(screen.getByTestId("profile-sheet-close"));

    await waitFor(() => {
      expect(screen.queryByText("Basic Only")).toBeNull();
    });

    fireEvent.press(screen.getAllByTestId("profile-open-cupidate-peer-2")[0]);

    await waitFor(() => {
      expect(screen.getByText("Private Cupidate Profile")).toBeTruthy();
      expect(screen.getByText("This cupidate keeps the dating profile private. Other cupids can only confirm that the profile exists.")).toBeTruthy();
      expect(screen.queryByText("Dating Preferences")).toBeNull();
    });
  });

  it("opens cupid profile from network and shows matchmaking stats", async () => {
    render(<App />);

    fireEvent.press(screen.getByTestId("tab-network"));
    fireEvent.press(screen.getByTestId("network-segment-cupids"));
    fireEvent.press(screen.getByTestId("network-subsegment-cupids-list"));

    await waitFor(() => {
      expect(screen.getByTestId("profile-open-cupid-local-cupid-a")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("profile-open-cupid-local-cupid-a"));

    await waitFor(() => {
      expect(screen.getByTestId("profile-sheet-title")).toHaveTextContent("Cupid Profile");
      expect(screen.getByText("Shows how this cupid has guided matches and relationship handoffs across the network.")).toBeTruthy();
      expect(screen.getByText("Romance Conversions")).toBeTruthy();
    });
  });

  it("persists structured profile edits from the cupidate overlay", async () => {
    render(<App />);

    fireEvent.press(screen.getByTestId("tab-network"));
    fireEvent.press(screen.getByTestId("network-segment-cupidates"));

    await waitFor(() => {
      expect(screen.getByTestId("profile-open-cupidate-mine-1")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("profile-open-cupidate-mine-1"));

    await waitFor(() => {
      expect(screen.getByTestId("profile-edit-region")).toBeTruthy();
    });

    fireEvent.changeText(screen.getByTestId("profile-edit-region"), "busan");
    fireEvent.changeText(screen.getByTestId("profile-edit-job-title"), "Product Designer");
    fireEvent.changeText(screen.getByTestId("profile-edit-preferred-job-groups"), "finance, strategy");
    fireEvent.press(screen.getByText("Private"));

    fireEvent.press(screen.getByTestId("profile-sheet-save"));
    fireEvent.press(screen.getByTestId("profile-sheet-close"));

    fireEvent.press(screen.getByTestId("profile-open-cupidate-mine-1"));

    await waitFor(() => {
      expect(screen.getByDisplayValue("busan")).toBeTruthy();
      expect(screen.getByDisplayValue("Product Designer")).toBeTruthy();
      expect(screen.getByDisplayValue("finance, strategy")).toBeTruthy();
      expect(screen.getAllByText("Private").length).toBeGreaterThan(0);
    });
  });

  it("caps must-have condition selection at five items", async () => {
    render(<App />);

    fireEvent.press(screen.getByTestId("tab-network"));
    fireEvent.press(screen.getByTestId("network-segment-cupidates"));

    await waitFor(() => {
      expect(screen.getByTestId("profile-open-cupidate-mine-1")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("profile-open-cupidate-mine-1"));

    await waitFor(() => {
      expect(screen.getByTestId("profile-must-have-shared_hobbies")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("profile-must-have-shared_hobbies"));
    fireEvent.press(screen.getByTestId("profile-must-have-preferred_smoking"));
    fireEvent.press(screen.getByTestId("profile-must-have-preferred_drinking"));

    await waitFor(() => {
      expect(screen.getByText("Five are already selected. Uncheck one to choose another.")).toBeTruthy();
      expect(screen.getByTestId("profile-must-have-preferred_height_range").props.accessibilityState.disabled).toBe(true);
    });
  });
});
