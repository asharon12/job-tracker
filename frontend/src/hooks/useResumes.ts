import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/api';
import type { Resume } from '../types';

export const useResumes = () =>
  useQuery<Resume[]>({
    queryKey: ['resumes'],
    queryFn: () => api.get<Resume[]>('/resumes'),
  });

export const useUploadResume = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => api.post<Resume>('/resumes', formData),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  });
};

export const useDeleteResume = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/resumes/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['resumes'] }),
  });
};
