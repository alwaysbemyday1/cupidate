import { useMemo, useState } from "react";

import { buildMatchCandidates } from "../../../domain/matching/buildMatchCandidates";
import {
  CONNECTED_CUPID_ID,
  type AppView,
  type CupidConnection,
  type CupidateRecord,
  type HomeSummary,
  type MatchRequest,
  type MatchRequestStatus,
  MY_CUPID_ID,
  type NetworkSegment,
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

export function pairKey(sourceCupidateId: string, targetCupidateId: string) {
  return `${sourceCupidateId}:${targetCupidateId}`;
}

export function useCupidateAppState() {
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
  const [cupidates, setCupidates] = useState<CupidateRecord[]>([]);
  const [connections, setConnections] = useState<CupidConnection[]>([
    { cupidId: CONNECTED_CUPID_ID, name: "Connected Cupid A", region: "seoul", status: "connected" },
    { cupidId: "cupid-connected-2", name: "Connected Cupid B", region: "busan", status: "pending" }
  ]);
  const [newConnectionName, setNewConnectionName] = useState("");
  const [newConnectionRegion, setNewConnectionRegion] = useState("");
  const [requests, setRequests] = useState<MatchRequest[]>([]);
  const [myNickname, setMyNickname] = useState("cupid_master");
  const [privacyNetworkOnly, setPrivacyNetworkOnly] = useState(true);
  const [notificationEnabled, setNotificationEnabled] = useState(true);

  const canSubmit = useMemo(() => displayName.trim().length > 0 && !!gender, [displayName, gender]);

  const myCupidates = useMemo(
    () => cupidates.filter((item) => item.ownerCupidId === MY_CUPID_ID),
    [cupidates]
  );

  const connectedCupidates = useMemo(
    () => cupidates.filter((item) => item.ownerCupidId !== MY_CUPID_ID),
    [cupidates]
  );

  const recommendations = useMemo(() => {
    const matches = myCupidates.flatMap((source) =>
      buildMatchCandidates({
        source,
        targets: connectedCupidates,
        currentYear: 2026,
        isConnected: (sourceOwnerCupidId, targetOwnerCupidId) =>
          connections.some(
            (connection) =>
              connection.cupidId === targetOwnerCupidId &&
              connection.status === "connected" &&
              sourceOwnerCupidId === MY_CUPID_ID
          )
      })
    );

    return matches.slice(0, 20);
  }, [connectedCupidates, connections, myCupidates]);

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

  const onRegisterCupidate = () => {
    const formErrors = validateForm(displayName, birthYearInput, gender);
    setErrors(formErrors);

    if (Object.keys(formErrors).length > 0) {
      return;
    }

    const parsedBirthYear = birthYearInput ? Number(birthYearInput) : null;
    const ownerCupidId = ownerType === "mine" ? MY_CUPID_ID : CONNECTED_CUPID_ID;

    setCupidates((prev) => [
      {
        cupidateId: `${Date.now()}`,
        ownerCupidId,
        birthYear: parsedBirthYear,
        displayName: displayName.trim(),
        gender,
        bio: bio.trim(),
        preferences: {
          ageRange: [24, 35],
          hobbies: parseHobbies(hobbiesInput),
          smoking: "any",
          drinking: "any",
          location: locationInput.trim() || "seoul"
        }
      },
      ...prev
    ]);

    setDisplayName("");
    setBirthYearInput("");
    setGender("");
    setBio("");
    setHobbiesInput("");
    setLocationInput("seoul");
    setErrors({});
  };

  const onAddConnection = () => {
    if (!newConnectionName.trim() || !newConnectionRegion.trim()) {
      return;
    }

    setConnections((prev) => [
      {
        cupidId: `cupid-${Date.now()}`,
        name: newConnectionName.trim(),
        region: newConnectionRegion.trim().toLowerCase(),
        status: "pending"
      },
      ...prev
    ]);

    setNewConnectionName("");
    setNewConnectionRegion("");
  };

  const onSendRequest = (sourceCupidateId: string, targetCupidateId: string) => {
    const key = pairKey(sourceCupidateId, targetCupidateId);
    if (requestByPair.get(key)) {
      return;
    }

    setRequests((prev) => [
      {
        id: `req-${Date.now()}`,
        sourceCupidateId,
        targetCupidateId,
        status: "requested",
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const onUpdateRequestStatus = (sourceCupidateId: string, targetCupidateId: string, status: MatchRequestStatus) => {
    setRequests((prev) =>
      prev.map((request) =>
        request.sourceCupidateId === sourceCupidateId && request.targetCupidateId === targetCupidateId
          ? { ...request, status }
          : request
      )
    );
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
    newConnectionName,
    setNewConnectionName,
    newConnectionRegion,
    setNewConnectionRegion,
    requests,
    myNickname,
    setMyNickname,
    privacyNetworkOnly,
    setPrivacyNetworkOnly,
    notificationEnabled,
    setNotificationEnabled,
    canSubmit,
    recommendations,
    requestByPair,
    notifications,
    homeSummary,
    onRegisterCupidate,
    onAddConnection,
    onSendRequest,
    onUpdateRequestStatus
  };
}
