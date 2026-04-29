import { create } from "zustand";

const STORAGE_KEY_TOKEN = "nexakazi_token";
const STORAGE_KEY_USER = "nexakazi_user";
const TOKEN_EXPIRY_KEY = "nexakazi_token_expiry";

const getStoredAuth = () => {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const user = localStorage.getItem(STORAGE_KEY_USER);
    const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);

    // Check if token is expired
    if (token && expiry && Date.now() > parseInt(expiry)) {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);
      return { user: null, token: null };
    }

    return {
      token: token || null,
      user: user ? JSON.parse(user) : null,
    };
  } catch (error) {
    console.error("Error retrieving auth from storage:", error);
    return { user: null, token: null };
  }
};

const useAuthStore = create((set, get) => {
  const { user: storedUser, token: storedToken } = getStoredAuth();

  return {
    user: storedUser,
    token: storedToken,
    isAuthenticated: !!storedToken,

    login: (user, token, expiresIn = 604800000) => {
      const expiryTime = Date.now() + expiresIn; // Default 7 days
      
      localStorage.setItem(STORAGE_KEY_TOKEN, token);
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
      localStorage.setItem(TOKEN_EXPIRY_KEY, expiryTime.toString());

      set({
        user,
        token,
        isAuthenticated: true,
      });
    },

    logout: () => {
      localStorage.removeItem(STORAGE_KEY_TOKEN);
      localStorage.removeItem(STORAGE_KEY_USER);
      localStorage.removeItem(TOKEN_EXPIRY_KEY);

      set({
        user: null,
        token: null,
        isAuthenticated: false,
      });
    },

    updateUser: (updates) => {
      const currentUser = get().user;
      const updatedUser = { ...currentUser, ...updates };
      
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
      set({ user: updatedUser });
    },

    isTokenExpired: () => {
      const expiry = localStorage.getItem(TOKEN_EXPIRY_KEY);
      return expiry && Date.now() > parseInt(expiry);
    },
  };
});

export default useAuthStore;
