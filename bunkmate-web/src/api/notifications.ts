import axios, { AxiosInstance } from "axios";
import { API_CONFIG } from "../constants/config";
import { kvHelper } from "../utils/storage";
import { Notification } from "../types/notifications";

class NotificationService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
    });

    this.api.interceptors.request.use((config) => {
      const token = kvHelper.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  async getNotifications(): Promise<Notification[]> {
    try {
      const response = await this.api.get(API_CONFIG.ENDPOINTS.NOTIFICATIONS);
      return response.data || [];
    } catch (error) {
      console.warn("Failed to fetch notifications:", error);
      return [];
    }
  }
}

export const notificationService = new NotificationService();
