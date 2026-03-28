import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getMatchingRepository } from "../repository/createMatchingRepository";
import type {
  MarkContactSharedInput,
  UpdateMatchingStatusInput,
  UpsertMatchingCandidateInput
} from "../repository/types";

export const matchingQueryKeys = {
  root: ["matching"] as const,
  candidates: () => [...matchingQueryKeys.root, "candidates"] as const
};

type QueryHookOptions = {
  enabled?: boolean;
};

export function useMatchCandidatesQuery(options?: QueryHookOptions) {
  return useQuery({
    queryKey: matchingQueryKeys.candidates(),
    queryFn: () => getMatchingRepository().listCandidates(),
    enabled: options?.enabled ?? true
  });
}

export function useRequestMatchMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertMatchingCandidateInput) => getMatchingRepository().upsertCandidate(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: matchingQueryKeys.candidates() });
    }
  });
}

export function useUpdateMatchStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateMatchingStatusInput) => getMatchingRepository().updateCandidateStatus(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: matchingQueryKeys.candidates() });
    }
  });
}

export function useMarkContactSharedMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: MarkContactSharedInput) => getMatchingRepository().markContactShared(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: matchingQueryKeys.candidates() });
    }
  });
}
