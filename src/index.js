import api, { route } from '@forge/api';
import { findPrecedents, report } from './engine.js';
import { getWork, confluenceDecisions, rejectedIssues } from './sources.js';
import { addOwners, cloudIdFrom } from './twg.js';

async function run(issueKey, as) {
  const work = await getWork(issueKey, as);
  const [conf, jira] = await Promise.all([confluenceDecisions(as), rejectedIssues(work, as)]);
  const results = findPrecedents(work, [...conf.items, ...jira.items]);
  return { work, results, notes: [...conf.notes, ...jira.notes] };
}

// Rovo action + MCP tool: find-precedent (GET). Falls back to the issue the user is viewing.
export async function findPrecedent(payload, context) {
  const issueKey = payload.issueKey || payload.context?.jira?.issueKey;
  if (!issueKey) return 'Tell me which Jira issue to check, for example PROJ-123.';
  try {
    const { results, notes } = await run(issueKey, 'user');
    notes.push(...(await addOwners(results, cloudIdFrom(payload, context))));
    return report(issueKey, results, notes);
  } catch (e) {
    return `Precedent check failed: ${e.message}`;
  }
}

// Rovo action + MCP tool: check-conflict (GET) on free text, before an issue exists.
export async function checkConflict(payload, context) {
  const text = String(payload.proposal || '').slice(0, 2000);
  if (!text.trim()) return 'Describe the proposal to check.';
  const conf = await confluenceDecisions('user');
  const results = findPrecedents({ summary: text }, conf.items);
  const notes = [...conf.notes, ...(await addOwners(results, cloudIdFrom(payload, context)))];
  return report('proposal', results, notes);
}

// Trigger: on issue create, comment only when a CONFLICT exists (no noise on RELATED).
export async function onIssueCreated(event) {
  const issueKey = event.issue?.key;
  if (!issueKey) return;
  const { results, notes } = await run(issueKey, 'app');
  console.log(`precedent ${issueKey}: ${results.map((r) => `${r.verdict}:${r.score}`).join(',') || 'none'} ${notes.join(' ')}`);
  if (!results.some((r) => r.verdict === 'CONFLICT')) return;
  const text = `Precedent: this may revisit an earlier decision.\n${report(issueKey, results, notes)}`;
  const res = await api.asApp().requestJira(route`/rest/api/3/issue/${issueKey}/comment`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      body: {
        type: 'doc',
        version: 1,
        content: text.split('\n').map((line) => ({ type: 'paragraph', content: [{ type: 'text', text: line }] })),
      },
    }),
  });
  if (!res.ok) console.error(`Comment on ${issueKey} failed: HTTP ${res.status}`);
}
