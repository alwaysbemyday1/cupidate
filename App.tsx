import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { buildMatchCandidates } from "./src/domain/matching/buildMatchCandidates";
import type { CupidateProfile } from "./src/domain/matching/types";

const MY_CUPID_ID = "cupid-me";
const CONNECTED_CUPID_ID = "cupid-connected-1";

type AppView = "home" | "network" | "matching" | "my";
type NetworkSegment = "cupidates" | "cupids";
type MatchRequestStatus = "requested" | "accepted" | "rejected" | "completed";

type CupidateRecord = CupidateProfile & {
  displayName: string;
  gender: string;
  bio: string;
};

type CupidConnection = {
  cupidId: string;
  name: string;
  region: string;
  status: "connected" | "pending" | "blocked";
};

type MatchRequest = {
  id: string;
  sourceCupidateId: string;
  targetCupidateId: string;
  status: MatchRequestStatus;
  createdAt: string;
};

type ValidationErrors = {
  displayName?: string;
  birthYear?: string;
  gender?: string;
};

function validateForm(displayName: string, birthYearInput: string, gender: string): ValidationErrors {
  const errors: ValidationErrors = {};
  const currentYear = new Date().getFullYear();
  const parsedBirthYear = birthYearInput ? Number(birthYearInput) : null;

  if (!displayName.trim()) {
    errors.displayName = "Name is required.";
  }

  if (
    birthYearInput &&
    (parsedBirthYear === null ||
      Number.isNaN(parsedBirthYear) ||
      parsedBirthYear < 1900 ||
      parsedBirthYear > currentYear)
  ) {
    errors.birthYear = `Birth year must be in range 1900-${currentYear}.`;
  }

  if (!gender) {
    errors.gender = "Gender is required.";
  }

  return errors;
}

function parseHobbies(input: string): string[] {
  if (!input.trim()) {
    return [];
  }

  return input
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function pairKey(sourceCupidateId: string, targetCupidateId: string) {
  return `${sourceCupidateId}:${targetCupidateId}`;
}

function PixelButton({
  label,
  active,
  onPress
}: {
  label: string;
  active?: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pixelButton, active ? styles.pixelButtonActive : styles.pixelButtonIdle]}
      accessibilityRole="button"
    >
      <Text style={styles.pixelButtonText}>{label}</Text>
    </Pressable>
  );
}

function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

export default function App() {
  const [activeView, setActiveView] = useState<AppView>("home");
  const [networkSegment, setNetworkSegment] = useState<NetworkSegment>("cupidates");
  const [displayName, setDisplayName] = useState("");
  const [birthYearInput, setBirthYearInput] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [hobbiesInput, setHobbiesInput] = useState("");
  const [locationInput, setLocationInput] = useState("seoul");
  const [ownerType, setOwnerType] = useState<"mine" | "connected">("mine");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [cupidates, setCupidates] = useState<CupidateRecord[]>([]);
  const [connections, setConnections] = useState<CupidConnection[]>([
    { cupidId: CONNECTED_CUPID_ID, name: "Connected Cupid A", region: "seoul", status: "connected" },
    { cupidId: "cupid-connected-2", name: "Connected Cupid B", region: "busan", status: "pending" }
  ]);
  const [newConnectionName, setNewConnectionName] = useState("");
  const [newConnectionRegion, setNewConnectionRegion] = useState("");
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [myNickname, setMyNickname] = useState("cupid_master");
  const [privacyNetworkOnly, setPrivacyNetworkOnly] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const canSubmit = useMemo(() => displayName.trim().length > 0 && !!gender, [displayName, gender]);

  const myCupidates = useMemo(
    () => cupidates.filter((item) => item.ownerCupidId === MY_CUPID_ID),
    [cupidates]
  );

  const connectedCupidates = useMemo(
    () => cupidates.filter((item) => item.ownerCupidId !== MY_CUPID_ID),
    [cupidates]
  );

  const recommendations = useMemo(() => {
    const matches = myCupidates.flatMap((source) =>
      buildMatchCandidates({
        source,
        targets: connectedCupidates,
        currentYear: 2026,
        isConnected: (sourceOwnerCupidId, targetOwnerCupidId) =>
          connections.some(
            (connection) =>
              connection.cupidId === targetOwnerCupidId &&
              connection.status === "connected" &&
              sourceOwnerCupidId === MY_CUPID_ID
          )
      })
    );

    return matches.slice(0, 20);
  }, [connectedCupidates, connections, myCupidates]);

  const requestByPair = useMemo(() => {
    const map = new Map<string, MatchRequest>();
    requests.forEach((request) => {
      map.set(pairKey(request.sourceCupidateId, request.targetCupidateId), request);
    });
    return map;
  }, [requests]);

  const notifications = useMemo(
    () =>
      requests
        .slice()
        .reverse()
        .slice(0, 5)
        .map(
          (request) =>
            `Request ${request.sourceCupidateId} -> ${request.targetCupidateId}: ${request.status.toUpperCase()}`
        ),
    [requests]
  );

  const homeSummary = useMemo(
    () => ({
      myCupidates: myCupidates.length,
      connectedCupids: connections.filter((connection) => connection.status === "connected").length,
      recommendations: recommendations.length,
      pendingRequests: requests.filter((request) => request.status === "requested").length
    }),
    [connections, myCupidates.length, recommendations.length, requests]
  );

  const onRegisterCupidate = () => {
    const formErrors = validateForm(displayName, birthYearInput, gender);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const parsedBirthYear = birthYearInput ? Number(birthYearInput) : null;
    const ownerCupidId = ownerType === "mine" ? MY_CUPID_ID : CONNECTED_CUPID_ID;

    setCupidates((prev) => [
      {
        cupidateId: `${Date.now()}`,
        ownerCupidId,
        birthYear: parsedBirthYear,
        displayName: displayName.trim(),
        gender,
        bio: bio.trim(),
        preferences: {
          ageRange: [24, 35],
          hobbies: parseHobbies(hobbiesInput),
          smoking: "any",
          drinking: "any",
          location: locationInput.trim() || "seoul"
        }
      },
      ...prev
    ]);

    setDisplayName("");
    setBirthYearInput("");
    setGender("");
    setBio("");
    setHobbiesInput("");
    setLocationInput("seoul");
    setErrors({});
  };

  const onAddConnection = () => {
    if (!newConnectionName.trim() || !newConnectionRegion.trim()) {
      return;
    }

    setConnections((prev) => [
      {
        cupidId: `cupid-${Date.now()}`,
        name: newConnectionName.trim(),
        region: newConnectionRegion.trim().toLowerCase(),
        status: "pending"
      },
      ...prev
    ]);

    setNewConnectionName("");
    setNewConnectionRegion("");
  };

  const onSendRequest = (sourceCupidateId: string, targetCupidateId: string) => {
    const key = pairKey(sourceCupidateId, targetCupidateId);
    if (requestByPair.get(key)) {
      return;
    }

    setRequests((prev) => [
      {
        id: `req-${Date.now()}`,
        sourceCupidateId,
        targetCupidateId,
        status: "requested",
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const onUpdateRequestStatus = (sourceCupidateId: string, targetCupidateId: string, status: MatchRequestStatus) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.sourceCupidateId === sourceCupidateId && request.targetCupidateId === targetCupidateId
          ? { ...request, status }
          : request
      )
    );
  };

  const renderHome = () => (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      <View style={styles.summaryGrid}>
        <SummaryCard label="My Cupidates" value={homeSummary.myCupidates} />
        <SummaryCard label="Connected Cupids" value={homeSummary.connectedCupids} />
        <SummaryCard label="Recommendations" value={homeSummary.recommendations} />
        <SummaryCard label="Pending Requests" value={homeSummary.pendingRequests} />
      </View>

      <Text style={styles.sectionTitle}>Notification Feed</Text>
      {notifications.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No notifications yet.</Text>
          <Text style={styles.emptySubText}>Actions in Network and Matching will appear here.</Text>
        </View>
      ) : (
        notifications.map((item) => (
          <View key={item} style={styles.listCard}>
            <Text style={styles.listMeta}>{item}</Text>
          </View>
        ))
      )}

      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.buttonRow}>
        <PixelButton label="Go to Network" onPress={() => setActiveView("network")} />
        <PixelButton label="Go to Matching" onPress={() => setActiveView("matching")} />
      </View>
    </ScrollView>
  );

  const renderNetwork = () => (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      <View style={styles.buttonRow}>
        <PixelButton
          label={`My Cupidates (${cupidates.length})`}
          active={networkSegment === "cupidates"}
          onPress={() => setNetworkSegment("cupidates")}
        />
        <PixelButton
          label={`Connected Cupids (${connections.length})`}
          active={networkSegment === "cupids"}
          onPress={() => setNetworkSegment("cupids")}
        />
      </View>

      {networkSegment === "cupidates" ? (
        <>
          <Text style={styles.fieldLabel}>Owner Type</Text>
          <View style={styles.buttonRow}>
            <PixelButton label="My Cupidate" active={ownerType === "mine"} onPress={() => setOwnerType("mine")} />
            <PixelButton
              label="Connected Cupidate"
              active={ownerType === "connected"}
              onPress={() => setOwnerType("connected")}
            />
          </View>

          <Text style={styles.fieldLabel}>Name</Text>
          <TextInput
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="e.g. Mina"
            placeholderTextColor="#6D4AFF"
            style={styles.input}
          />
          {!!errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}

          <Text style={styles.fieldLabel}>Birth Year</Text>
          <TextInput
            value={birthYearInput}
            onChangeText={setBirthYearInput}
            keyboardType="numeric"
            placeholder="e.g. 1998"
            placeholderTextColor="#6D4AFF"
            style={styles.input}
          />
          {!!errors.birthYear && <Text style={styles.errorText}>{errors.birthYear}</Text>}

          <Text style={styles.fieldLabel}>Gender</Text>
          <View style={styles.buttonRow}>
            <PixelButton label="Male" active={gender === "male"} onPress={() => setGender("male")} />
            <PixelButton label="Female" active={gender === "female"} onPress={() => setGender("female")} />
          </View>
          {!!errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

          <Text style={styles.fieldLabel}>Hobbies (comma separated)</Text>
          <TextInput
            value={hobbiesInput}
            onChangeText={setHobbiesInput}
            placeholder="hiking,music,coffee"
            placeholderTextColor="#6D4AFF"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Location</Text>
          <TextInput
            value={locationInput}
            onChangeText={setLocationInput}
            placeholder="seoul"
            placeholderTextColor="#6D4AFF"
            style={styles.input}
          />

          <Text style={styles.fieldLabel}>Bio</Text>
          <TextInput
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            placeholder="A short profile summary"
            placeholderTextColor="#6D4AFF"
            style={[styles.input, styles.multilineInput]}
          />

          <PixelButton label="Save Cupidate" onPress={onRegisterCupidate} active={canSubmit} />

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
                  Owner: {item.ownerCupidId === MY_CUPID_ID ? "My Cupidate" : "Connected Cupidate"}
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
            value={newConnectionName}
            onChangeText={setNewConnectionName}
            placeholder="Cupid name"
            placeholderTextColor="#6D4AFF"
            style={styles.input}
          />
          <TextInput
            value={newConnectionRegion}
            onChangeText={setNewConnectionRegion}
            placeholder="region (e.g. seoul)"
            placeholderTextColor="#6D4AFF"
            style={styles.input}
          />
          <PixelButton label="Add Connection Request" onPress={onAddConnection} />

          <Text style={styles.sectionTitle}>Connected Cupid List</Text>
          {connections.map((connection) => (
            <View key={connection.cupidId} style={styles.listCard}>
              <Text style={styles.listName}>{connection.name}</Text>
              <Text style={styles.listMeta}>Region: {connection.region}</Text>
              <Text style={styles.listMeta}>Status: {connection.status}</Text>
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );

  const renderMatching = () => (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      <Text style={styles.sectionTitle}>Recommendation Board</Text>
      {recommendations.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No recommendations yet.</Text>
          <Text style={styles.emptySubText}>Register my and connected cupidates first in Network.</Text>
        </View>
      ) : (
        recommendations.map((item) => {
          const key = pairKey(item.sourceCupidateId, item.targetCupidateId);
          const request = requestByPair.get(key);
          const sourceName =
            cupidates.find((profile) => profile.cupidateId === item.sourceCupidateId)?.displayName ||
            item.sourceCupidateId;
          const targetName =
            cupidates.find((profile) => profile.cupidateId === item.targetCupidateId)?.displayName ||
            item.targetCupidateId;

          return (
            <View key={key} style={styles.listCard}>
              <Text style={styles.listName}>
                {sourceName} x {targetName}
              </Text>
              <Text style={styles.listMeta}>Match Rate: {item.matchScore}%</Text>
              <Text style={styles.listMeta}>
                Shared Hobbies: {item.reason.matchedHobbies.length ? item.reason.matchedHobbies.join(", ") : "-"}
              </Text>
              <Text style={styles.listMeta}>Status: {request?.status ?? "none"}</Text>

              <View style={styles.buttonRow}>
                {!request && (
                  <PixelButton
                    label="Request Match"
                    onPress={() => onSendRequest(item.sourceCupidateId, item.targetCupidateId)}
                  />
                )}
                {request?.status === "requested" && (
                  <>
                    <PixelButton
                      label="Accept"
                      onPress={() => onUpdateRequestStatus(item.sourceCupidateId, item.targetCupidateId, "accepted")}
                    />
                    <PixelButton
                      label="Reject"
                      onPress={() => onUpdateRequestStatus(item.sourceCupidateId, item.targetCupidateId, "rejected")}
                    />
                  </>
                )}
                {request?.status === "accepted" && (
                  <PixelButton
                    label="Mark Contact Shared"
                    onPress={() => onUpdateRequestStatus(item.sourceCupidateId, item.targetCupidateId, "completed")}
                  />
                )}
              </View>
            </View>
          );
        })
      )}

      <Text style={styles.sectionTitle}>Match Request History</Text>
      {requests.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No history yet.</Text>
        </View>
      ) : (
        requests.map((request) => (
          <View key={request.id} style={styles.listCard}>
            <Text style={styles.listMeta}>
              {request.sourceCupidateId}
              {" -> "}
              {request.targetCupidateId}
            </Text>
            <Text style={styles.listMeta}>Status: {request.status}</Text>
            <Text style={styles.listMeta}>Created: {request.createdAt.slice(0, 10)}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );

  const renderMy = () => (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      <Text style={styles.fieldLabel}>Nickname</Text>
      <TextInput value={myNickname} onChangeText={setMyNickname} style={styles.input} />

      <View style={styles.settingRow}>
        <Text style={styles.fieldLabel}>Network-only profile visibility</Text>
        <Switch value={privacyNetworkOnly} onValueChange={setPrivacyNetworkOnly} />
      </View>
      <Text style={styles.listMeta}>Visibility: {privacyNetworkOnly ? "Network only" : "Private"}</Text>

      <View style={styles.settingRow}>
        <Text style={styles.fieldLabel}>Notifications</Text>
        <Switch value={notificationEnabled} onValueChange={setNotificationEnabled} />
      </View>
      <Text style={styles.listMeta}>Notification status: {notificationEnabled ? "ON" : "OFF"}</Text>

      <Text style={styles.sectionTitle}>Account Summary</Text>
      <View style={styles.listCard}>
        <Text style={styles.listMeta}>Connected Cupids: {connections.length}</Text>
        <Text style={styles.listMeta}>Registered Cupidates: {cupidates.length}</Text>
        <Text style={styles.listMeta}>Match Requests: {requests.length}</Text>
      </View>
    </ScrollView>
  );

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
          <PixelButton label="HOME" active={activeView === "home"} onPress={() => setActiveView("home")} />
          <PixelButton label="NETWORK" active={activeView === "network"} onPress={() => setActiveView("network")} />
          <PixelButton
            label="MATCHING"
            active={activeView === "matching"}
            onPress={() => setActiveView("matching")}
          />
          <PixelButton label="MY" active={activeView === "my"} onPress={() => setActiveView("my")} />
        </View>

        {activeView === "home" && renderHome()}
        {activeView === "network" && renderNetwork()}
        {activeView === "matching" && renderMatching()}
        {activeView === "my" && renderMy()}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#111827"
  },
  container: {
    flex: 1,
    paddingHorizontal: 14,
    paddingBottom: 14
  },
  headerRow: {
    marginTop: 12,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start"
  },
  title: {
    color: "#FDE047",
    fontFamily: "monospace",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 1
  },
  subtitle: {
    color: "#60A5FA",
    fontFamily: "monospace",
    fontSize: 12,
    marginTop: 4
  },
  statusBadge: {
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#34D399",
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  statusText: {
    color: "#064E3B",
    fontFamily: "monospace",
    fontWeight: "800",
    fontSize: 11
  },
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
    flexWrap: "wrap"
  },
  panel: {
    flex: 1,
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#93C5FD"
  },
  panelContent: {
    padding: 12,
    gap: 8
  },
  fieldLabel: {
    color: "#111827",
    fontFamily: "monospace",
    fontWeight: "700",
    marginTop: 2
  },
  input: {
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#E0E7FF",
    color: "#111827",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontFamily: "monospace"
  },
  multilineInput: {
    minHeight: 88,
    textAlignVertical: "top"
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap"
  },
  pixelButton: {
    borderWidth: 3,
    borderColor: "#000000",
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  pixelButtonIdle: {
    backgroundColor: "#BFDBFE"
  },
  pixelButtonActive: {
    backgroundColor: "#FDE047"
  },
  pixelButtonText: {
    color: "#111827",
    fontFamily: "monospace",
    fontWeight: "800"
  },
  errorText: {
    color: "#B91C1C",
    fontFamily: "monospace",
    fontWeight: "700"
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  summaryCard: {
    width: "48%",
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#FEF08A",
    padding: 10
  },
  summaryLabel: {
    color: "#92400E",
    fontFamily: "monospace",
    fontWeight: "700",
    fontSize: 12
  },
  summaryValue: {
    color: "#7C2D12",
    fontFamily: "monospace",
    fontWeight: "800",
    fontSize: 20,
    marginTop: 4
  },
  sectionTitle: {
    marginTop: 8,
    color: "#111827",
    fontFamily: "monospace",
    fontWeight: "800"
  },
  emptyCard: {
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#E0F2FE",
    padding: 12
  },
  emptyText: {
    color: "#111827",
    fontFamily: "monospace",
    fontWeight: "700"
  },
  emptySubText: {
    color: "#334155",
    fontFamily: "monospace",
    marginTop: 4
  },
  listCard: {
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#E0E7FF",
    padding: 12,
    marginBottom: 10
  },
  listName: {
    color: "#111827",
    fontFamily: "monospace",
    fontWeight: "800"
  },
  listMeta: {
    color: "#334155",
    fontFamily: "monospace",
    marginTop: 4
  },
  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#000000",
    backgroundColor: "#E0E7FF",
    paddingHorizontal: 10,
    paddingVertical: 8
  }
});
