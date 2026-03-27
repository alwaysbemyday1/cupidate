import { fireEvent, render, screen } from "@testing-library/react-native";

import App from "./App";

describe("App", () => {
  it("renders registry header", () => {
    render(<App />);

    expect(screen.getByText("CUPIDATE REGISTRY")).toBeTruthy();
    expect(screen.getByText("PIXEL MATCH NETWORK")).toBeTruthy();
  });

  it("shows validation message when required fields are missing", () => {
    render(<App />);

    fireEvent.press(screen.getByText("NETWORK"));
    fireEvent.press(screen.getByText("Save Cupidate"));

    expect(screen.getByText("Name is required.")).toBeTruthy();
    expect(screen.getByText("Gender is required.")).toBeTruthy();
  });
});
