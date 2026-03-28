import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Text, View } from "react-native";

import { PixelButton } from "./src/features/app/components/PixelButton";
import { useAuthSessionGate } from "./src/features/auth/hooks/useAuthSessionGate";
import { useCupidateAppState } from "./src/features/app/model/useCupidateAppState";
import { styles } from "./src/features/app/styles";
import { AuthRequiredView } from "./src/features/app/views/AuthRequiredView";
import { HomeView } from "./src/features/app/views/HomeView";
import { MatchingView } from "./src/features/app/views/MatchingView";
import { MyView } from "./src/features/app/views/MyView";
import { NetworkView } from "./src/features/app/views/NetworkView";

function CupidateAppShell() {
  const authGate = useAuthSessionGate();
  const state = useCupidateAppState({
    isDataAccessEnabled: authGate.canAccessProtectedData
  });

  if (authGate.mode === "supabase" && !authGate.canAccessProtectedData) {
    return (
      <View style={styles.safeArea}>
        <StatusBar style="light" />
        <View style={styles.container}>
          <View style={styles.headerFrame}>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.title}>
                  CUPIDATE <Text style={styles.titleAccent}>ARCADE</Text>
                </Text>
                <Text style={styles.subtitle}>PIXEL MATCH NETWORK</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>LOCKED</Text>
              </View>
            </View>
          </View>

          <AuthRequiredView isLoading={authGate.isLoading} error={authGate.error} onRefresh={authGate.refresh} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.headerFrame}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>
                CUPIDATE <Text style={styles.titleAccent}>ARCADE</Text>
              </Text>
              <Text style={styles.subtitle}>PIXEL MATCH NETWORK</Text>
            </View>
            <View style={styles.statusBadge}>
              <Text style={styles.statusText}>ONLINE</Text>
            </View>
          </View>
        </View>

        <View style={styles.tabRow}>
          <PixelButton
            label="HOME"
            variant="primary"
            active={state.activeView === "home"}
            onPress={() => state.setActiveView("home")}
          />
          <PixelButton
            label="NETWORK"
            variant="neutral"
            active={state.activeView === "network"}
            onPress={() => state.setActiveView("network")}
          />
          <PixelButton
            label="MATCHING"
            variant="warning"
            active={state.activeView === "matching"}
            onPress={() => state.setActiveView("matching")}
          />
          <PixelButton
            label="MY"
            variant="success"
            active={state.activeView === "my"}
            onPress={() => state.setActiveView("my")}
          />
        </View>

        {state.activeView === "home" && (
          <HomeView
            homeSummary={state.homeSummary}
            notifications={state.notifications}
            onGoNetwork={() => state.setActiveView("network")}
            onGoMatching={() => state.setActiveView("matching")}
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
          />
        )}
      </View>
    </View>
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
