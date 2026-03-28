import { fireEvent, render, screen, waitFor } from "@testing-library/react-native";

import { AuthRequiredView } from "../AuthRequiredView";
import { I18nProvider } from "../../../i18n/context";
import { messages } from "../../../i18n/messages";

type SetupOptions = {
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void | Promise<void>;
  onSignInWithPassword?: (email: string, password: string) => Promise<string>;
  onSignUpWithPassword?: (email: string, password: string) => Promise<string>;
};

function setup(options?: SetupOptions) {
  const onRefresh = options?.onRefresh ?? jest.fn();
  const onSignInWithPassword = options?.onSignInWithPassword ?? jest.fn(async () => "Signed in successfully.");
  const onSignUpWithPassword = options?.onSignUpWithPassword ?? jest.fn(async () => "Account created.");

  render(
    <AuthRequiredView
      isLoading={options?.isLoading ?? false}
      error={options?.error ?? null}
      onRefresh={onRefresh}
      onSignInWithPassword={onSignInWithPassword}
      onSignUpWithPassword={onSignUpWithPassword}
    />
  );

  return {
    onRefresh,
    onSignInWithPassword,
    onSignUpWithPassword,
    emailInput: screen.getByPlaceholderText("you@example.com"),
    passwordInput: screen.getByPlaceholderText("at least 6 chars")
  };
}

describe("AuthRequiredView", () => {
  it("shows validation error when email is invalid", async () => {
    const { onSignInWithPassword, emailInput, passwordInput } = setup();

    fireEvent.changeText(emailInput, "invalid-email");
    fireEvent.changeText(passwordInput, "123456");
    fireEvent.press(screen.getByTestId("auth-signin"));

    await waitFor(() => {
      expect(screen.getByText("Auth: Enter a valid email address.")).toBeTruthy();
    });

    expect(onSignInWithPassword).not.toHaveBeenCalled();
  });

  it("shows validation error when password is too short", async () => {
    const { onSignInWithPassword, emailInput, passwordInput } = setup();

    fireEvent.changeText(emailInput, "user@example.com");
    fireEvent.changeText(passwordInput, "123");
    fireEvent.press(screen.getByTestId("auth-signin"));

    await waitFor(() => {
      expect(screen.getByText("Auth: Password must be at least 6 characters.")).toBeTruthy();
    });

    expect(onSignInWithPassword).not.toHaveBeenCalled();
  });

  it("submits normalized email on successful sign-in", async () => {
    const onSignInWithPassword = jest.fn(async () => "Signed in successfully.");
    const { emailInput, passwordInput } = setup({ onSignInWithPassword });

    fireEvent.changeText(emailInput, "  USER@Example.com ");
    fireEvent.changeText(passwordInput, "123456");
    fireEvent.press(screen.getByTestId("auth-signin"));

    await waitFor(() => {
      expect(onSignInWithPassword).toHaveBeenCalledWith("user@example.com", "123456");
      expect(screen.getByText("Signed in successfully.")).toBeTruthy();
    });
  });

  it("renders signup error message when create-account request fails", async () => {
    const onSignUpWithPassword = jest.fn(async () => {
      throw new Error("Invalid login credentials");
    });
    const { emailInput, passwordInput } = setup({ onSignUpWithPassword });

    fireEvent.changeText(emailInput, "user@example.com");
    fireEvent.changeText(passwordInput, "123456");
    fireEvent.press(screen.getByTestId("auth-signup"));

    await waitFor(() => {
      expect(screen.getByText("Auth: Invalid login credentials")).toBeTruthy();
    });
  });

  it("blocks auth actions while gate is loading", async () => {
    const onSignInWithPassword = jest.fn(async () => "Signed in successfully.");
    const { emailInput, passwordInput } = setup({
      isLoading: true,
      onSignInWithPassword
    });

    fireEvent.changeText(emailInput, "user@example.com");
    fireEvent.changeText(passwordInput, "123456");
    fireEvent.press(screen.getByTestId("auth-signin"));

    expect(screen.getByText("Checking session...")).toBeTruthy();
    expect(onSignInWithPassword).not.toHaveBeenCalled();
  });

  it("renders Korean copy when wrapped with Korean locale", async () => {
    render(
      <I18nProvider initialLocale="ko">
        <AuthRequiredView
          isLoading={false}
          error={null}
          onRefresh={jest.fn()}
          onSignInWithPassword={jest.fn(async () => "Signed in successfully.")}
          onSignUpWithPassword={jest.fn(async () => "Account created.")}
        />
      </I18nProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(messages.ko["auth.title"])).toBeTruthy();
      expect(screen.getByTestId("auth-signin")).toBeTruthy();
      expect(screen.getByText(messages.ko["auth.section.status"])).toBeTruthy();
    });
  });
});
