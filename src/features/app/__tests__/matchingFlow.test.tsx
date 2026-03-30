import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import App from "../../../../App";
import { setMatchingRepositoryForTest } from "../../matching/repository/createMatchingRepository";
import { createInMemoryMatchingRepository } from "../../matching/repository/inMemoryMatchingRepository";
import { setNetworkRepositoryForTest } from "../../network/repository/createNetworkRepository";
import { createInMemoryNetworkRepository } from "../../network/repository/inMemoryNetworkRepository";

describe("Matching flow", () => {
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
            preferredSmoking: "any",
            preferredDrinking: "any",
            preferredGenders: ["male"],
            preferredHeightRange: [172, 184],
            mustHaveConditionKeys: ["preferred_regions", "preferred_job_groups"],
            preferences: {
              ageRange: [25, 34],
              hobbies: ["coffee", "books"],
              location: "seoul",
              smoking: "any",
              drinking: "any"
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
            preferredDrinking: "any",
            preferredGenders: ["female"],
            preferredHeightRange: [158, 172],
            mustHaveConditionKeys: ["shared_hobbies"],
            preferences: {
              ageRange: [24, 35],
              hobbies: ["coffee", "music"],
              location: "seoul",
              smoking: "any",
              drinking: "any"
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

  it("processes request -> accept -> contact shared lifecycle", async () => {
    render(<App />);

    fireEvent.press(screen.getByTestId("tab-matching"));

    await waitFor(() => {
      expect(screen.getByText("Request Match")).toBeTruthy();
      expect(
        screen.getAllByText(
          "Detailed scoring is hidden because one of these dating profiles is not fully visible right now."
        ).length
      ).toBe(1);
      expect(screen.queryByText("Feedback Summary")).toBeNull();
      expect(screen.queryByText("Suggested: Mina + Joon")).toBeNull();
    });

    fireEvent.press(screen.getByText("Request Match"));

    await waitFor(() => {
      expect(screen.getByText("Approve")).toBeTruthy();
      expect(screen.getByText("Reject")).toBeTruthy();
      expect(screen.getAllByText("Awaiting Approval").length).toBeGreaterThan(0);
    });

    fireEvent.press(screen.getByText("Approve"));

    await waitFor(() => {
      expect(screen.getByText("Mark Contact Shared")).toBeTruthy();
      expect(screen.getAllByText("Decision in progress").length).toBeGreaterThan(0);
    });

    fireEvent.press(screen.getByText("Mark Contact Shared"));

    await waitFor(() => {
      expect(screen.getAllByText("Contact Shared").length).toBeGreaterThan(0);
    });
  });
});
