import apiClient from "./apiClient";
import useAuthStore from "../store/authStore";

export const authService = {
  async register(name, email, password) {
    try {
      const response = await apiClient.post("/auth/register", {
        name,
        email,
        password,
      });
      
      if (response.token && response.user) {
        useAuthStore.getState().login(response.user, response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  async login(email, password) {
    try {
      const response = await apiClient.post("/auth/login", {
        email,
        password,
      });
      
      if (response.token && response.user) {
        useAuthStore.getState().login(response.user, response.token);
      }
      
      return response;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    useAuthStore.getState().logout();
  },

  getToken() {
    return useAuthStore.getState().token;
  },

  getUser() {
    return useAuthStore.getState().user;
  },

  isAuthenticated() {
    return !!useAuthStore.getState().token;
  },

  isTokenExpired() {
    return useAuthStore.getState().isTokenExpired();
  },
};

export default authService;
