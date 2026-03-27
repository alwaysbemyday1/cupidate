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

    fireEvent.press(screen.getByText("MATCHING"));

    await waitFor(() => {
      expect(screen.getByText("Mina x Joon")).toBeTruthy();
      expect(screen.getByText("Status: none")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Request Match"));

    await waitFor(() => {
      expect(screen.getAllByText("Status: requested").length).toBeGreaterThan(0);
    });

    fireEvent.press(screen.getByText("Accept"));

    await waitFor(() => {
      expect(screen.getAllByText("Status: accepted").length).toBeGreaterThan(0);
    });

    fireEvent.press(screen.getByText("Mark Contact Shared"));

    await waitFor(() => {
      expect(screen.getAllByText("Status: completed").length).toBeGreaterThan(0);
    });
  });
});
