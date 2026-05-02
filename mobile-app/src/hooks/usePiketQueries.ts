import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { piketService } from '../services/piketService';
import { dispensasiKeys } from './useDispensasiQueries';

export const piketKeys = {
  all: ['piket'] as const,
  status: () => [...piketKeys.all, 'status'] as const,
  dailyLog: () => [...piketKeys.all, 'daily-log'] as const,
};

export function usePiketStatus() {
  return useQuery({
    queryKey: piketKeys.status(),
    queryFn: piketService.getStatus,
  });
}

export function usePiketDailyLog() {
  return useQuery({
    queryKey: piketKeys.dailyLog(),
    queryFn: piketService.getDailyLog,
  });
}

export function useTogglePiketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (is_ready: boolean) => piketService.setStatus(is_ready),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: piketKeys.status() });
    },
  });
}

export function useValidateQR() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (qr_token: string) => piketService.validateQR(qr_token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: piketKeys.dailyLog() });
      queryClient.invalidateQueries({ queryKey: dispensasiKeys.allTickets() });
    },
  });
}
