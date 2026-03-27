import { isSupabaseConfigured, supabase } from "../../../lib/supabase";

import { createInMemoryMatchingRepository } from "./inMemoryMatchingRepository";
import { createSupabaseMatchingRepository } from "./supabaseMatchingRepository";
import type { MatchingRepository } from "./types";

let cachedRepository: MatchingRepository | null = null;

export function getMatchingRepository(): MatchingRepository {
  if (cachedRepository) {
    return cachedRepository;
  }

  if (isSupabaseConfigured && supabase) {
    cachedRepository = createSupabaseMatchingRepository(supabase);
    return cachedRepository;
  }

  cachedRepository = createInMemoryMatchingRepository();
  return cachedRepository;
}

export function setMatchingRepositoryForTest(repository: MatchingRepository | null) {
  cachedRepository = repository;
}
