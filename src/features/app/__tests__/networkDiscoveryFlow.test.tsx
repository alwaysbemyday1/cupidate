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
            nickname: "network_buddy",
            email: "network_buddy@cupidate.app"
          },
          {
            id: "local-cupid-b",
            nickname: "runner_friend",
            email: "runner_friend@cupidate.app"
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
    fireEvent.press(screen.getByTestId("network-add-cupid-fab"));

    await waitFor(() => {
      expect(screen.getByText("Search by Email or Username")).toBeTruthy();
    });
  }

  it("shows empty discovery state when no cupid matches query", async () => {
    render(<App />);

    await openConnectedCupidsSegment();

    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. demo-yuna@cupidate.app or navy_yuna"),
      "zzzz"
    );

    await waitFor(() => {
      expect(screen.getByText("No cupid matched that email or username.")).toBeTruthy();
    });
  });

  it("supports search -> select -> add connection request interaction", async () => {
    render(<App />);

    await openConnectedCupidsSegment();

    fireEvent.changeText(
      screen.getByPlaceholderText("e.g. demo-yuna@cupidate.app or navy_yuna"),
      "network_buddy@cupidate.app"
    );

    await waitFor(() => {
      expect(screen.getByText("network_buddy")).toBeTruthy();
      expect(screen.getByText("No cupidate profile")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Select"));

    await waitFor(() => {
      expect(screen.getByText("Selected")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("Add Connection Request"));

    await waitFor(() => {
      expect(screen.getByText("network_buddy")).toBeTruthy();
      expect(screen.getByText("Connection request sent")).toBeTruthy();
      expect(screen.queryByTestId("network-add-cupid-sheet")).toBeNull();
    });
  });
});
