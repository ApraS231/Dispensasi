import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dispensasiService } from '../services/dispensasiService';

export const dispensasiKeys = {
  all: ['dispensasi'] as const,
  lists: () => [...dispensasiKeys.all, 'list'] as const,
  me: () => [...dispensasiKeys.lists(), 'me'] as const,
  allTickets: () => [...dispensasiKeys.lists(), 'all'] as const,
  pending: () => [...dispensasiKeys.lists(), 'pending'] as const,
  monitoringAnak: () => [...dispensasiKeys.lists(), 'monitoring-anak'] as const,
  details: () => [...dispensasiKeys.all, 'detail'] as const,
  detail: (id: string) => [...dispensasiKeys.details(), id] as const,
};

export function useMyTickets() {
  return useQuery({
    queryKey: dispensasiKeys.me(),
    queryFn: dispensasiService.getMyTickets,
  });
}

export function useAllTickets() {
  return useQuery({
    queryKey: dispensasiKeys.allTickets(),
    queryFn: dispensasiService.getAll,
  });
}

export function usePendingTickets() {
  return useQuery({
    queryKey: dispensasiKeys.pending(),
    queryFn: dispensasiService.getPending,
  });
}

export function useTicketDetail(id: string) {
  return useQuery({
    queryKey: dispensasiKeys.detail(id),
    queryFn: () => dispensasiService.getById(id),
    enabled: !!id,
  });
}

export function useMonitoringAnak() {
  return useQuery({
    queryKey: dispensasiKeys.monitoringAnak(),
    queryFn: dispensasiService.monitoringAnak,
  });
}

export function useSubmitDispensasi() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => dispensasiService.store(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: dispensasiKeys.me() });
      queryClient.invalidateQueries({ queryKey: dispensasiKeys.allTickets() });
      queryClient.invalidateQueries({ queryKey: dispensasiKeys.pending() });
    },
  });
}

export function useApproveTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => dispensasiService.approve(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: dispensasiKeys.pending() });
      queryClient.invalidateQueries({ queryKey: dispensasiKeys.allTickets() });
      queryClient.invalidateQueries({ queryKey: dispensasiKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: ['piket'] }); // Invalidate all piket queries (status, queue, log)
    },
  });
}

export function useRejectTicket() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, catatan }: { id: string; catatan: string }) => dispensasiService.reject(id, catatan),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: dispensasiKeys.pending() });
      queryClient.invalidateQueries({ queryKey: dispensasiKeys.allTickets() });
      queryClient.invalidateQueries({ queryKey: dispensasiKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: ['piket'] }); // Invalidate all piket queries
    },
  });
}
