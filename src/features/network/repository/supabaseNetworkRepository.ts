import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  CreateConnectionInput,
  CreateCupidateInput,
  CurrentCupid,
  NetworkConnection,
  NetworkCupidate,
  NetworkRepository,
  UpdateConnectionStatusInput
} from "./types";

type JsonValue = string | number | boolean | null | { [key: string]: JsonValue | undefined } | JsonValue[];

type CupidateRow = {
  id: string;
  owner_cupid_id: string;
  display_name: string;
  birth_year: number | null;
  gender: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
};

type CupidatePreferenceRow = {
  cupidate_id: string;
  preferences: JsonValue;
};

type CupidRow = {
  id: string;
  nickname: string;
};

type ConnectionRow = {
  id: string;
  requester_cupid_id: string;
  addressee_cupid_id: string;
  status: NetworkConnection["status"];
  responded_at: string | null;
  created_at: string;
  updated_at: string;
};

function asPreferenceData(value: JsonValue | null | undefined): NetworkCupidate["preferences"] {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as NetworkCupidate["preferences"];
}

async function getRequiredUserId(client: SupabaseClient) {
  const { data, error } = await client.auth.getUser();
  if (error) {
    throw error;
  }

  const userId = data.user?.id;
  if (!userId) {
    throw new Error("No authenticated user found.");
  }

  return userId;
}

function mapCupidateRow(row: CupidateRow, preferences: NetworkCupidate["preferences"]): NetworkCupidate {
  return {
    id: row.id,
    ownerCupidId: row.owner_cupid_id,
    displayName: row.display_name,
    birthYear: row.birth_year,
    gender: row.gender,
    bio: row.bio,
    preferences,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapConnectionRow(
  row: ConnectionRow,
  currentCupidId: string,
  nicknames: Map<string, string>
): NetworkConnection {
  const outbound = row.requester_cupid_id === currentCupidId;
  const counterpartCupidId = outbound ? row.addressee_cupid_id : row.requester_cupid_id;

  return {
    id: row.id,
    requesterCupidId: row.requester_cupid_id,
    addresseeCupidId: row.addressee_cupid_id,
    status: row.status,
    respondedAt: row.responded_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    direction: outbound ? "outbound" : "inbound",
    counterpartCupidId,
    counterpartNickname: nicknames.get(counterpartCupidId) ?? null
  };
}

export class SupabaseNetworkRepository implements NetworkRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getCurrentCupid(): Promise<CurrentCupid | null> {
    const userId = await getRequiredUserId(this.client);
    const { data, error } = await this.client
      .from("cupids")
      .select("id,nickname")
      .eq("id", userId)
      .maybeSingle<CupidRow>();

    if (error) {
      throw error;
    }

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      nickname: data.nickname
    };
  }

  async upsertCurrentCupidNickname(nickname: string): Promise<CurrentCupid> {
    const userId = await getRequiredUserId(this.client);

    const { data, error } = await this.client
      .from("cupids")
      .upsert(
        {
          id: userId,
          nickname: nickname.trim()
        },
        { onConflict: "id" }
      )
      .select("id,nickname")
      .single<CupidRow>();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      nickname: data.nickname
    };
  }

  async listCupidates(): Promise<NetworkCupidate[]> {
    const { data: cupidateRows, error: cupidatesError } = await this.client
      .from("cupidates")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<CupidateRow[]>();

    if (cupidatesError) {
      throw cupidatesError;
    }

    if (cupidateRows.length === 0) {
      return [];
    }

    const cupidateIds = cupidateRows.map((item) => item.id);
    const { data: preferenceRows, error: preferencesError } = await this.client
      .from("cupidate_preferences")
      .select("cupidate_id,preferences")
      .in("cupidate_id", cupidateIds)
      .returns<CupidatePreferenceRow[]>();

    if (preferencesError) {
      throw preferencesError;
    }

    const preferenceMap = new Map<string, NetworkCupidate["preferences"]>(
      preferenceRows.map((item) => [item.cupidate_id, asPreferenceData(item.preferences)])
    );

    return cupidateRows.map((row) => mapCupidateRow(row, preferenceMap.get(row.id) ?? {}));
  }

  async createCupidate(input: CreateCupidateInput): Promise<NetworkCupidate> {
    const userId = await getRequiredUserId(this.client);
    const { data: cupidateRow, error: cupidateError } = await this.client
      .from("cupidates")
      .insert({
        owner_cupid_id: userId,
        display_name: input.displayName.trim(),
        birth_year: input.birthYear ?? null,
        gender: input.gender ?? null,
        bio: input.bio ?? ""
      })
      .select("*")
      .single<CupidateRow>();

    if (cupidateError) {
      throw cupidateError;
    }

    const preferencesPayload = input.preferences ?? {};
    const { error: preferenceError } = await this.client.from("cupidate_preferences").upsert(
      {
        cupidate_id: cupidateRow.id,
        preferences: preferencesPayload
      },
      { onConflict: "cupidate_id" }
    );

    if (preferenceError) {
      throw preferenceError;
    }

    return mapCupidateRow(cupidateRow, preferencesPayload);
  }

  async listConnections(): Promise<NetworkConnection[]> {
    const userId = await getRequiredUserId(this.client);
    const { data: connectionRows, error: connectionsError } = await this.client
      .from("cupid_connections")
      .select("*")
      .or(`requester_cupid_id.eq.${userId},addressee_cupid_id.eq.${userId}`)
      .order("created_at", { ascending: false })
      .returns<ConnectionRow[]>();

    if (connectionsError) {
      throw connectionsError;
    }

    if (connectionRows.length === 0) {
      return [];
    }

    const counterpartIds = Array.from(
      new Set(
        connectionRows.map((row) =>
          row.requester_cupid_id === userId ? row.addressee_cupid_id : row.requester_cupid_id
        )
      )
    );

    const nicknameMap = await this.fetchNicknames(counterpartIds);
    return connectionRows.map((row) => mapConnectionRow(row, userId, nicknameMap));
  }

  async createConnection(input: CreateConnectionInput): Promise<NetworkConnection> {
    const userId = await getRequiredUserId(this.client);
    const { data: row, error } = await this.client
      .from("cupid_connections")
      .insert({
        requester_cupid_id: userId,
        addressee_cupid_id: input.addresseeCupidId,
        status: "pending"
      })
      .select("*")
      .single<ConnectionRow>();

    if (error) {
      throw error;
    }

    const nicknameMap = await this.fetchNicknames([input.addresseeCupidId]);
    return mapConnectionRow(row, userId, nicknameMap);
  }

  async updateConnectionStatus(input: UpdateConnectionStatusInput): Promise<NetworkConnection> {
    const userId = await getRequiredUserId(this.client);
    const now = new Date().toISOString();

    const { data: row, error } = await this.client
      .from("cupid_connections")
      .update({
        status: input.status,
        responded_at: now
      })
      .eq("id", input.connectionId)
      .or(`requester_cupid_id.eq.${userId},addressee_cupid_id.eq.${userId}`)
      .select("*")
      .single<ConnectionRow>();

    if (error) {
      throw error;
    }

    const counterpartId = row.requester_cupid_id === userId ? row.addressee_cupid_id : row.requester_cupid_id;
    const nicknameMap = await this.fetchNicknames([counterpartId]);
    return mapConnectionRow(row, userId, nicknameMap);
  }

  private async fetchNicknames(cupidIds: string[]): Promise<Map<string, string>> {
    if (cupidIds.length === 0) {
      return new Map();
    }

    const { data, error } = await this.client
      .from("cupids")
      .select("id,nickname")
      .in("id", cupidIds)
      .returns<CupidRow[]>();

    if (error) {
      throw error;
    }

    return new Map(data.map((item) => [item.id, item.nickname]));
  }
}

export function createSupabaseNetworkRepository(client: SupabaseClient): NetworkRepository {
  return new SupabaseNetworkRepository(client);
}
