import { ScrollView, Text, TextInput, View } from "react-native";

import { PixelButton } from "../components/PixelButton";
import { StateCard } from "../components/StateCard";
import type { CupidConnection, CupidateRecord, NetworkSegment, ValidationErrors } from "../model/types";
import { styles } from "../styles";

type ConnectionSearchResult = {
  cupidId: string;
  nickname: string;
};

type NetworkViewProps = {
  networkSegment: NetworkSegment;
  onChangeNetworkSegment: (segment: NetworkSegment) => void;
  cupidates: CupidateRecord[];
  connections: CupidConnection[];
  ownerType: "mine" | "connected";
  onChangeOwnerType: (ownerType: "mine" | "connected") => void;
  displayName: string;
  onChangeDisplayName: (value: string) => void;
  birthYearInput: string;
  onChangeBirthYearInput: (value: string) => void;
  gender: string;
  onChangeGender: (value: string) => void;
  hobbiesInput: string;
  onChangeHobbiesInput: (value: string) => void;
  locationInput: string;
  onChangeLocationInput: (value: string) => void;
  bio: string;
  onChangeBio: (value: string) => void;
  errors: ValidationErrors;
  canSubmit: boolean;
  onSaveCupidate: () => void | Promise<void>;
  currentCupidId: string;
  connectionSearchQuery: string;
  onChangeConnectionSearchQuery: (value: string) => void;
  connectionSearchResults: ConnectionSearchResult[];
  selectedConnectionCupidId: string | null;
  onSelectConnectionCupid: (cupidId: string) => void;
  onAddConnection: () => void | Promise<void>;
  isNetworkLoading?: boolean;
  isSearchingCupids?: boolean;
  isMutatingNetwork?: boolean;
  networkError?: string | null;
};

export function NetworkView({
  networkSegment,
  onChangeNetworkSegment,
  cupidates,
  connections,
  ownerType,
  onChangeOwnerType,
  displayName,
  onChangeDisplayName,
  birthYearInput,
  onChangeBirthYearInput,
  gender,
  onChangeGender,
  hobbiesInput,
  onChangeHobbiesInput,
  locationInput,
  onChangeLocationInput,
  bio,
  onChangeBio,
  errors,
  canSubmit,
  onSaveCupidate,
  currentCupidId,
  connectionSearchQuery,
  onChangeConnectionSearchQuery,
  connectionSearchResults,
  selectedConnectionCupidId,
  onSelectConnectionCupid,
  onAddConnection,
  isNetworkLoading,
  isSearchingCupids,
  isMutatingNetwork,
  networkError
}: NetworkViewProps) {
  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      {isNetworkLoading ? (
        <StateCard tone="loading" title="SYNCING NETWORK ROSTER" description="Loading cupidates and connection map." />
      ) : null}
      {networkError ? <StateCard tone="error" title="NETWORK SYNC ERROR" description={networkError} /> : null}

      <View style={styles.buttonRow}>
        <PixelButton
          label={`My Cupidates (${cupidates.length})`}
          variant="primary"
          active={networkSegment === "cupidates"}
          onPress={() => onChangeNetworkSegment("cupidates")}
        />
        <PixelButton
          label={`Connected Cupids (${connections.length})`}
          variant="neutral"
          active={networkSegment === "cupids"}
          onPress={() => onChangeNetworkSegment("cupids")}
        />
      </View>

      {networkSegment === "cupidates" ? (
        <>
          <Text style={styles.fieldLabel}>Owner Type</Text>
          <View style={styles.buttonRow}>
            <PixelButton label="My Cupidate" active={ownerType === "mine"} onPress={() => onChangeOwnerType("mine")} />
            <PixelButton
              label="Connected Cupidate"
              variant="warning"
              active={ownerType === "connected"}
              onPress={() => onChangeOwnerType("connected")}
            />
          </View>

          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            value={displayName}
            onChangeText={onChangeDisplayName}
            placeholder="e.g. Mina"
            placeholderTextColor="#6D4AFF"
            style={styles.input}
          />
          {!!errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}

          <Text style={styles.fieldLabel}>Birth Year</Text>
          <TextInput
            value={birthYearInput}
            onChangeText={onChangeBirthYearInput}
            keyboardType="numeric"
            placeholder="e.g. 1998"
            placeholderTextColor="#6D4AFF"
            style={styles.input}
          />
          {!!errors.birthYear && <Text style={styles.errorText}>{errors.birthYear}</Text>}

          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.buttonRow}>
            <PixelButton label="Male" active={gender === "male"} onPress={() => onChangeGender("male")} />
            <PixelButton label="Female" active={gender === "female"} onPress={() => onChangeGender("female")} />
          </View>
          {!!errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

          <Text style={styles.fieldLabel}>Hobbies (comma separated)</Text>
          <TextInput
            value={hobbiesInput}
            onChangeText={onChangeHobbiesInput}
            placeholder="hiking,music,coffee"
            placeholderTextColor="#6D4AFF"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput
            value={locationInput}
            onChangeText={onChangeLocationInput}
            placeholder="seoul"
            placeholderTextColor="#6D4AFF"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={onChangeBio}
            multiline
            numberOfLines={3}
            placeholder="A short profile summary"
            placeholderTextColor="#6D4AFF"
            style={[styles.input, styles.multilineInput]}
          />

          <PixelButton label="Save Cupidate" variant="primary" onPress={onSaveCupidate} active={canSubmit} />

          <Text style={styles.sectionTitle}>Cupidate List</Text>
          {cupidates.length === 0 ? (
            <StateCard tone="empty" title="NO CUPIDATES YET" description="Register your first cupidate profile." />
          ) : (
            cupidates.map((item) => (
              <View key={item.cupidateId} style={styles.listCard}>
                <Text style={styles.listName}>
                  {item.displayName} ({item.gender})
                </Text>
                <Text style={styles.listMeta}>Birth Year: {item.birthYear ?? "-"}</Text>
                <Text style={styles.listMeta}>
                  Owner: {item.ownerCupidId === currentCupidId ? "My Cupidate" : "Connected Cupidate"}
                </Text>
                <Text style={styles.listMeta}>Bio: {item.bio || "-"}</Text>
              </View>
            ))
          )}
        </>
      ) : (
        <>
          <Text style={styles.fieldLabel}>Search Cupid by Nickname</Text>
          <TextInput
            value={connectionSearchQuery}
            onChangeText={onChangeConnectionSearchQuery}
            placeholder="e.g. connected_a"
            placeholderTextColor="#6D4AFF"
            style={styles.input}
          />

          {isSearchingCupids ? (
            <StateCard tone="loading" title="SEARCHING CUPIDS" description="Scanning available network candidates." />
          ) : null}

          {connectionSearchQuery.trim().length > 0 && connectionSearchResults.length === 0 && !isSearchingCupids ? (
            <StateCard tone="empty" title="NO MATCHED CUPID" description="No available cupid found for this query." />
          ) : null}

          {connectionSearchResults.map((candidate) => {
            const selected = selectedConnectionCupidId === candidate.cupidId;

            return (
              <View key={candidate.cupidId} style={styles.listCard}>
                <Text style={styles.listName}>{candidate.nickname}</Text>
                <Text style={styles.listMeta}>Cupid ID: {candidate.cupidId}</Text>
                <View style={styles.buttonRow}>
                  <PixelButton
                    label={selected ? "Selected" : "Select"}
                    variant={selected ? "success" : "neutral"}
                    onPress={() => onSelectConnectionCupid(candidate.cupidId)}
                  />
                </View>
              </View>
            );
          })}

          <PixelButton
            label={isMutatingNetwork ? "Adding..." : "Add Connection Request"}
            variant="warning"
            onPress={onAddConnection}
          />

          <Text style={styles.sectionTitle}>Connected Cupid List</Text>
          {connections.length === 0 ? (
            <StateCard
              tone="empty"
              title="NO CONNECTIONS YET"
              description="Send your first connection request from the search results."
            />
          ) : (
            connections.map((connection) => (
              <View key={connection.cupidId} style={styles.listCard}>
                <Text style={styles.listName}>{connection.name}</Text>
                <Text style={styles.listMeta}>Cupid ID: {connection.cupidId}</Text>
                <Text style={styles.listMeta}>Status: {connection.status}</Text>
              </View>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}
