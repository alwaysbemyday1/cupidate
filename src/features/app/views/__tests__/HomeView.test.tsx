import { render, screen } from "@testing-library/react-native";

import { I18nProvider } from "../../../i18n/context";
import { HomeView } from "../HomeView";

describe("HomeView", () => {
  it("keeps recommendation cards concise and summary metrics actionable", () => {
    render(
      <I18nProvider initialLocale="en">
        <HomeView
          homeSummary={{
            myCupidates: 2,
            connectedCupids: 1,
            recommendations: 2,
            pendingRequests: 1
          }}
          activeCupidateCount={1}
          inactiveCupidateCount={1}
          notifications={[
            {
              id: "n-1",
              status: "accepted",
              sourceLabel: "Mina",
              targetLabel: "Joon"
            }
          ]}
          recommendations={[
            {
              sourceCupidateId: "mine-1",
              targetCupidateId: "peer-1",
              matchScore: 92,
              reason: {
                matchedHobbies: ["coffee"],
                priorityMatches: ["preferred_regions"],
                breakdown: {
                  age: 20,
                  hobbies: 20,
                  lifestyle: 18,
                  location: 15,
                  profile: 10
                }
              }
            }
          ]}
          cupidates={[
            {
              cupidateId: "mine-1",
              ownerCupidId: "cupid-me",
              displayName: "Mina",
              birthYear: 1998,
              gender: "female",
              bio: "",
              isActive: true,
              profileVisibility: "public",
              region: "seoul",
              jobTitle: "Brand Strategist",
              heightCm: 164,
              smokingHabit: "none",
              drinkingHabit: "social",
              preferredAgeRange: [27, 34],
              preferredRegions: ["seoul"],
              preferredJobGroups: ["product"],
              preferredSmoking: "any",
              preferredDrinking: "any",
              preferredGenders: ["male"],
              preferredHeightRange: [175, 185],
              mustHaveConditionKeys: [],
              preferences: {}
            },
            {
              cupidateId: "peer-1",
              ownerCupidId: "cupid-peer",
              displayName: "Joon",
              birthYear: 1996,
              gender: "male",
              bio: "",
              isActive: true,
              profileVisibility: "public",
              region: "bundang",
              jobTitle: "Product Engineer",
              heightCm: 181,
              smokingHabit: "none",
              drinkingHabit: "social",
              preferredAgeRange: [25, 33],
              preferredRegions: ["seoul"],
              preferredJobGroups: ["finance"],
              preferredSmoking: "any",
              preferredDrinking: "any",
              preferredGenders: ["female"],
              preferredHeightRange: [160, 172],
              mustHaveConditionKeys: [],
              preferences: {}
            }
          ]}
          onGoNetwork={() => {}}
          onGoMy={() => {}}
          onGoMatching={() => {}}
        />
      </I18nProvider>
    );

    expect(screen.getByText("Match approved: Mina + Joon")).toBeTruthy();
    expect(screen.queryByText("Approved")).toBeNull();
    expect(screen.queryByText("Suggested Pair")).toBeNull();
    expect(screen.queryByText("Cupidate")).toBeNull();
    expect(screen.getByText("seoul / Brand Strategist")).toBeTruthy();
    expect(screen.getByText("bundang / Product Engineer")).toBeTruthy();
    expect(screen.getByText("Active Cupidates")).toBeTruthy();
    expect(screen.getByText("Inactive Cupidates")).toBeTruthy();
    expect(screen.queryByText("Today's Picks")).toBeNull();
  });
});
