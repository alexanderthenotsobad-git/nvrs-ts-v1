"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type UserRole = "none" | "patron" | "staff" | "admin";

export interface MockUser {
  name: string;
  role: Exclude<UserRole, "none">;
  email?: string;
}

type UserRoleContextType = {
  user: MockUser | null;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  signIn: (role: Exclude<UserRole, "none">, name?: string) => void;
  signOut: () => void;
};

const DEFAULT_NAMES: Record<Exclude<UserRole, "none">, string> = {
  patron: "Maya Chen",
  staff: "Nina Park",
  admin: "Alex Rivera",
};

const UserRoleContext = createContext<UserRoleContextType>({
  user: null,
  userRole: "none",
  setUserRole: () => {},
  signIn: () => {},
  signOut: () => {},
});

export const UserRoleProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<MockUser | null>(null);

  const signIn = useCallback(
    (role: Exclude<UserRole, "none">, name?: string) => {
      setUser({
        role,
        name: name?.trim() || DEFAULT_NAMES[role],
        email:
          role === "patron"
            ? "maya@example.com"
            : role === "staff"
              ? "nina@vrs.test"
              : "alex@vrs.test",
      });
    },
    [],
  );

  const signOut = useCallback(() => setUser(null), []);

  const setUserRole = useCallback(
    (role: UserRole) => {
      if (role === "none") {
        setUser(null);
        return;
      }
      signIn(role);
    },
    [signIn],
  );

  const value = useMemo(
    () => ({
      user,
      userRole: user?.role ?? ("none" as const),
      setUserRole,
      signIn,
      signOut,
    }),
    [user, setUserRole, signIn, signOut],
  );

  return <UserRoleContext.Provider value={value}>{children}</UserRoleContext.Provider>;
};

export const useUserRole = () => useContext(UserRoleContext);
