import { create } from 'zustand';
import React from 'react';

interface HeaderState {
  title: string;
  showAvatar: boolean;
  showNotification: boolean;
  onBack?: () => void;
  rightComponent?: React.ReactNode;
  hasGlobalHeader: boolean;
  setHeaderProps: (props: Partial<Omit<HeaderState, 'setHeaderProps' | 'setHasGlobalHeader'>>) => void;
  setHasGlobalHeader: (val: boolean) => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
  title: 'Sistem Perizinan Siswa',
  showAvatar: true,
  showNotification: true,
  onBack: undefined,
  rightComponent: undefined,
  hasGlobalHeader: false,
  setHeaderProps: (props) => set(props),
  setHasGlobalHeader: (val) => set({ hasGlobalHeader: val }),
}));
