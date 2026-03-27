type MatchGateInput = {
  sourceOwnerCupidId: string;
  targetOwnerCupidId: string;
  isConnected: boolean;
};

export function canCalculateMatch({ sourceOwnerCupidId, targetOwnerCupidId, isConnected }: MatchGateInput) {
  if (!sourceOwnerCupidId || !targetOwnerCupidId) {
    return false;
  }

  if (sourceOwnerCupidId === targetOwnerCupidId) {
    return false;
  }

  return isConnected;
}
