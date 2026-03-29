import { calculateMatchScore } from "./calculateMatchScore";
import { canCalculateMatch } from "./networkAccessRule";
import type { CupidateProfile, MatchCandidate } from "./types";

type BuildMatchCandidatesInput = {
  source: CupidateProfile;
  targets: CupidateProfile[];
  isConnected: (sourceOwnerCupidId: string, targetOwnerCupidId: string) => boolean;
  currentYear?: number;
};

export function buildMatchCandidates({
  source,
  targets,
  isConnected,
  currentYear
}: BuildMatchCandidatesInput): MatchCandidate[] {
  return targets
    .filter((target) => target.cupidateId !== source.cupidateId)
    .filter((target) =>
      canCalculateMatch({
        sourceOwnerCupidId: source.ownerCupidId,
        targetOwnerCupidId: target.ownerCupidId,
        isConnected: isConnected(source.ownerCupidId, target.ownerCupidId)
      })
    )
    .map((target) => {
      const score = calculateMatchScore(source, target, currentYear);

      return {
        sourceCupidateId: source.cupidateId,
        targetCupidateId: target.cupidateId,
        matchScore: score.score,
        reason: {
          breakdown: score.breakdown,
          matchedHobbies: score.matchedHobbies,
          priorityMatches: score.priorityMatches
        }
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);
}
