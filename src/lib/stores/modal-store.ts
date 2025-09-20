"use client";

import { create } from "zustand";

type ModalType =
  | "auction"
  | "blindBox"
  | "redemption"
  | "creatorDraft"
  | "creatorNew"
  | "aiPreset"
  | "walletPrompt";

interface ModalPayload {
  [key: string]: unknown;
}

interface ModalState {
  modal?: { type: ModalType; payload?: ModalPayload };
  openModal: (type: ModalType, payload?: ModalPayload) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  modal: undefined,
  openModal: (type, payload) => set({ modal: { type, payload } }),
  closeModal: () => set({ modal: undefined }),
}));
