import { AUTH_ACCESS_TOKEN, THEME_MODE, INSIGHTS_LOGGED } from "../constants/config";

class WebStorage {
  private getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  private setItem(key: string, value: string): void {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("Failed to save to localStorage:", e);
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Failed to remove from localStorage:", e);
    }
  }

  getAuthToken(): string | null {
    return this.getItem(AUTH_ACCESS_TOKEN);
  }

  setAuthToken(token: string): void {
    this.setItem(AUTH_ACCESS_TOKEN, token);
  }

  clearAuthToken(): void {
    this.removeItem(AUTH_ACCESS_TOKEN);
  }

  getThemeMode(): "light" | "dark" | "system" {
    const mode = this.getItem(THEME_MODE);
    if (mode === "light" || mode === "dark") return mode;
    return "dark"; // Default to dark for this app
  }

  setThemeMode(mode: "light" | "dark" | "system"): void {
    this.setItem(THEME_MODE, mode);
  }

  hasInsightsLogged(): boolean {
    return !!this.getItem(INSIGHTS_LOGGED);
  }

  setInsightsLogged(logged: boolean): void {
    if (logged) {
      this.setItem(INSIGHTS_LOGGED, "true");
    } else {
      this.removeItem(INSIGHTS_LOGGED);
    }
  }

  // Account storage for multi-account support
  getAccounts(): Array<{ id: number; name: string; username: string; token: string }> {
    const accounts = this.getItem("bunkmate_accounts");
    return accounts ? JSON.parse(accounts) : [];
  }

  saveAccounts(accounts: Array<{ id: number; name: string; username: string; token: string }>): void {
    this.setItem("bunkmate_accounts", JSON.stringify(accounts));
  }

  getCurrentAccountId(): number | null {
    const id = this.getItem("bunkmate_current_account_id");
    return id ? parseInt(id, 10) : null;
  }

  setCurrentAccountId(id: number | null): void {
    if (id !== null) {
      this.setItem("bunkmate_current_account_id", id.toString());
    } else {
      this.removeItem("bunkmate_current_account_id");
    }
  }

  // Generic key-value helpers
  set(key: string, value: any): void {
    this.setItem(key, typeof value === "string" ? value : JSON.stringify(value));
  }

  get<T>(key: string): T | null {
    const item = this.getItem(key);
    if (!item) return null;
    try {
      return JSON.parse(item) as T;
    } catch {
      return item as unknown as T;
    }
  }

  delete(key: string): void {
    this.removeItem(key);
  }
}

export const storage = new WebStorage();
export const kvHelper = storage;
