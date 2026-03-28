import { Pressable, Text } from "react-native";

import type { ButtonVariant } from "../theme/tokens";
import { styles } from "../styles";

type PixelButtonProps = {
  label: string;
  active?: boolean;
  variant?: ButtonVariant;
  onPress: () => void;
};

function variantStyle(variant: ButtonVariant | undefined) {
  switch (variant) {
    case "primary":
      return styles.pixelButtonPrimary;
    case "success":
      return styles.pixelButtonSuccess;
    case "warning":
      return styles.pixelButtonWarning;
    case "danger":
      return styles.pixelButtonDanger;
    case "neutral":
    default:
      return styles.pixelButtonNeutral;
  }
}

export function PixelButton({ label, active, variant = "neutral", onPress }: PixelButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.pixelButton, variantStyle(variant), active ? styles.pixelButtonActiveOutline : null]}
      accessibilityRole="button"
    >
      <Text style={styles.pixelButtonText}>{label}</Text>
    </Pressable>
  );
}
