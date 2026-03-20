const HIGH_SEVERITY_PATTERNS = [
  /\bkill\s*(my|him|her|them)?self\b/i,
  /\bsuicid(e|al)\b/i,
  /\bself[- ]?harm\b/i,
  /\bcut(ting)?\s*(my|him|her)?self\b/i,
  /\bend\s*(my|it|this)\s*life\b/i,
  /\bwant\s*to\s*die\b/i,
  /\bbetter\s*off\s*dead\b/i,
  /\bno\s*reason\s*to\s*live\b/i,
  /\bplan\s*to\s*(end|kill|hurt)\b/i,
  /\boverdose\b/i,
  /\bjump(ing)?\s*(off|from)\b/i,
  /\bhang(ing)?\s*myself\b/i,
  /\bslit\s*(my)?\s*wrist/i,
  /\bactive\s*danger\b/i,
];

const LOW_SEVERITY_PATTERNS = [
  /\bhopeless(ness)?\b/i,
  /\bdespair\b/i,
  /\bworthless\b/i,
  /\bno\s*point\b/i,
  /\bcan'?t\s*go\s*on\b/i,
  /\bgive\s*up\b/i,
  /\bdon'?t\s*care\s*anymore\b/i,
  /\bexhausted\s*of\s*(life|living|everything)\b/i,
  /\bnumb\b/i,
  /\bempty\s*inside\b/i,
  /\bno\s*one\s*cares\b/i,
  /\bburden\s*(to|on)\b/i,
  /\bwish\s*i\s*wasn'?t\s*here\b/i,
];

export const CRISIS_RESPONSE_HIGH =
  "I hear you. What you're carrying right now is too heavy to carry alone. Please reach out to the 988 Suicide and Crisis Lifeline \u2014 call or text 988. You matter, and real support is there right now.";

export function detectCrisis(content: string): {
  crisis: boolean;
  severity: "low" | "high";
} {
  const text = content.toLowerCase();

  for (const pattern of HIGH_SEVERITY_PATTERNS) {
    if (pattern.test(text)) {
      return { crisis: true, severity: "high" };
    }
  }

  for (const pattern of LOW_SEVERITY_PATTERNS) {
    if (pattern.test(text)) {
      return { crisis: true, severity: "low" };
    }
  }

  return { crisis: false, severity: "low" };
}
