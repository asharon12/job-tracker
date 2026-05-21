import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { InterviewRound } from '../types';

export const useRounds = (applicationId: string) =>
  useQuery<InterviewRound[]>({
    queryKey: ['rounds', applicationId],
    queryFn: () => api.get<InterviewRound[]>(`/applications/${applicationId}/rounds`),
    enabled: !!applicationId,
  });

export const useAddRound = (applicationId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<InterviewRound>) =>
      api.post<InterviewRound>(`/applications/${applicationId}/rounds`, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rounds', applicationId] });
      qc.invalidateQueries({ queryKey: ['application', applicationId] });
    },
  });
};

export const useUpdateRound = (applicationId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ roundId, data }: { roundId: string; data: Partial<InterviewRound> }) =>
      api.put<InterviewRound>(`/applications/${applicationId}/rounds/${roundId}`, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rounds', applicationId] }),
  });
};

export const useDeleteRound = (applicationId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (roundId: string) =>
      api.delete(`/applications/${applicationId}/rounds/${roundId}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['rounds', applicationId] }),
  });
};
