import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Application } from '../types';

interface ApplicationsParams {
  status?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ApplicationsResponse {
  data: Application[];
  total: number;
  page: number;
  limit: number;
}

export const useApplications = (params: ApplicationsParams = {}) =>
  useQuery<ApplicationsResponse>({
    queryKey: ['applications', params],
    queryFn: () => api.get<ApplicationsResponse>('/applications', { params: params as Record<string, unknown> }),
  });

export const useApplication = (id: string) =>
  useQuery<Application>({
    queryKey: ['application', id],
    queryFn: () => api.get<Application>(`/applications/${id}`),
    enabled: !!id,
  });

export const useCreateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Partial<Application>) => api.post<Application>('/applications', data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
};

export const useUpdateApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Application> }) =>
      api.put<Application>(`/applications/${id}`, data),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: ['applications'] });
      qc.invalidateQueries({ queryKey: ['application', id] });
    },
  });
};

export const useDeleteApplication = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/applications/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['applications'] }),
  });
};

export const useSummarizeJD = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.post(`/applications/${id}/summarize-jd`),
    onSuccess: (_data, id) => qc.invalidateQueries({ queryKey: ['application', id] }),
  });
};
