import { useState } from "react";
import { TextInput, View } from "react-native";

import { PixelBox } from "../components/PixelBox";
import { PixelButton } from "../components/PixelButton";
import { PixelText } from "../components/PixelText";
import { styles } from "../styles";
import { designTokens } from "../theme/tokens";
import { useI18n } from "../../i18n/context";

type AuthRequiredViewProps = {
  isLoading: boolean;
  error: string | null;
  onRefresh: () => void | Promise<void>;
  onSignInWithPassword: (email: string, password: string) => Promise<string>;
  onSignUpWithPassword: (email: string, password: string) => Promise<string>;
};

const emailPattern = /^\S+@\S+\.\S+$/;
const placeholderTextColor = designTokens.color.inkMuted;

function normalizeSuccessMessage(action: "signin" | "signup", rawMessage: string, t: (key: string) => string) {
  if (action === "signin") {
    return t("auth.success.signIn");
  }

  if (rawMessage.toLowerCase().includes("verify email")) {
    return t("auth.success.signUpVerify");
  }

  return t("auth.success.signUp");
}

export function AuthRequiredView({
  isLoading,
  error,
  onRefresh,
  onSignInWithPassword,
  onSignUpWithPassword
}: AuthRequiredViewProps) {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const runAuthAction = async (action: "signin" | "signup") => {
    if (isSubmitting || isLoading) {
      return;
    }

    const nextEmail = email.trim().toLowerCase();

    setActionMessage(null);
    setActionError(null);

    if (!emailPattern.test(nextEmail)) {
      setActionError(t("auth.validation.email"));
      return;
    }

    if (password.length < 6) {
      setActionError(t("auth.validation.password"));
      return;
    }

    setIsSubmitting(true);

    try {
      const message =
        action === "signin"
          ? await onSignInWithPassword(nextEmail, password)
          : await onSignUpWithPassword(nextEmail, password);

      setActionMessage(normalizeSuccessMessage(action, message, t));
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : t("auth.error.requestFailed");
      setActionError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.centerPanel}>
      <View style={styles.authStack}>
        <PixelBox style={styles.authHeroCard} contentStyle={styles.authHeroContent}>
          <PixelText variant="screenTitle" style={styles.gateTitle}>
            {t("auth.title")}
          </PixelText>
          <PixelText variant="body" style={styles.gateText}>
            {t("auth.subtitle")}
          </PixelText>
        </PixelBox>

        <PixelBox style={styles.authPanelCard} contentStyle={styles.authPanelContent}>
          <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
            {t("auth.section.form")}
          </PixelText>

          <View style={styles.gateForm}>
            <PixelText variant="label" style={styles.fieldLabel}>
              {t("auth.fields.email")}
            </PixelText>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder={t("auth.placeholders.email")}
              placeholderTextColor={placeholderTextColor}
              style={styles.input}
              editable={!isSubmitting}
            />

            <PixelText variant="label" style={styles.fieldLabel}>
              {t("auth.fields.password")}
            </PixelText>
            <TextInput
              value={password}
              onChangeText={setPassword}
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              placeholder={t("auth.placeholders.password")}
              placeholderTextColor={placeholderTextColor}
              style={styles.input}
              editable={!isSubmitting}
            />
          </View>

          <View style={styles.buttonRow}>
            <PixelButton
              label={isSubmitting ? t("auth.buttons.signingIn") : t("auth.buttons.signIn")}
              variant="primary"
              testID="auth-signin"
              onPress={() => void runAuthAction("signin")}
            />
            <PixelButton
              label={isSubmitting ? t("auth.buttons.working") : t("auth.buttons.signUp")}
              variant="success"
              testID="auth-signup"
              onPress={() => void runAuthAction("signup")}
            />
          </View>
        </PixelBox>

        <PixelBox style={styles.authPanelCard} contentStyle={styles.authPanelContent}>
          <View style={styles.authStatusRow}>
            <PixelText variant="sectionTitle" style={styles.surfaceSectionTitle}>
              {t("auth.section.status")}
            </PixelText>
            <View style={styles.authStatusChip}>
              <PixelText variant="caption" style={styles.authStatusChipText}>
                {isLoading ? t("auth.status.syncChip") : t("auth.status.readyChip")}
              </PixelText>
            </View>
          </View>

          <PixelText variant="body" style={styles.authCaption}>
            {isLoading ? t("auth.status.checking") : t("auth.status.ready")}
          </PixelText>

          <View style={styles.buttonRow}>
            <PixelButton
              label={t("auth.buttons.refresh")}
              variant="secondary"
              testID="auth-refresh"
              onPress={() => void onRefresh()}
            />
          </View>

          {actionMessage ? (
            <PixelText variant="body" style={styles.gateHint}>
              {actionMessage}
            </PixelText>
          ) : null}
          {error ? (
            <PixelText variant="body" style={styles.errorText}>
              {t("auth.error.prefix", { message: error })}
            </PixelText>
          ) : null}
          {actionError ? (
            <PixelText variant="body" style={styles.errorText}>
              {t("auth.error.authPrefix", { message: actionError })}
            </PixelText>
          ) : null}
        </PixelBox>
      </View>
    </View>
  );
}
