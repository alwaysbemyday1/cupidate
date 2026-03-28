import { Text, View } from "react-native";

import { styles } from "../styles";

type StateTone = "loading" | "empty" | "error";

type StateCardProps = {
  tone: StateTone;
  title: string;
  description?: string;
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

export function StateCard({ tone, title, description }: StateCardProps) {
  return (
    <View style={[styles.stateCard, toneContainerStyle(tone)]}>
      <Text style={[styles.stateCardTitle, toneTitleStyle(tone)]}>{title}</Text>
      {description ? <Text style={styles.stateCardDescription}>{description}</Text> : null}
    </View>
  );
}
