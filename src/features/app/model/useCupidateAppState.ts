import { useEffect, useMemo, useState } from "react";

import { buildMatchCandidates } from "../../../domain/matching/buildMatchCandidates";
import type { PreferenceConditionKey } from "../../../domain/matching/types";
import {
  useMarkContactSharedMutation,
  useMatchCandidatesQuery,
  useRequestMatchMutation,
  useUpdateMatchStatusMutation
} from "../../matching/hooks/useMatchingData";
import {
  useConnectionsQuery,
  useCreateConnectionMutation,
  useCreateCupidateMutation,
  useCupidatesQuery,
  useCurrentCupidQuery,
  useSearchCupidsQuery,
  useUpdateCupidateMutation,
  useUpsertCurrentCupidNicknameMutation
} from "../../network/hooks/useNetworkData";
import {
  type AppView,
  type CupidConnection,
  type CupidProfileSummary,
  type CupidateRecord,
  type CupidateProfileDraft,
  type CupidateProfileSummary,
  type HomeNotification,
  type HomeSummary,
  type MatchRequest,
  type MatchRequestStatus,
  MY_CUPID_ID,
  type NetworkSegment,
  type RecommendationItem,
  type SelectedProfileSummary,
  type SelectedProfileTarget,
  type ValidationErrors
} from "./types";

function validateForm(displayName: string, birthYearInput: string, gender: string): ValidationErrors {
  const errors: ValidationErrors = {};
  const currentYear = new Date().getFullYear();
  const parsedBirthYear = birthYearInput ? Number(birthYearInput) : null;

  if (!displayName.trim()) {
    errors.displayName = "network.validation.nameRequired";
  }

  if (
    birthYearInput &&
    (parsedBirthYear === null ||
      Number.isNaN(parsedBirthYear) ||
      parsedBirthYear < 1900 ||
      parsedBirthYear > currentYear)
  ) {
    errors.birthYear = "network.validation.birthYear";
  }

  if (!gender) {
    errors.gender = "network.validation.genderRequired";
  }

  return errors;
}

function parseHobbies(input: string): string[] {
  if (!input.trim()) {
    return [];
  }

  return input
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function parseOptionalNumber(input: string): number | undefined {
  const trimmed = input.trim();
  if (!trimmed) {
    return undefined;
  }

  const parsed = Number(trimmed);
  if (Number.isNaN(parsed)) {
    return undefined;
  }

  return parsed;
}

function parseClampedRange(
  minInput: string,
  maxInput: string,
  minBoundary: number,
  maxBoundary: number
): [number, number] | undefined {
  const min = parseOptionalNumber(minInput);
  const max = parseOptionalNumber(maxInput);

  if (min === undefined && max === undefined) {
    return undefined;
  }

  if (min === undefined || max === undefined) {
    return undefined;
  }

  const normalizedMin = Math.min(min, max);
  const normalizedMax = Math.max(min, max);

  if (normalizedMin < minBoundary || normalizedMax > maxBoundary) {
    return undefined;
  }

  return [normalizedMin, normalizedMax];
}

function getErrorMessage(error: unknown): string | null {
  if (!error) {
    return null;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Unknown error";
}

function firstErrorMessage(errors: unknown[]): string | null {
  for (const error of errors) {
    const message = getErrorMessage(error);
    if (message) {
      return message;
    }
  }

  return null;
}

function mapConnectionStatus(status: string): CupidConnection["status"] {
  if (status === "accepted") {
    return "connected";
  }

  if (status === "blocked" || status === "rejected") {
    return "blocked";
  }

  return "pending";
}

function mapMatchRequestStatus(status: string, reason: Record<string, unknown>): MatchRequestStatus {
  if (status === "dismissed") {
    return "rejected";
  }

  if (status === "accepted" && reason.contactSharedAt) {
    return "completed";
  }

  if (status === "accepted") {
    return "accepted";
  }

  return "requested";
}

function mapRelationship(status: CupidConnection["status"] | "self" | undefined): CupidProfileSummary["relationship"] {
  if (status === "self") {
    return "self";
  }

  if (status === "connected") {
    return "connected";
  }

  if (status === "blocked") {
    return "blocked";
  }

  if (status === "pending") {
    return "pending";
  }

  return "discoverable";
}

function pickRepresentativeCupidate(cupidates: CupidateRecord[]) {
  if (cupidates.length === 0) {
    return null;
  }

  return cupidates.find((item) => item.isActive) ?? cupidates[0];
}

export function pairKey(sourceCupidateId: string, targetCupidateId: string) {
  return `${sourceCupidateId}:${targetCupidateId}`;
}

type UseCupidateAppStateOptions = {
  isDataAccessEnabled?: boolean;
};

export function useCupidateAppState(options?: UseCupidateAppStateOptions) {
  const isDataAccessEnabled = options?.isDataAccessEnabled ?? true;
  const [activeView, setActiveView] = useState<AppView>("home");
  const [selectedProfileTarget, setSelectedProfileTarget] = useState<SelectedProfileTarget | null>(null);
  const [networkSegment, setNetworkSegment] = useState<NetworkSegment>("cupids");
  const [displayName, setDisplayName] = useState("");
  const [birthYearInput, setBirthYearInput] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [profileVisibility, setProfileVisibility] = useState<"private" | "basic" | "public">("basic");
  const [hobbiesInput, setHobbiesInput] = useState("");
  const [locationInput, setLocationInput] = useState("seoul");
  const [jobTitleInput, setJobTitleInput] = useState("");
  const [heightInput, setHeightInput] = useState("");
  const [smokingHabit, setSmokingHabit] = useState<"none" | "sometimes" | "often">("none");
  const [drinkingHabit, setDrinkingHabit] = useState<"never" | "social" | "often">("social");
  const [preferredAgeMinInput, setPreferredAgeMinInput] = useState("24");
  const [preferredAgeMaxInput, setPreferredAgeMaxInput] = useState("35");
  const [preferredRegionsInput, setPreferredRegionsInput] = useState("seoul");
  const [preferredJobGroupsInput, setPreferredJobGroupsInput] = useState("");
  const [preferredSmoking, setPreferredSmoking] = useState<"none_only" | "ok" | "any">("any");
  const [preferredDrinking, setPreferredDrinking] = useState<"never" | "social" | "often" | "any">("any");
  const [preferredGender, setPreferredGender] = useState<"any" | "male" | "female" | "other">("any");
  const [preferredHeightMinInput, setPreferredHeightMinInput] = useState("");
  const [preferredHeightMaxInput, setPreferredHeightMaxInput] = useState("");
  const [mustHaveConditionKeys, setMustHaveConditionKeys] = useState<PreferenceConditionKey[]>([]);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [connectionSearchQuery, setConnectionSearchQuery] = useState("");
  const [selectedConnectionCupidId, setSelectedConnectionCupidId] = useState<string | null>(null);
  const [myNickname, setMyNickname] = useState("cupid_master");
  const [privacyNetworkOnly, setPrivacyNetworkOnly] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);
  const [nicknameHydrated, setNicknameHydrated] = useState(false);

  const currentCupidQuery = useCurrentCupidQuery({ enabled: isDataAccessEnabled });
  const cupidatesQuery = useCupidatesQuery({ enabled: isDataAccessEnabled });
  const connectionsQuery = useConnectionsQuery({ enabled: isDataAccessEnabled });
  const cupidSearchQuery = useSearchCupidsQuery(connectionSearchQuery, {
    enabled: isDataAccessEnabled && networkSegment === "cupids"
  });
  const matchCandidatesQuery = useMatchCandidatesQuery({ enabled: isDataAccessEnabled });

  const createCupidateMutation = useCreateCupidateMutation();
  const updateCupidateMutation = useUpdateCupidateMutation();
  const createConnectionMutation = useCreateConnectionMutation();
  const upsertNicknameMutation = useUpsertCurrentCupidNicknameMutation();

  const requestMatchMutation = useRequestMatchMutation();
  const updateMatchStatusMutation = useUpdateMatchStatusMutation();
  const markContactSharedMutation = useMarkContactSharedMutation();

  useEffect(() => {
    if (!nicknameHydrated && currentCupidQuery.data?.nickname) {
      setMyNickname(currentCupidQuery.data.nickname);
      setNicknameHydrated(true);
      return;
    }

    if (!nicknameHydrated && currentCupidQuery.isSuccess) {
      setNicknameHydrated(true);
    }
  }, [currentCupidQuery.data?.nickname, currentCupidQuery.isSuccess, nicknameHydrated]);

  const myCupidId = currentCupidQuery.data?.id ?? MY_CUPID_ID;

  const cupidates = useMemo<CupidateRecord[]>(
    () =>
      (cupidatesQuery.data ?? []).map((item) => ({
        cupidateId: item.id,
        ownerCupidId: item.ownerCupidId,
        birthYear: item.birthYear,
        displayName: item.displayName,
        gender: item.gender ?? "unknown",
        bio: item.bio ?? "",
        isActive: item.isActive,
        profileVisibility: item.profileVisibility,
        region: item.region,
        jobTitle: item.jobTitle,
        heightCm: item.heightCm,
        smokingHabit: item.smokingHabit,
        drinkingHabit: item.drinkingHabit,
        preferredAgeRange: item.preferredAgeRange,
        preferredRegions: item.preferredRegions,
        preferredJobGroups: item.preferredJobGroups,
        preferredSmoking: item.preferredSmoking,
        preferredDrinking: item.preferredDrinking,
        preferredGenders: item.preferredGenders,
        preferredHeightRange: item.preferredHeightRange,
        mustHaveConditionKeys: item.mustHaveConditionKeys,
        preferences: item.preferences
      })),
    [cupidatesQuery.data]
  );

  const cupidatesByOwnerId = useMemo(() => {
    const grouped = new Map<string, CupidateRecord[]>();

    cupidates.forEach((item) => {
      const current = grouped.get(item.ownerCupidId) ?? [];
      current.push(item);
      grouped.set(item.ownerCupidId, current);
    });

    return grouped;
  }, [cupidates]);

  const representativeCupidateByOwnerId = useMemo(() => {
    const grouped = new Map<string, CupidateRecord | null>();

    cupidatesByOwnerId.forEach((items, ownerCupidId) => {
      grouped.set(ownerCupidId, pickRepresentativeCupidate(items));
    });

    return grouped;
  }, [cupidatesByOwnerId]);

  const rawConnections = useMemo(
    () =>
      (connectionsQuery.data ?? []).map((item) => ({
        connectionId: item.id,
        cupidId: item.counterpartCupidId,
        name: item.counterpartNickname ?? item.counterpartCupidId,
        region: "-",
        status: mapConnectionStatus(item.status),
        direction: item.direction
      })),
    [connectionsQuery.data]
  );

  const connections = useMemo<CupidConnection[]>(
    () =>
      rawConnections.map((item) => {
        const representativeCupidate = representativeCupidateByOwnerId.get(item.cupidId) ?? null;
        const activeCupidate = representativeCupidate?.isActive ? representativeCupidate : null;

        return {
          ...item,
          datingProfileStatus: activeCupidate ? "active" : representativeCupidate ? "inactive" : "none",
          activeCupidateId: activeCupidate?.cupidateId ?? null,
          activeCupidateVisibility: activeCupidate?.profileVisibility ?? null,
          activeCupidateName: activeCupidate?.displayName ?? null
        };
      }),
    [rawConnections, representativeCupidateByOwnerId]
  );

  const existingConnectionCupidIds = useMemo(() => new Set(connections.map((item) => item.cupidId)), [connections]);

  const connectionSearchResults = useMemo<
    Array<{
      cupidId: string;
      nickname: string;
      datingProfileStatus: "active" | "inactive" | "none";
      cupidateId: string | null;
      cupidateName: string | null;
      profileVisibility: "private" | "basic" | "public" | null;
    }>
  >(
    () =>
      (cupidSearchQuery.data ?? [])
        .filter((item) => item.id !== myCupidId)
        .filter((item) => !existingConnectionCupidIds.has(item.id))
        .map((item) => {
          const representativeCupidate = representativeCupidateByOwnerId.get(item.id) ?? null;
          const activeCupidate = representativeCupidate?.isActive ? representativeCupidate : null;

          return {
            cupidId: item.id,
            nickname: item.nickname,
            datingProfileStatus: activeCupidate ? "active" : representativeCupidate ? "inactive" : "none",
            cupidateId: activeCupidate?.cupidateId ?? null,
            cupidateName: activeCupidate?.displayName ?? null,
            profileVisibility: activeCupidate?.profileVisibility ?? representativeCupidate?.profileVisibility ?? null
          };
        }),
    [cupidSearchQuery.data, existingConnectionCupidIds, myCupidId, representativeCupidateByOwnerId]
  );

  const myCupidates = useMemo(
    () => cupidates.filter((item) => item.ownerCupidId === myCupidId),
    [cupidates, myCupidId]
  );

  const connectedCupidates = useMemo(
    () => cupidates.filter((item) => item.ownerCupidId !== myCupidId),
    [cupidates, myCupidId]
  );

  const activeMyCupidates = useMemo(
    () => myCupidates.filter((item) => item.isActive),
    [myCupidates]
  );

  const inactiveMyCupidates = useMemo(
    () => myCupidates.filter((item) => !item.isActive),
    [myCupidates]
  );

  const myPrimaryCupidate = useMemo(
    () => representativeCupidateByOwnerId.get(myCupidId) ?? null,
    [myCupidId, representativeCupidateByOwnerId]
  );

  const activeConnectedCupidates = useMemo(
    () => connectedCupidates.filter((item) => item.isActive),
    [connectedCupidates]
  );

  const networkCupidates = useMemo(
    () =>
      connections
        .filter((item) => item.status === "connected")
        .map((item) => representativeCupidateByOwnerId.get(item.cupidId) ?? null)
        .filter((item): item is CupidateRecord => !!item && item.isActive),
    [connections, representativeCupidateByOwnerId]
  );

  const recommendations = useMemo(() => {
    const matches = activeMyCupidates.flatMap((source) =>
      buildMatchCandidates({
        source,
        targets: activeConnectedCupidates,
        currentYear: 2026,
        isConnected: (sourceOwnerCupidId, targetOwnerCupidId) =>
          sourceOwnerCupidId === myCupidId &&
          connections.some(
            (connection) => connection.cupidId === targetOwnerCupidId && connection.status === "connected"
          )
      })
    );

    return matches.slice(0, 20);
  }, [activeConnectedCupidates, activeMyCupidates, connections, myCupidId]);

  const requests = useMemo<MatchRequest[]>(
    () =>
      (matchCandidatesQuery.data ?? []).map((item) => ({
        id: item.id,
        sourceCupidateId: item.sourceCupidateId,
        targetCupidateId: item.targetCupidateId,
        status: mapMatchRequestStatus(item.status, item.reason),
        createdAt: item.createdAt
      })),
    [matchCandidatesQuery.data]
  );

  const requestByPair = useMemo(() => {
    const map = new Map<string, MatchRequest>();
    requests.forEach((request) => {
      map.set(pairKey(request.sourceCupidateId, request.targetCupidateId), request);
    });
    return map;
  }, [requests]);

  const cupidateNameById = useMemo(
    () => new Map(cupidates.map((item) => [item.cupidateId, item.displayName])),
    [cupidates]
  );

  const cupidById = useMemo(() => {
    const map = new Map<
      string,
      {
        nickname: string;
        status: CupidConnection["status"] | "self" | undefined;
      }
    >();

    map.set(myCupidId, {
      nickname: currentCupidQuery.data?.nickname ?? myNickname,
      status: "self"
    });

    connections.forEach((connection) => {
      map.set(connection.cupidId, {
        nickname: connection.name,
        status: connection.status
      });
    });

    connectionSearchResults.forEach((result) => {
      if (!map.has(result.cupidId)) {
        map.set(result.cupidId, {
          nickname: result.nickname,
          status: undefined
        });
      }
    });

    return map;
  }, [connectionSearchResults, connections, currentCupidQuery.data?.nickname, myCupidId, myNickname]);

  const requestsByCupidateId = useMemo(() => {
    const map = new Map<string, MatchRequest[]>();

    requests.forEach((request) => {
      const sourceList = map.get(request.sourceCupidateId) ?? [];
      sourceList.push(request);
      map.set(request.sourceCupidateId, sourceList);

      const targetList = map.get(request.targetCupidateId) ?? [];
      targetList.push(request);
      map.set(request.targetCupidateId, targetList);
    });

    return map;
  }, [requests]);

  const selectedProfile = useMemo<SelectedProfileSummary>(() => {
    if (!selectedProfileTarget) {
      return null;
    }

    if (selectedProfileTarget.kind === "cupid") {
      const cupidId = selectedProfileTarget.cupidId;
      const cupid = cupidById.get(cupidId);
      const ownedCupidates = cupidates.filter((item) => item.ownerCupidId === cupidId);
      const representativeCupidate = representativeCupidateByOwnerId.get(cupidId) ?? null;
      const activeCupidate = representativeCupidate?.isActive ? representativeCupidate : null;
      const ownedCupidateIds = new Set(ownedCupidates.map((item) => item.cupidateId));
      const relatedRequests = requests.filter(
        (request) => ownedCupidateIds.has(request.sourceCupidateId) || ownedCupidateIds.has(request.targetCupidateId)
      );

      return {
        kind: "cupid",
        cupidId,
        nickname: cupid?.nickname ?? cupidId,
        relationship: mapRelationship(cupid?.status),
        datingProfile: {
          status: activeCupidate ? "active" : representativeCupidate ? "inactive" : "none",
          cupidateId: activeCupidate?.cupidateId ?? null,
          displayName: activeCupidate?.displayName ?? representativeCupidate?.displayName ?? null,
          visibility: activeCupidate?.profileVisibility ?? representativeCupidate?.profileVisibility ?? null
        },
        stats: {
          cupidateCount: ownedCupidates.length,
          activeCupidateCount: ownedCupidates.filter((item) => item.isActive).length,
          introductions: relatedRequests.length,
          ongoingMatches: relatedRequests.filter(
            (request) => request.status === "requested" || request.status === "accepted"
          ).length,
          completedMatches: relatedRequests.filter((request) => request.status === "completed").length
        }
      };
    }

    const cupidate = cupidates.find((item) => item.cupidateId === selectedProfileTarget.cupidateId);
    if (!cupidate) {
      return null;
    }

    const relatedRequests = requestsByCupidateId.get(cupidate.cupidateId) ?? [];
    const owner = cupidById.get(cupidate.ownerCupidId);

    return {
      kind: "cupidate",
      cupidateId: cupidate.cupidateId,
      ownerCupidId: cupidate.ownerCupidId,
      ownerNickname: owner?.nickname ?? cupidate.ownerCupidId,
      displayName: cupidate.displayName,
      birthYear: cupidate.birthYear,
      gender: cupidate.gender,
      bio: cupidate.bio,
      isActive: cupidate.isActive,
      profileVisibility: cupidate.profileVisibility,
      region: cupidate.region,
      jobTitle: cupidate.jobTitle,
      heightCm: cupidate.heightCm,
      smokingHabit: cupidate.smokingHabit,
      drinkingHabit: cupidate.drinkingHabit,
      preferredAgeRange: cupidate.preferredAgeRange,
      preferredRegions: cupidate.preferredRegions,
      preferredJobGroups: cupidate.preferredJobGroups,
      preferredSmoking: cupidate.preferredSmoking,
      preferredDrinking: cupidate.preferredDrinking,
      preferredGenders: cupidate.preferredGenders,
      preferredHeightRange: cupidate.preferredHeightRange,
      mustHaveConditionKeys: cupidate.mustHaveConditionKeys,
      preferences: cupidate.preferences,
      canEdit: cupidate.ownerCupidId === myCupidId,
      stats: {
        totalRequests: relatedRequests.length,
        ongoingMatches: relatedRequests.filter(
          (request) => request.status === "requested" || request.status === "accepted"
        ).length,
        completedMatches: relatedRequests.filter((request) => request.status === "completed").length
      }
    };
  }, [cupidById, cupidates, myCupidId, representativeCupidateByOwnerId, requests, requestsByCupidateId, selectedProfileTarget]);

  const notifications = useMemo<HomeNotification[]>(
    () =>
      requests
        .slice()
        .reverse()
        .slice(0, 5)
        .map((request) => ({
          id: request.id,
          sourceLabel: cupidateNameById.get(request.sourceCupidateId) ?? request.sourceCupidateId,
          targetLabel: cupidateNameById.get(request.targetCupidateId) ?? request.targetCupidateId,
          status: request.status
        })),
    [cupidateNameById, requests]
  );

  const homeSummary = useMemo<HomeSummary>(
    () => ({
      myCupidates: myCupidates.length,
      connectedCupids: connections.filter((connection) => connection.status === "connected").length,
      recommendations: recommendations.length,
      pendingRequests: requests.filter((request) => request.status === "requested").length
    }),
    [connections, myCupidates.length, recommendations.length, requests]
  );

  const networkError = useMemo(
    () =>
      firstErrorMessage([
        currentCupidQuery.error,
        cupidatesQuery.error,
        connectionsQuery.error,
        cupidSearchQuery.error,
        createCupidateMutation.error,
        updateCupidateMutation.error,
        createConnectionMutation.error
      ]),
    [
      connectionsQuery.error,
      createConnectionMutation.error,
      createCupidateMutation.error,
      currentCupidQuery.error,
      cupidSearchQuery.error,
      cupidatesQuery.error,
      updateCupidateMutation.error
    ]
  );

  const matchingError = useMemo(
    () =>
      firstErrorMessage([
        matchCandidatesQuery.error,
        requestMatchMutation.error,
        updateMatchStatusMutation.error,
        markContactSharedMutation.error
      ]),
    [
      markContactSharedMutation.error,
      matchCandidatesQuery.error,
      requestMatchMutation.error,
      updateMatchStatusMutation.error
    ]
  );

  const myError = useMemo(
    () => firstErrorMessage([currentCupidQuery.error, upsertNicknameMutation.error]),
    [currentCupidQuery.error, upsertNicknameMutation.error]
  );

  const onRegisterCupidate = async () => {
    if (!isDataAccessEnabled) {
      return;
    }

    const formErrors = validateForm(displayName, birthYearInput, gender);

    const preferredAgeRange = parseClampedRange(preferredAgeMinInput, preferredAgeMaxInput, 19, 100);
    if (!preferredAgeRange) {
      formErrors.preferredAgeRange = "network.validation.preferredAgeRange";
    }

    const parsedHeight = parseOptionalNumber(heightInput);
    if (heightInput.trim() && (parsedHeight === undefined || parsedHeight < 120 || parsedHeight > 230)) {
      formErrors.height = "network.validation.heightRange";
    }

    const preferredHeightRange = parseClampedRange(preferredHeightMinInput, preferredHeightMaxInput, 120, 230);
    if ((preferredHeightMinInput.trim() || preferredHeightMaxInput.trim()) && !preferredHeightRange) {
      formErrors.preferredHeightRange = "network.validation.preferredHeightRange";
    }

    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const parsedBirthYear = birthYearInput ? Number(birthYearInput) : null;
    const region = locationInput.trim().toLowerCase() || "seoul";
    const preferredRegions = parseHobbies(preferredRegionsInput);
    const preferredJobGroups = parseHobbies(preferredJobGroupsInput);

    await createCupidateMutation.mutateAsync({
      displayName: displayName.trim(),
      birthYear: parsedBirthYear,
      gender,
      bio: bio.trim(),
      isActive: false,
      profileVisibility,
      region,
      jobTitle: jobTitleInput.trim() || null,
      heightCm: parsedHeight ?? null,
      smokingHabit,
      drinkingHabit,
      preferredAgeRange,
      preferredRegions: preferredRegions.length ? preferredRegions : [region],
      preferredJobGroups,
      preferredSmoking,
      preferredDrinking,
      preferredGenders: preferredGender === "any" ? [] : [preferredGender],
      preferredHeightRange,
      mustHaveConditionKeys,
      preferences: {
        hobbies: parseHobbies(hobbiesInput)
      } as CupidateRecord["preferences"]
    });

    setDisplayName("");
    setBirthYearInput("");
    setGender("");
    setBio("");
    setProfileVisibility("basic");
    setHobbiesInput("");
    setLocationInput("seoul");
    setJobTitleInput("");
    setHeightInput("");
    setSmokingHabit("none");
    setDrinkingHabit("social");
    setPreferredAgeMinInput("24");
    setPreferredAgeMaxInput("35");
    setPreferredRegionsInput("seoul");
    setPreferredJobGroupsInput("");
    setPreferredSmoking("any");
    setPreferredDrinking("any");
    setPreferredGender("any");
    setPreferredHeightMinInput("");
    setPreferredHeightMaxInput("");
    setMustHaveConditionKeys([]);
    setErrors({});
  };

  const onAddConnection = async () => {
    if (!isDataAccessEnabled) {
      return;
    }

    if (!selectedConnectionCupidId) {
      return;
    }

    await createConnectionMutation.mutateAsync({
      addresseeCupidId: selectedConnectionCupidId
    });

    setConnectionSearchQuery("");
    setSelectedConnectionCupidId(null);
  };

  const onSaveNickname = async () => {
    if (!isDataAccessEnabled) {
      return;
    }

    if (!myNickname.trim()) {
      return;
    }

    const updated = await upsertNicknameMutation.mutateAsync(myNickname.trim());
    setMyNickname(updated.nickname);
  };

  const onSendRequest = async (sourceCupidateId: string, targetCupidateId: string) => {
    if (!isDataAccessEnabled) {
      return;
    }

    const key = pairKey(sourceCupidateId, targetCupidateId);
    if (requestByPair.get(key)) {
      return;
    }

    const recommendation = recommendations.find(
      (item) => item.sourceCupidateId === sourceCupidateId && item.targetCupidateId === targetCupidateId
    );

    if (!recommendation) {
      return;
    }

    await requestMatchMutation.mutateAsync({
      sourceCupidateId,
      targetCupidateId,
      matchScore: recommendation.matchScore,
      reason: {
        breakdown: recommendation.reason.breakdown,
        matchedHobbies: recommendation.reason.matchedHobbies,
        priorityMatches: recommendation.reason.priorityMatches,
        requestedAt: new Date().toISOString()
      }
    });
  };

  const onUpdateRequestStatus = async (
    sourceCupidateId: string,
    targetCupidateId: string,
    status: MatchRequestStatus
  ) => {
    if (!isDataAccessEnabled) {
      return;
    }

    const request = requestByPair.get(pairKey(sourceCupidateId, targetCupidateId));
    if (!request) {
      return;
    }

    if (status === "accepted") {
      await updateMatchStatusMutation.mutateAsync({
        candidateId: request.id,
        status: "accepted"
      });
      return;
    }

    if (status === "rejected") {
      await updateMatchStatusMutation.mutateAsync({
        candidateId: request.id,
        status: "dismissed"
      });
      return;
    }

    if (status === "completed") {
      await markContactSharedMutation.mutateAsync({
        candidateId: request.id
      });
    }
  };

  const onSaveCupidateProfile = async (draft: CupidateProfileDraft) => {
    if (!isDataAccessEnabled) {
      return;
    }

    await updateCupidateMutation.mutateAsync({
      cupidateId: draft.cupidateId,
      displayName: draft.displayName.trim(),
      birthYear: draft.birthYear,
      gender: draft.gender,
      bio: draft.bio.trim(),
      isActive: draft.isActive,
      profileVisibility: draft.profileVisibility,
      region: draft.region,
      jobTitle: draft.jobTitle,
      heightCm: draft.heightCm,
      smokingHabit: draft.smokingHabit,
      drinkingHabit: draft.drinkingHabit,
      preferredAgeRange: draft.preferredAgeRange,
      preferredRegions: draft.preferredRegions,
      preferredJobGroups: draft.preferredJobGroups,
      preferredSmoking: draft.preferredSmoking,
      preferredDrinking: draft.preferredDrinking,
      preferredGenders: draft.preferredGenders,
      preferredHeightRange: draft.preferredHeightRange,
      mustHaveConditionKeys: draft.mustHaveConditionKeys,
      preferences: draft.preferences
    });
  };

  const onOpenCupidProfile = (cupidId: string) => {
    setSelectedProfileTarget({
      kind: "cupid",
      cupidId
    });
  };

  const onOpenCupidateProfile = (cupidateId: string) => {
    setSelectedProfileTarget({
      kind: "cupidate",
      cupidateId
    });
  };

  const onCloseProfile = () => {
    setSelectedProfileTarget(null);
  };

  const onRetryHome = async () => {
    if (!isDataAccessEnabled) {
      return;
    }

    createCupidateMutation.reset();
    updateCupidateMutation.reset();
    createConnectionMutation.reset();
    requestMatchMutation.reset();
    updateMatchStatusMutation.reset();
    markContactSharedMutation.reset();

    await Promise.all([
      currentCupidQuery.refetch(),
      cupidatesQuery.refetch(),
      connectionsQuery.refetch(),
      matchCandidatesQuery.refetch()
    ]);
  };

  const onRetryNetwork = async () => {
    if (!isDataAccessEnabled) {
      return;
    }

    createCupidateMutation.reset();
    updateCupidateMutation.reset();
    createConnectionMutation.reset();

    const tasks: Promise<unknown>[] = [
      currentCupidQuery.refetch(),
      cupidatesQuery.refetch(),
      connectionsQuery.refetch()
    ];

    if (connectionSearchQuery.trim().length > 0 && networkSegment === "cupids") {
      tasks.push(cupidSearchQuery.refetch());
    }

    await Promise.all(tasks);
  };

  const onRetryMatching = async () => {
    if (!isDataAccessEnabled) {
      return;
    }

    requestMatchMutation.reset();
    updateMatchStatusMutation.reset();
    markContactSharedMutation.reset();

    await Promise.all([matchCandidatesQuery.refetch(), cupidatesQuery.refetch(), connectionsQuery.refetch()]);
  };

  const onRetryMy = async () => {
    if (!isDataAccessEnabled) {
      return;
    }

    upsertNicknameMutation.reset();
    await currentCupidQuery.refetch();
  };

  return {
    activeView,
    setActiveView,
    selectedProfile,
    networkSegment,
    setNetworkSegment,
    displayName,
    setDisplayName,
    birthYearInput,
    setBirthYearInput,
    gender,
    setGender,
    bio,
    setBio,
    profileVisibility,
    setProfileVisibility,
      hobbiesInput,
      setHobbiesInput,
      locationInput,
      setLocationInput,
      jobTitleInput,
      setJobTitleInput,
      heightInput,
      setHeightInput,
      smokingHabit,
      setSmokingHabit,
      drinkingHabit,
      setDrinkingHabit,
      preferredAgeMinInput,
      setPreferredAgeMinInput,
      preferredAgeMaxInput,
      setPreferredAgeMaxInput,
      preferredRegionsInput,
      setPreferredRegionsInput,
      preferredJobGroupsInput,
      setPreferredJobGroupsInput,
      preferredSmoking,
      setPreferredSmoking,
      preferredDrinking,
      setPreferredDrinking,
      preferredGender,
      setPreferredGender,
      preferredHeightMinInput,
      setPreferredHeightMinInput,
      preferredHeightMaxInput,
      setPreferredHeightMaxInput,
      mustHaveConditionKeys,
      setMustHaveConditionKeys,
    errors,
    cupidates,
    connections,
    connectionSearchQuery,
    setConnectionSearchQuery,
    selectedConnectionCupidId,
    setSelectedConnectionCupidId,
    connectionSearchResults,
    requests,
    myNickname,
    setMyNickname,
    privacyNetworkOnly,
    setPrivacyNetworkOnly,
    notificationEnabled,
    setNotificationEnabled,
    myCupidId,
    recommendations,
    requestByPair,
    myCupidates,
    myPrimaryCupidate,
    networkCupidates,
    activeMyCupidates,
    inactiveMyCupidates,
    notifications,
    homeSummary,
    isHomeLoading:
      currentCupidQuery.isLoading ||
      cupidatesQuery.isLoading ||
      connectionsQuery.isLoading ||
      matchCandidatesQuery.isLoading,
    homeError: firstErrorMessage([networkError, matchingError]),
    isNetworkLoading: cupidatesQuery.isLoading || connectionsQuery.isLoading,
    isSearchingCupids: cupidSearchQuery.isLoading,
    isMutatingNetwork:
      createCupidateMutation.isPending || updateCupidateMutation.isPending || createConnectionMutation.isPending,
    networkError,
    isMatchingLoading: matchCandidatesQuery.isLoading,
    isMutatingMatching:
      requestMatchMutation.isPending || updateMatchStatusMutation.isPending || markContactSharedMutation.isPending,
    matchingError,
    isSavingNickname: upsertNicknameMutation.isPending,
    isMyLoading: currentCupidQuery.isLoading,
    myError,
    isDataAccessEnabled,
    onRegisterCupidate,
    onSaveCupidateProfile,
    onAddConnection,
    onSaveNickname,
    onSendRequest,
    onUpdateRequestStatus,
    onOpenCupidProfile,
    onOpenCupidateProfile,
    onCloseProfile,
    onRetryHome,
    onRetryNetwork,
    onRetryMatching,
    onRetryMy
  };
}
