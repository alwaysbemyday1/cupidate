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
      expect(screen.getByText("Network Board")).toBeTruthy();
      expect(screen.getByText("My Cupidates")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("tab-matching"));

    await waitFor(() => {
      expect(screen.getByText("Pending Match Requests")).toBeTruthy();
      expect(screen.getByText("Matching Insights")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("tab-my"));

    await waitFor(() => {
      expect(screen.getByText("Nickname")).toBeTruthy();
      expect(screen.getByText("Account Summary")).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("tab-home"));

    await waitFor(() => {
      expect(screen.getByText("Jump In")).toBeTruthy();
      expect(screen.getByText("Today's Matches")).toBeTruthy();
    });
  });
});
