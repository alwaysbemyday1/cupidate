import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";

import { PixelBox } from "./src/features/app/components/PixelBox";
import { PixelTabBar } from "./src/features/app/components/PixelTabBar";
import { PixelText } from "./src/features/app/components/PixelText";
import { useCupidateAppState } from "./src/features/app/model/useCupidateAppState";
import { styles } from "./src/features/app/styles";
import { designTokens } from "./src/features/app/theme/tokens";
import { AuthRequiredView } from "./src/features/app/views/AuthRequiredView";
import { HomeView } from "./src/features/app/views/HomeView";
import { MatchingView } from "./src/features/app/views/MatchingView";
import { MyView } from "./src/features/app/views/MyView";
import { NetworkView } from "./src/features/app/views/NetworkView";
import { useAuthSessionGate } from "./src/features/auth/hooks/useAuthSessionGate";
import { I18nProvider, useI18n } from "./src/features/i18n/context";
import type { AppView } from "./src/features/app/model/types";

function titleKeyForView(activeView: AppView) {
  switch (activeView) {
    case "network":
      return "app.views.network";
    case "matching":
      return "app.views.matching";
    case "my":
      return "app.views.my";
    case "home":
    default:
      return "app.views.home";
  }
}

function CupidateHeader({ activeView, locked }: { activeView: AppView; locked?: boolean }) {
  const { t } = useI18n();

  return (
    <PixelBox
      style={styles.headerFrame}
      backgroundColor={designTokens.color.backgroundAlt}
      contentStyle={styles.headerContent}
    >
      <View style={styles.headerRow}>
        <View style={{ flex: 1 }}>
          <PixelText variant="screenTitle" style={styles.title} color={designTokens.color.inkInverse}>
            {`Cupidate: ${t(titleKeyForView(activeView))}`}
          </PixelText>
          <PixelText variant="caption" style={styles.subtitle}>
            {t("app.header.subtitle")}
          </PixelText>
        </View>
        <View style={styles.statusBadge}>
          <PixelText variant="caption" style={styles.statusText}>
            {locked ? t("app.status.locked") : t("app.status.online")}
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
  const { t } = useI18n();

  const tabItems = useMemo<Array<{ key: AppView; label: string; iconLabel: string; accentColor: string }>>(
    () => [
      { key: "home", label: t("app.tabs.home"), iconLabel: "HM", accentColor: designTokens.color.gold },
      { key: "matching", label: t("app.tabs.matching"), iconLabel: "MT", accentColor: designTokens.color.pink },
      { key: "network", label: t("app.tabs.network"), iconLabel: "NW", accentColor: designTokens.color.blue },
      { key: "my", label: t("app.tabs.my"), iconLabel: "MY", accentColor: designTokens.color.gold }
    ],
    [t]
  );

  if (authGate.mode === "supabase" && !authGate.canAccessProtectedData) {
    return (
      <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
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
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <CupidateHeader activeView={state.activeView} />

        <View style={styles.screenBody}>
          {state.activeView === "home" && (
            <HomeView
              homeSummary={state.homeSummary}
              notifications={state.notifications}
              recommendations={state.recommendations}
              cupidates={state.cupidates}
              onGoNetwork={() => state.setActiveView("network")}
              onGoMy={() => state.setActiveView("my")}
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
              requests={state.requests}
              recommendationCount={state.recommendations.length}
              masterCupidName={state.myNickname}
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
    <SafeAreaProvider>
      <I18nProvider initialLocale="en">
        <QueryClientProvider client={queryClient}>
          <CupidateAppShell />
        </QueryClientProvider>
      </I18nProvider>
    </SafeAreaProvider>
  );
}
