/** Prompt injection patterns blocked before agent tool execution (DT-III.07). */
const INJECTION_PATTERNS: RegExp[] = [
  /ignore\s+(all\s+)?(previous|prior)\s+instructions/i,
  /disregard\s+(the\s+)?system\s+prompt/i,
  /you\s+are\s+now\s+(a\s+)?(?:dan|jailbreak)/i,
  /\bact\s+as\b.*\bwithout\s+restrictions\b/i,
  /reveal\s+(the\s+)?(system|hidden)\s+prompt/i,
  /<\s*script\b/i,
  /\{\{\s*system\s*\}\}/i,
];

export type InjectionScanResult = {
  blocked: boolean;
  reason?: string;
};

export function scanForInjection(text: string): InjectionScanResult {
  const trimmed = text.trim();
  if (!trimmed) return { blocked: false };
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(trimmed)) {
      return { blocked: true, reason: `Blocked pattern: ${pattern.source}` };
    }
  }
  if (trimmed.length > 4000) {
    return { blocked: true, reason: "Message exceeds 4000 characters" };
  }
  return { blocked: false };
}
