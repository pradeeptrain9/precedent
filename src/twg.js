import api from '@forge/api';

// Teamwork Graph: who owns each matched decision page, so Precedent can say who to ask.
// Curated queries only (no persisted Cypher). requestTeamworkGraph exists on asUser() only,
// so this runs in Rovo actions, not in the issue trigger.

const OWNERS = `query precedent_pageOwners($id: ID!) {
  confluencePageOwners(id: $id, first: 3) { edges { node { ... on AtlassianUser { name } } } }
  confluencePageCreator(id: $id, first: 1) { edges { node { ... on AtlassianUser { name } } } }
}`;

// HTTP 200 is not success on this API: need data and no errors.
async function twg(query, variables, operationName) {
  try {
    const res = await api.asUser().requestTeamworkGraph(query, variables, operationName);
    const json = await res.json().catch(() => null);
    if (res.status >= 400 || json?.errors?.length || !json?.data) {
      return { ok: false, error: json?.errors?.[0]?.message?.slice(0, 120) || `HTTP ${res.status}` };
    }
    return { ok: true, data: json.data };
  } catch (e) {
    return { ok: false, error: String(e?.message || e).slice(0, 120) };
  }
}

const names = (conn) => (conn?.edges || []).map((e) => e?.node?.name).filter(Boolean);

export function cloudIdFrom(payload, context) {
  if (payload?.context?.cloudId) return payload.context.cloudId;
  if (context?.cloudId) return context.cloudId;
  return /site\/([0-9a-f-]{36})/.exec(context?.installContext || '')?.[1] || null;
}

// Adds `owner` to Confluence results in place. Returns notes (empty on success).
export async function addOwners(results, cloudId) {
  const pages = results.filter((r) => r.source === 'confluence' && r.pageId);
  if (!pages.length) return [];
  if (!cloudId) return ['Note: decision owners unavailable (no site id).'];
  const out = await Promise.all(
    pages.map((r) => twg(OWNERS, { id: `ari:cloud:confluence:${cloudId}:page/${r.pageId}` }, 'precedent_pageOwners'))
  );
  let failed = 0;
  out.forEach((res, i) => {
    if (!res.ok) return failed++;
    const owners = names(res.data.confluencePageOwners);
    pages[i].owner = (owners.length ? owners : names(res.data.confluencePageCreator)).join(', ') || undefined;
  });
  if (failed) console.log(`twg owners: ${failed}/${pages.length} failed: ${out.find((r) => !r.ok).error}`);
  return failed ? [`Note: Teamwork Graph owner lookup failed for ${failed} decision(s).`] : [];
}
