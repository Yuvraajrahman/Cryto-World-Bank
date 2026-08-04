/**
 * Resolve which LM Studio model to call.
 * Default: whatever LLM is currently loaded (LLM_MODEL=auto).
 * Pin a specific id via LLM_MODEL=publisher/model-name if needed.
 */
import { config } from "../config";

const EMBEDDING_RE = /embed|embedding|nomic-embed/i;

type Cache = { at: number; model: string; loaded: string[]; available: string[] };
let cache: Cache | null = null;
const CACHE_MS = 8_000;

function isAutoMode(raw: string) {
  const v = raw.trim().toLowerCase();
  return !v || v === "auto" || v === "*" || v === "loaded" || v === "current";
}

export async function resolveLlmModel(opts?: { forceRefresh?: boolean }): Promise<{
  model: string;
  source: "env" | "loaded" | "catalog" | "fallback";
  loaded: string[];
  available: string[];
  baseUrl: string;
}> {
  const baseUrl = config.llmBaseUrl;
  const pinned = (config.llmModel || "auto").trim();
  const now = Date.now();

  if (!opts?.forceRefresh && cache && now - cache.at < CACHE_MS) {
    if (!isAutoMode(pinned)) {
      return {
        model: pinned,
        source: "env",
        loaded: cache.loaded,
        available: cache.available,
        baseUrl,
      };
    }
    return {
      model: cache.model,
      source: "loaded",
      loaded: cache.loaded,
      available: cache.available,
      baseUrl,
    };
  }

  const loaded: string[] = [];
  const available: string[] = [];

  try {
    const native = await fetch(`${baseUrl}/api/v1/models`, {
      signal: AbortSignal.timeout(5_000),
    });
    if (native.ok) {
      const json = (await native.json()) as {
        models?: Array<{
          type?: string;
          key?: string;
          loaded_instances?: Array<{ id?: string }>;
        }>;
      };
      for (const m of json.models || []) {
        if (m.type && m.type !== "llm") continue;
        const key = m.key || "";
        if (!key || EMBEDDING_RE.test(key)) continue;
        available.push(key);
        for (const inst of m.loaded_instances || []) {
          const id = (inst.id || key).trim();
          if (id && !loaded.includes(id)) loaded.push(id);
        }
      }
    }
  } catch {
    /* fall through to OpenAI /v1/models */
  }

  if (!available.length) {
    try {
      const openAi = await fetch(`${baseUrl}/v1/models`, {
        signal: AbortSignal.timeout(5_000),
      });
      if (openAi.ok) {
        const json = (await openAi.json()) as { data?: Array<{ id?: string }> };
        for (const m of json.data || []) {
          const id = (m.id || "").trim();
          if (!id || EMBEDDING_RE.test(id)) continue;
          available.push(id);
        }
      }
    } catch {
      /* ignore */
    }
  }

  let model: string;
  let source: "env" | "loaded" | "catalog" | "fallback";

  if (!isAutoMode(pinned)) {
    model = pinned;
    source = "env";
  } else if (loaded.length) {
    model = loaded[0]!;
    source = "loaded";
  } else if (available.length) {
    model = available[0]!;
    source = "catalog";
  } else {
    model = "local-model";
    source = "fallback";
  }

  cache = { at: now, model: isAutoMode(pinned) ? model : pinned, loaded, available };
  return { model, source, loaded, available, baseUrl };
}

export function invalidateLlmModelCache() {
  cache = null;
}
