import AsyncStorage from "@react-native-async-storage/async-storage";

import type { Locale } from "./types";

export const LOCALE_STORAGE_KEY = "cupidate.locale";

function isLocale(value: string | null): value is Locale {
  return value === "en" || value === "ko";
}

export async function loadStoredLocale() {
  const value = await AsyncStorage.getItem(LOCALE_STORAGE_KEY);
  return isLocale(value) ? value : null;
}

export async function persistLocale(locale: Locale) {
  await AsyncStorage.setItem(LOCALE_STORAGE_KEY, locale);
}
