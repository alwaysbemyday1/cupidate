import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import App from "../../../../App";
import { setMatchingRepositoryForTest } from "../../matching/repository/createMatchingRepository";
import { createInMemoryMatchingRepository } from "../../matching/repository/inMemoryMatchingRepository";
import { setNetworkRepositoryForTest } from "../../network/repository/createNetworkRepository";
import { createInMemoryNetworkRepository } from "../../network/repository/inMemoryNetworkRepository";

describe("Activation gate flow", () => {
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
            id: "mine-hana",
            ownerCupidId: "local-cupid-me",
            displayName: "Hana",
            birthYear: 1996,
            gender: "female",
            bio: "quiet and thoughtful",
            isActive: false,
            region: "seoul",
            jobTitle: "Finance Manager",
            heightCm: 165,
            smokingHabit: "none",
            drinkingHabit: "social",
            preferredAgeRange: [29, 36],
            preferredRegions: ["seoul", "bundang"],
            preferredJobGroups: ["product", "engineer"],
            preferredSmoking: "none_only",
            preferredDrinking: "social",
            preferredGenders: ["male"],
            preferredHeightRange: [173, 185],
            preferences: {
              hobbies: ["reading", "brunch"],
              mbti: "ISFJ"
            },
            createdAt: "2026-03-30T00:00:00.000Z",
            updatedAt: "2026-03-30T00:00:00.000Z"
          },
          {
            id: "peer-joon",
            ownerCupidId: "local-cupid-a",
            displayName: "Joon",
            birthYear: 1994,
            gender: "male",
            bio: "steady and warm",
            isActive: true,
            region: "bundang",
            jobTitle: "Product Engineer",
            heightCm: 180,
            smokingHabit: "none",
            drinkingHabit: "social",
            preferredAgeRange: [24, 33],
            preferredRegions: ["seoul", "bundang"],
            preferredJobGroups: ["finance", "strategy"],
            preferredSmoking: "none_only",
            preferredDrinking: "social",
            preferredGenders: ["female"],
            preferredHeightRange: [158, 170],
            preferences: {
              hobbies: ["reading", "travel"],
              mbti: "INTJ"
            },
            createdAt: "2026-03-30T00:00:00.000Z",
            updatedAt: "2026-03-30T00:00:00.000Z"
          }
        ],
        connections: [
          {
            id: "conn-1",
            requesterCupidId: "local-cupid-me",
            addresseeCupidId: "local-cupid-a",
            status: "accepted",
            respondedAt: "2026-03-30T00:00:00.000Z",
            createdAt: "2026-03-30T00:00:00.000Z",
            updatedAt: "2026-03-30T00:00:00.000Z"
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

  it("keeps inactive cupidates out of matching until activated from profile management", async () => {
    render(<App />);

    fireEvent.press(screen.getByTestId("tab-matching"));

    await waitFor(() => {
      expect(screen.queryByText("Hana suggested for Joon")).toBeNull();
    });

    fireEvent.press(screen.getByTestId("tab-network"));
    fireEvent.press(screen.getByTestId("network-segment-cupidates"));

    await waitFor(() => {
      expect(screen.getByTestId("profile-open-cupidate-mine-hana")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("profile-open-cupidate-mine-hana"));

    await waitFor(() => {
      expect(screen.getByText("INACTIVE")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Activate"));
    fireEvent.press(screen.getByText("Save Profile"));
    fireEvent.press(screen.getByText("Close"));

    fireEvent.press(screen.getByTestId("tab-matching"));

    await waitFor(() => {
      expect(screen.getByText("Hana suggested for Joon")).toBeTruthy();
    });
  });
});
