import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import App from "./App";
import { setMatchingRepositoryForTest } from "./src/features/matching/repository/createMatchingRepository";
import { createInMemoryMatchingRepository } from "./src/features/matching/repository/inMemoryMatchingRepository";
import { setNetworkRepositoryForTest } from "./src/features/network/repository/createNetworkRepository";
import { createInMemoryNetworkRepository } from "./src/features/network/repository/inMemoryNetworkRepository";

describe("App", () => {
  beforeEach(() => {
    setNetworkRepositoryForTest(createInMemoryNetworkRepository());
    setMatchingRepositoryForTest(createInMemoryMatchingRepository());
  });

  afterEach(() => {
    setNetworkRepositoryForTest(null);
    setMatchingRepositoryForTest(null);
  });

  it("renders registry header", async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("app-header-title")).toHaveTextContent("Home");
    });
  });

  it("shows validation message when required fields are missing", async () => {
    render(<App />);

    fireEvent.press(screen.getByTestId("tab-network"));
    fireEvent.press(screen.getByTestId("network-segment-cupidates"));
    fireEvent.press(screen.getByTestId("network-subsegment-cupidates-register"));
    fireEvent.press(screen.getByText("Save Cupidate"));

    await waitFor(() => {
      expect(screen.getByText("Name is required.")).toBeTruthy();
      expect(screen.getByText("Gender is required.")).toBeTruthy();
    });
  });
});
