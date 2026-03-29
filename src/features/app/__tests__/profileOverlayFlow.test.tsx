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
            preferences: {
              ageRange: [24, 35],
              hobbies: ["coffee", "music"],
              location: "seoul"
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
      expect(screen.getByTestId("profile-open-cupidate-mine-1")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("profile-open-cupidate-mine-1"));

    await waitFor(() => {
      expect(screen.getByTestId("profile-sheet-title")).toHaveTextContent("Cupidate Profile");
      expect(screen.getByTestId("profile-sheet")).toBeTruthy();
      expect(screen.getByText("Dating Preferences")).toBeTruthy();
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
});
