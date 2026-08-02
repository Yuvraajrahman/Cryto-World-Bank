import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api } from "@/lib/api";

function emptyState() {
  return {
    hydratedFromApi: false,
    registration: {
      done: false,
      fullName: "",
      email: "",
      phone: "",
      country: "",
      dateOfBirth: "",
      accountType: "individual",
    },
    kyc1: {
      status: "not_started",
      idFrontName: "",
      idBackName: "",
      selfieName: "",
      rejectionReason: "",
      submittedAt: null,
    },
    kyc2: {
      status: "not_started",
      skipped: false,
      addressDocName: "",
      incomeDocName: "",
      submittedAt: null,
      rejectionReason: "",
    },
    consent: {
      done: false,
      risk: false,
      data: false,
      agent: false,
      consentedAt: null,
    },
    complete: {
      done: false,
    },
  };
}

function mapKycStatus(s) {
  if (!s) return "not_started";
  return String(s).toLowerCase();
}

function applyApiStatus(api) {
  const kyc1Status = mapKycStatus(api.kyc1?.status);
  const kyc2Status = mapKycStatus(api.kyc2?.status);
  return {
    hydratedFromApi: true,
    registration: {
      done: Boolean(api.registration?.done),
      fullName: api.user?.displayName || "",
      email: api.user?.email || "",
      phone: api.user?.phone || "",
      country: api.user?.country || "",
      dateOfBirth: api.user?.dateOfBirth || "",
      accountType: api.user?.accountType || "individual",
    },
    kyc1: {
      status: kyc1Status,
      idFrontName: api.kyc1?.idFrontName || "",
      idBackName: api.kyc1?.idBackName || "",
      selfieName: api.kyc1?.selfieName || "",
      rejectionReason: api.kyc1?.rejectionReason || "",
      submittedAt: api.kyc1?.submittedAt || null,
    },
    kyc2: {
      status: kyc2Status,
      skipped: Boolean(api.kyc2?.skipped),
      addressDocName: api.kyc2?.addressDocName || "",
      incomeDocName: api.kyc2?.incomeDocName || "",
      submittedAt: api.kyc2?.submittedAt || null,
      rejectionReason: api.kyc2?.rejectionReason || "",
    },
    consent: {
      done: Boolean(api.consent?.consentedAt),
      risk: Boolean(api.consent?.risk),
      data: Boolean(api.consent?.data),
      agent: Boolean(api.consent?.agent),
      consentedAt: api.consent?.consentedAt || null,
    },
    complete: {
      done: Boolean(api.user?.onboardingComplete),
    },
  };
}

/**
 * Onboarding progress — syncs with /api/onboarding/* when a JWT session exists.
 * Local persist remains a UX cache for form drafts between steps.
 */
export const useOnboardingStore = create(
  persist(
    (set, get) => ({
      ...emptyState(),

      setRegistration: (patch) =>
        set((s) => ({ registration: { ...s.registration, ...patch } })),

      completeRegistration: () =>
        set((s) => ({ registration: { ...s.registration, done: true } })),

      setKyc1: (patch) => set((s) => ({ kyc1: { ...s.kyc1, ...patch } })),

      submitKyc1: () =>
        set((s) => ({
          kyc1: {
            ...s.kyc1,
            status: "pending",
            submittedAt: new Date().toISOString(),
            rejectionReason: "",
          },
        })),

      setKyc2: (patch) => set((s) => ({ kyc2: { ...s.kyc2, ...patch } })),

      submitKyc2: () =>
        set((s) => ({
          kyc2: {
            ...s.kyc2,
            status: "pending",
            skipped: false,
            submittedAt: new Date().toISOString(),
            rejectionReason: "",
          },
        })),

      skipKyc2: () =>
        set((s) => ({
          kyc2: { ...s.kyc2, skipped: true },
        })),

      setConsent: (patch) => set((s) => ({ consent: { ...s.consent, ...patch } })),

      completeConsent: () =>
        set((s) => ({
          consent: {
            ...s.consent,
            done: true,
            consentedAt: new Date().toISOString(),
          },
        })),

      markComplete: () => set({ complete: { done: true } }),

      resetOnboarding: () => set(emptyState()),

      hydrateFromApi: (apiStatus) => set(applyApiStatus(apiStatus)),

      /** Pull latest onboarding state from the backend (requires JWT). */
      syncFromApi: async () => {
        try {
          const status = await api.get("/api/onboarding/status");
          set(applyApiStatus(status));
          return status;
        } catch {
          return null;
        }
      },

      registerRemote: async (payload) => {
        const status = await api.post("/api/onboarding/register", payload);
        set(applyApiStatus(status));
        return status;
      },

      submitKyc1Remote: async (payload) => {
        const status = await api.post("/api/onboarding/kyc-1", payload);
        set(applyApiStatus(status));
        return status;
      },

      submitKyc2Remote: async (payload) => {
        const status = await api.post("/api/onboarding/kyc-2", payload);
        set(applyApiStatus(status));
        return status;
      },

      skipKyc2Remote: async () => {
        const status = await api.post("/api/onboarding/kyc-2/skip");
        set(applyApiStatus(status));
        return status;
      },

      consentRemote: async (payload) => {
        const status = await api.post("/api/onboarding/consent", payload);
        set(applyApiStatus(status));
        return status;
      },

      completeRemote: async () => {
        const status = await api.post("/api/onboarding/complete");
        set(applyApiStatus(status));
        return status;
      },

      nextStepPath: () => {
        const s = get();
        if (!s.registration.done) return "/onboarding/register";
        if (s.kyc1.status === "not_started") return "/onboarding/kyc-1";
        if (!s.consent.done) return "/onboarding/consent";
        if (!s.complete.done) return "/onboarding/complete";
        return "/app/dashboard";
      },
    }),
    { name: "wbr-onboarding" },
  ),
);
