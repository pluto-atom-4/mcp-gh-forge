#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { exec } from "child_process";
import path from "path";

// 1. Initialize the MCP Server with your custom name
const server = new Server(
  { name: "mcp-gh-forge", version: "1.0.0" },
  { capabilities: { tools: {} } }
);

// Resolve the directory where your custom shell scripts live
const SCRIPT_DIR =
  process.env.MCP_SCRIPT_DIR ||
  path.join(process.env.HOME || process.env.USERPROFILE, "bin", "mcp-git-helpers");

// 2. Define the schema to expose your shell script macro runner to the AI agent
server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: [
    {
      name: "run_forge_macro",
      description:
        "Executes powerful multi-step local Git and cloud GitHub automated scripts (consolidate, get-changed-files, draft-and-save, branch-init, branch-cleanup).",
      inputSchema: {
        type: "object",
        properties: {
          action: {
            type: "string",
            enum: [
              "consolidate",
              "get-changed-files",
              "draft-and-save",
              "branch-init",
              "branch-cleanup",
            ],
            description: "The targeted script action block to execute.",
          },
          argument: {
            type: "string",
            description:
              "The parameter required by the action (e.g., Issue title, PR number, commit revision hash).",
          },
        },
        required: ["action", "argument"],
      },
    },
  ],
}));

// 3. Handle execution requests passed down by Claude Code or Copilot CLI
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name !== "run_forge_macro") {
    throw new Error(`Tool ${request.params.name} not found`);
  }

  const { action, argument } = request.params.arguments;
  const scriptPath = path.join(SCRIPT_DIR, "git-orchestrator.sh");

  // Clean double-quotes from the argument to prevent shell injection vulnerabilities
  const sanitizedArgument = argument.replace(/"/g, '\\"');

  // Format the command execution cleanly across Debian and Windows Git Bash
  const command = `bash "${scriptPath}" "${action}" "${sanitizedArgument}"`;

  return new Promise((resolve) => {
    exec(command, (error, stdout, stderr) => {
      resolve({
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                success: !error,
                stdout: stdout.trim(),
                stderr: stderr.trim(),
                error: error ? error.message : null,
              },
              null,
              2
            ),
          },
        ],
      });
    });
  });
});

// 4. Establish a standard Input/Output (stdio) bridge with the client
const transport = new StdioServerTransport();
await server.connect(transport);
