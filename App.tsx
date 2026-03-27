import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

import { buildMatchCandidates } from "./src/domain/matching/buildMatchCandidates";
import type { CupidateProfile } from "./src/domain/matching/types";

const MY_CUPID_ID = "cupid-me";
const CONNECTED_CUPID_ID = "cupid-connected-1";

type CupidateRecord = CupidateProfile & {
  displayName: string;
  gender: string;
  bio: string;
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
    errors.displayName = "이름을 입력해 주세요.";
  }

  if (
    birthYearInput &&
    (parsedBirthYear === null ||
      Number.isNaN(parsedBirthYear) ||
      parsedBirthYear < 1900 ||
      parsedBirthYear > currentYear)
  ) {
    errors.birthYear = `출생연도는 1900-${currentYear} 범위여야 해요.`;
  }

  if (!gender) {
    errors.gender = "성별을 선택해 주세요.";
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
  const [tab, setTab] = useState<"register" | "list" | "dashboard">("register");
  const [displayName, setDisplayName] = useState("");
  const [birthYearInput, setBirthYearInput] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [hobbiesInput, setHobbiesInput] = useState("");
  const [locationInput, setLocationInput] = useState("seoul");
  const [ownerType, setOwnerType] = useState<"mine" | "connected">("mine");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [cupidates, setCupidates] = useState<CupidateRecord[]>([]);

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
          (sourceOwnerCupidId === MY_CUPID_ID && targetOwnerCupidId === CONNECTED_CUPID_ID) ||
          (sourceOwnerCupidId === CONNECTED_CUPID_ID && targetOwnerCupidId === MY_CUPID_ID)
      })
    );

    return matches.slice(0, 5);
  }, [connectedCupidates, myCupidates]);

  const onSubmit = () => {
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
    setTab("dashboard");
  };

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
          <PixelButton label="등록" active={tab === "register"} onPress={() => setTab("register")} />
          <PixelButton label={`목록 (${cupidates.length})`} active={tab === "list"} onPress={() => setTab("list")} />
          <PixelButton
            label={`대시보드 (${recommendations.length})`}
            active={tab === "dashboard"}
            onPress={() => setTab("dashboard")}
          />
        </View>

        {tab === "register" && (
          <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
            <Text style={styles.fieldLabel}>소유 네트워크</Text>
            <View style={styles.buttonRow}>
              <PixelButton label="내 지인" active={ownerType === "mine"} onPress={() => setOwnerType("mine")} />
              <PixelButton
                label="연결 지인"
                active={ownerType === "connected"}
                onPress={() => setOwnerType("connected")}
              />
            </View>

            <Text style={styles.fieldLabel}>이름</Text>
            <TextInput
              value={displayName}
              onChangeText={setDisplayName}
              placeholder="예: 민지"
              placeholderTextColor="#6D4AFF"
              style={styles.input}
            />
            {!!errors.displayName && <Text style={styles.errorText}>{errors.displayName}</Text>}

            <Text style={styles.fieldLabel}>출생연도</Text>
            <TextInput
              value={birthYearInput}
              onChangeText={setBirthYearInput}
              keyboardType="numeric"
              placeholder="예: 1998"
              placeholderTextColor="#6D4AFF"
              style={styles.input}
            />
            {!!errors.birthYear && <Text style={styles.errorText}>{errors.birthYear}</Text>}

            <Text style={styles.fieldLabel}>성별</Text>
            <View style={styles.buttonRow}>
              <PixelButton label="여성" active={gender === "여성"} onPress={() => setGender("여성")} />
              <PixelButton label="남성" active={gender === "남성"} onPress={() => setGender("남성")} />
            </View>
            {!!errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

            <Text style={styles.fieldLabel}>취미 (쉼표 구분)</Text>
            <TextInput
              value={hobbiesInput}
              onChangeText={setHobbiesInput}
              placeholder="예: hiking,music,coffee"
              placeholderTextColor="#6D4AFF"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>위치</Text>
            <TextInput
              value={locationInput}
              onChangeText={setLocationInput}
              placeholder="예: seoul"
              placeholderTextColor="#6D4AFF"
              style={styles.input}
            />

            <Text style={styles.fieldLabel}>소개</Text>
            <TextInput
              value={bio}
              onChangeText={setBio}
              multiline
              numberOfLines={3}
              placeholder="취미, 성향 등 간단 소개"
              placeholderTextColor="#6D4AFF"
              style={[styles.input, styles.multilineInput]}
            />

            <PixelButton label="지인 등록 완료" onPress={onSubmit} active={canSubmit} />
          </ScrollView>
        )}

        {tab === "list" && (
          <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
            {cupidates.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>등록된 지인이 없습니다.</Text>
                <Text style={styles.emptySubText}>[등록] 탭에서 첫 지인을 추가해 주세요.</Text>
              </View>
            ) : (
              cupidates.map((item) => (
                <View key={item.cupidateId} style={styles.listCard}>
                  <Text style={styles.listName}>
                    {item.displayName} ({item.gender})
                  </Text>
                  <Text style={styles.listMeta}>출생연도: {item.birthYear ?? "-"}</Text>
                  <Text style={styles.listMeta}>네트워크: {item.ownerCupidId === MY_CUPID_ID ? "내 지인" : "연결 지인"}</Text>
                  <Text style={styles.listMeta}>소개: {item.bio || "-"}</Text>
                </View>
              ))
            )}
          </ScrollView>
        )}

        {tab === "dashboard" && (
          <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
            <View style={styles.summaryGrid}>
              <SummaryCard label="내 지인" value={myCupidates.length} />
              <SummaryCard label="연결 지인" value={connectedCupidates.length} />
              <SummaryCard label="전체 등록" value={cupidates.length} />
              <SummaryCard label="추천 매칭" value={recommendations.length} />
            </View>

            <Text style={styles.sectionTitle}>추천 목록</Text>
            {recommendations.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>추천 가능한 매칭이 아직 없어요.</Text>
                <Text style={styles.emptySubText}>내 지인과 연결 지인을 각각 등록하면 추천이 생성됩니다.</Text>
              </View>
            ) : (
              recommendations.map((item, index) => (
                <View key={`${item.sourceCupidateId}-${item.targetCupidateId}`} style={styles.listCard}>
                  <Text style={styles.listName}>
                    #{index + 1} SCORE {item.matchScore}%
                  </Text>
                  <Text style={styles.listMeta}>출발: {item.sourceCupidateId}</Text>
                  <Text style={styles.listMeta}>후보: {item.targetCupidateId}</Text>
                  <Text style={styles.listMeta}>
                    공통 취미: {item.reason.matchedHobbies.length ? item.reason.matchedHobbies.join(", ") : "-"}
                  </Text>
                </View>
              ))
            )}
          </ScrollView>
        )}
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
    marginBottom: 10
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
    gap: 8
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
  }
});
