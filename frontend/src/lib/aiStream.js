import { getApiBaseUrl } from "@/lib/apiBase";
function getToken() {
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
export async function streamChat(opts) {
    const token = getToken();
    const headers = { "content-type": "application/json" };
    if (token)
        headers.authorization = `Bearer ${token}`;
    const res = await fetch(`${getApiBaseUrl()}/api/ai/chat/stream`, {
        method: "POST",
        headers,
        body: JSON.stringify({
            messages: opts.messages,
            featureKey: opts.featureKey,
            route: opts.route,
            roleHint: opts.roleHint,
        }),
    });
    if (!res.ok || !res.body) {
        const text = await res.text().catch(() => "");
        throw new Error(`stream_failed_${res.status}${text ? `: ${text}` : ""}`);
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buf = "";
    let event = null;
    let dataLines = [];
    let finalMeta = {};
    const flushEvent = () => {
        if (!event)
            return;
        const data = dataLines.join("\n");
        if (event === "token") {
            opts.onToken(data);
        }
        else if (event === "meta") {
            try {
                const meta = JSON.parse(data);
                finalMeta = { ...finalMeta, ...meta };
                opts.onMeta?.(meta);
            }
            catch {
                /* ignore */
            }
        }
        else if (event === "error") {
            try {
                const err = JSON.parse(data);
                opts.onError?.(err.message ?? "Unknown error");
            }
            catch {
                opts.onError?.(data || "Unknown error");
            }
        }
        else if (event === "done") {
            try {
                const meta = JSON.parse(data);
                finalMeta = { ...finalMeta, ...meta };
            }
            catch {
                /* ignore */
            }
        }
        event = null;
        dataLines = [];
    };
    while (true) {
        const { done, value } = await reader.read();
        if (done)
            break;
        buf += decoder.decode(value, { stream: true });
        while (true) {
            const nl = buf.indexOf("\n");
            if (nl === -1)
                break;
            const line = buf.slice(0, nl);
            buf = buf.slice(nl + 1);
            const trimmed = line.replace(/\r$/, "");
            if (trimmed === "") {
                flushEvent();
                continue;
            }
            if (trimmed.startsWith("event:")) {
                event = trimmed.slice("event:".length).trim();
                continue;
            }
            if (trimmed.startsWith("data:")) {
                // SSE format is `data: <payload>`. Remove only the first single space
                // after `data:` if present, but preserve any intentional leading spaces
                // (LLM tokens often begin with a space).
                const raw = trimmed.slice("data:".length);
                dataLines.push(raw.startsWith(" ") ? raw.slice(1) : raw);
            }
        }
    }
    flushEvent();
    return finalMeta;
}
