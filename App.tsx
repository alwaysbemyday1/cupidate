import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

type Cupidate = {
  id: string;
  displayName: string;
  birthYear: number | null;
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

export default function App() {
  const [tab, setTab] = useState<"register" | "list">("register");
  const [displayName, setDisplayName] = useState("");
  const [birthYearInput, setBirthYearInput] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [cupidates, setCupidates] = useState<Cupidate[]>([]);

  const canSubmit = useMemo(() => displayName.trim().length > 0 && !!gender, [displayName, gender]);

  const onSubmit = () => {
    const formErrors = validateForm(displayName, birthYearInput, gender);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const parsedBirthYear = birthYearInput ? Number(birthYearInput) : null;

    setCupidates((prev) => [
      {
        id: `${Date.now()}`,
        displayName: displayName.trim(),
        birthYear: parsedBirthYear,
        gender,
        bio: bio.trim()
      },
      ...prev
    ]);

    setDisplayName("");
    setBirthYearInput("");
    setGender("");
    setBio("");
    setErrors({});
    setTab("list");
  };

  return (
    <View style={styles.safeArea}>
      <StatusBar style="light" />
      <View style={styles.container}>
        <Text style={styles.title}>CUPIDATE REGISTRY</Text>
        <Text style={styles.subtitle}>PIXEL MATCH NETWORK</Text>

        <View style={styles.tabRow}>
          <PixelButton label="등록" active={tab === "register"} onPress={() => setTab("register")} />
          <PixelButton label={`목록 (${cupidates.length})`} active={tab === "list"} onPress={() => setTab("list")} />
        </View>

        {tab === "register" ? (
          <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
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
            <View style={styles.genderRow}>
              <PixelButton label="여성" active={gender === "여성"} onPress={() => setGender("여성")} />
              <PixelButton label="남성" active={gender === "남성"} onPress={() => setGender("남성")} />
            </View>
            {!!errors.gender && <Text style={styles.errorText}>{errors.gender}</Text>}

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
        ) : (
          <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
            {cupidates.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>등록된 지인이 없습니다.</Text>
                <Text style={styles.emptySubText}>[등록] 탭에서 첫 지인을 추가해 주세요.</Text>
              </View>
            ) : (
              cupidates.map((item) => (
                <View key={item.id} style={styles.listCard}>
                  <Text style={styles.listName}>
                    {item.displayName} ({item.gender})
                  </Text>
                  <Text style={styles.listMeta}>출생연도: {item.birthYear ?? "-"}</Text>
                  <Text style={styles.listMeta}>소개: {item.bio || "-"}</Text>
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
  title: {
    color: "#FDE047",
    fontFamily: "monospace",
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 12
  },
  subtitle: {
    color: "#60A5FA",
    fontFamily: "monospace",
    fontSize: 12,
    marginTop: 4,
    marginBottom: 12
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
  genderRow: {
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
