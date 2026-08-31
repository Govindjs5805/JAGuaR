import axios from "axios";
import { INSIGHTS_API_URL, INSIGHTS_LOGGED_CODE } from "../constants/config";
import { kvHelper } from "../utils/storage";

export async function logInsight(name: string): Promise<void> {
  try {
    if (kvHelper.hasInsightsLogged() || !INSIGHTS_API_URL) return;

    await axios.post(INSIGHTS_API_URL, {
      name,
      code: INSIGHTS_LOGGED_CODE,
      platform: "web",
      timestamp: new Date().toISOString(),
    });

    kvHelper.setInsightsLogged(true);
  } catch {
    // Non-fatal, ignore errors
  }
}
