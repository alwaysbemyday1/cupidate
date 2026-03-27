import { Pressable, Text } from "react-native";

import { styles } from "../styles";

type PixelButtonProps = {
  label: string;
  active?: boolean;
  onPress: () => void;
};

export function PixelButton({ label, active, onPress }: PixelButtonProps) {
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
