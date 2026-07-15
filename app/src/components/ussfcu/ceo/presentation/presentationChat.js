// Scripted, deterministic Q&A resolver for the Presentation Mode chat.
// Consistent with the rest of the prototype (no live LLM). Reuses the matching
// technique from hooks/useChatFlow.js — exact/alias match, then a keyword-scored
// fallback with stopword filtering — scoped to the current slide first, then
// global, so nothing is unanswerable regardless of which slide is showing.
import bank from '../../../../data/ussfcu/ceo/presentationChat.json';

// Slide index → bank key. MUST match the SLIDES order in PresentationMode.jsx.
export const SLIDE_IDS = ['situational', 'evidence', 'trajectory', 'assurance', 'members', 'resolution', 'nextSteps'];

export const slideIdForIndex = (idx) => SLIDE_IDS[idx] || SLIDE_IDS[0];

const STOPWORDS = new Set([
  'the', 'a', 'an', 'is', 'are', 'to', 'for', 'of', 'on', 'in', 'at', 'me', 'my', 'our', 'i',
  'what', 'show', 'tell', 'give', 'about', 'this', 'that', 'these', 'those', 'it', 'can',
  'do', 'does', 'please', 'some', 'any', 'how', 'why', 'where', 'which', 'who', 'and', 'or', 'but',
  'us', 'we', 'you', 'your',
]);

function shape(q, extra = {}) {
  return {
    id: q.id,
    q: q.q,
    a: q.a,
    sources: q.sources || [],
    confidence: q.confidence,
    followups: q.followups || [],
    action: q.action || null,
    ...extra,
  };
}

// Every question object with its bank origin, current slide first.
function pool(slideId) {
  const slideQs = bank.slides[slideId]?.questions || [];
  return [...slideQs, ...bank.global.questions];
}

export function greeting() {
  return bank.global.greeting;
}

export function suggestionsFor(slideId) {
  return bank.slides[slideId]?.suggested || bank.global.default.followups;
}

// Look up a question by id across every bank (used for click-seeded questions).
export function findById(id) {
  const all = [...bank.global.questions, ...Object.values(bank.slides).flatMap((s) => s.questions || [])];
  const q = all.find((x) => x.id === id);
  return q ? shape(q) : null;
}

// Resolve free text (or a chip / suggested question) → an answer object.
export function resolve(text, slideId) {
  const norm = (text || '').toLowerCase().trim();
  const candidates = pool(slideId);

  // 1) exact match on the canonical question or an alias
  for (const q of candidates) {
    if (q.q.toLowerCase() === norm) return shape(q);
    if ((q.aliases || []).some((a) => a.toLowerCase() === norm)) return shape(q);
  }

  // 2) alias substring match (either direction), like useChatFlow's partial pass
  for (const q of candidates) {
    for (const a of q.aliases || []) {
      const al = a.toLowerCase();
      if (al.length > 2 && (norm.includes(al) || al.includes(norm))) return shape(q);
    }
  }

  // 3) keyword-scored fallback — slide-scoped candidates come first, so ties
  //    favor the current slide (strict > keeps the earlier/slide match).
  const words = norm.split(/\W+/).filter((w) => w.length > 2 && !STOPWORDS.has(w));
  if (words.length > 0) {
    let best = null;
    let bestScore = 0;
    for (const q of candidates) {
      const corpus = `${q.q} ${(q.aliases || []).join(' ')} ${(q.keywords || []).join(' ')} ${q.a}`.toLowerCase();
      let score = 0;
      for (const w of words) if (corpus.includes(w)) score += 1;
      if (score > bestScore) { bestScore = score; best = q; }
    }
    const minScore = words.length <= 2 ? 1 : 2;
    if (best && bestScore >= minScore) return shape(best);
  }

  // 4) graceful default — never a dead end
  return shape(
    { id: '__default__', q: text, a: bank.global.default.a, followups: bank.global.default.followups },
    { isDefault: true },
  );
}
