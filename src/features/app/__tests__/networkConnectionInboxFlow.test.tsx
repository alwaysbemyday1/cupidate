import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import App from "../../../../App";
import { setMatchingRepositoryForTest } from "../../matching/repository/createMatchingRepository";
import { createInMemoryMatchingRepository } from "../../matching/repository/inMemoryMatchingRepository";
import { setNetworkRepositoryForTest } from "../../network/repository/createNetworkRepository";
import { createInMemoryNetworkRepository } from "../../network/repository/inMemoryNetworkRepository";

describe("Network connection inbox flow", () => {
  beforeEach(() => {
    setNetworkRepositoryForTest(
      createInMemoryNetworkRepository({
        currentCupid: {
          id: "local-cupid-me",
          nickname: "owner_me"
        },
        cupids: [
          {
            id: "local-cupid-b",
            nickname: "incoming_friend"
          }
        ],
        connections: [
          {
            id: "conn-inbound",
            requesterCupidId: "local-cupid-b",
            addresseeCupidId: "local-cupid-me",
            status: "pending",
            respondedAt: null,
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

  it("accepts an inbound cupid connection from the network list", async () => {
    render(<App />);

    fireEvent.press(screen.getByTestId("tab-network"));

    await waitFor(() => {
      expect(screen.getByText("incoming_friend")).toBeTruthy();
      expect(screen.getByText("Incoming request")).toBeTruthy();
      expect(screen.getByText("Accept")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Accept"));

    await waitFor(() => {
      expect(screen.getByText("connected")).toBeTruthy();
      expect(screen.queryByText("Accept")).toBeNull();
    });
  });
});
