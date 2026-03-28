import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getNetworkRepository } from "../repository/createNetworkRepository";
import type {
  CreateConnectionInput,
  CreateCupidateInput,
  UpdateConnectionStatusInput
} from "../repository/types";

export const networkQueryKeys = {
  root: ["network"] as const,
  currentCupid: () => [...networkQueryKeys.root, "currentCupid"] as const,
  cupidates: () => [...networkQueryKeys.root, "cupidates"] as const,
  connections: () => [...networkQueryKeys.root, "connections"] as const,
  cupidSearch: (query: string) => [...networkQueryKeys.root, "cupidSearch", query] as const
};

type QueryHookOptions = {
  enabled?: boolean;
};

export function useCurrentCupidQuery(options?: QueryHookOptions) {
  return useQuery({
    queryKey: networkQueryKeys.currentCupid(),
    queryFn: () => getNetworkRepository().getCurrentCupid(),
    enabled: options?.enabled ?? true
  });
}

export function useCupidatesQuery(options?: QueryHookOptions) {
  return useQuery({
    queryKey: networkQueryKeys.cupidates(),
    queryFn: () => getNetworkRepository().listCupidates(),
    enabled: options?.enabled ?? true
  });
}

export function useConnectionsQuery(options?: QueryHookOptions) {
  return useQuery({
    queryKey: networkQueryKeys.connections(),
    queryFn: () => getNetworkRepository().listConnections(),
    enabled: options?.enabled ?? true
  });
}

export function useSearchCupidsQuery(query: string, options?: QueryHookOptions) {
  return useQuery({
    queryKey: networkQueryKeys.cupidSearch(query),
    queryFn: () => getNetworkRepository().searchCupids(query),
    enabled: (options?.enabled ?? true) && query.trim().length > 0
  });
}

export function useCreateCupidateMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCupidateInput) => getNetworkRepository().createCupidate(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: networkQueryKeys.cupidates() });
    }
  });
}

export function useCreateConnectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateConnectionInput) => getNetworkRepository().createConnection(input),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: networkQueryKeys.connections() }),
        queryClient.invalidateQueries({ queryKey: networkQueryKeys.cupidates() })
      ]);
    }
  });
}

export function useUpdateConnectionStatusMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateConnectionStatusInput) => getNetworkRepository().updateConnectionStatus(input),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: networkQueryKeys.connections() });
    }
  });
}

export function useUpsertCurrentCupidNicknameMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nickname: string) => getNetworkRepository().upsertCurrentCupidNickname(nickname),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: networkQueryKeys.currentCupid() });
    }
  });
}
