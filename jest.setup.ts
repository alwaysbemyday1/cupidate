import { act } from "@testing-library/react-native";
import { notifyManager } from "@tanstack/query-core";

jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));
jest.mock("@react-native-async-storage/async-storage", () =>
  require("@react-native-async-storage/async-storage/jest/async-storage-mock")
);
jest.mock("react-native-safe-area-context", () => {
  const React = require("react");
  const { View } = require("react-native");

  return {
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => React.createElement(View, null, children),
    SafeAreaView: ({ children, style }: { children: React.ReactNode; style?: object }) =>
      React.createElement(View, { style }, children),
    useSafeAreaInsets: () => ({ top: 0, right: 0, bottom: 0, left: 0 })
  };
});

notifyManager.setNotifyFunction((callback) => {
  act(() => {
    callback();
  });
});
