import { useQuery } from '@tanstack/react-query';
import api from '../lib/api';
import type { Stats } from '../types';

export const useStats = () =>
  useQuery<Stats>({
    queryKey: ['stats'],
    queryFn: () => api.get<Stats>('/stats'),
  });
