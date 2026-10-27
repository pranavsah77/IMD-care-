import React, { createContext, useContext, useState, useEffect } from "react";
import { Language } from "../i18n/translations.ts";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: "patient" | "reviewer" | "doctor" | "guest";
  preferredLanguage: Language;
  avatarInitials: string;
  ageGroup?: string;
  emergencyContact?: string;
  isGuest: boolean;
}

export const DEMO_PROFILES: UserProfile[] = [
  {
    id: "user-guest",
    name: "Demo Guest",
    email: "guest@imdcare.demo",
    role: "guest",
    preferredLanguage: "en",
    avatarInitials: "DG",
    ageGroup: "Adult (18-64)",
    emergencyContact: "911 / 112",
    isGuest: true,
  },
  {
    id: "user-rahul",
    name: "Rahul Patil",
    email: "rahul.patil@imdcare.demo",
    role: "patient",
    preferredLanguage: "mr",
    avatarInitials: "RP",
    ageGroup: "Adult (18-64)",
    emergencyContact: "+91 98765 43210",
    isGuest: false,
  },
  {
    id: "user-priya",
    name: "Dr. Priya Sharma",
    email: "dr.priya@imdcare.demo",
    role: "doctor",
    preferredLanguage: "hi",
    avatarInitials: "PS",
    ageGroup: "Adult (18-64)",
    emergencyContact: "+91 91234 56789",
    isGuest: false,
  },
];

interface AuthContextType {
  user: UserProfile;
  loginWithEmail: (email: string, name?: string) => void;
  loginWithGoogle: () => void;
  switchProfile: (profile: UserProfile) => void;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => void;
  isModalOpen: boolean;
  openSignInModal: () => void;
  closeSignInModal: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: DEMO_PROFILES[0],
  loginWithEmail: () => {},
  loginWithGoogle: () => {},
  switchProfile: () => {},
  logout: () => {},
  updateProfile: () => {},
  isModalOpen: false,
  openSignInModal: () => {},
  closeSignInModal: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(() => {
    const saved = localStorage.getItem("imd_user");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEMO_PROFILES[0];
  });

  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem("imd_user", JSON.stringify(user));
  }, [user]);

  const loginWithEmail = (email: string, name?: string) => {
    const displayName = name?.trim() || email.split("@")[0] || "User";
    const initials = displayName.slice(0, 2).toUpperCase();
    const newUser: UserProfile = {
      id: "usr-" + Date.now(),
      name: displayName,
      email: email.trim(),
      role: "patient",
      preferredLanguage: "en",
      avatarInitials: initials,
      isGuest: false,
    };
    setUser(newUser);
    setIsModalOpen(false);
  };

  const loginWithGoogle = () => {
    const googleUser: UserProfile = {
      id: "usr-google-" + Date.now(),
      name: "Google Account User",
      email: "user.auth@gmail.com",
      role: "patient",
      preferredLanguage: "en",
      avatarInitials: "GU",
      isGuest: false,
    };
    setUser(googleUser);
    setIsModalOpen(false);
  };

  const switchProfile = (profile: UserProfile) => {
    setUser(profile);
    setIsModalOpen(false);
  };

  const logout = () => {
    setUser(DEMO_PROFILES[0]);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser((prev) => ({ ...prev, ...data }));
  };

  const openSignInModal = () => setIsModalOpen(true);
  const closeSignInModal = () => setIsModalOpen(false);

  return (
    <AuthContext.Provider
      value={{
        user,
        loginWithEmail,
        loginWithGoogle,
        switchProfile,
        logout,
        updateProfile,
        isModalOpen,
        openSignInModal,
        closeSignInModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
