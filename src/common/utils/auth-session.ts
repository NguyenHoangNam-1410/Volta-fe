import type { User } from "../../apis/users/user.interface";

const AUTH_USER_KEY = "user";
const AUTH_MODE_KEY = "auth_mode";

type AuthMode = "authenticated" | "guest";

const getAuthMode = (): AuthMode | null => {
  const mode = localStorage.getItem(AUTH_MODE_KEY);
  if (mode === "authenticated" || mode === "guest") {
    return mode;
  }
  return null;
};

export const getStoredUser = (): User | null => {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as User;
  } catch {
    localStorage.removeItem(AUTH_USER_KEY);
    return null;
  }
};

export const isAuthenticated = (): boolean => {
  return getAuthMode() === "authenticated" && Boolean(getStoredUser());
};

export const setAuthenticatedSession = (user: User): void => {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
  localStorage.setItem(AUTH_MODE_KEY, "authenticated");
};

export const setGuestSession = (): void => {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.setItem(AUTH_MODE_KEY, "guest");
};

export const clearSession = (): void => {
  localStorage.removeItem(AUTH_USER_KEY);
  localStorage.removeItem(AUTH_MODE_KEY);
};
