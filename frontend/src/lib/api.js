const BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";
export class ApiError extends Error {
    constructor(message, status, code, details) {
        super(message);
        Object.defineProperty(this, "status", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "code", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "details", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
function getToken() {
    // Pulled lazily so that zustand persist rehydration doesn't race the first
    // request.
    try {
        const raw = localStorage.getItem("cwb-session");
        if (!raw)
            return null;
        const parsed = JSON.parse(raw);
        return parsed?.state?.token ?? null;
    }
    catch {
        return null;
    }
}
async function request(path, init = {}) {
    const token = getToken();
    const headers = new Headers(init.headers);
    if (!(init.body instanceof FormData)) {
        headers.set("content-type", "application/json");
    }
    if (token)
        headers.set("authorization", `Bearer ${token}`);
    const res = await fetch(`${BASE}${path}`, { ...init, headers });
    if (!res.ok) {
        let code;
        let message = res.statusText;
        let details;
        try {
            const body = await res.json();
            code = body?.error;
            message = body?.message ?? body?.error ?? message;
            details = body?.details ?? body;
        }
        catch {
            /* ignore */
        }
        throw new ApiError(message, res.status, code, details);
    }
    if (res.status === 204) {
        return undefined;
    }
    return res.json();
}
export const api = {
    get: (path) => request(path),
    post: (path, body) => request(path, {
        method: "POST",
        body: body ? JSON.stringify(body) : undefined,
    }),
    put: (path, body) => request(path, {
        method: "PUT",
        body: body ? JSON.stringify(body) : undefined,
    }),
    delete: (path) => request(path, { method: "DELETE" }),
};
