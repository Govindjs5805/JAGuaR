import { create } from "zustand";
import {
  loginToKtuScraper,
  getGradeCardToken,
  getGradeCard,
  isTimesUp,
} from "../api/ktuScraper";
import {
  upsertLogin,
  getLogin,
  upsertGradeCache,
  getGradeCache,
  deleteLogin,
} from "../utils/database";
import type { Semester, GradeCardResponse } from "../types/gradeCard";

interface KtuGradeState {
  username: string;
  password: string;
  credentialsLoaded: boolean;
  hasSavedCredentials: boolean;

  accountId: number | null;
  ktuLoginId: number | null;

  isLoggedIn: boolean;
  isLoggingIn: boolean;
  loginError: string | null;

  selectedSemester: Semester;
  gradeCard: GradeCardResponse | null;
  isFetching: boolean;
  fetchError: string | null;
  fromCache: boolean;
  isOld: boolean;

  setUsername: (v: string) => void;
  setPassword: (v: string) => void;
  setSelectedSemester: (s: Semester) => void;
  loadCachedCredentials: (accountId: number) => Promise<void>;
  manualLogin: () => Promise<void>;
  fetchGrades: () => Promise<void>;
  refreshGrades: () => Promise<void>;
  disconnectKtu: () => void;
  resetError: () => void;
}

let _sessionCookie: string | null = null;
let _csrfToken: string | null = null;
let _sessionStart: number | null = null;
let _isProcessing = false;

function resetSession() {
  _sessionCookie = null;
  _csrfToken = null;
  _sessionStart = null;
  _isProcessing = false;
}

function hasActiveSession(): boolean {
  return (
    !!_sessionCookie &&
    !!_csrfToken &&
    _sessionStart !== null &&
    !isTimesUp(_sessionStart)
  );
}

async function doLogin(uname: string, pwd: string) {
  const loginRes = await loginToKtuScraper(uname, pwd);
  _sessionCookie = loginRes.sessionCookie;

  const tokenRes = await getGradeCardToken(loginRes.sessionCookie);
  _csrfToken = tokenRes.csrfToken;
  _sessionStart = Date.now();
}

async function ensureSession(
  set: (s: Partial<KtuGradeState>) => void,
  get: () => KtuGradeState
): Promise<boolean> {
  if (hasActiveSession()) return true;

  const { username, password } = get();
  const uname = username.trim();
  const pwd = password.trim();

  if (!uname || !pwd) {
    set({ loginError: "No saved credentials. Please log in." });
    return false;
  }

  set({ isLoggingIn: true, loginError: null });
  try {
    await doLogin(uname, pwd);
    set({ isLoggedIn: true, isLoggingIn: false });
    return true;
  } catch (e: any) {
    const message =
      e?.response?.data?.error ||
      e.message ||
      "Login failed. Please try again.";
    resetSession();
    set({
      isLoggedIn: false,
      isLoggingIn: false,
      loginError: message,
    });
    return false;
  }
}

const useKtuGradeStore = create<KtuGradeState>((set, get) => ({
  username: "",
  password: "",
  credentialsLoaded: false,
  hasSavedCredentials: false,

  accountId: null,
  ktuLoginId: null,

  isLoggedIn: false,
  isLoggingIn: false,
  loginError: null,

  selectedSemester: "1",
  gradeCard: null,
  isFetching: false,
  fetchError: null,
  fromCache: false,
  isOld: false,

  setUsername: (v) => set({ username: v }),
  setPassword: (v) => set({ password: v }),
  setSelectedSemester: (s) =>
    set({
      selectedSemester: s,
      gradeCard: null,
      fetchError: null,
      fromCache: false,
    }),
  resetError: () => set({ loginError: null, fetchError: null }),

  loadCachedCredentials: async (accountId) => {
    const prev = get().accountId;
    if (prev !== null && prev !== accountId) {
      resetSession();
      set({
        isLoggedIn: false,
        gradeCard: null,
        fetchError: null,
        loginError: null,
        fromCache: false,
        ktuLoginId: null,
        hasSavedCredentials: false,
        username: "",
        password: "",
      });
    }

    set({ accountId });

    try {
      const cached = await getLogin({ accountId });
      if (cached) {
        set({
          username: cached.username,
          password: cached.password,
          ktuLoginId: cached.id,
          hasSavedCredentials: true,
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      set({ credentialsLoaded: true });
    }
  },

  manualLogin: async () => {
    const { username, password, accountId } = get();
    const uname = username.trim();
    const pwd = password.trim();

    if (!uname || !pwd) {
      set({ loginError: "Username and password are required." });
      return;
    }
    if (_isProcessing) return;

    _isProcessing = true;
    set({ isLoggingIn: true, loginError: null });

    try {
      await doLogin(uname, pwd);
      set({ isLoggedIn: true, hasSavedCredentials: true });

      if (accountId) {
        try {
          const row = await upsertLogin({
            accountId,
            username: uname,
            password: pwd,
          });
          if (row) set({ ktuLoginId: row.id });
        } catch {
          // non-fatal
        }
      }
    } catch (e: any) {
      set({
        loginError: "Login failed. Check your credentials.",
      });
    } finally {
      _isProcessing = false;
      set({ isLoggingIn: false });
    }
  },

  fetchGrades: async () => {
    if (_isProcessing) return;
    const { selectedSemester, ktuLoginId } = get();
    const semNum = parseInt(selectedSemester, 10);

    set({ isFetching: true, fetchError: null, fromCache: false });

    if (ktuLoginId) {
      try {
        const cached = await getGradeCache({
          loginId: ktuLoginId,
          semester: semNum,
        });
        if (cached) {
          set({
            gradeCard: cached.data,
            fromCache: true,
            isFetching: false,
            isOld: cached.isOld,
          });
          return;
        }
      } catch {
        // cache miss
      }
    }

    _isProcessing = true;
    const ok = await ensureSession(set, get);
    if (!ok) {
      _isProcessing = false;
      set({ isFetching: false });
      return;
    }

    try {
      const result = await getGradeCard({
        sessionCookie: _sessionCookie!,
        csrfToken: _csrfToken!,
        semester: selectedSemester,
      });
      set({ gradeCard: result, isOld: false });

      const loginId = get().ktuLoginId;
      if (loginId) {
        if (result.courses.length >= 1 && result.sgpa !== "Not Available") {
          try {
            await upsertGradeCache({
              loginId,
              semester: semNum,
              grades: result,
            });
          } catch {
            // non-fatal
          }
        }
      }
    } catch {
      resetSession();
      set({
        isLoggedIn: false,
        fetchError: "Could not fetch grade card. Please try again.",
      });
    } finally {
      _isProcessing = false;
      set({ isFetching: false });
    }
  },

  refreshGrades: async () => {
    if (_isProcessing) return;
    const { selectedSemester } = get();

    _isProcessing = true;
    set({ isFetching: true, fetchError: null, fromCache: false });

    const ok = await ensureSession(set, get);
    if (!ok) {
      _isProcessing = false;
      set({ isFetching: false });
      return;
    }

    try {
      const result = await getGradeCard({
        sessionCookie: _sessionCookie!,
        csrfToken: _csrfToken!,
        semester: selectedSemester,
      });
      set({ gradeCard: result });

      const loginId = get().ktuLoginId;
      if (loginId) {
        try {
          await upsertGradeCache({
            loginId,
            semester: parseInt(selectedSemester, 10),
            grades: result,
          });
        } catch {
          // non-fatal
        }
      }
    } catch {
      resetSession();
      set({
        isLoggedIn: false,
        fetchError: "Could not fetch grade card. Please try again.",
      });
    } finally {
      _isProcessing = false;
      set({ isFetching: false });
    }
  },

  disconnectKtu: () => {
    const { accountId } = get();
    resetSession();

    if (accountId) {
      deleteLogin({ accountId }).catch(() => {});
    }

    set({
      username: "",
      password: "",
      hasSavedCredentials: false,
      isLoggedIn: false,
      isLoggingIn: false,
      loginError: null,
      selectedSemester: "1",
      gradeCard: null,
      isFetching: false,
      fetchError: null,
      fromCache: false,
      ktuLoginId: null,
    });
  },
}));

export { useKtuGradeStore, useKtuGradeStore as useKTUGradesStore };
export default useKtuGradeStore;
