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
};

export function PixelBox({
  children,
  style,
  contentStyle,
  backgroundColor = designTokens.color.surface,
  borderColor = designTokens.color.border,
  shadowColor = designTokens.color.shadow
}: PixelBoxProps) {
  return (
    <View style={[localStyles.shadowLayer, { backgroundColor: shadowColor }, style]}>
      <View style={[localStyles.contentLayer, { backgroundColor, borderColor }, contentStyle]}>{children}</View>
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
    borderRadius: 0
  }
});
