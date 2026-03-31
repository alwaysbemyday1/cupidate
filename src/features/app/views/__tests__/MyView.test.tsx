import { render, screen } from "@testing-library/react-native";

import { I18nProvider } from "../../../i18n/context";
import { MyView } from "../MyView";

describe("MyView", () => {
  it("separates account details, app settings, and network snapshot cleanly", () => {
    render(
      <I18nProvider initialLocale="en">
        <MyView
          myNickname="pixel_me"
          onChangeMyNickname={() => {}}
          onSaveMyNickname={() => {}}
          privacyNetworkOnly
          onChangePrivacyNetworkOnly={() => {}}
          notificationEnabled
          onChangeNotificationEnabled={() => {}}
          connectionCount={3}
          cupidateCount={2}
          activeCupidateCount={1}
          inactiveCupidateCount={1}
          requestCount={4}
          onGoNetwork={() => {}}
          currentCupidId="cupid-me"
          accountEmail="me@cupidate.app"
          joinedAt="2026-03-01T00:00:00.000Z"
          accountMode="supabase"
        />
      </I18nProvider>
    );

    expect(screen.getByText("App Settings")).toBeTruthy();
    expect(screen.queryByText("Matching Preferences")).toBeNull();
    expect(screen.getByText("Account Mode: Supabase Connected")).toBeTruthy();
    expect(screen.queryByText("Refresh Session")).toBeNull();
    expect(screen.getByText("Network Snapshot")).toBeTruthy();
    expect(screen.getByText("Connections")).toBeTruthy();
    expect(screen.getByText("Cupidates")).toBeTruthy();
    expect(screen.getAllByText("Active").length).toBeGreaterThan(0);
    expect(screen.getByText("Requests")).toBeTruthy();
    expect(screen.queryByText("Account Visibility")).toBeNull();
  });
});
