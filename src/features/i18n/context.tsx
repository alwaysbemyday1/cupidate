import { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react";

import { messages } from "./messages";
import type { Locale, TranslationKey, TranslationParams } from "./types";

type I18nContextValue = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: TranslationKey, params?: TranslationParams) => string;
};

function interpolate(template: string, params?: TranslationParams) {
  if (!params) {
    return template;
  }

  return Object.entries(params).reduce(
    (result, [key, value]) => result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value)),
    template
  );
}

const fallbackLocale: Locale = "en";

const defaultContext: I18nContextValue = {
  locale: fallbackLocale,
  setLocale: () => {},
  t: (key, params) => interpolate(messages[fallbackLocale][key] ?? key, params)
};

const I18nContext = createContext<I18nContextValue>(defaultContext);

export function I18nProvider({ children, initialLocale = fallbackLocale }: PropsWithChildren<{ initialLocale?: Locale }>) {
  const [locale, setLocale] = useState<Locale>(initialLocale);

  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      setLocale,
      t: (key, params) => {
        const template = messages[locale][key] ?? messages[fallbackLocale][key] ?? key;
        return interpolate(template, params);
      }
    }),
    [locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
