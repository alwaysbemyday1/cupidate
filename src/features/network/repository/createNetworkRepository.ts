import { isSupabaseConfigured, supabase } from "../../../lib/supabase";

import { createInMemoryNetworkRepository } from "./inMemoryNetworkRepository";
import { createSupabaseNetworkRepository } from "./supabaseNetworkRepository";
import type { NetworkRepository } from "./types";

let cachedRepository: NetworkRepository | null = null;

export function getNetworkRepository(): NetworkRepository {
  if (cachedRepository) {
    return cachedRepository;
  }

  if (isSupabaseConfigured && supabase) {
    cachedRepository = createSupabaseNetworkRepository(supabase);
    return cachedRepository;
  }

  cachedRepository = createInMemoryNetworkRepository();
  return cachedRepository;
}

export function setNetworkRepositoryForTest(repository: NetworkRepository | null) {
  cachedRepository = repository;
}
