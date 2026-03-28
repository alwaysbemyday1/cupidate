import { ScrollView, TextInput, View } from "react-native";

import { PixelBox } from "../components/PixelBox";
import { PixelButton } from "../components/PixelButton";
import { PixelText } from "../components/PixelText";
import { StateCard } from "../components/StateCard";
import type { CupidConnection, CupidateRecord, NetworkSegment, ValidationErrors } from "../model/types";
import { styles } from "../styles";
import { designTokens } from "../theme/tokens";

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

const placeholderTextColor = designTokens.color.inkMuted;

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
          variant="secondary"
          active={networkSegment === "cupids"}
          onPress={() => onChangeNetworkSegment("cupids")}
        />
      </View>

      {networkSegment === "cupidates" ? (
        <>
          <PixelText variant="label" style={styles.fieldLabel}>
            Owner Type
          </PixelText>
          <View style={styles.buttonRow}>
            <PixelButton label="My Cupidate" active={ownerType === "mine"} onPress={() => onChangeOwnerType("mine")} />
            <PixelButton
              label="Connected Cupidate"
              variant="secondary"
              active={ownerType === "connected"}
              onPress={() => onChangeOwnerType("connected")}
            />
          </View>

          <PixelText variant="label" style={styles.fieldLabel}>
            Name
          </PixelText>
          <TextInput
            value={displayName}
            onChangeText={onChangeDisplayName}
            placeholder="e.g. Mina"
            placeholderTextColor={placeholderTextColor}
            style={styles.input}
          />
          {!!errors.displayName && (
            <PixelText variant="body" style={styles.errorText}>
              {errors.displayName}
            </PixelText>
          )}

          <PixelText variant="label" style={styles.fieldLabel}>
            Birth Year
          </PixelText>
          <TextInput
            value={birthYearInput}
            onChangeText={onChangeBirthYearInput}
            keyboardType="numeric"
            placeholder="e.g. 1998"
            placeholderTextColor={placeholderTextColor}
            style={styles.input}
          />
          {!!errors.birthYear && (
            <PixelText variant="body" style={styles.errorText}>
              {errors.birthYear}
            </PixelText>
          )}

          <PixelText variant="label" style={styles.fieldLabel}>
            Gender
          </PixelText>
          <View style={styles.buttonRow}>
            <PixelButton label="Male" active={gender === "male"} onPress={() => onChangeGender("male")} />
            <PixelButton label="Female" active={gender === "female"} onPress={() => onChangeGender("female")} />
            <PixelButton label="Other" active={gender === "other"} onPress={() => onChangeGender("other")} />
          </View>
          {!!errors.gender && (
            <PixelText variant="body" style={styles.errorText}>
              {errors.gender}
            </PixelText>
          )}

          <PixelText variant="label" style={styles.fieldLabel}>
            Region
          </PixelText>
          <TextInput
            value={locationInput}
            onChangeText={onChangeLocationInput}
            placeholder="e.g. seoul"
            placeholderTextColor={placeholderTextColor}
            style={styles.input}
          />

          <PixelText variant="label" style={styles.fieldLabel}>
            Job Title
          </PixelText>
          <TextInput
            value={jobTitleInput}
            onChangeText={onChangeJobTitleInput}
            placeholder="e.g. Product Designer"
            placeholderTextColor={placeholderTextColor}
            style={styles.input}
          />

          <PixelText variant="label" style={styles.fieldLabel}>
            Height (cm)
          </PixelText>
          <TextInput
            value={heightInput}
            onChangeText={onChangeHeightInput}
            keyboardType="numeric"
            placeholder="e.g. 168"
            placeholderTextColor={placeholderTextColor}
            style={styles.input}
          />
          {!!errors.height && (
            <PixelText variant="body" style={styles.errorText}>
              {errors.height}
            </PixelText>
          )}

          <PixelText variant="label" style={styles.fieldLabel}>
            Smoking Habit
          </PixelText>
          <View style={styles.buttonRow}>
            <PixelButton label="None" active={smokingHabit === "none"} onPress={() => onChangeSmokingHabit("none")} />
            <PixelButton
              label="Sometimes"
              active={smokingHabit === "sometimes"}
              onPress={() => onChangeSmokingHabit("sometimes")}
            />
            <PixelButton label="Often" active={smokingHabit === "often"} onPress={() => onChangeSmokingHabit("often")} />
          </View>

          <PixelText variant="label" style={styles.fieldLabel}>
            Drinking Habit
          </PixelText>
          <View style={styles.buttonRow}>
            <PixelButton label="Never" active={drinkingHabit === "never"} onPress={() => onChangeDrinkingHabit("never")} />
            <PixelButton label="Social" active={drinkingHabit === "social"} onPress={() => onChangeDrinkingHabit("social")} />
            <PixelButton label="Often" active={drinkingHabit === "often"} onPress={() => onChangeDrinkingHabit("often")} />
          </View>

          <PixelText variant="label" style={styles.fieldLabel}>
            Hobbies (comma separated)
          </PixelText>
          <TextInput
            value={hobbiesInput}
            onChangeText={onChangeHobbiesInput}
            placeholder="hiking,music,coffee"
            placeholderTextColor={placeholderTextColor}
            style={styles.input}
          />

          <PixelText variant="label" style={styles.fieldLabel}>
            Preferred Age Range
          </PixelText>
          <View style={styles.buttonRow}>
            <TextInput
              value={preferredAgeMinInput}
              onChangeText={onChangePreferredAgeMinInput}
              keyboardType="numeric"
              placeholder="min"
              placeholderTextColor={placeholderTextColor}
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              value={preferredAgeMaxInput}
              onChangeText={onChangePreferredAgeMaxInput}
              keyboardType="numeric"
              placeholder="max"
              placeholderTextColor={placeholderTextColor}
              style={[styles.input, styles.halfInput]}
            />
          </View>
          {!!errors.preferredAgeRange && (
            <PixelText variant="body" style={styles.errorText}>
              {errors.preferredAgeRange}
            </PixelText>
          )}

          <PixelText variant="label" style={styles.fieldLabel}>
            Preferred Regions (comma separated)
          </PixelText>
          <TextInput
            value={preferredRegionsInput}
            onChangeText={onChangePreferredRegionsInput}
            placeholder="seoul,busan"
            placeholderTextColor={placeholderTextColor}
            style={styles.input}
          />

          <PixelText variant="label" style={styles.fieldLabel}>
            Preferred Smoking
          </PixelText>
          <View style={styles.buttonRow}>
            <PixelButton
              label="Non-smoker"
              active={preferredSmoking === "none_only"}
              onPress={() => onChangePreferredSmoking("none_only")}
            />
            <PixelButton label="OK" active={preferredSmoking === "ok"} onPress={() => onChangePreferredSmoking("ok")} />
            <PixelButton label="Any" active={preferredSmoking === "any"} onPress={() => onChangePreferredSmoking("any")} />
          </View>

          <PixelText variant="label" style={styles.fieldLabel}>
            Preferred Drinking
          </PixelText>
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

          <PixelText variant="label" style={styles.fieldLabel}>
            Preferred Gender
          </PixelText>
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

          <PixelText variant="label" style={styles.fieldLabel}>
            Preferred Height Range (optional)
          </PixelText>
          <View style={styles.buttonRow}>
            <TextInput
              value={preferredHeightMinInput}
              onChangeText={onChangePreferredHeightMinInput}
              keyboardType="numeric"
              placeholder="min cm"
              placeholderTextColor={placeholderTextColor}
              style={[styles.input, styles.halfInput]}
            />
            <TextInput
              value={preferredHeightMaxInput}
              onChangeText={onChangePreferredHeightMaxInput}
              keyboardType="numeric"
              placeholder="max cm"
              placeholderTextColor={placeholderTextColor}
              style={[styles.input, styles.halfInput]}
            />
          </View>
          {!!errors.preferredHeightRange && (
            <PixelText variant="body" style={styles.errorText}>
              {errors.preferredHeightRange}
            </PixelText>
          )}

          <PixelText variant="label" style={styles.fieldLabel}>
            Bio
          </PixelText>
          <TextInput
            value={bio}
            onChangeText={onChangeBio}
            multiline
            numberOfLines={3}
            placeholder="A short profile summary"
            placeholderTextColor={placeholderTextColor}
            style={[styles.input, styles.multilineInput]}
          />

          <PixelButton
            label={isMutatingNetwork ? "Saving..." : "Save Cupidate"}
            variant={canSubmit ? "primary" : "warning"}
            onPress={onSaveCupidate}
            active={canSubmit}
          />

          <PixelText variant="sectionTitle" style={styles.sectionTitle}>
            Cupidate List
          </PixelText>
          {cupidates.length === 0 ? (
            <StateCard tone="empty" title="NO CUPIDATES YET" description="Register your first cupidate profile." />
          ) : (
            cupidates.map((item) => (
              <PixelBox key={item.cupidateId} style={styles.listCard} contentStyle={styles.listCardContent}>
                <PixelText variant="sectionTitle" style={styles.listName}>
                  {`${item.displayName} (${item.gender})`}
                </PixelText>
                <PixelText variant="body" style={styles.listMeta}>
                  {`Birth Year: ${item.birthYear ?? "-"}`}
                </PixelText>
                <PixelText variant="body" style={styles.listMeta}>
                  {`Owner: ${item.ownerCupidId === currentCupidId ? "My Cupidate" : "Connected Cupidate"}`}
                </PixelText>
                <PixelText variant="body" style={styles.listMeta}>
                  {`Region: ${item.preferences.region ?? "-"}`}
                </PixelText>
                <PixelText variant="body" style={styles.listMeta}>
                  {`Job: ${item.preferences.jobTitle ?? "-"}`}
                </PixelText>
                <PixelText variant="body" style={styles.listMeta}>
                  {`Lifestyle: ${item.preferences.smokingHabit ?? "-"} / ${item.preferences.drinkingHabit ?? "-"}`}
                </PixelText>
                <PixelText variant="body" style={styles.listMeta}>
                  {`Bio: ${item.bio || "-"}`}
                </PixelText>
              </PixelBox>
            ))
          )}
        </>
      ) : (
        <>
          <PixelText variant="label" style={styles.fieldLabel}>
            Search Cupid by Nickname
          </PixelText>
          <TextInput
            value={connectionSearchQuery}
            onChangeText={onChangeConnectionSearchQuery}
            placeholder="e.g. connected_a"
            placeholderTextColor={placeholderTextColor}
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
              <PixelBox key={candidate.cupidId} style={styles.listCard} contentStyle={styles.listCardContent}>
                <PixelText variant="sectionTitle" style={styles.listName}>
                  {candidate.nickname}
                </PixelText>
                <PixelText variant="body" style={styles.listMeta}>
                  {`Cupid ID: ${candidate.cupidId}`}
                </PixelText>
                <View style={styles.buttonRow}>
                  <PixelButton
                    label={selected ? "Selected" : "Select"}
                    variant={selected ? "success" : "secondary"}
                    onPress={() => onSelectConnectionCupid(candidate.cupidId)}
                  />
                </View>
              </PixelBox>
            );
          })}

          <PixelButton
            label={isMutatingNetwork ? "Adding..." : "Add Connection Request"}
            variant="warning"
            onPress={onAddConnection}
          />

          <PixelText variant="sectionTitle" style={styles.sectionTitle}>
            Connected Cupid List
          </PixelText>
          {connections.length === 0 ? (
            <StateCard
              tone="empty"
              title="NO CONNECTIONS YET"
              description="Send your first connection request from the search results."
            />
          ) : (
            connections.map((connection) => (
              <PixelBox key={connection.cupidId} style={styles.listCard} contentStyle={styles.listCardContent}>
                <PixelText variant="sectionTitle" style={styles.listName}>
                  {connection.name}
                </PixelText>
                <PixelText variant="body" style={styles.listMeta}>
                  {`Cupid ID: ${connection.cupidId}`}
                </PixelText>
                <PixelText variant="body" style={styles.listMeta}>
                  {`Status: ${connection.status}`}
                </PixelText>
              </PixelBox>
            ))
          )}
        </>
      )}
    </ScrollView>
  );
}
