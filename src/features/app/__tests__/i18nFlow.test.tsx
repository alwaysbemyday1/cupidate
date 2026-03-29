import AsyncStorage from "@react-native-async-storage/async-storage";
import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import App from "../../../../App";
import { setMatchingRepositoryForTest } from "../../matching/repository/createMatchingRepository";
import { createInMemoryMatchingRepository } from "../../matching/repository/inMemoryMatchingRepository";
import { setNetworkRepositoryForTest } from "../../network/repository/createNetworkRepository";
import { createInMemoryNetworkRepository } from "../../network/repository/inMemoryNetworkRepository";
import { messages } from "../../i18n/messages";
import { LOCALE_STORAGE_KEY } from "../../i18n/storage";

describe("App i18n flow", () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    setNetworkRepositoryForTest(createInMemoryNetworkRepository());
    setMatchingRepositoryForTest(createInMemoryMatchingRepository());
  });

  afterEach(async () => {
    await AsyncStorage.clear();
    setNetworkRepositoryForTest(null);
    setMatchingRepositoryForTest(null);
  });

  it("applies Korean copy after language switch in My view and persists it across remount", async () => {
    const rendered = render(<App />);

    fireEvent.press(screen.getByTestId("tab-my"));

    await waitFor(() => {
      expect(screen.getByText(messages.en["my.sections.language"])).toBeTruthy();
    });

    fireEvent.press(screen.getByTestId("locale-ko"));

    await waitFor(() => {
      expect(screen.getByText(messages.ko["my.sections.profileOverview"])).toBeTruthy();
      expect(screen.getByTestId("app-header-title")).toHaveTextContent(messages.ko["app.views.my"]);
    });
    await waitFor(() => {
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(LOCALE_STORAGE_KEY, "ko");
    });

    fireEvent.press(screen.getByTestId("tab-home"));

    await waitFor(() => {
      expect(screen.getByText(messages.ko["home.sections.alarmFeed"])).toBeTruthy();
      expect(screen.getByText(messages.ko["home.sections.quickActions"])).toBeTruthy();
      expect(screen.getByTestId("app-header-title")).toHaveTextContent(messages.ko["app.views.home"]);
    });

    rendered.unmount();
    render(<App />);

    await waitFor(() => {
      expect(screen.getByTestId("app-header-title")).toHaveTextContent(messages.ko["app.views.home"]);
      expect(screen.getByText(messages.ko["home.sections.alarmFeed"])).toBeTruthy();
    });
  });
});
