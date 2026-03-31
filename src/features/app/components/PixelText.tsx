import { StyleSheet, Text, type StyleProp, type TextProps, type TextStyle } from "react-native";

import { designTokens } from "../theme/tokens";

type PixelTextVariant = "screenTitle" | "sectionTitle" | "body" | "label" | "caption" | "button";

type PixelTextProps = TextProps & {
  variant?: PixelTextVariant;
  color?: string;
  style?: StyleProp<TextStyle>;
};

function variantStyle(variant: PixelTextVariant) {
  switch (variant) {
    case "screenTitle":
      return localStyles.screenTitle;
    case "sectionTitle":
      return localStyles.sectionTitle;
    case "label":
      return localStyles.label;
    case "caption":
      return localStyles.caption;
    case "button":
      return localStyles.button;
    case "body":
    default:
      return localStyles.body;
  }
}

export function PixelText({
  variant = "body",
  color,
  style,
  allowFontScaling = false,
  children,
  ...rest
}: PixelTextProps) {
  return (
    <Text
      {...rest}
      allowFontScaling={allowFontScaling}
      style={[localStyles.base, variantStyle(variant), color ? { color } : null, style]}
    >
      {children}
    </Text>
  );
}

const localStyles = StyleSheet.create({
  base: {
    color: designTokens.color.ink,
    fontFamily: designTokens.font.family,
    flexShrink: 1,
    includeFontPadding: false
  },
  screenTitle: {
    fontSize: designTokens.font.title,
    lineHeight: 24
  },
  sectionTitle: {
    fontSize: designTokens.font.section,
    lineHeight: 22
  },
  body: {
    fontSize: designTokens.font.body,
    lineHeight: 19
  },
  label: {
    fontSize: designTokens.font.label,
    lineHeight: 18
  },
  caption: {
    fontSize: designTokens.font.caption,
    lineHeight: 16
  },
  button: {
    color: designTokens.color.inkInverse,
    fontSize: designTokens.font.body,
    lineHeight: 16
  }
});
