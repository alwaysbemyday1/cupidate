import { ScrollView, Switch, TextInput, View } from "react-native";

import { PixelBox } from "../components/PixelBox";
import { PixelButton } from "../components/PixelButton";
import { PixelText } from "../components/PixelText";
import { StateCard } from "../components/StateCard";
import { SummaryCard } from "../components/SummaryCard";
import { styles } from "../styles";
import { designTokens } from "../theme/tokens";
import { useI18n } from "../../i18n/context";

type MyViewProps = {
  myNickname: string;
  onChangeMyNickname: (value: string) => void;
  onSaveMyNickname: () => void | Promise<void>;
  isSavingNickname?: boolean;
  privacyNetworkOnly: boolean;
  onChangePrivacyNetworkOnly: (value: boolean) => void;
  notificationEnabled: boolean;
  onChangeNotificationEnabled: (value: boolean) => void;
  connectionCount: number;
  cupidateCount: number;
  activeCupidateCount: number;
  inactiveCupidateCount: number;
  requestCount: number;
  onGoNetwork: () => void;
  currentCupidId: string;
  accountEmail?: string | null;
  joinedAt?: string | null;
  accountMode: "local" | "supabase";
  onRefreshAccount?: () => void | Promise<void>;
  isMyLoading?: boolean;
  myError?: string | null;
  onRetryMyError?: () => void | Promise<void>;
};

function buildAvatarSeed(nickname: string) {
  const trimmed = nickname.trim();

  if (!trimmed) {
    return "CU";
  }

  return Array.from(trimmed.replace(/\s+/g, "")).slice(0, 2).join("").toUpperCase();
}

function formatJoinedAt(joinedAt: string | null | undefined, fallback: string, unknown: string) {
  if (!joinedAt) {
    return fallback;
  }

  const date = new Date(joinedAt);
  if (Number.isNaN(date.getTime())) {
    return unknown;
  }

  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(
    date.getDate()
  ).padStart(2, "0")}`;
}

export function MyView({
  myNickname,
  onChangeMyNickname,
  onSaveMyNickname,
  isSavingNickname,
  privacyNetworkOnly,
  onChangePrivacyNetworkOnly,
  notificationEnabled,
  onChangeNotificationEnabled,
  connectionCount,
  cupidateCount,
  activeCupidateCount,
  inactiveCupidateCount,
  requestCount,
  onGoNetwork,
  currentCupidId,
  accountEmail,
  joinedAt,
  accountMode,
  onRefreshAccount,
  isMyLoading,
  myError,
  onRetryMyError
}: MyViewProps) {
  const { locale, setLocale, t } = useI18n();
  const avatarSeed = buildAvatarSeed(myNickname);
  const accountModeLabel = accountMode === "supabase" ? t("my.status.supabase") : t("my.status.local");
  const joinedLabel = formatJoinedAt(joinedAt, t("my.fallback.localBuild"), t("my.fallback.unknown"));
  const visibilityLabel = privacyNetworkOnly ? t("my.visibility.network") : t("my.visibility.private");
  const notificationLabel = notificationEnabled ? t("my.notification.on") : t("my.notification.off");

  return (
    <ScrollView style={styles.panel} contentContainerStyle={styles.panelContent}>
      {isMyLoading ? (
        <StateCard tone="loading" title={t("my.loading.title")} description={t("my.loading.description")} />
      ) : null}
      {myError ? (
        <StateCard
          tone="error"
          title={t("my.error.title")}
          description={myError}
          actionLabel={t("my.error.retry")}
          actionVariant="warning"
          onAction={onRetryMyError}
        />
      ) : null}

      <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
        {t("my.sections.profileOverview")}
      </PixelText>
      <PixelBox style={styles.listCard} contentStyle={styles.listCardContent}>
        <View style={styles.profileRow}>
          <View style={styles.avatarBox}>
            <PixelText variant="screenTitle" style={styles.avatarText}>
              {avatarSeed}
            </PixelText>
          </View>
          <View style={styles.profileInfo}>
            <PixelText variant="label" style={styles.fieldLabel}>
              {t("my.fields.nickname")}
            </PixelText>
            <TextInput value={myNickname} onChangeText={onChangeMyNickname} style={styles.input} />
            <PixelText variant="body" style={styles.textBody}>
              {t("my.fields.cupidId", { id: currentCupidId })}
            </PixelText>
          </View>
        </View>

        <View style={styles.buttonRow}>
          <PixelButton
            label={isSavingNickname ? t("my.buttons.saving") : t("my.buttons.saveNickname")}
            variant="primary"
            onPress={onSaveMyNickname}
          />
          {onRefreshAccount ? (
            <PixelButton
              label={t("my.buttons.refreshSession")}
              variant="secondary"
              onPress={() => {
                void onRefreshAccount();
              }}
            />
          ) : null}
        </View>
      </PixelBox>

      <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
        {t("my.sections.accountDetails")}
      </PixelText>
      <PixelBox style={styles.listCard} contentStyle={styles.listCardContent}>
        <PixelText variant="body" style={styles.textBody}>
          {t("my.fields.email", { value: accountEmail ?? t("my.fallback.localAccount") })}
        </PixelText>
        <View style={styles.profileDivider} />
        <PixelText variant="body" style={styles.textBody}>
          {t("my.fields.joinDate", { value: joinedLabel })}
        </PixelText>
        <View style={styles.profileDivider} />
        <PixelText variant="body" style={styles.textBody}>
          {t("my.fields.mode", { value: accountModeLabel })}
        </PixelText>
      </PixelBox>

      <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
        {t("my.sections.language")}
      </PixelText>
      <PixelBox style={styles.listCard} contentStyle={styles.listCardContent}>
        <PixelText variant="body" style={styles.textBody}>
          {t("my.locale.current", { language: locale === "ko" ? t("my.locale.ko") : t("my.locale.en") })}
        </PixelText>
        <PixelText variant="caption" style={styles.profileMetaText}>
          {t("my.fields.languageHint")}
        </PixelText>
        <PixelText variant="caption" style={styles.profileMetaText}>
          {t("my.locale.persistence")}
        </PixelText>
        <View style={styles.languageButtonRow}>
          <PixelButton
            label={t("my.buttons.english")}
            variant="secondary"
            active={locale === "en"}
            testID="locale-en"
            onPress={() => setLocale("en")}
          />
          <PixelButton
            label={t("my.buttons.korean")}
            variant="primary"
            active={locale === "ko"}
            testID="locale-ko"
            onPress={() => setLocale("ko")}
          />
        </View>
      </PixelBox>

      <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
        {t("my.sections.preferences")}
      </PixelText>
      <PixelBox style={styles.listCard} contentStyle={styles.listCardContent}>
        <View style={styles.settingRow}>
          <PixelText variant="label" style={styles.fieldLabel}>
            {t("my.preference.visibility")}
          </PixelText>
          <Switch
            value={privacyNetworkOnly}
            onValueChange={onChangePrivacyNetworkOnly}
            trackColor={{ false: designTokens.color.switchTrack, true: designTokens.color.pink }}
          />
        </View>
        <PixelText variant="caption" style={styles.profileMetaText}>
          {t("my.preference.visibilityHint")}
        </PixelText>
        <PixelText variant="body" style={styles.listMeta}>
          {t("my.fields.visibility", { value: visibilityLabel })}
        </PixelText>

        <View style={styles.settingRow}>
          <PixelText variant="label" style={styles.fieldLabel}>
            {t("my.preference.notifications")}
          </PixelText>
          <Switch
            value={notificationEnabled}
            onValueChange={onChangeNotificationEnabled}
            trackColor={{ false: designTokens.color.switchTrack, true: designTokens.color.pink }}
          />
        </View>
        <PixelText variant="body" style={styles.listMeta}>
          {t("my.fields.notifications", { value: notificationLabel })}
        </PixelText>
      </PixelBox>

      <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
        {t("my.sections.readiness")}
      </PixelText>
      {cupidateCount === 0 ? (
        <StateCard
          tone="empty"
          title={t("my.readiness.emptyTitle")}
          description={t("my.readiness.emptyDescription")}
          actionLabel={t("my.buttons.openNetwork")}
          onAction={onGoNetwork}
        />
      ) : (
        <PixelBox style={styles.listCard} contentStyle={styles.listCardContent}>
          <PixelText variant="body" style={styles.textBody}>
            {t("my.readiness.hint", {
              active: activeCupidateCount,
              inactive: inactiveCupidateCount
            })}
          </PixelText>
          <View style={styles.summaryGrid}>
            <SummaryCard label={t("my.readiness.active")} value={activeCupidateCount} />
            <SummaryCard label={t("my.readiness.inactive")} value={inactiveCupidateCount} />
          </View>
          {inactiveCupidateCount > 0 ? (
            <View style={styles.stateCardActionRow}>
              <PixelButton label={t("my.buttons.openNetwork")} variant="secondary" onPress={onGoNetwork} />
            </View>
          ) : null}
        </PixelBox>
      )}

      <PixelText variant="sectionTitle" style={styles.pageSectionTitle}>
        {t("my.sections.summary")}
      </PixelText>
      {connectionCount === 0 && cupidateCount === 0 && requestCount === 0 ? (
        <StateCard tone="empty" title={t("my.empty.title")} description={t("my.empty.description")} />
      ) : (
        <View style={styles.summaryGrid}>
          <SummaryCard label={t("my.summary.connections")} value={connectionCount} />
          <SummaryCard label={t("my.summary.cupidates")} value={cupidateCount} />
          <SummaryCard label={t("my.summary.active")} value={activeCupidateCount} />
          <SummaryCard label={t("my.summary.requests")} value={requestCount} />
        </View>
      )}
    </ScrollView>
  );
}
