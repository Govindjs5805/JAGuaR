import axios, { AxiosInstance, AxiosResponse } from "axios";
import { API_CONFIG } from "../constants/config";
import { kvHelper } from "../utils/storage";
import { SurveyStartData } from "../types/api";
import { Survey } from "../types/surveys";

class SurveysService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = kvHelper.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );
  }

  async fetchSurveys(): Promise<Survey[]> {
    try {
      const response: AxiosResponse<{ data: Survey[] }> = await this.api.get(
        API_CONFIG.ENDPOINTS.SURVEY.GET
      );
      return response.data.data || [];
    } catch (error) {
      throw error;
    }
  }

  async getSurveyData(surveyId: number): Promise<SurveyStartData> {
    try {
      const response: AxiosResponse<SurveyStartData> = await this.api.get(
        `/studfbsurveys/${surveyId}`
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  async submitSurvey(surveyId: number, answers: any): Promise<void> {
    try {
      await this.api.post(`/studfbsurveys/${surveyId}/submit`, answers);
    } catch (error) {
      throw error;
    }
  }
}

export const surveysService = new SurveysService();
