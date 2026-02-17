import { create } from 'zustand';

export type Modal =
    | { kind: 'none' }
    | { kind: 'addDocs' }
    | { kind: 'export' }
    | { kind: 'arrayStrategy'; path: string };

type UIState = {
    modal: Modal;
    openModal: (m: Modal) => void;
    closeModal: () => void;
};

export const useUIStore = create<UIState>((set) => ({
    modal: { kind: 'none' },
    openModal: (modal) => set({ modal }),
    closeModal: () => set({ modal: { kind: 'none' } }),
}));