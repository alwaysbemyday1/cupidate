import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import App from "../../../../App";
import { setMatchingRepositoryForTest } from "../../matching/repository/createMatchingRepository";
import { createInMemoryMatchingRepository } from "../../matching/repository/inMemoryMatchingRepository";
import { setNetworkRepositoryForTest } from "../../network/repository/createNetworkRepository";
import { createInMemoryNetworkRepository } from "../../network/repository/inMemoryNetworkRepository";

jest.setTimeout(15_000);

describe("Network discovery flow", () => {
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
            nickname: "network_buddy"
          },
          {
            id: "local-cupid-b",
            nickname: "runner_friend"
          }
        ],
        cupidates: [],
        connections: []
      })
    );

    setMatchingRepositoryForTest(createInMemoryMatchingRepository());
  });

  afterEach(() => {
    setNetworkRepositoryForTest(null);
    setMatchingRepositoryForTest(null);
  });

  async function openConnectedCupidsSegment() {
    fireEvent.press(screen.getByTestId("tab-network"));
    fireEvent.press(screen.getByTestId("network-segment-cupids"));
    fireEvent.press(screen.getByTestId("network-subsegment-cupids-register"));

    await waitFor(() => {
      expect(screen.getByText("Search Cupid by Nickname")).toBeTruthy();
    });
  }

  it("shows empty discovery state when no cupid matches query", async () => {
    render(<App />);

    await openConnectedCupidsSegment();

    fireEvent.changeText(screen.getByPlaceholderText("e.g. connected_a"), "zzzz");

    await waitFor(() => {
      expect(screen.getByText("No available cupid found for this query.")).toBeTruthy();
    });
  });

  it("supports search -> select -> add connection request interaction", async () => {
    render(<App />);

    await openConnectedCupidsSegment();

    fireEvent.changeText(screen.getByPlaceholderText("e.g. connected_a"), "buddy");

    await waitFor(() => {
      expect(screen.getByText("network_buddy")).toBeTruthy();
      expect(screen.getByText("Cupid ID: local-cupid-a")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Select"));

    await waitFor(() => {
      expect(screen.getByText("Selected")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Add Connection Request"));

    await waitFor(() => {
      expect(screen.queryByDisplayValue("buddy")).toBeNull();
      expect(screen.getByText("Connected Cupids (1)")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("network-subsegment-cupids-list"));

    await waitFor(() => {
      expect(screen.getByText("pending")).toBeTruthy();
    });
  });
});
