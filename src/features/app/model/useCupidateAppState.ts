import { useEffect, useMemo, useState } from "react";

import { buildMatchCandidates } from "../../../domain/matching/buildMatchCandidates";
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
  useUpsertCurrentCupidNicknameMutation
} from "../../network/hooks/useNetworkData";
import {
  type AppView,
  type CupidConnection,
  type CupidateRecord,
  type HomeSummary,
  type MatchRequest,
  type MatchRequestStatus,
  MY_CUPID_ID,
  type NetworkSegment,
  type RecommendationItem,
  type ValidationErrors
} from "./types";

function validateForm(displayName: string, birthYearInput: string, gender: string): ValidationErrors {
  const errors: ValidationErrors = {};
  const currentYear = new Date().getFullYear();
  const parsedBirthYear = birthYearInput ? Number(birthYearInput) : null;

  if (!displayName.trim()) {
    errors.displayName = "Name is required.";
  }

  if (
    birthYearInput &&
    (parsedBirthYear === null ||
      Number.isNaN(parsedBirthYear) ||
      parsedBirthYear < 1900 ||
      parsedBirthYear > currentYear)
  ) {
    errors.birthYear = `Birth year must be in range 1900-${currentYear}.`;
  }

  if (!gender) {
    errors.gender = "Gender is required.";
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

export function pairKey(sourceCupidateId: string, targetCupidateId: string) {
  return `${sourceCupidateId}:${targetCupidateId}`;
}

type UseCupidateAppStateOptions = {
  isDataAccessEnabled?: boolean;
};

export function useCupidateAppState(options?: UseCupidateAppStateOptions) {
  const isDataAccessEnabled = options?.isDataAccessEnabled ?? true;
  const [activeView, setActiveView] = useState<AppView>("home");
  const [networkSegment, setNetworkSegment] = useState<NetworkSegment>("cupidates");
  const [displayName, setDisplayName] = useState("");
  const [birthYearInput, setBirthYearInput] = useState("");
  const [gender, setGender] = useState("");
  const [bio, setBio] = useState("");
  const [hobbiesInput, setHobbiesInput] = useState("");
  const [locationInput, setLocationInput] = useState("seoul");
  const [ownerType, setOwnerType] = useState<"mine" | "connected">("mine");
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

  const canSubmit = useMemo(() => displayName.trim().length > 0 && !!gender, [displayName, gender]);

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
        preferences: item.preferences
      })),
    [cupidatesQuery.data]
  );

  const connections = useMemo<CupidConnection[]>(
    () =>
      (connectionsQuery.data ?? []).map((item) => ({
        cupidId: item.counterpartCupidId,
        name: item.counterpartNickname ?? item.counterpartCupidId,
        region: "-",
        status: mapConnectionStatus(item.status)
      })),
    [connectionsQuery.data]
  );

  const existingConnectionCupidIds = useMemo(
    () => new Set(connections.map((item) => item.cupidId)),
    [connections]
  );

  const connectionSearchResults = useMemo(
    () =>
      (cupidSearchQuery.data ?? [])
        .filter((item) => item.id !== myCupidId)
        .filter((item) => !existingConnectionCupidIds.has(item.id))
        .map((item) => ({
          cupidId: item.id,
          nickname: item.nickname
        })),
    [cupidSearchQuery.data, existingConnectionCupidIds, myCupidId]
  );

  const myCupidates = useMemo(
    () => cupidates.filter((item) => item.ownerCupidId === myCupidId),
    [cupidates, myCupidId]
  );

  const connectedCupidates = useMemo(
    () => cupidates.filter((item) => item.ownerCupidId !== myCupidId),
    [cupidates, myCupidId]
  );

  const recommendations = useMemo(() => {
    const matches = myCupidates.flatMap((source) =>
      buildMatchCandidates({
        source,
        targets: connectedCupidates,
        currentYear: 2026,
        isConnected: (sourceOwnerCupidId, targetOwnerCupidId) =>
          sourceOwnerCupidId === myCupidId &&
          connections.some(
            (connection) => connection.cupidId === targetOwnerCupidId && connection.status === "connected"
          )
      })
    );

    return matches.slice(0, 20);
  }, [connectedCupidates, connections, myCupidId, myCupidates]);

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

  const notifications = useMemo(
    () =>
      requests
        .slice()
        .reverse()
        .slice(0, 5)
        .map(
          (request) =>
            `Request ${request.sourceCupidateId} -> ${request.targetCupidateId}: ${request.status.toUpperCase()}`
        ),
    [requests]
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
        createConnectionMutation.error
      ]),
    [
      connectionsQuery.error,
      createConnectionMutation.error,
      createCupidateMutation.error,
      currentCupidQuery.error,
      cupidSearchQuery.error,
      cupidatesQuery.error
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
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const parsedBirthYear = birthYearInput ? Number(birthYearInput) : null;

    await createCupidateMutation.mutateAsync({
      displayName: displayName.trim(),
      birthYear: parsedBirthYear,
      gender,
      bio: bio.trim(),
      preferences: {
        ageRange: [24, 35],
        hobbies: parseHobbies(hobbiesInput),
        smoking: "any",
        drinking: "any",
        location: locationInput.trim() || "seoul"
      } as CupidateRecord["preferences"]
    });

    setDisplayName("");
    setBirthYearInput("");
    setGender("");
    setBio("");
    setHobbiesInput("");
    setLocationInput("seoul");
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

  const onRetryHome = async () => {
    if (!isDataAccessEnabled) {
      return;
    }

    createCupidateMutation.reset();
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
    hobbiesInput,
    setHobbiesInput,
    locationInput,
    setLocationInput,
    ownerType,
    setOwnerType,
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
    canSubmit,
    myCupidId,
    recommendations,
    requestByPair,
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
    isMutatingNetwork: createCupidateMutation.isPending || createConnectionMutation.isPending,
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
    onAddConnection,
    onSaveNickname,
    onSendRequest,
    onUpdateRequestStatus,
    onRetryHome,
    onRetryNetwork,
    onRetryMatching,
    onRetryMy
  };
}
