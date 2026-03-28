import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import App from "../../../../App";
import { setMatchingRepositoryForTest } from "../../matching/repository/createMatchingRepository";
import { createInMemoryMatchingRepository } from "../../matching/repository/inMemoryMatchingRepository";
import { setNetworkRepositoryForTest } from "../../network/repository/createNetworkRepository";
import { createInMemoryNetworkRepository } from "../../network/repository/inMemoryNetworkRepository";
import { messages } from "../../i18n/messages";

describe("App i18n flow", () => {
  beforeEach(() => {
    setNetworkRepositoryForTest(createInMemoryNetworkRepository());
    setMatchingRepositoryForTest(createInMemoryMatchingRepository());
  });

  afterEach(() => {
    setNetworkRepositoryForTest(null);
    setMatchingRepositoryForTest(null);
  });

  it("applies Korean copy after language switch in My view", async () => {
    render(<App />);

    fireEvent.press(screen.getByTestId("tab-my"));

    await waitFor(() => {
      expect(screen.getByText(messages.en["my.sections.language"])).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("locale-ko"));

    await waitFor(() => {
      expect(screen.getByText(messages.ko["my.sections.profileOverview"])).toBeTruthy();
      expect(screen.getByText(`Cupidate: ${messages.ko["app.views.my"]}`)).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("tab-home"));

    await waitFor(() => {
      expect(screen.getByText(messages.ko["home.sections.alarmFeed"])).toBeTruthy();
      expect(screen.getByText(messages.ko["home.sections.quickActions"])).toBeTruthy();
      expect(screen.getByText(`Cupidate: ${messages.ko["app.views.home"]}`)).toBeTruthy();
    });
  });
});
