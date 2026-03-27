import { act } from "@testing-library/react-native";
import { notifyManager } from "@tanstack/query-core";

jest.mock("react-native-reanimated", () => require("react-native-reanimated/mock"));

notifyManager.setNotifyFunction((callback) => {
  act(() => {
    callback();
  });
});
