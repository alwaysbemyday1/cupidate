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
      expect(screen.getByText("Notification Feed")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("NETWORK"));

    await waitFor(() => {
      expect(screen.getByText(/My Cupidates \(/)).toBeTruthy();
      expect(screen.getByText("Save Cupidate")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("MATCHING"));

    await waitFor(() => {
      expect(screen.getByText("Recommendation Board")).toBeTruthy();
      expect(screen.getByText("Match Request History")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("MY"));

    await waitFor(() => {
      expect(screen.getByText("Nickname")).toBeTruthy();
      expect(screen.getByText("Account Summary")).toBeTruthy();
    });

    fireEvent.press(screen.getByText("HOME"));

    await waitFor(() => {
      expect(screen.getByText("Quick Actions")).toBeTruthy();
      expect(screen.getByText("CUPID MODE")).toBeTruthy();
    });
  });
});
