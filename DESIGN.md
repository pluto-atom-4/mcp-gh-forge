# Design

## Goal

Give AI terminal assistants (Claude Code, GitHub Copilot CLI) a way to run
multi-step local Git + remote GitHub operations as a single tool call, instead of
chaining many separate shell commands through the model — cheaper on context/tokens
and faster.

## Architecture

```
AI assistant (Claude Code / Copilot CLI)
        │  MCP stdio transport
        ▼
   index.js  (this repo)
        │  exec("bash <script> <action> <argument>")
        ▼
$MCP_SCRIPT_DIR/git-orchestrator.sh   (external, user-owned, not versioned here)
        │
        ▼
  local git / GitHub CLI (gh) / filesystem
```

`index.js` is intentionally a thin bridge:

1. Registers one MCP tool, `run_forge_macro`, with a JSON-schema-constrained
   `action` enum and a free-text `argument`.
2. On invocation, shells out to a single external orchestrator script, passing
   `action` and a sanitized `argument`.
3. Returns stdout/stderr/exit status back to the model as structured JSON.

## Why a fixed action enum, not arbitrary commands

The MCP tool schema restricts `action` to five named operations
(`consolidate`, `get-changed-files`, `draft-and-save`, `branch-init`,
`branch-cleanup`). This is the security boundary: the AI can pick _which_ of a
fixed set of vetted operations to run and supply one argument, but it cannot
construct or run its own shell command through this server. All actual command
logic lives in `git-orchestrator.sh`, which is outside version control and owned
by whoever deploys the server.

## Why the orchestrator script is external, not bundled

Keeping the script out of this repo means:

- The repo stays a generic, reusable bridge — not tied to one person's git/GitHub
  conventions.
- Users can audit/edit their own automation without touching server code.
- `MCP_SCRIPT_DIR` makes the split explicit and swappable per machine/OS.

## Non-goals

- Not a general-purpose shell-exec MCP server.
- Not a GitHub API client library — the orchestrator script, not `index.js`, talks
  to `gh`/GitHub API.
- No persistent state — each `run_forge_macro` call is a stateless one-shot exec.

## Known trade-offs

- Errors from the orchestrator script are surfaced as data (`success: false`) rather
  than thrown MCP errors, so the model sees failures without the transport erroring.
- `argument` is a single string, not structured input — action-specific parsing
  happens inside the shell script, not in `index.js`.
