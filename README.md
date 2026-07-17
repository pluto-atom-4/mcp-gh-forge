# mcp-gh-forge 🛠️

`mcp-gh-forge` is a lightweight, ultra-minimal Model Context Protocol (MCP) server designed to act as a secure proxy between your AI terminal assistants (**Claude Code** and **GitHub Copilot CLI**) and your local automation workflows.

Instead of forcing your AI model to execute slow, separate, step-by-step commands, `mcp-gh-forge` lets the AI run robust, multi-step **local Git operations** and **cloud GitHub API macros** simultaneously through a single execution layer.

---

## 💎 Features

- **Dual-Universe Automation:** Bridges local workspace operations (Git branches, files, builds) and remote cloud platform operations (GitHub Issues, Pull Requests).
- **Token & Cost Efficiency:** Packs multi-stage developer chores into single-turn executions, slashing LLM context window bloat and API latency.
- **Cross-Platform Compatibility:** Runs identically on **Debian 13** and **Windows 11 (Git Bash)**.
- **Fail-Safe Security Boundary:** The AI cannot execute arbitrary terminal commands. It is bounded strictly to the execution parameter switches defined in your script blueprint directory.

---

## 📂 Project Structure

```text
mcp-gh-forge/
├── index.js             # Core MCP Node.js server bridge
├── package.json         # Node.js module configuration
└── README.md            # Documentation
```

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have [Node.js](https://nodejs.org) (v18+) installed on your local operating system.

### 2. Installation

Clone or navigate into your server folder and set up your project dependencies:

```bash
# Initialize project directory
cd mcp-gh-forge
npm install
```

### 3. Exposing Your Custom Automations

By default, the server expects your automated shell script (`git-orchestrator.sh`) to reside in your local machine's user path (`~/bin/mcp-git-helpers/`).

Make sure your shell scripts are executable (especially on Linux/Debian):

```bash
chmod +x ~/bin/mcp-git-helpers/git-orchestrator.sh
```

---

## 🔌 Linking to Your AI Assistants

To connect `mcp-gh-forge` to **Claude Code**, update your global `~/.claude.json` configuration profile.

### For Debian 13

```json
{
  "mcpServers": {
    "mcp-gh-forge": {
      "command": "node",
      "args": ["/home/yourusername/projects/mcp-gh-forge/index.js"],
      "env": {
        "MCP_SCRIPT_DIR": "/home/yourusername/bin/mcp-git-helpers"
      }
    }
  }
}
```

### For Windows 11 (Git Bash)

_Note: Always use forward slashes (`/`) for paths within your JSON string parameters to ensure seamless cross-platform execution runtime support._

```json
{
  "mcpServers": {
    "mcp-gh-forge": {
      "command": "node",
      "args": ["C:/Users/YourName/projects/mcp-gh-forge/index.js"],
      "env": {
        "MCP_SCRIPT_DIR": "C:/Users/YourName/bin/mcp-git-helpers"
      }
    }
  }
}
```

---

## 🛠️ Expose Actions & Capabilities

Once connected, `mcp-gh-forge` exposes the `run_forge_macro` tool to your interactive terminal sessions. The tool accepts the following parameters:

| Action              | Core Responsibility                               | Expected Argument Parameter              |
| :------------------ | :------------------------------------------------ | :--------------------------------------- |
| `consolidate`       | Pulls issue/PR logs & comments together.          | PR or Issue Number (`45`)                |
| `get-changed-files` | Extracts unique lists of updated files.           | Revision Tag or Git Hash (`v2.1.0`)      |
| `draft-and-save`    | Creates a local MD file & drafts a live GH issue. | Issue Title (`"Bug: Auth Loop Failure"`) |
| `branch-init`       | Safely fetches main & initializes clean branch.   | New Branch Suffix (`"login-fix"`)        |
| `branch-cleanup`    | Hard purges and cleans a dead branch layout.      | Targeted Branch Suffix (`"login-fix"`)   |

---

## 🦾 Usage Example

Launch your interactive assistant inside any active target git repository:

```bash
claude
```

Use natural language commands to kick off your automated multi-step processes:

> _"Use mcp-gh-forge to run get-changed-files for v1.0.4. Analyze the output and write an engine summary changelog."_

> _"Please initialize a new local feature branch using action branch-init for argument user-dashboard-patch."_
