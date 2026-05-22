import { create } from "zustand";

type UserProfileUpdate = {
  name?: string;
  email?: string;
  teamName?: string;
  sync_allowed?: boolean;
};

type UserStore = {
  name: string;
  email: string;
  teamName: string;
  sync_allowed: boolean;
  setUserProfile: (profile: UserProfileUpdate) => void;
  setTeamName: (teamName: string) => void;
  clearUserProfile: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  name: "",
  email: "",
  teamName: "",
  sync_allowed: false,
  setUserProfile: (profile) =>
    set((state) => ({
      name: profile.name ?? state.name,
      email: profile.email ?? state.email,
      teamName: profile.teamName ?? state.teamName,
      sync_allowed: profile.sync_allowed ?? state.sync_allowed,
    })),
  setTeamName: (teamName) => set({ teamName }),
  clearUserProfile: () => set({ name: "", email: "", teamName: "", sync_allowed: false }),
}));
