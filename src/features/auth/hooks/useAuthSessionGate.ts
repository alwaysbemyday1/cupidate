import { useCallback, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";

import { isSupabaseConfigured, supabase } from "../../../lib/supabase";

type AuthMode = "local" | "supabase";

type UseAuthSessionGateResult = {
  mode: AuthMode;
  isLoading: boolean;
  session: Session | null;
  userId: string | null;
  error: string | null;
  canAccessProtectedData: boolean;
  refresh: () => Promise<void>;
};

async function fetchSession(): Promise<Session | null> {
  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase.auth.getSession();
  if (error) {
    throw error;
  }

  return data.session;
}

export function useAuthSessionGate(): UseAuthSessionGateResult {
  const isTestMode = process.env.NODE_ENV === "test";
  const mode: AuthMode = !isSupabaseConfigured || isTestMode ? "local" : "supabase";

  const [isLoading, setIsLoading] = useState(mode === "supabase");
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (mode !== "supabase") {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextSession = await fetchSession();
      setSession(nextSession);
    } catch (refreshError) {
      const message = refreshError instanceof Error ? refreshError.message : "Failed to refresh auth session.";
      setError(message);
      setSession(null);
    } finally {
      setIsLoading(false);
    }
  }, [mode]);

  useEffect(() => {
    if (mode !== "supabase" || !supabase) {
      setIsLoading(false);
      setSession(null);
      setError(null);
      return;
    }

    let mounted = true;

    const bootstrap = async () => {
      try {
        const nextSession = await fetchSession();
        if (!mounted) {
          return;
        }

        setSession(nextSession);
        setError(null);
      } catch (bootstrapError) {
        if (!mounted) {
          return;
        }

        const message = bootstrapError instanceof Error ? bootstrapError.message : "Failed to initialize auth.";
        setError(message);
        setSession(null);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    bootstrap();

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) {
        return;
      }

      setSession(nextSession);
      setError(null);
      setIsLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, [mode]);

  const canAccessProtectedData = useMemo(() => {
    if (mode === "local") {
      return true;
    }

    return Boolean(session?.user);
  }, [mode, session]);

  return {
    mode,
    isLoading,
    session,
    userId: session?.user?.id ?? null,
    error,
    canAccessProtectedData,
    refresh
  };
}
