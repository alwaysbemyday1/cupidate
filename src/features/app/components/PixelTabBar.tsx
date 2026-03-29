import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

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
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={localStyles.mount}>
      <View style={[localStyles.frame, { paddingBottom: Math.max(insets.bottom, designTokens.spacing.xs) }]}>
        <View style={localStyles.row}>
          {items.map((item, index) => {
            const active = item.key === activeKey;

            return (
              <Pressable
                key={item.key}
                accessibilityRole="button"
                accessibilityLabel={`${item.label} tab`}
                accessibilityState={{ selected: active }}
                onPress={() => onSelect(item.key)}
                testID={`tab-${item.key}`}
                style={[localStyles.cellPressable, index > 0 ? localStyles.cellPressableBorder : null]}
              >
                {({ pressed }) => (
                  <View
                    style={[
                      localStyles.cellFace,
                      active ? localStyles.cellFaceActive : localStyles.cellFaceInactive,
                      pressed ? localStyles.cellFacePressed : null
                    ]}
                  >
                    <View
                      style={[
                        localStyles.activeStrip,
                        active ? { backgroundColor: item.accentColor, opacity: 1 } : null
                      ]}
                    />
                    <View
                      style={[
                        localStyles.iconChip,
                        active ? { backgroundColor: item.accentColor } : localStyles.iconChipInactive
                      ]}
                    >
                      <PixelText variant="caption" color={designTokens.color.inkInverse}>
                        {item.iconLabel}
                      </PixelText>
                    </View>
                    <PixelText
                      variant="caption"
                      style={localStyles.cellLabel}
                      color={active ? designTokens.color.ink : designTokens.color.inkMuted}
                    >
                      {item.label}
                    </PixelText>
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
    bottom: 0
  },
  frame: {
    backgroundColor: designTokens.color.surfaceRaised,
    borderTopWidth: designTokens.border.heavy,
    borderColor: designTokens.color.border,
    paddingTop: designTokens.spacing.xs,
    paddingHorizontal: designTokens.spacing.xs
  },
  row: {
    flexDirection: "row"
  },
  cellPressable: {
    flex: 1,
    minHeight: designTokens.size.tabBarHeight - 12
  },
  cellPressableBorder: {
    borderLeftWidth: designTokens.border.thin,
    borderLeftColor: designTokens.color.inputBorder
  },
  cellFace: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 4,
    paddingTop: 8,
    paddingBottom: 6
  },
  cellFaceActive: {
    backgroundColor: designTokens.color.surface
  },
  cellFacePressed: {
    transform: [{ translateY: 1 }]
  },
  cellFaceInactive: {
    backgroundColor: designTokens.color.surfaceRaised
  },
  activeStrip: {
    position: "absolute",
    top: 0,
    left: 10,
    right: 10,
    height: 4,
    opacity: 0
  },
  iconChip: {
    minWidth: 28,
    minHeight: 24,
    paddingHorizontal: 6,
    paddingVertical: 3,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: designTokens.border.normal,
    borderColor: designTokens.color.border
  },
  iconChipInactive: {
    backgroundColor: designTokens.color.navyDark
  },
  cellLabel: {
    textAlign: "center"
  }
});
