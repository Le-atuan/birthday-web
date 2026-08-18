import { create } from "zustand";

const MIN_STEP = 0;
const MAX_STEP = 5;

type UserSlice = {
  name: string;
  dob: string;
  email: string;
  phone: string;
  lat?: number;
  lng?: number;
  setUser: (
    user: Pick<UserSlice, "name" | "dob" | "email" | "phone">
  ) => void;
  setLocation: (lat: number, lng: number) => void;
};

type FlowSlice = {
  step: number;
  wishText: string;
  next: () => void;
  back: () => void;
  setWish: (t: string) => void;
};

type AppStore = UserSlice & FlowSlice;

export const useAppStore = create<AppStore>((set) => ({
  name: "",
  dob: "",
  email: "",
  phone: "",
  lat: undefined,
  lng: undefined,
  setUser: (user) => set(user),
  setLocation: (lat, lng) => set({ lat, lng }),

  step: MIN_STEP,
  wishText: "",
  next: () =>
    set((state) => ({ step: Math.min(state.step + 1, MAX_STEP) })),
  back: () =>
    set((state) => ({ step: Math.max(state.step - 1, MIN_STEP) })),
  setWish: (t) => set({ wishText: t }),
}));
