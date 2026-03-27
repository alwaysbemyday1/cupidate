import type {
  CreateConnectionInput,
  CreateCupidateInput,
  CurrentCupid,
  NetworkConnection,
  NetworkCupidate,
  NetworkRepository,
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
    const now = NOW();
    const next: NetworkCupidate = {
      id: randomId("cupidate"),
      ownerCupidId: this.currentCupid.id,
      displayName: input.displayName.trim(),
      birthYear: input.birthYear ?? null,
      gender: input.gender ?? null,
      bio: input.bio ?? "",
      preferences: input.preferences ?? {},
      createdAt: now,
      updatedAt: now
    };

    this.cupidates = [next, ...this.cupidates];
    return next;
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
