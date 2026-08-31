import axios from "axios";
import { CHAT_CONFIG } from "../constants/config";
import { Message, GifData } from "../types/api";

class ChatService {
  async getMessages(offset: number = 0, limit: number = 50): Promise<Message[]> {
    try {
      if (!CHAT_CONFIG.KLIPY_API_URL) return [];
      const url = CHAT_CONFIG.GET_MESSAGES(offset, limit, CHAT_CONFIG.KLIPY_API_URL);
      const res = await axios.get(url);
      return res.data || [];
    } catch (error) {
      console.warn("Failed to fetch messages:", error);
      return [];
    }
  }

  async searchGifs(query: string): Promise<GifData[]> {
    try {
      if (!CHAT_CONFIG.KLIPY_API_KEY) return [];
      const res = await axios.get(`https://api.klipy.co/v1/gifs/search`, {
        params: {
          key: CHAT_CONFIG.KLIPY_API_KEY,
          q: query,
          limit: 20,
        },
      });
      return res.data?.data || [];
    } catch (error) {
      console.warn("Failed to fetch gifs:", error);
      return [];
    }
  }
}

export const chatService = new ChatService();
