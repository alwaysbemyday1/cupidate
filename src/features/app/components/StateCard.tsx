import { View } from "react-native";

import { PixelBox } from "./PixelBox";
import { PixelButton } from "./PixelButton";
import { PixelText } from "./PixelText";
import { styles } from "../styles";
import type { ButtonVariant } from "../theme/tokens";

type StateTone = "loading" | "empty" | "error";

type StateCardProps = {
  tone: StateTone;
  title: string;
  description?: string;
  actionLabel?: string;
  actionVariant?: ButtonVariant;
  onAction?: () => void | Promise<void>;
};

function toneContainerStyle(tone: StateTone) {
  switch (tone) {
    case "loading":
      return styles.stateCardLoading;
    case "error":
      return styles.stateCardError;
    case "empty":
    default:
      return styles.stateCardEmpty;
  }
}

function toneTitleStyle(tone: StateTone) {
  switch (tone) {
    case "loading":
      return styles.stateCardTitleLoading;
    case "error":
      return styles.stateCardTitleError;
    case "empty":
    default:
      return styles.stateCardTitleEmpty;
  }
}

export function StateCard({
  tone,
  title,
  description,
  actionLabel,
  actionVariant = "primary",
  onAction
}: StateCardProps) {
  return (
    <PixelBox style={styles.stateCard} contentStyle={[styles.stateCardContent, toneContainerStyle(tone)]}>
      <PixelText variant="sectionTitle" style={[styles.stateCardTitle, toneTitleStyle(tone)]}>
        {title}
      </PixelText>
      {description ? (
        <PixelText variant="body" style={styles.stateCardDescription}>
          {description}
        </PixelText>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.stateCardActionRow}>
          <PixelButton label={actionLabel} variant={actionVariant} onPress={() => void onAction()} />
        </View>
      ) : null}
    </PixelBox>
  );
}
