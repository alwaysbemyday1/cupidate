import { createContext, useCallback, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";

import { messages } from "./messages";
import { loadStoredLocale, persistLocale } from "./storage";
import type { Locale, TranslationKey, TranslationParams } from "./types";

type I18nContextValue = {
  isReady: boolean;
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
  isReady: false,
  locale: fallbackLocale,
  setLocale: () => {},
  t: (key, params) => interpolate(messages[fallbackLocale][key] ?? key, params)
};

const I18nContext = createContext<I18nContextValue>(defaultContext);

export function I18nProvider({ children, initialLocale = fallbackLocale }: PropsWithChildren<{ initialLocale?: Locale }>) {
  const isTestMode = process.env.NODE_ENV === "test";
  const [locale, setLocale] = useState<Locale>(initialLocale);
  const [isReady, setIsReady] = useState(isTestMode);

  useEffect(() => {
    let isMounted = true;

    const hydrateLocale = async () => {
      try {
        const storedLocale = await loadStoredLocale();
        if (!isMounted || !storedLocale) {
          return;
        }

        setLocale((currentLocale) => (currentLocale === storedLocale ? currentLocale : storedLocale));
      } finally {
        if (isMounted && !isTestMode) {
          setIsReady(true);
        }
      }
    };

    void hydrateLocale();

    return () => {
      isMounted = false;
    };
  }, [isTestMode]);

  const handleSetLocale = useCallback((nextLocale: Locale) => {
    setLocale(nextLocale);
    void persistLocale(nextLocale);
  }, []);

  const value = useMemo<I18nContextValue>(
    () => ({
      isReady,
      locale,
      setLocale: handleSetLocale,
      t: (key, params) => {
        const template = messages[locale][key] ?? messages[fallbackLocale][key] ?? key;
        return interpolate(template, params);
      }
    }),
    [handleSetLocale, isReady, locale]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
