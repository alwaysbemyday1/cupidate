import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { designTokens } from "../theme/tokens";

type PixelBoxProps = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  borderColor?: string;
  shadowColor?: string;
  highlightColor?: string;
};

export function PixelBox({
  children,
  style,
  contentStyle,
  backgroundColor = designTokens.color.surface,
  borderColor = designTokens.color.border,
  shadowColor = designTokens.color.shadow,
  highlightColor = "rgba(255, 255, 255, 0.35)"
}: PixelBoxProps) {
  return (
    <View style={[localStyles.shadowLayer, { backgroundColor: shadowColor }, style]}>
      <View style={[localStyles.contentLayer, { backgroundColor, borderColor }, contentStyle]}>
        <View pointerEvents="none" style={[localStyles.highlightLine, { backgroundColor: highlightColor }]} />
        {children}
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  shadowLayer: {
    paddingRight: designTokens.size.pixelShadow,
    paddingBottom: designTokens.size.pixelShadow
  },
  contentLayer: {
    borderWidth: designTokens.border.normal,
    borderRadius: 0,
    overflow: "hidden"
  },
  highlightLine: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 2
  }
});
