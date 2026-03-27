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

    fireEvent.press(screen.getByText("지인 등록 완료"));

    expect(screen.getByText("이름을 입력해 주세요.")).toBeTruthy();
    expect(screen.getByText("성별을 선택해 주세요.")).toBeTruthy();
  });
});
