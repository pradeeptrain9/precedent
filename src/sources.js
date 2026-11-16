import api, { route } from '@forge/api';

// Fetchers return { items, notes }. A failed source adds a note instead of
// silently returning [] so the agent can say the answer may be incomplete.

export async function getWork(issueKey, as = 'user') {
  const res = await api[as === 'app' ? 'asApp' : 'asUser']().requestJira(
    route`/rest/api/3/issue/${issueKey}?fields=summary,description,project`
  );
  if (!res.ok) throw new Error(`Could not read ${issueKey} (HTTP ${res.status})`);
  const { fields } = await res.json();
  return { key: issueKey, summary: fields.summary, description: adfText(fields.description), project: fields.project?.key };
}

// Confluence decision records: labelled "decision" or titled ADR/decision (teams rarely label consistently).
export async function confluenceDecisions(as = 'user', limit = 50) {
  const cql = 'type = page and (label = "decision" or title ~ "ADR" or title ~ "decision") order by lastmodified desc';
  const res = await api[as === 'app' ? 'asApp' : 'asUser']().requestConfluence(
    route`/wiki/rest/api/search?cql=${cql}&limit=${limit}&excerpt=highlight`
  );
  if (!res.ok) return { items: [], notes: [`Note: Confluence search failed (HTTP ${res.status}); results may be incomplete.`] };
  const json = await res.json();
  return {
    items: (json.results || []).map((r) => ({
      source: 'confluence',
      pageId: r.content?.id,
      title: r.content?.title || r.title,
      excerpt: (r.excerpt || '').replace(/@@@(end)?hl@@@/g, ''),
      url: `${json._links?.base || ''}${r.url || r.content?._links?.webui || ''}`,
    })),
    notes: [],
  };
}

// Resolved Jira issues in the same project resolved as Won't Do / Declined: earlier "no" decisions.
export async function rejectedIssues(work, as = 'user', limit = 50) {
  const jql = `project = "${work.project}" AND key != ${work.key} AND statusCategory = Done AND resolution in ("Won't Do", "Declined", "Won't Fix") ORDER BY updated DESC`;
  const res = await api[as === 'app' ? 'asApp' : 'asUser']().requestJira(route`/rest/api/3/search/jql`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jql, maxResults: limit, fields: ['summary', 'description', 'resolution'] }),
  });
  if (!res.ok) return { items: [], notes: [`Note: Jira search failed (HTTP ${res.status}); results may be incomplete.`] };
  const json = await res.json();
  return {
    items: (json.issues || []).map((i) => ({
      source: 'jira',
      title: `${i.key} ${i.fields.summary}`,
      // resolution text marks it negative for the engine
      excerpt: `rejected (${i.fields.resolution?.name}). ${adfText(i.fields.description)}`.slice(0, 600),
      url: `/browse/${i.key}`,
    })),
    notes: [],
  };
}

// Flatten Atlassian Document Format to plain text.
export function adfText(node) {
  if (!node) return '';
  if (typeof node === 'string') return node;
  if (node.text) return node.text;
  return (node.content || []).map(adfText).join(' ');
}
