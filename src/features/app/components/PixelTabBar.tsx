import { Pressable, StyleSheet, View } from "react-native";

import { PixelText } from "./PixelText";
import { designTokens } from "../theme/tokens";

type PixelTabBarItem<T extends string> = {
  key: T;
  label: string;
  iconLabel: string;
  accentColor: string;
};

type PixelTabBarProps<T extends string> = {
  activeKey: T;
  items: PixelTabBarItem<T>[];
  onSelect: (key: T) => void;
};

export function PixelTabBar<T extends string>({ activeKey, items, onSelect }: PixelTabBarProps<T>) {
  return (
    <View pointerEvents="box-none" style={localStyles.mount}>
      <View style={localStyles.frame}>
        <View style={localStyles.row}>
          {items.map((item) => {
            const active = item.key === activeKey;

            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={`${item.label} tab`}
                accessibilityState={{ selected: active }}
                onPress={() => onSelect(item.key)}
                testID={`tab-${item.key}`}
                style={localStyles.cellPressable}
              >
                {({ pressed }) => (
                  <View
                    style={[
                      localStyles.cellShadow,
                      pressed ? localStyles.cellShadowPressed : null,
                      active ? { backgroundColor: item.accentColor } : null
                    ]}
                  >
                    <View
                      style={[
                        localStyles.cellFace,
                        active ? { backgroundColor: item.accentColor } : localStyles.cellFaceInactive,
                        pressed ? localStyles.cellFacePressed : null
                      ]}
                    >
                      <View style={localStyles.iconChip}>
                        <PixelText variant="caption" color={designTokens.color.inkInverse}>
                          {item.iconLabel}
                        </PixelText>
                      </View>
                      <PixelText
                        variant="caption"
                        style={localStyles.cellLabel}
                        color={active ? designTokens.color.inkInverse : designTokens.color.ink}
                      >
                        {item.label}
                      </PixelText>
                    </View>
                  </View>
                )}
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const localStyles = StyleSheet.create({
  mount: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: designTokens.spacing.md,
    paddingBottom: designTokens.size.tabBarInset
  },
  frame: {
    backgroundColor: designTokens.color.surfaceAlt,
    borderTopWidth: designTokens.border.normal,
    borderLeftWidth: designTokens.border.normal,
    borderRightWidth: designTokens.border.normal,
    borderBottomWidth: designTokens.border.normal,
    borderColor: designTokens.color.border,
    paddingHorizontal: designTokens.spacing.xs,
    paddingVertical: designTokens.spacing.xs
  },
  row: {
    flexDirection: "row",
    gap: designTokens.spacing.xs
  },
  cellPressable: {
    flex: 1
  },
  cellShadow: {
    backgroundColor: designTokens.color.shadow,
    paddingRight: 3,
    paddingBottom: 3
  },
  cellShadowPressed: {
    paddingRight: 1,
    paddingBottom: 1
  },
  cellFace: {
    minHeight: designTokens.size.buttonHeight,
    borderWidth: designTokens.border.normal,
    borderColor: designTokens.color.border,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 4,
    paddingVertical: 6
  },
  cellFaceInactive: {
    backgroundColor: designTokens.color.surface
  },
  cellFacePressed: {
    transform: [{ translateY: 1 }]
  },
  iconChip: {
    minWidth: 18,
    paddingHorizontal: 3,
    paddingVertical: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: designTokens.color.navyDark,
    borderWidth: designTokens.border.thin,
    borderColor: designTokens.color.border
  },
  cellLabel: {
    textAlign: "center"
  }
});
