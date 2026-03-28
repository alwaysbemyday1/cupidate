import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { SafeAreaView, View } from "react-native";

import { PixelBox } from "./src/features/app/components/PixelBox";
import { PixelTabBar } from "./src/features/app/components/PixelTabBar";
import { PixelText } from "./src/features/app/components/PixelText";
import { useCupidateAppState } from "./src/features/app/model/useCupidateAppState";
import { styles } from "./src/features/app/styles";
import { AuthRequiredView } from "./src/features/app/views/AuthRequiredView";
import { HomeView } from "./src/features/app/views/HomeView";
import { MatchingView } from "./src/features/app/views/MatchingView";
import { MyView } from "./src/features/app/views/MyView";
import { NetworkView } from "./src/features/app/views/NetworkView";
import { useAuthSessionGate } from "./src/features/auth/hooks/useAuthSessionGate";
import { designTokens } from "./src/features/app/theme/tokens";
import type { AppView } from "./src/features/app/model/types";

const tabItems: Array<{ key: AppView; label: string; iconLabel: string; accentColor: string }> = [
  { key: "home", label: "HOME", iconLabel: "HM", accentColor: designTokens.color.gold },
  { key: "matching", label: "MATCHING", iconLabel: "MT", accentColor: designTokens.color.pink },
  { key: "network", label: "NETWORK", iconLabel: "NW", accentColor: designTokens.color.blue },
  { key: "my", label: "MY", iconLabel: "MY", accentColor: designTokens.color.gold }
];

function titleForView(activeView: AppView) {
  switch (activeView) {
    case "network":
      return "Network";
    case "matching":
      return "Matching";
    case "my":
      return "My Info";
    case "home":
    default:
      return "Home";
  }
}

function CupidateHeader({ activeView, locked }: { activeView: AppView; locked?: boolean }) {
  return (
    <PixelBox
      style={styles.headerFrame}
      backgroundColor={designTokens.color.backgroundAlt}
      contentStyle={styles.headerContent}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <PixelText variant="screenTitle" style={styles.title} color={designTokens.color.inkInverse}>
            {`Cupidate: ${titleForView(activeView)}`}
          </PixelText>
          <PixelText variant="caption" style={styles.subtitle}>
            PIXEL MATCH NETWORK
          </PixelText>
        </View>
        <View style={styles.statusBadge}>
          <PixelText variant="caption" style={styles.statusText}>
            {locked ? "LOCKED" : "ONLINE"}
          </PixelText>
        </View>
      </View>
    </PixelBox>
  );
}

function CupidateAppShell() {
  const authGate = useAuthSessionGate();
  const state = useCupidateAppState({
    isDataAccessEnabled: authGate.canAccessProtectedData
  });

  if (authGate.mode === "supabase" && !authGate.canAccessProtectedData) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.container}>
          <CupidateHeader activeView="home" locked />
          <View style={styles.screenBody}>
            <AuthRequiredView
              isLoading={authGate.isLoading}
              error={authGate.error}
              onRefresh={authGate.refresh}
              onSignInWithPassword={authGate.signInWithPassword}
              onSignUpWithPassword={authGate.signUpWithPassword}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <CupidateHeader activeView={state.activeView} />

        <View style={styles.screenBody}>
          {state.activeView === "home" && (
            <HomeView
              homeSummary={state.homeSummary}
              notifications={state.notifications}
              onGoNetwork={() => state.setActiveView("network")}
              onGoMatching={() => state.setActiveView("matching")}
              isHomeLoading={state.isHomeLoading}
              homeError={state.homeError}
              onRetryHomeError={state.onRetryHome}
            />
          )}

          {state.activeView === "network" && (
            <NetworkView
              networkSegment={state.networkSegment}
              onChangeNetworkSegment={state.setNetworkSegment}
              cupidates={state.cupidates}
              connections={state.connections}
              ownerType={state.ownerType}
              onChangeOwnerType={state.setOwnerType}
              displayName={state.displayName}
              onChangeDisplayName={state.setDisplayName}
              birthYearInput={state.birthYearInput}
              onChangeBirthYearInput={state.setBirthYearInput}
              gender={state.gender}
              onChangeGender={state.setGender}
              hobbiesInput={state.hobbiesInput}
              onChangeHobbiesInput={state.setHobbiesInput}
              locationInput={state.locationInput}
              onChangeLocationInput={state.setLocationInput}
              jobTitleInput={state.jobTitleInput}
              onChangeJobTitleInput={state.setJobTitleInput}
              heightInput={state.heightInput}
              onChangeHeightInput={state.setHeightInput}
              smokingHabit={state.smokingHabit}
              onChangeSmokingHabit={state.setSmokingHabit}
              drinkingHabit={state.drinkingHabit}
              onChangeDrinkingHabit={state.setDrinkingHabit}
              preferredAgeMinInput={state.preferredAgeMinInput}
              onChangePreferredAgeMinInput={state.setPreferredAgeMinInput}
              preferredAgeMaxInput={state.preferredAgeMaxInput}
              onChangePreferredAgeMaxInput={state.setPreferredAgeMaxInput}
              preferredRegionsInput={state.preferredRegionsInput}
              onChangePreferredRegionsInput={state.setPreferredRegionsInput}
              preferredSmoking={state.preferredSmoking}
              onChangePreferredSmoking={state.setPreferredSmoking}
              preferredDrinking={state.preferredDrinking}
              onChangePreferredDrinking={state.setPreferredDrinking}
              preferredGender={state.preferredGender}
              onChangePreferredGender={state.setPreferredGender}
              preferredHeightMinInput={state.preferredHeightMinInput}
              onChangePreferredHeightMinInput={state.setPreferredHeightMinInput}
              preferredHeightMaxInput={state.preferredHeightMaxInput}
              onChangePreferredHeightMaxInput={state.setPreferredHeightMaxInput}
              bio={state.bio}
              onChangeBio={state.setBio}
              errors={state.errors}
              canSubmit={state.canSubmit}
              onSaveCupidate={state.onRegisterCupidate}
              currentCupidId={state.myCupidId}
              connectionSearchQuery={state.connectionSearchQuery}
              onChangeConnectionSearchQuery={state.setConnectionSearchQuery}
              connectionSearchResults={state.connectionSearchResults}
              selectedConnectionCupidId={state.selectedConnectionCupidId}
              onSelectConnectionCupid={state.setSelectedConnectionCupidId}
              onAddConnection={state.onAddConnection}
              isNetworkLoading={state.isNetworkLoading}
              isSearchingCupids={state.isSearchingCupids}
              isMutatingNetwork={state.isMutatingNetwork}
              networkError={state.networkError}
              onRetryNetworkError={state.onRetryNetwork}
            />
          )}

          {state.activeView === "matching" && (
            <MatchingView
              recommendations={state.recommendations}
              cupidates={state.cupidates}
              requestByPair={state.requestByPair}
              requests={state.requests}
              onSendRequest={state.onSendRequest}
              onUpdateRequestStatus={state.onUpdateRequestStatus}
              isMatchingLoading={state.isMatchingLoading}
              isMutatingMatching={state.isMutatingMatching}
              matchingError={state.matchingError}
              onRetryMatchingError={state.onRetryMatching}
            />
          )}

          {state.activeView === "my" && (
            <MyView
              myNickname={state.myNickname}
              onChangeMyNickname={state.setMyNickname}
              onSaveMyNickname={state.onSaveNickname}
              isSavingNickname={state.isSavingNickname}
              privacyNetworkOnly={state.privacyNetworkOnly}
              onChangePrivacyNetworkOnly={state.setPrivacyNetworkOnly}
              notificationEnabled={state.notificationEnabled}
              onChangeNotificationEnabled={state.setNotificationEnabled}
              connectionCount={state.connections.length}
              cupidateCount={state.cupidates.length}
              requestCount={state.requests.length}
              currentCupidId={state.myCupidId}
              accountEmail={authGate.session?.user?.email ?? null}
              joinedAt={authGate.session?.user?.created_at ?? null}
              accountMode={authGate.mode}
              onRefreshAccount={authGate.refresh}
              isMyLoading={state.isMyLoading}
              myError={state.myError}
              onRetryMyError={state.onRetryMy}
            />
          )}
        </View>

        <PixelTabBar activeKey={state.activeView} items={tabItems} onSelect={state.setActiveView} />
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            gcTime: 0,
            refetchOnWindowFocus: false,
            refetchOnReconnect: false
          },
          mutations: {
            retry: false,
            gcTime: 0
          }
        }
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <CupidateAppShell />
    </QueryClientProvider>
  );
}
