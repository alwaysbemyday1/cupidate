import { Pressable, StyleSheet, View } from "react-native";

import { PixelText } from "./PixelText";
import type { ButtonVariant } from "../theme/tokens";
import { designTokens } from "../theme/tokens";

type PixelButtonProps = {
  label: string;
  active?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  variant?: ButtonVariant;
  testID?: string;
  onPress: () => void;
};

function variantPalette(variant: ButtonVariant | undefined) {
  switch (variant) {
    case "primary":
      return {
        backgroundColor: designTokens.color.pink,
        topLine: "#F2A3BC",
        bottomLine: designTokens.color.pinkDark,
        textColor: designTokens.color.inkInverse
      };
    case "secondary":
      return {
        backgroundColor: designTokens.color.blue,
        topLine: "#8DB6DF",
        bottomLine: designTokens.color.blueDark,
        textColor: designTokens.color.inkInverse
      };
    case "success":
      return {
        backgroundColor: designTokens.color.success,
        topLine: "#A8D89D",
        bottomLine: designTokens.color.successDark,
        textColor: designTokens.color.ink
      };
    case "warning":
      return {
        backgroundColor: designTokens.color.warning,
        topLine: "#F1D8A3",
        bottomLine: designTokens.color.warningDark,
        textColor: designTokens.color.ink
      };
    case "danger":
      return {
        backgroundColor: designTokens.color.danger,
        topLine: "#D997A8",
        bottomLine: designTokens.color.dangerDark,
        textColor: designTokens.color.inkInverse
      };
    case "neutral":
    default:
      return {
        backgroundColor: designTokens.color.blueDark,
        topLine: "#7FA1D3",
        bottomLine: designTokens.color.navyDark,
        textColor: designTokens.color.inkInverse
      };
  }
}

export function PixelButton({
  label,
  active,
  disabled,
  fullWidth = false,
  variant = "neutral",
  testID,
  onPress
}: PixelButtonProps) {
  const palette = variantPalette(variant);

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!disabled, selected: !!active }}
      disabled={disabled}
      onPress={onPress}
      style={[localStyles.pressable, fullWidth ? localStyles.pressableFullWidth : null]}
      hitSlop={4}
      testID={testID}
    >
      {({ pressed }) => (
        <View
          style={[
            localStyles.shadowLayer,
            active ? localStyles.shadowLayerActive : null,
            pressed ? localStyles.shadowLayerPressed : null,
            disabled ? localStyles.shadowLayerDisabled : null
          ]}
        >
            <View
              style={[
                localStyles.face,
                { backgroundColor: palette.backgroundColor },
              active ? localStyles.faceActive : null,
              pressed ? localStyles.facePressed : null,
              disabled ? localStyles.faceDisabled : null
            ]}
            >
              <View style={localStyles.faceHighlight} />
              <View style={[localStyles.bevelLine, localStyles.bevelTop, { backgroundColor: palette.topLine }]} />
              <View style={[localStyles.bevelLine, localStyles.bevelBottom, { backgroundColor: palette.bottomLine }]} />
              <PixelText variant="button" color={palette.textColor} style={localStyles.label}>
              {label}
            </PixelText>
          </View>
        </View>
      )}
    </Pressable>
  );
}

const localStyles = StyleSheet.create({
  pressable: {
    minWidth: 96
  },
  pressableFullWidth: {
    width: "100%"
  },
  shadowLayer: {
    backgroundColor: designTokens.color.shadow,
    paddingRight: designTokens.size.pixelShadow,
    paddingBottom: designTokens.size.pixelShadow
  },
  shadowLayerActive: {
    backgroundColor: designTokens.color.goldDark
  },
  shadowLayerPressed: {
    paddingRight: 2,
    paddingBottom: 2
  },
  shadowLayerDisabled: {
    backgroundColor: designTokens.color.shadowSoft
  },
  face: {
    minHeight: designTokens.size.buttonHeight,
    borderWidth: designTokens.border.normal,
    borderColor: designTokens.color.border,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: designTokens.spacing.sm,
    paddingVertical: 8
  },
  faceActive: {
    borderColor: designTokens.color.gold
  },
  facePressed: {
    transform: [{ translateY: 1 }]
  },
  faceDisabled: {
    opacity: 0.58
  },
  faceHighlight: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: "50%",
    backgroundColor: "rgba(255, 255, 255, 0.08)"
  },
  bevelLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 3
  },
  bevelTop: {
    top: 0
  },
  bevelBottom: {
    bottom: 0
  },
  label: {
    textAlign: "center"
  }
});
