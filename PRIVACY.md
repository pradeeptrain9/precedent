# Precedent privacy policy

Last updated: 16 November 2026

Precedent is a Forge app that runs entirely on Atlassian's Forge platform. It has no servers of its own and sends no data outside Atlassian.

## What it reads
- **Jira:** the summary and description of the issue being checked, and issues in the same project resolved as Won't Do, Declined or Won't Fix.
- **Confluence:** titles and search excerpts of pages labelled `decision` or titled with "ADR" or "decision".
- **Teamwork Graph:** the name of the owner (or creator) of a matched decision page.

When you use the Rovo agent or the MCP tools, these reads run as you, so Precedent only sees what you can already see. The issue-created trigger runs as the app and sees only spaces and projects an admin has given it access to.

## What it writes
- A comment on a newly created Jira issue, only when it finds a likely conflict with an earlier decision.

## What it stores
Nothing. Precedent uses no Forge storage. Each request is computed and discarded.

Forge logs keep one line per issue-created check (the issue key and match scores) under Atlassian's standard log retention. They contain no page content or personal data.

## AI
Precedent's matching is fixed rules, not AI. When you use the Rovo agent, Atlassian Rovo phrases the result under your organisation's Rovo terms. Precedent does not call any other AI service.

## Contact
Questions or deletion requests: https://github.com/pradeeptrain9/precedent/issues
