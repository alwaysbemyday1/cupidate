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

const NOW = () => new Date().toISOString();

type InMemoryNetworkRepositoryOptions = {
  currentCupid?: CurrentCupid;
  cupids?: CurrentCupid[];
  cupidates?: NetworkCupidate[];
  connections?: Omit<NetworkConnection, "counterpartCupidId" | "counterpartNickname" | "direction">[];
};

function randomId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
}

function hydrateCupidate(input: CreateCupidateInput, ownerCupidId: string): NetworkCupidate {
  const now = NOW();
  const structured = extractStructuredCupidateFields(input);
  const flexiblePreferences = createFlexiblePreferencePayload(input.preferences, structured);

  return {
    id: randomId("cupidate"),
    ownerCupidId,
    displayName: input.displayName.trim(),
    birthYear: input.birthYear ?? null,
    gender: input.gender ?? null,
    bio: input.bio ?? "",
    isActive: input.isActive ?? false,
    profileVisibility: input.profileVisibility ?? "basic",
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
    preferences: hydrateCupidatePreferences(flexiblePreferences, structured),
    createdAt: now,
    updatedAt: now
  };
}

export class InMemoryNetworkRepository implements NetworkRepository {
  private currentCupid: CurrentCupid;
  private cupidsById: Map<string, CurrentCupid>;
  private cupidates: NetworkCupidate[];
  private connections: Omit<NetworkConnection, "counterpartCupidId" | "counterpartNickname" | "direction">[];

  constructor(options?: InMemoryNetworkRepositoryOptions) {
    this.currentCupid = options?.currentCupid ?? { id: "local-cupid-me", nickname: "local_me" };

    this.cupidsById = new Map(
      [
        this.currentCupid,
        { id: "local-cupid-a", nickname: "connected_a" },
        { id: "local-cupid-b", nickname: "connected_b" },
        ...(options?.cupids ?? [])
      ].map((item) => [item.id, item])
    );

    this.cupidates = options?.cupidates ?? [];
    this.connections = options?.connections ?? [];
  }

  async getCurrentCupid(): Promise<CurrentCupid | null> {
    return this.currentCupid;
  }

  async searchCupids(query: string): Promise<DiscoverableCupid[]> {
    const normalized = query.trim().toLowerCase();

    if (!normalized) {
      return [];
    }

    const connectedCupidIds = new Set(
      this.connections
        .filter(
          (item) => item.requesterCupidId === this.currentCupid.id || item.addresseeCupidId === this.currentCupid.id
        )
        .map((item) => (item.requesterCupidId === this.currentCupid.id ? item.addresseeCupidId : item.requesterCupidId))
    );

    return Array.from(this.cupidsById.values())
      .filter((item) => item.id !== this.currentCupid.id)
      .filter((item) => !connectedCupidIds.has(item.id))
      .filter(
        (item) => item.nickname.toLowerCase().includes(normalized) || item.id.toLowerCase().includes(normalized)
      )
      .sort((a, b) => a.nickname.localeCompare(b.nickname))
      .slice(0, 20)
      .map((item) => ({
        id: item.id,
        nickname: item.nickname
      }));
  }

  async upsertCurrentCupidNickname(nickname: string): Promise<CurrentCupid> {
    const next: CurrentCupid = {
      ...this.currentCupid,
      nickname: nickname.trim()
    };

    this.currentCupid = next;
    this.cupidsById.set(next.id, next);
    return next;
  }

  async listCupidates(): Promise<NetworkCupidate[]> {
    return [...this.cupidates].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  async createCupidate(input: CreateCupidateInput): Promise<NetworkCupidate> {
    const next = hydrateCupidate(input, this.currentCupid.id);
    this.cupidates = [next, ...this.cupidates];
    return next;
  }

  async updateCupidate(input: UpdateCupidateInput): Promise<NetworkCupidate> {
    const found = this.cupidates.find((item) => item.id === input.cupidateId);
    if (!found) {
      throw new Error(`Cupidate not found: ${input.cupidateId}`);
    }

    if (found.ownerCupidId !== this.currentCupid.id) {
      throw new Error("Forbidden cupidate update");
    }

    const mergedPreferences = {
      ...found.preferences,
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

    const structured = extractStructuredCupidateFields({
      region: input.region,
      jobTitle: input.jobTitle,
      heightCm: input.heightCm,
      smokingHabit: input.smokingHabit,
      drinkingHabit: input.drinkingHabit,
      preferredAgeRange: input.preferredAgeRange,
      preferredRegions: input.preferredRegions,
      preferredJobGroups: input.preferredJobGroups,
      preferredSmoking: input.preferredSmoking,
      preferredDrinking: input.preferredDrinking,
      preferredGenders: input.preferredGenders,
      preferredHeightRange: input.preferredHeightRange,
      preferences: mergedPreferences
    });

    const flexiblePreferences = createFlexiblePreferencePayload(mergedPreferences, structured);

    const updated: NetworkCupidate = {
      ...found,
      displayName: input.displayName !== undefined ? input.displayName.trim() : found.displayName,
      birthYear: input.birthYear !== undefined ? input.birthYear ?? null : found.birthYear,
      gender: input.gender !== undefined ? input.gender ?? null : found.gender,
      bio: input.bio !== undefined ? input.bio ?? "" : found.bio,
      isActive: input.isActive !== undefined ? input.isActive : found.isActive,
      profileVisibility: input.profileVisibility !== undefined ? input.profileVisibility : found.profileVisibility,
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
      preferences: hydrateCupidatePreferences(flexiblePreferences, structured),
      updatedAt: NOW()
    };

    this.cupidates = this.cupidates.map((item) => (item.id === input.cupidateId ? updated : item));
    return updated;
  }

  async listConnections(): Promise<NetworkConnection[]> {
    return this.connections
      .filter(
        (item) => item.requesterCupidId === this.currentCupid.id || item.addresseeCupidId === this.currentCupid.id
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .map((row) => this.withPerspective(row));
  }

  async createConnection(input: CreateConnectionInput): Promise<NetworkConnection> {
    const now = NOW();
    const next = {
      id: randomId("connection"),
      requesterCupidId: this.currentCupid.id,
      addresseeCupidId: input.addresseeCupidId,
      status: "pending" as const,
      respondedAt: null,
      createdAt: now,
      updatedAt: now
    };

    this.connections = [next, ...this.connections];

    if (!this.cupidsById.has(input.addresseeCupidId)) {
      this.cupidsById.set(input.addresseeCupidId, {
        id: input.addresseeCupidId,
        nickname: `cupid_${input.addresseeCupidId.slice(-4)}`
      });
    }

    return this.withPerspective(next);
  }

  async updateConnectionStatus(input: UpdateConnectionStatusInput): Promise<NetworkConnection> {
    const found = this.connections.find((item) => item.id === input.connectionId);
    if (!found) {
      throw new Error(`Connection not found: ${input.connectionId}`);
    }

    if (found.requesterCupidId !== this.currentCupid.id && found.addresseeCupidId !== this.currentCupid.id) {
      throw new Error("Forbidden connection update");
    }

    const now = NOW();
    const updated = {
      ...found,
      status: input.status,
      respondedAt: now,
      updatedAt: now
    };

    this.connections = this.connections.map((item) => (item.id === input.connectionId ? updated : item));
    return this.withPerspective(updated);
  }

  private withPerspective(
    row: Omit<NetworkConnection, "counterpartCupidId" | "counterpartNickname" | "direction">
  ): NetworkConnection {
    const isOutbound = row.requesterCupidId === this.currentCupid.id;
    const counterpartCupidId = isOutbound ? row.addresseeCupidId : row.requesterCupidId;

    return {
      ...row,
      direction: isOutbound ? "outbound" : "inbound",
      counterpartCupidId,
      counterpartNickname: this.cupidsById.get(counterpartCupidId)?.nickname ?? null
    };
  }
}

export function createInMemoryNetworkRepository(options?: InMemoryNetworkRepositoryOptions): NetworkRepository {
  return new InMemoryNetworkRepository(options);
}
