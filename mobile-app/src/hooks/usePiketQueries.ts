import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { piketService } from '../services/piketService';
import { dispensasiKeys } from './useDispensasiQueries';

export const piketKeys = {
  all: ['piket'] as const,
  status: () => [...piketKeys.all, 'status'] as const,
  queue: () => [...piketKeys.all, 'queue'] as const,
  dailyLog: () => [...piketKeys.all, 'daily-log'] as const,
};

export function usePiketStatus() {
  return useQuery({
    queryKey: piketKeys.status(),
    queryFn: piketService.getStatus,
  });
}

export function usePiketQueue(enabled = true) {
  return useQuery({
    queryKey: piketKeys.queue(),
    queryFn: piketService.getQueue,
    enabled,
    refetchInterval: 30_000, // Polling ringan setiap 30 detik
    staleTime: 10_000,
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
