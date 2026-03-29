import { Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { PixelText } from "./PixelText";
import { designTokens } from "../theme/tokens";

type PixelTabIconKind = "home" | "network" | "match" | "my";

type PixelTabBarItem<T extends string> = {
  key: T;
  label: string;
  iconLabel: PixelTabIconKind;
  accentColor: string;
};

type PixelTabBarProps<T extends string> = {
  activeKey: T;
  items: PixelTabBarItem<T>[];
  onSelect: (key: T) => void;
};

function PixelGlyph({ kind, color }: { kind: PixelTabIconKind; color: string }) {
  const pixelsByKind: Record<PixelTabIconKind, Array<[number, number]>> = {
    home: [
      [2, 1],
      [3, 0],
      [4, 1],
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
      [5, 2],
      [1, 3],
      [5, 3],
      [1, 4],
      [2, 4],
      [4, 4],
      [5, 4],
      [1, 5],
      [2, 5],
      [4, 5],
      [5, 5]
    ],
    network: [
      [1, 1],
      [2, 1],
      [4, 1],
      [5, 1],
      [2, 2],
      [3, 2],
      [4, 2],
      [1, 3],
      [2, 3],
      [4, 3],
      [5, 3],
      [2, 4],
      [3, 4],
      [4, 4],
      [1, 5],
      [2, 5],
      [4, 5],
      [5, 5]
    ],
    match: [
      [1, 1],
      [2, 1],
      [4, 1],
      [5, 1],
      [0, 2],
      [1, 2],
      [2, 2],
      [3, 2],
      [4, 2],
      [5, 2],
      [6, 2],
      [1, 3],
      [2, 3],
      [3, 3],
      [4, 3],
      [5, 3],
      [2, 4],
      [3, 4],
      [4, 4],
      [3, 5]
    ],
    my: [
      [3, 0],
      [2, 1],
      [3, 1],
      [4, 1],
      [2, 2],
      [3, 2],
      [4, 2],
      [2, 3],
      [3, 3],
      [4, 3],
      [1, 4],
      [2, 4],
      [3, 4],
      [4, 4],
      [5, 4],
      [1, 5],
      [5, 5]
    ]
  };

  return (
    <View style={localStyles.glyphCanvas}>
      {pixelsByKind[kind].map(([x, y], index) => (
        <View
          key={`${kind}-${index}`}
          style={[
            localStyles.glyphPixel,
            {
              left: x * 2,
              top: y * 2,
              backgroundColor: color
            }
          ]}
        />
      ))}
    </View>
  );
}

export function PixelTabBar<T extends string>({ activeKey, items, onSelect }: PixelTabBarProps<T>) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={localStyles.mount}>
      <View style={[localStyles.frame, { paddingBottom: Math.max(insets.bottom, designTokens.spacing.xxs) }]}>
        <View style={localStyles.row}>
          {items.map((item, index) => {
            const active = item.key === activeKey;
            const iconColor = active ? designTokens.color.inkInverse : designTokens.color.surfaceRaised;

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
                      <PixelGlyph kind={item.iconLabel} color={iconColor} />
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
    bottom: 0,
    backgroundColor: designTokens.color.surfaceRaised
  },
  frame: {
    backgroundColor: designTokens.color.surfaceRaised,
    borderTopWidth: designTokens.border.heavy,
    borderColor: designTokens.color.border,
    paddingTop: designTokens.spacing.xxs,
    paddingHorizontal: designTokens.spacing.xxs
  },
  row: {
    flexDirection: "row"
  },
  cellPressable: {
    flex: 1,
    minHeight: designTokens.size.tabBarHeight - 8
  },
  cellPressableBorder: {
    borderLeftWidth: designTokens.border.thin,
    borderLeftColor: designTokens.color.inputBorder
  },
  cellFace: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingHorizontal: 4,
    paddingTop: 6,
    paddingBottom: 4
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
    left: 8,
    right: 8,
    height: 3,
    opacity: 0
  },
  iconChip: {
    width: 24,
    height: 22,
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
  },
  glyphCanvas: {
    width: 14,
    height: 12,
    position: "relative"
  },
  glyphPixel: {
    position: "absolute",
    width: 2,
    height: 2
  }
});
