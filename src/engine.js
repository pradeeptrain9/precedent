// Deterministic precedent engine. No LLM, no I/O: same input, same output.
// The Rovo agent only phrases what this returns.

const STOP = new Set(
  'a an and are as at be by for from has have in is it its of on or that the this to was we will with should use using add new not no our can'.split(' ')
);

// Words in a decision record that mean "we said no / moved away from this".
const NEGATIVE = /\b(rejected|reject|declined|superseded|deprecated|do not use|don't use|decided against|will not|won't|abandoned|reverted|rolled back|banned)\b/i;

export function tokens(text = '') {
  const out = new Set();
  for (const w of String(text).toLowerCase().match(/[a-z0-9][a-z0-9.+#-]*/g) || []) {
    if (w.length > 2 && !STOP.has(w)) out.add(w);
  }
  return out;
}

// Share of the work item's terms that the decision also mentions, title terms weighted x2.
export function score(work, decision) {
  const w = tokens(`${work.summary} ${work.description || ''}`);
  if (!w.size) return 0;
  const title = tokens(decision.title);
  const body = tokens(decision.excerpt);
  let hit = 0;
  for (const t of w) hit += title.has(t) ? 2 : body.has(t) ? 1 : 0;
  return Math.min(1, hit / w.size);
}

export function overlap(work, decision) {
  const w = tokens(`${work.summary} ${work.description || ''}`);
  const d = tokens(`${decision.title} ${decision.excerpt}`);
  return [...w].filter((t) => d.has(t)).sort();
}

// Returns decisions ranked by relevance, each flagged CONFLICT or RELATED.
export function findPrecedents(work, decisions, { minScore = 0.25, limit = 5 } = {}) {
  return decisions
    .map((d) => {
      const s = score(work, d);
      const negative = NEGATIVE.test(`${d.title} ${d.excerpt}`);
      return {
        ...d,
        score: Math.round(s * 100) / 100,
        matched: overlap(work, d),
        verdict: negative && s >= minScore ? 'CONFLICT' : 'RELATED',
      };
    })
    .filter((d) => d.score >= minScore)
    .sort((a, b) => (b.verdict === 'CONFLICT') - (a.verdict === 'CONFLICT') || b.score - a.score)
    .slice(0, limit);
}

// Plain-text report the agent/MCP client relays. Fails closed: says "none found", never invents.
export function report(workKey, results, notes = []) {
  if (!results.length) {
    return [`No prior decisions found for ${workKey}.`, ...notes].join('\n');
  }
  const lines = results.map(
    (r) => `- [${r.verdict}] ${r.title} (${r.source}, score ${r.score}, matched: ${r.matched.join(', ')}) ${r.url}`
  );
  const conflicts = results.filter((r) => r.verdict === 'CONFLICT').length;
  return [
    `${workKey}: ${conflicts} possible conflict(s), ${results.length - conflicts} related decision(s).`,
    ...lines,
    ...notes,
  ].join('\n');
}
