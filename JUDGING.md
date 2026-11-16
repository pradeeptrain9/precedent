# Testing Precedent (for judges)

Precedent warns when new Jira work revisits a decision your team already made, and tells you who owns that decision.

## 1. Install (about 2 minutes, site admin)

**[Install Precedent](https://developer.atlassian.com/console/install/7b13220c-82e5-4ca1-b2ec-af9a328c0f72?signature=AYABeOIP6aViSP%2FmPK13tXsJI3sAAAADAAdhd3Mta21zAEthcm46YXdzOmttczp1cy13ZXN0LTI6NzA5NTg3ODM1MjQzOmtleS83MDVlZDY3MC1mNTdjLTQxYjUtOWY5Yi1lM2YyZGNjMTQ2ZTcAuAECAQB4CxqLTo9l4lqXuFjNim1xJM%2Bp%2F3TVP9xHS2BrU5DRRucBxr0Qqi1wdsVrFbciEZDY6AAAAH4wfAYJKoZIhvcNAQcGoG8wbQIBADBoBgkqhkiG9w0BBwEwHgYJYIZIAWUDBAEuMBEEDJeWzrI0tf7F6Z2BuAIBEIA7DZsXPJLUFAVA1Z07VaYPZA7BpNJkXFfm5hWzzh7vZvpual1M1B%2FfO8kwd6NDJYhM3hhXE0nDMsirZnUAB2F3cy1rbXMAS2Fybjphd3M6a21zOmV1LXdlc3QtMTo3MDk1ODc4MzUyNDM6a2V5LzQ2MzBjZTZiLTAwYzMtNGRlMi04NzdiLTYyN2UyMDYwZTVjYwC4AQICAHi9bVMAkme4qVQX1fQHo6ePw3H40A7cGfz7yrmSfBWMXgGmSMPANnmy5fcBQoTaRgOiAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMY%2FaBH247EAweJVNHAgEQgDtVm7%2BARDAEtcB0s7%2FiH%2BP%2FkImrplrSbuRb79f8Tkd4HTIxx10EnAhlgHVpC%2Bw0E4p7FtXjnzf7rJL1vgAHYXdzLWttcwBLYXJuOmF3czprbXM6dXMtZWFzdC0xOjcwOTU4NzgzNTI0MzprZXkvNmMxMjBiYTAtNGNkNS00OTg1LWI4MmUtNDBhMDQ5NTJjYzU3ALgBAgIAeDYASx0XCjkny4iLV6vz%2BKtEGSGT6kdt0QRpkn6D%2FlVEAUqj%2FlkAasEa6HjXuqDR8oQAAAB%2BMHwGCSqGSIb3DQEHBqBvMG0CAQAwaAYJKoZIhvcNAQcBMB4GCWCGSAFlAwQBLjARBAwQf%2BPmhJubBCrj%2BaUCARCAO3WehBPsc%2BmKJrKDp6K%2B8uI2uc8Qa4F6MG4kdbX6JD%2B4CHSvmnRkJr68fdw7QR1TLvq7oF16R4FsvRziAgAAAAAMAAAQAAAAAAAAAAAAAAAAAOi6dGrp%2FRMJzJKtzYwDsQn%2F%2F%2F%2F%2FAAAAAQAAAAAAAAAAAAAAAQAAADJdBj%2Baex5O3%2BATQ8nIeGVhjFudRYREyS5xth%2FUUpW4OAdlmYpglOlJN94Vs8N7H8J9oF2J8yYwtJ9PM0ZaJ1Yk3us%3D&product=jira&product=confluence)**

1. Open the link and select **Get app**.
2. Choose your site, **tick Confluence** under "additional Atlassian apps", and select **Install**. Precedent reads decision pages from Confluence, so it needs both.

Rovo chat needs a site with Rovo (any paid plan, or a Forge demo site from `forge site provision`). The automatic Jira comment works without Rovo.

## 2. Give Precedent read access to your decisions (1 minute)

In the Confluence space where you will put the decision page:
**Space settings → Users → Add people and agents → `precedent` (App) → role Viewer → Add → Save.**

This only matters for the automatic comment, which runs as the app. Allow about two minutes for it to take effect. If the picker shows more than one `precedent` app (possible after a reinstall), add each one. The newest install uses its own account.

## 3. Create a decision (1 minute)

In that space, create a page titled:

> **ADR-12: PostgreSQL for orders service, MongoDB rejected**

Body:

> Status: Decided. We rejected MongoDB for the orders service because checkout needs multi-document transactions and a strict schema. Do not use MongoDB for orders; use PostgreSQL.

Any page labelled `decision`, or with "ADR" or "decision" in the title, counts.

## 4. See it work

**A. Automatic warning (no Rovo needed).** In any Jira software project, create an issue:

> Summary: **Migrate orders service to MongoDB**
> Description: Move the orders service from PostgreSQL to MongoDB.

Within a few seconds, Precedent comments with a **CONFLICT** that links ADR-12 and lists the words it matched on. Jira can skip events for the first minute or two after an install; if no comment appears, create the issue again.

**B. Rovo agent + Teamwork Graph.** Open Rovo chat, choose the **Precedent** agent, and ask:

> Has <your issue key> already been decided? Who owns that decision?

It answers with the conflicting decision, the link, and the **owner** (looked up through Teamwork Graph).

You can also check an idea before filing it:

> Does this proposal contradict an earlier decision: "use MongoDB for orders"?

**C. MCP (optional).** A site admin can expose the tools to outside AI clients under admin.atlassian.com → Apps → Sites → your site → Connected apps → Precedent → enable tools. Then add `https://mcp.atlassian.com/forge/7b13220c-82e5-4ca1-b2ec-af9a328c0f72` as a remote MCP server in an MCP client. The tools are `find-precedent` and `check-conflict`.

## Notes
- No data is stored. See [PRIVACY.md](PRIVACY.md).
- Matching is fixed rules, not AI, so the same input always gives the same result. Rovo only phrases the answer and is told never to invent decisions.
- Support: https://github.com/pradeeptrain9/precedent/issues
