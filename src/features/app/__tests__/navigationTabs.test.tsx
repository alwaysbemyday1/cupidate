import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import App from "../../../../App";
import { setMatchingRepositoryForTest } from "../../matching/repository/createMatchingRepository";
import { createInMemoryMatchingRepository } from "../../matching/repository/inMemoryMatchingRepository";
import { setNetworkRepositoryForTest } from "../../network/repository/createNetworkRepository";
import { createInMemoryNetworkRepository } from "../../network/repository/inMemoryNetworkRepository";

describe("App navigation tabs", () => {
  beforeEach(() => {
    setNetworkRepositoryForTest(createInMemoryNetworkRepository());
    setMatchingRepositoryForTest(createInMemoryMatchingRepository());
  });

  afterEach(() => {
    setNetworkRepositoryForTest(null);
    setMatchingRepositoryForTest(null);
  });

  it("navigates across Home / Network / Matching / My tabs", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText("Alarm Feed")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("tab-network"));

    await waitFor(() => {
      expect(screen.getByText("Cupids are the people who introduce others and keep the network moving.")).toBeTruthy();
      expect(screen.getByTestId("network-add-cupid-fab")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("tab-matching"));

    await waitFor(() => {
      expect(screen.getByText("Pending Match Requests")).toBeTruthy();
      expect(screen.getByText("Matching Insights")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("tab-my"));

    await waitFor(() => {
      expect(screen.getByText("Nickname")).toBeTruthy();
      expect(screen.getByText("Cupidate Readiness")).toBeTruthy();
      expect(screen.getByText("Network Snapshot")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("tab-home"));

    await waitFor(() => {
      expect(screen.getByText("Jump In")).toBeTruthy();
      expect(screen.getByText("Today's Matches")).toBeTruthy();
    });
  });
});
