import { ScrollView, Text, TextInput, View } from "react-native";

import { PixelButton } from "../components/PixelButton";
import { styles } from "../styles";
import type { CupidConnection, CupidateRecord, NetworkSegment, ValidationErrors } from "../model/types";

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
  newConnectionCupidId: string;
  onChangeNewConnectionCupidId: (value: string) => void;
  onAddConnection: () => void | Promise<void>;
  isNetworkLoading?: boolean;
  isMutatingNetwork?: boolean;
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
  newConnectionCupidId,
  onChangeNewConnectionCupidId,
  onAddConnection,
  isNetworkLoading,
  isMutatingNetwork
}: NetworkViewProps) {
  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      {isNetworkLoading && <Text style={styles.listMeta}>Syncing network data...</Text>}

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
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No cupidates yet.</Text>
            </View>
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
          <Text style={styles.fieldLabel}>Add Connected Cupid</Text>
          <TextInput
            value={newConnectionCupidId}
            onChangeText={onChangeNewConnectionCupidId}
            placeholder="Connected Cupid ID (e.g. local-cupid-a)"
            placeholderTextColor="#6D4AFF"
            style={styles.input}
          />
          <PixelButton
            label={isMutatingNetwork ? "Adding..." : "Add Connection Request"}
            variant="warning"
            onPress={onAddConnection}
          />

          <Text style={styles.sectionTitle}>Connected Cupid List</Text>
          {connections.map((connection) => (
            <View key={connection.cupidId} style={styles.listCard}>
              <Text style={styles.listName}>{connection.name}</Text>
              <Text style={styles.listMeta}>Cupid ID: {connection.cupidId}</Text>
              <Text style={styles.listMeta}>Status: {connection.status}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
}
