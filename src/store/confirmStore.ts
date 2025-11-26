import { create } from 'zustand';

interface ConfirmState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  variant: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
  loading: boolean;
  show: (options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
    onConfirm: () => void | Promise<void>;
  }) => void;
  hide: () => void;
  setLoading: (loading: boolean) => void;
}

export const useConfirmStore = create<ConfirmState>((set, get) => ({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  cancelText: 'Cancel',
  variant: 'danger',
  onConfirm: () => {},
  loading: false,

  show: (options) => {
    set({
      isOpen: true,
      title: options.title,
      message: options.message,
      confirmText: options.confirmText || 'Confirm',
      cancelText: options.cancelText || 'Cancel',
      variant: options.variant || 'danger',
      onConfirm: async () => {
        set({ loading: true });
        try {
          await options.onConfirm();
        } finally {
          set({ loading: false, isOpen: false });
        }
      },
    });
  },

  hide: () => {
    set({ isOpen: false, loading: false });
  },

  setLoading: (loading) => {
    set({ loading });
  },
}));

// Hook for convenience
export function useConfirm() {
  const { show } = useConfirmStore();
  
  return (options: Parameters<typeof show>[0]) => {
    return new Promise<boolean>((resolve) => {
      show({
        ...options,
        onConfirm: async () => {
          await options.onConfirm();
          resolve(true);
        },
      });
    });
  };
}


