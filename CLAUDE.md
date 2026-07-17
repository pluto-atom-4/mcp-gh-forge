# CLAUDE.md

Guidance for Claude Code (or any AI agent) working in this repository.

## Project

`mcp-gh-forge` is a single-file MCP (Model Context Protocol) server (`index.js`) that
exposes one tool, `run_forge_macro`, to AI terminal assistants (Claude Code, GitHub
Copilot CLI). The tool shells out to a fixed external script
(`$MCP_SCRIPT_DIR/git-orchestrator.sh`) with an `action` + `argument` pair. The AI
cannot run arbitrary commands — only the actions defined in that script
(`consolidate`, `get-changed-files`, `draft-and-save`, `branch-init`,
`branch-cleanup`).

The orchestrator script itself lives outside this repo (default
`~/bin/mcp-git-helpers/git-orchestrator.sh`), overridable via `MCP_SCRIPT_DIR`.

## Commands

```bash
npm start           # run the MCP server (node index.js)
npm run lint         # eslint .
npm run lint:fix      # eslint . --fix
npm run format        # prettier --write .
npm run format:check  # prettier --check .
npm run secretlint     # scan for committed secrets
```

## Tooling in place

- **ESLint 9** (flat config, `eslint.config.js`) + **Prettier** (`.prettierrc.json`),
  wired together via `eslint-config-prettier`.
- **Husky** git hooks:
  - `pre-commit` → `lint-staged` (eslint --fix + prettier --write on staged files)
  - `pre-push` → `npm audit --audit-level=high` + `secretlint`
- **secretlint** (`.secretlintrc.json`, recommend preset) scans for AWS/GCP keys,
  private keys, tokens, etc.
- GitHub Actions: `.github/workflows/ai-code-review.yml` auto-approves own-account
  PRs (does not run tests/lint itself — CI must be added separately for that to mean
  anything as a gate).

## Conventions

- ESM only (`"type": "module"` in package.json) — use `import`, not `require`.
- No test suite exists yet. Don't assume one when reasoning about `npm test`.
- Keep `index.js` as the single entrypoint unless the project's scope grows enough to
  justify splitting it — it is intentionally minimal (see DESIGN.md).
- The `argument` string passed to `run_forge_macro` is shell-interpolated into the
  orchestrator call; any change to that path must preserve the existing quote
  escaping (see `sanitizedArgument` in index.js) to avoid command injection.

## Security notes

- Never widen `run_forge_macro`'s surface to accept freeform shell commands — the
  fixed action enum is the security boundary.
- `MCP_SCRIPT_DIR` and the orchestrator script are trusted, user-controlled, outside
  version control. Don't assume its contents when editing this repo.
