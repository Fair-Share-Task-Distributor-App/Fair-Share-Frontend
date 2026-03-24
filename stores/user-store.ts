import { create } from "zustand";

type UserProfileUpdate = {
  name?: string;
  email?: string;
  teamName?: string;
};

type UserStore = {
  name: string;
  email: string;
  teamName: string;
  setUserProfile: (profile: UserProfileUpdate) => void;
  setTeamName: (teamName: string) => void;
  clearUserProfile: () => void;
};

export const useUserStore = create<UserStore>((set) => ({
  name: "",
  email: "",
  teamName: "",
  setUserProfile: (profile) =>
    set((state) => ({
      name: profile.name ?? state.name,
      email: profile.email ?? state.email,
      teamName: profile.teamName ?? state.teamName,
    })),
  setTeamName: (teamName) => set({ teamName }),
  clearUserProfile: () => set({ name: "", email: "", teamName: "" }),
}));
