import { StatusBar } from "expo-status-bar";
import { Text, View } from "react-native";

import { PixelButton } from "./src/features/app/components/PixelButton";
import { useCupidateAppState } from "./src/features/app/model/useCupidateAppState";
import { styles } from "./src/features/app/styles";
import { HomeView } from "./src/features/app/views/HomeView";
import { MatchingView } from "./src/features/app/views/MatchingView";
import { MyView } from "./src/features/app/views/MyView";
import { NetworkView } from "./src/features/app/views/NetworkView";

export default function App() {
  const state = useCupidateAppState();

  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.title}>CUPIDATE REGISTRY</Text>
            <Text style={styles.subtitle}>PIXEL MATCH NETWORK</Text>
          </View>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>ONLINE</Text>
          </View>
        </View>

        <View style={styles.tabRow}>
          <PixelButton label="HOME" active={state.activeView === "home"} onPress={() => state.setActiveView("home")} />
          <PixelButton
            label="NETWORK"
            active={state.activeView === "network"}
            onPress={() => state.setActiveView("network")}
          />
          <PixelButton
            label="MATCHING"
            active={state.activeView === "matching"}
            onPress={() => state.setActiveView("matching")}
          />
          <PixelButton label="MY" active={state.activeView === "my"} onPress={() => state.setActiveView("my")} />
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
            newConnectionName={state.newConnectionName}
            onChangeNewConnectionName={state.setNewConnectionName}
            newConnectionRegion={state.newConnectionRegion}
            onChangeNewConnectionRegion={state.setNewConnectionRegion}
            onAddConnection={state.onAddConnection}
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
          />
        )}

        {state.activeView === "my" && (
          <MyView
            myNickname={state.myNickname}
            onChangeMyNickname={state.setMyNickname}
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
