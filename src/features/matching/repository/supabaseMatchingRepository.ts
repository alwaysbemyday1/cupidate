import type { SupabaseClient } from "@supabase/supabase-js";

import type {
  MarkContactSharedInput,
  MatchingCandidate,
  MatchingRepository,
  UpdateMatchingStatusInput,
  UpsertMatchingCandidateInput
} from "./types";

type JsonValue = string | number | boolean | null | { [key: string]: JsonValue | undefined } | JsonValue[];

type MatchCandidateRow = {
  id: string;
  source_cupidate_id: string;
  target_cupidate_id: string;
  match_score: number | string;
  match_status: "proposed" | "accepted" | "dismissed";
  reason: JsonValue;
  created_at: string;
  updated_at: string;
};

function asObject(value: JsonValue | null | undefined): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return value as Record<string, unknown>;
}

function toNumber(value: number | string) {
  return typeof value === "number" ? value : Number(value);
}

function mapRow(row: MatchCandidateRow): MatchingCandidate {
  return {
    id: row.id,
    sourceCupidateId: row.source_cupidate_id,
    targetCupidateId: row.target_cupidate_id,
    matchScore: toNumber(row.match_score),
    status: row.match_status,
    reason: asObject(row.reason),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export class SupabaseMatchingRepository implements MatchingRepository {
  constructor(private readonly client: SupabaseClient) {}

  async listCandidates(): Promise<MatchingCandidate[]> {
    const { data, error } = await this.client
      .from("match_candidates")
      .select("*")
      .order("created_at", { ascending: false })
      .returns<MatchCandidateRow[]>();

    if (error) {
      throw error;
    }

    return data.map(mapRow);
  }

  async upsertCandidate(input: UpsertMatchingCandidateInput): Promise<MatchingCandidate> {
    const { data, error } = await this.client
      .from("match_candidates")
      .upsert(
        {
          source_cupidate_id: input.sourceCupidateId,
          target_cupidate_id: input.targetCupidateId,
          match_score: input.matchScore,
          match_status: "proposed",
          reason: input.reason
        },
        { onConflict: "source_cupidate_id,target_cupidate_id" }
      )
      .select("*")
      .single<MatchCandidateRow>();

    if (error) {
      throw error;
    }

    return mapRow(data);
  }

  async updateCandidateStatus(input: UpdateMatchingStatusInput): Promise<MatchingCandidate> {
    const { data, error } = await this.client
      .from("match_candidates")
      .update({
        match_status: input.status
      })
      .eq("id", input.candidateId)
      .select("*")
      .single<MatchCandidateRow>();

    if (error) {
      throw error;
    }

    return mapRow(data);
  }

  async markContactShared(input: MarkContactSharedInput): Promise<MatchingCandidate> {
    const { data: current, error: currentError } = await this.client
      .from("match_candidates")
      .select("*")
      .eq("id", input.candidateId)
      .single<MatchCandidateRow>();

    if (currentError) {
      throw currentError;
    }

    const updatedReason = {
      ...asObject(current.reason),
      contactSharedAt: input.sharedAt ?? new Date().toISOString()
    };

    const { data, error } = await this.client
      .from("match_candidates")
      .update({
        match_status: "accepted",
        reason: updatedReason
      })
      .eq("id", input.candidateId)
      .select("*")
      .single<MatchCandidateRow>();

    if (error) {
      throw error;
    }

    return mapRow(data);
  }
}

export function createSupabaseMatchingRepository(client: SupabaseClient): MatchingRepository {
  return new SupabaseMatchingRepository(client);
}
