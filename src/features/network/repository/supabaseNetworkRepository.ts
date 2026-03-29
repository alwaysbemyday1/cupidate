import type { SupabaseClient } from "@supabase/supabase-js";

import {
  createFlexiblePreferencePayload,
  extractStructuredCupidateFields,
  hydrateCupidatePreferences
} from "./cupidateFields";
import type {
  CreateConnectionInput,
  CreateCupidateInput,
  CurrentCupid,
  DiscoverableCupid,
  NetworkConnection,
  NetworkCupidate,
  NetworkRepository,
  UpdateCupidateInput,
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
  is_active: boolean;
  profile_visibility: NetworkCupidate["profileVisibility"];
  region: string | null;
  job_title: string | null;
  height_cm: number | null;
  smoking_habit: NetworkCupidate["smokingHabit"];
  drinking_habit: NetworkCupidate["drinkingHabit"];
  created_at: string;
  updated_at: string;
};

type CupidatePreferenceRow = {
  cupidate_id: string;
  preferences: JsonValue;
  preferred_age_min: number | null;
  preferred_age_max: number | null;
  preferred_height_min_cm: number | null;
  preferred_height_max_cm: number | null;
  preferred_regions: string[] | null;
  preferred_job_groups: string[] | null;
  preferred_smoking: NetworkCupidate["preferredSmoking"];
  preferred_drinking: NetworkCupidate["preferredDrinking"];
  preferred_genders: NetworkCupidate["preferredGenders"] | null;
  must_have_condition_keys: NetworkCupidate["mustHaveConditionKeys"] | null;
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

function preferenceRange(min: number | null, max: number | null): [number, number] | null {
  if (min === null || max === null) {
    return null;
  }

  return [Math.min(min, max), Math.max(min, max)];
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

function mapCupidateRow(
  row: CupidateRow,
  preferenceRow: CupidatePreferenceRow | null | undefined
): NetworkCupidate {
  const structured = {
    region: row.region,
    jobTitle: row.job_title,
    heightCm: row.height_cm,
    smokingHabit: row.smoking_habit,
    drinkingHabit: row.drinking_habit,
    preferredAgeRange: preferenceRow
      ? preferenceRange(preferenceRow.preferred_age_min, preferenceRow.preferred_age_max)
      : null,
    preferredRegions: preferenceRow?.preferred_regions ?? [],
    preferredJobGroups: preferenceRow?.preferred_job_groups ?? [],
    preferredSmoking: preferenceRow?.preferred_smoking ?? null,
    preferredDrinking: preferenceRow?.preferred_drinking ?? null,
    preferredGenders: preferenceRow?.preferred_genders ?? [],
    mustHaveConditionKeys: preferenceRow?.must_have_condition_keys ?? [],
    preferredHeightRange: preferenceRow
      ? preferenceRange(preferenceRow.preferred_height_min_cm, preferenceRow.preferred_height_max_cm)
      : null
  } as const;

  return {
    id: row.id,
    ownerCupidId: row.owner_cupid_id,
    displayName: row.display_name,
    birthYear: row.birth_year,
    gender: row.gender,
    bio: row.bio,
    isActive: row.is_active,
    profileVisibility: row.profile_visibility ?? "basic",
    region: structured.region,
    jobTitle: structured.jobTitle,
    heightCm: structured.heightCm,
    smokingHabit: structured.smokingHabit,
    drinkingHabit: structured.drinkingHabit,
    preferredAgeRange: structured.preferredAgeRange,
    preferredRegions: structured.preferredRegions,
    preferredJobGroups: structured.preferredJobGroups,
    preferredSmoking: structured.preferredSmoking,
    preferredDrinking: structured.preferredDrinking,
    preferredGenders: structured.preferredGenders,
    preferredHeightRange: structured.preferredHeightRange,
    mustHaveConditionKeys: structured.mustHaveConditionKeys,
    preferences: hydrateCupidatePreferences(asPreferenceData(preferenceRow?.preferences), structured),
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

function buildPreferenceRowPayload(cupidateId: string, input: CreateCupidateInput | UpdateCupidateInput) {
  const structured = extractStructuredCupidateFields(input);
  const flexiblePreferences = createFlexiblePreferencePayload(input.preferences, structured);

  return {
    structured,
    flexiblePreferences,
    row: {
      cupidate_id: cupidateId,
      preferences: flexiblePreferences,
      preferred_age_min: structured.preferredAgeRange?.[0] ?? null,
      preferred_age_max: structured.preferredAgeRange?.[1] ?? null,
      preferred_height_min_cm: structured.preferredHeightRange?.[0] ?? null,
      preferred_height_max_cm: structured.preferredHeightRange?.[1] ?? null,
      preferred_regions: structured.preferredRegions,
      preferred_job_groups: structured.preferredJobGroups,
      preferred_smoking: structured.preferredSmoking,
      preferred_drinking: structured.preferredDrinking,
      preferred_genders: structured.preferredGenders,
      must_have_condition_keys: structured.mustHaveConditionKeys
    }
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

  async searchCupids(query: string): Promise<DiscoverableCupid[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return [];
    }

    const userId = await getRequiredUserId(this.client);
    const { data, error } = await this.client
      .from("cupids")
      .select("id,nickname")
      .neq("id", userId)
      .ilike("nickname", `%${trimmed}%`)
      .order("nickname", { ascending: true })
      .limit(20)
      .returns<CupidRow[]>();

    if (error) {
      throw error;
    }

    return data.map((item) => ({
      id: item.id,
      nickname: item.nickname
    }));
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
      .select(
        "cupidate_id,preferences,preferred_age_min,preferred_age_max,preferred_height_min_cm,preferred_height_max_cm,preferred_regions,preferred_job_groups,preferred_smoking,preferred_drinking,preferred_genders,must_have_condition_keys"
      )
      .in("cupidate_id", cupidateIds)
      .returns<CupidatePreferenceRow[]>();

    if (preferencesError) {
      throw preferencesError;
    }

    const preferenceMap = new Map<string, CupidatePreferenceRow>(
      preferenceRows.map((item) => [item.cupidate_id, item])
    );

    return cupidateRows.map((row) => mapCupidateRow(row, preferenceMap.get(row.id)));
  }

  async createCupidate(input: CreateCupidateInput): Promise<NetworkCupidate> {
    const userId = await getRequiredUserId(this.client);
    const preferencePayload = buildPreferenceRowPayload("", input);

    const { data: cupidateRow, error: cupidateError } = await this.client
      .from("cupidates")
      .insert({
        owner_cupid_id: userId,
        display_name: input.displayName.trim(),
        birth_year: input.birthYear ?? null,
        gender: input.gender ?? null,
        bio: input.bio ?? "",
        is_active: input.isActive ?? false,
        profile_visibility: input.profileVisibility ?? "basic",
        region: preferencePayload.structured.region,
        job_title: preferencePayload.structured.jobTitle,
        height_cm: preferencePayload.structured.heightCm,
        smoking_habit: preferencePayload.structured.smokingHabit,
        drinking_habit: preferencePayload.structured.drinkingHabit
      })
      .select("*")
      .single<CupidateRow>();

    if (cupidateError) {
      throw cupidateError;
    }

    const fullPreferencePayload = buildPreferenceRowPayload(cupidateRow.id, input);
    const { error: preferenceError } = await this.client.from("cupidate_preferences").upsert(fullPreferencePayload.row, {
      onConflict: "cupidate_id"
    });

    if (preferenceError) {
      throw preferenceError;
    }

    return mapCupidateRow(cupidateRow, fullPreferencePayload.row);
  }

  async updateCupidate(input: UpdateCupidateInput): Promise<NetworkCupidate> {
    const current = await this.fetchCupidateSnapshot(input.cupidateId);
    if (!current) {
      throw new Error(`Cupidate not found: ${input.cupidateId}`);
    }

    const mergedPreferences = {
      ...current.preferences,
      ...(input.preferences ?? {})
    };

    if (input.region === undefined) {
      if (input.preferences?.region !== undefined) {
        mergedPreferences.region = input.preferences.region;
        mergedPreferences.location = input.preferences.region;
      } else if (input.preferences?.location !== undefined) {
        mergedPreferences.region = input.preferences.location;
        mergedPreferences.location = input.preferences.location;
      }
    }

    const mergedInput: UpdateCupidateInput = {
      ...input,
      preferences: mergedPreferences
    };

    const preferencePayload = buildPreferenceRowPayload(input.cupidateId, mergedInput);
    const updatePayload: Record<string, string | number | boolean | null> = {
      profile_visibility: input.profileVisibility ?? current.profileVisibility,
      region: preferencePayload.structured.region,
      job_title: preferencePayload.structured.jobTitle,
      height_cm: preferencePayload.structured.heightCm,
      smoking_habit: preferencePayload.structured.smokingHabit,
      drinking_habit: preferencePayload.structured.drinkingHabit
    };

    if (input.displayName !== undefined) {
      updatePayload.display_name = input.displayName.trim();
    }

    if (input.birthYear !== undefined) {
      updatePayload.birth_year = input.birthYear ?? null;
    }

    if (input.gender !== undefined) {
      updatePayload.gender = input.gender ?? null;
    }

    if (input.bio !== undefined) {
      updatePayload.bio = input.bio ?? "";
    }

    if (input.isActive !== undefined) {
      updatePayload.is_active = input.isActive;
    }

    if (input.profileVisibility !== undefined) {
      updatePayload.profile_visibility = input.profileVisibility;
    }

    const { data: cupidateRow, error: cupidateError } = await this.client
      .from("cupidates")
      .update(updatePayload)
      .eq("id", input.cupidateId)
      .select("*")
      .single<CupidateRow>();

    if (cupidateError) {
      throw cupidateError;
    }

    const { error: preferenceError } = await this.client.from("cupidate_preferences").upsert(preferencePayload.row, {
      onConflict: "cupidate_id"
    });

    if (preferenceError) {
      throw preferenceError;
    }

    return mapCupidateRow(cupidateRow, preferencePayload.row);
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

  private async fetchCupidateSnapshot(cupidateId: string): Promise<NetworkCupidate | null> {
    const { data: cupidateRow, error: cupidateError } = await this.client
      .from("cupidates")
      .select("*")
      .eq("id", cupidateId)
      .maybeSingle<CupidateRow>();

    if (cupidateError) {
      throw cupidateError;
    }

    if (!cupidateRow) {
      return null;
    }

    const { data: preferenceRow, error: preferenceError } = await this.client
      .from("cupidate_preferences")
      .select(
        "cupidate_id,preferences,preferred_age_min,preferred_age_max,preferred_height_min_cm,preferred_height_max_cm,preferred_regions,preferred_job_groups,preferred_smoking,preferred_drinking,preferred_genders,must_have_condition_keys"
      )
      .eq("cupidate_id", cupidateId)
      .maybeSingle<CupidatePreferenceRow>();

    if (preferenceError) {
      throw preferenceError;
    }

    return mapCupidateRow(cupidateRow, preferenceRow);
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
