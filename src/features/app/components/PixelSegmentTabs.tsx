import { Pressable, StyleSheet, View } from "react-native";

import { PixelText } from "./PixelText";
import { designTokens } from "../theme/tokens";

type SegmentItem<T extends string> = {
  key: T;
  label: string;
  testID?: string;
};

type PixelSegmentTabsProps<T extends string> = {
  items: SegmentItem<T>[];
  activeKey: T;
  onSelect: (key: T) => void;
  compact?: boolean;
};

export function PixelSegmentTabs<T extends string>({
  items,
  activeKey,
  onSelect,
  compact = false
}: PixelSegmentTabsProps<T>) {
  return (
    <View style={localStyles.shadowLayer}>
      <View style={localStyles.rail}>
        <View style={localStyles.row}>
          {items.map((item, index) => {
            const active = item.key === activeKey;

            return (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityState={{ selected: active }}
                onPress={() => onSelect(item.key)}
                style={[localStyles.segment, index > 0 ? localStyles.segmentBorder : null]}
                testID={item.testID}
              >
                {({ pressed }) => (
                  <View
                    style={[
                      localStyles.segmentFace,
                      compact ? localStyles.segmentFaceCompact : null,
                      active ? localStyles.segmentFaceActive : localStyles.segmentFaceInactive,
                      pressed ? localStyles.segmentFacePressed : null
                    ]}
                  >
                    <View
                      style={[
                        localStyles.segmentStrip,
                        active ? localStyles.segmentStripActive : null
                      ]}
                    />
                    <PixelText
                      variant={compact ? "caption" : "label"}
                      color={active ? designTokens.color.ink : designTokens.color.inkMuted}
                      style={localStyles.segmentLabel}
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
  shadowLayer: {
    backgroundColor: designTokens.color.shadow,
    paddingRight: designTokens.size.pixelShadow,
    paddingBottom: designTokens.size.pixelShadow
  },
  rail: {
    borderWidth: designTokens.border.normal,
    borderColor: designTokens.color.border,
    backgroundColor: designTokens.color.surfaceRaised
  },
  row: {
    flexDirection: "row"
  },
  segment: {
    flex: 1
  },
  segmentBorder: {
    borderLeftWidth: designTokens.border.thin,
    borderLeftColor: designTokens.color.inputBorder
  },
  segmentFace: {
    minHeight: 40,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: designTokens.spacing.xs,
    paddingVertical: designTokens.spacing.xs
  },
  segmentFaceCompact: {
    minHeight: 34,
    paddingVertical: designTokens.spacing.xxs
  },
  segmentFaceActive: {
    backgroundColor: designTokens.color.surface
  },
  segmentFaceInactive: {
    backgroundColor: designTokens.color.surfaceAlt
  },
  segmentFacePressed: {
    transform: [{ translateY: 1 }]
  },
  segmentStrip: {
    position: "absolute",
    top: 0,
    left: 6,
    right: 6,
    height: 3,
    backgroundColor: "transparent"
  },
  segmentStripActive: {
    backgroundColor: designTokens.color.pink
  },
  segmentLabel: {
    textAlign: "center"
  }
});
