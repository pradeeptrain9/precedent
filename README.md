# Precedent

Flags Jira work that revisits an earlier team decision. A fixed-rule engine (`src/engine.js`, no LLM) scores Confluence decision pages and Jira issues resolved as Won't Do against the work item; Rovo only phrases the result.

- **Rovo agent** `Precedent`: ask "Has PROJ-123 already been decided?"
- **Rovo actions / MCP tools**: `find-precedent` (issue key), `check-conflict` (free text)
- **Trigger**: on issue create, comments only when a CONFLICT is found

## Setup after install

1. Install on Jira **and** Confluence (same site).
2. In each Confluence space that holds decisions: Space settings → Users → Add people and agents → `precedent` (App) → role **Viewer**. Without this the create-issue comment finds nothing (it searches as the app); Rovo chat works without it (it searches as the user). Allow ~1 minute to take effect.
3. Decision pages are found by label `decision` or a title containing "ADR" or "decision".

## Dev

```bash
export PATH=/opt/homebrew/opt/node@24/bin:$PATH   # Forge CLI needs Node 22/24
npm test
forge deploy -e development
forge logs -e development -s 10m
```
