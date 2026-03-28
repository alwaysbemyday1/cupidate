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
  jobTitleInput: string;
  onChangeJobTitleInput: (value: string) => void;
  heightInput: string;
  onChangeHeightInput: (value: string) => void;
  smokingHabit: "none" | "sometimes" | "often";
  onChangeSmokingHabit: (value: "none" | "sometimes" | "often") => void;
  drinkingHabit: "never" | "social" | "often";
  onChangeDrinkingHabit: (value: "never" | "social" | "often") => void;
  preferredAgeMinInput: string;
  onChangePreferredAgeMinInput: (value: string) => void;
  preferredAgeMaxInput: string;
  onChangePreferredAgeMaxInput: (value: string) => void;
  preferredRegionsInput: string;
  onChangePreferredRegionsInput: (value: string) => void;
  preferredSmoking: "none_only" | "ok" | "any";
  onChangePreferredSmoking: (value: "none_only" | "ok" | "any") => void;
  preferredDrinking: "never" | "social" | "often" | "any";
  onChangePreferredDrinking: (value: "never" | "social" | "often" | "any") => void;
  preferredGender: "any" | "male" | "female" | "other";
  onChangePreferredGender: (value: "any" | "male" | "female" | "other") => void;
  preferredHeightMinInput: string;
  onChangePreferredHeightMinInput: (value: string) => void;
  preferredHeightMaxInput: string;
  onChangePreferredHeightMaxInput: (value: string) => void;
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
  onRetryNetworkError?: () => void | Promise<void>;
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
  jobTitleInput,
  onChangeJobTitleInput,
  heightInput,
  onChangeHeightInput,
  smokingHabit,
  onChangeSmokingHabit,
  drinkingHabit,
  onChangeDrinkingHabit,
  preferredAgeMinInput,
  onChangePreferredAgeMinInput,
  preferredAgeMaxInput,
  onChangePreferredAgeMaxInput,
  preferredRegionsInput,
  onChangePreferredRegionsInput,
  preferredSmoking,
  onChangePreferredSmoking,
  preferredDrinking,
  onChangePreferredDrinking,
  preferredGender,
  onChangePreferredGender,
  preferredHeightMinInput,
  onChangePreferredHeightMinInput,
  preferredHeightMaxInput,
  onChangePreferredHeightMaxInput,
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
  networkError,
  onRetryNetworkError
}: NetworkViewProps) {
  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      {isNetworkLoading ? (
        <StateCard tone="loading" title="SYNCING NETWORK ROSTER" description="Loading cupidates and connection map." />
      ) : null}
      {networkError ? (
        <StateCard
          tone="error"
          title="NETWORK SYNC ERROR"
          description={networkError}
          actionLabel="Retry Network Sync"
          actionVariant="warning"
          onAction={onRetryNetworkError}
        />
      ) : null}

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
            placeholderTextColor="#7f8ca8"
            style={styles.input}
          />
          {!!errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}

          <Text style={styles.fieldLabel}>Birth Year</Text>
          <TextInput
            value={birthYearInput}
            onChangeText={onChangeBirthYearInput}
            keyboardType="numeric"
            placeholder="e.g. 1998"
            placeholderTextColor="#7f8ca8"
            style={styles.input}
          />
          {!!errors.birthYear && <Text style={styles.errorText}>{errors.birthYear}</Text>}

          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.buttonRow}>
            <PixelButton label="Male" active={gender === "male"} onPress={() => onChangeGender("male")} />
            <PixelButton label="Female" active={gender === "female"} onPress={() => onChangeGender("female")} />
            <PixelButton label="Other" active={gender === "other"} onPress={() => onChangeGender("other")} />
          </View>
          {!!errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

          <Text style={styles.fieldLabel}>Region</Text>
          <TextInput
            value={locationInput}
            onChangeText={onChangeLocationInput}
            placeholder="e.g. seoul"
            placeholderTextColor="#7f8ca8"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Job Title</Text>
          <TextInput
            value={jobTitleInput}
            onChangeText={onChangeJobTitleInput}
            placeholder="e.g. Product Designer"
            placeholderTextColor="#7f8ca8"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Height (cm)</Text>
          <TextInput
            value={heightInput}
            onChangeText={onChangeHeightInput}
            keyboardType="numeric"
            placeholder="e.g. 168"
            placeholderTextColor="#7f8ca8"
            style={styles.input}
          />
          {!!errors.height && <Text style={styles.errorText}>{errors.height}</Text>}

          <Text style={styles.fieldLabel}>Smoking Habit</Text>
          <View style={styles.buttonRow}>
            <PixelButton label="None" active={smokingHabit === "none"} onPress={() => onChangeSmokingHabit("none")} />
            <PixelButton
              label="Sometimes"
              active={smokingHabit === "sometimes"}
              onPress={() => onChangeSmokingHabit("sometimes")}
            />
            <PixelButton label="Often" active={smokingHabit === "often"} onPress={() => onChangeSmokingHabit("often")} />
          </View>

          <Text style={styles.fieldLabel}>Drinking Habit</Text>
          <View style={styles.buttonRow}>
            <PixelButton label="Never" active={drinkingHabit === "never"} onPress={() => onChangeDrinkingHabit("never")} />
            <PixelButton label="Social" active={drinkingHabit === "social"} onPress={() => onChangeDrinkingHabit("social")} />
            <PixelButton label="Often" active={drinkingHabit === "often"} onPress={() => onChangeDrinkingHabit("often")} />
          </View>

          <Text style={styles.fieldLabel}>Hobbies (comma separated)</Text>
          <TextInput
            value={hobbiesInput}
            onChangeText={onChangeHobbiesInput}
            placeholder="hiking,music,coffee"
            placeholderTextColor="#7f8ca8"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Preferred Age Range</Text>
          <View style={styles.buttonRow}>
            <TextInput
              value={preferredAgeMinInput}
              onChangeText={onChangePreferredAgeMinInput}
              keyboardType="numeric"
              placeholder="min"
              placeholderTextColor="#7f8ca8"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              value={preferredAgeMaxInput}
              onChangeText={onChangePreferredAgeMaxInput}
              keyboardType="numeric"
              placeholder="max"
              placeholderTextColor="#7f8ca8"
              style={[styles.input, styles.halfInput]}
            />
          </View>
          {!!errors.preferredAgeRange && <Text style={styles.errorText}>{errors.preferredAgeRange}</Text>}

          <Text style={styles.fieldLabel}>Preferred Regions (comma separated)</Text>
          <TextInput
            value={preferredRegionsInput}
            onChangeText={onChangePreferredRegionsInput}
            placeholder="seoul,busan"
            placeholderTextColor="#7f8ca8"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Preferred Smoking</Text>
          <View style={styles.buttonRow}>
            <PixelButton
              label="Non-smoker"
              active={preferredSmoking === "none_only"}
              onPress={() => onChangePreferredSmoking("none_only")}
            />
            <PixelButton label="OK" active={preferredSmoking === "ok"} onPress={() => onChangePreferredSmoking("ok")} />
            <PixelButton label="Any" active={preferredSmoking === "any"} onPress={() => onChangePreferredSmoking("any")} />
          </View>

          <Text style={styles.fieldLabel}>Preferred Drinking</Text>
          <View style={styles.buttonRow}>
            <PixelButton
              label="Never"
              active={preferredDrinking === "never"}
              onPress={() => onChangePreferredDrinking("never")}
            />
            <PixelButton
              label="Social"
              active={preferredDrinking === "social"}
              onPress={() => onChangePreferredDrinking("social")}
            />
            <PixelButton
              label="Often"
              active={preferredDrinking === "often"}
              onPress={() => onChangePreferredDrinking("often")}
            />
            <PixelButton label="Any" active={preferredDrinking === "any"} onPress={() => onChangePreferredDrinking("any")} />
          </View>

          <Text style={styles.fieldLabel}>Preferred Gender</Text>
          <View style={styles.buttonRow}>
            <PixelButton label="Any" active={preferredGender === "any"} onPress={() => onChangePreferredGender("any")} />
            <PixelButton label="Male" active={preferredGender === "male"} onPress={() => onChangePreferredGender("male")} />
            <PixelButton
              label="Female"
              active={preferredGender === "female"}
              onPress={() => onChangePreferredGender("female")}
            />
            <PixelButton label="Other" active={preferredGender === "other"} onPress={() => onChangePreferredGender("other")} />
          </View>

          <Text style={styles.fieldLabel}>Preferred Height Range (optional)</Text>
          <View style={styles.buttonRow}>
            <TextInput
              value={preferredHeightMinInput}
              onChangeText={onChangePreferredHeightMinInput}
              keyboardType="numeric"
              placeholder="min cm"
              placeholderTextColor="#7f8ca8"
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              value={preferredHeightMaxInput}
              onChangeText={onChangePreferredHeightMaxInput}
              keyboardType="numeric"
              placeholder="max cm"
              placeholderTextColor="#7f8ca8"
              style={[styles.input, styles.halfInput]}
            />
          </View>
          {!!errors.preferredHeightRange && <Text style={styles.errorText}>{errors.preferredHeightRange}</Text>}

          <Text style={styles.fieldLabel}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={onChangeBio}
            multiline
            numberOfLines={3}
            placeholder="A short profile summary"
            placeholderTextColor="#7f8ca8"
            style={[styles.input, styles.multilineInput]}
          />

          <PixelButton
            label={isMutatingNetwork ? "Saving..." : "Save Cupidate"}
            variant="primary"
            onPress={onSaveCupidate}
            active={canSubmit}
          />

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
                <Text style={styles.listMeta}>Region: {item.preferences.region ?? "-"}</Text>
                <Text style={styles.listMeta}>Job: {item.preferences.jobTitle ?? "-"}</Text>
                <Text style={styles.listMeta}>
                  Lifestyle: {item.preferences.smokingHabit ?? "-"} / {item.preferences.drinkingHabit ?? "-"}
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
            placeholderTextColor="#7f8ca8"
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
