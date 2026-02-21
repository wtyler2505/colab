# MCP Server Reference

Complete reference for all Model Context Protocol servers available in this workspace. Servers are split into two categories: **local stdio** servers (running on your machine via `.mcp.json` configs) and **cloud-hosted** servers (connected through Claude.ai).

---

## Local Stdio Servers

These run as local processes on your machine. Configured via project-level (`/home/wtyler/colab/.mcp.json`) or global-level (`/home/wtyler/.mcp.json`) config files.

---

### Context7

| | |
|---|---|
| **Type** | Local stdio |
| **Config** | Project-level (`.mcp.json`) + Global-level (`~/.mcp.json`) |
| **Package** | `@upstash/context7-mcp` |
| **Purpose** | Fetches up-to-date library documentation and code examples for any programming library or framework. Prevents stale training-data answers. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `resolve-library-id` | Resolves a package name to a Context7-compatible library ID. **Must be called before `get-library-docs`** unless the user provides a `/org/project` ID directly. |
| `get-library-docs` | Retrieves current documentation and code snippets for a resolved library. Supports topic filtering and token limits. |

**Usage Notes:**
- The project-level config uses `npx` with an API key; the global config uses a locally installed Node module. Both provide the same functionality.
- Max 3 calls to `resolve-library-id` per question. If not found after 3, use the best result.
- Max 3 calls to `get-library-docs` per question. Synthesize from what you get.
- Be specific in queries: "How to set up JWT auth in Express.js" not just "auth".

---

### Desktop Commander

| | |
|---|---|
| **Type** | Local stdio |
| **Config** | Global-level (`~/.mcp.json`) |
| **Purpose** | Full filesystem access, process management, and search. Bypasses Claude Code's permission restrictions on sensitive files (`.env`, `.mcp.json`, credentials). |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `read_file` | Read file contents, supports offset/length for partial reads, images, and URLs. |
| `read_multiple_files` | Read multiple files simultaneously. |
| `write_file` | Write or append to files. Chunk in 25-30 line blocks. |
| `edit_block` | Surgical text replacement in files (find and replace). |
| `create_directory` | Create directories (supports nested). |
| `list_directory` | Detailed directory listing with depth control. |
| `move_file` | Move or rename files and directories. |
| `get_file_info` | File metadata: size, timestamps, permissions, line count. |
| `start_search` | Streaming file or content search with regex/literal support. |
| `get_more_search_results` | Paginate through search results. |
| `stop_search` | Cancel an active search. |
| `start_process` | Start a terminal process (Python REPL, shell commands, etc.). |
| `interact_with_process` | Send input to a running process and get response. |
| `read_process_output` | Read output from a running process. |
| `force_terminate` | Kill a running terminal session. |
| `list_sessions` | List all active terminal sessions. |
| `list_processes` | List all running system processes. |
| `kill_process` | Terminate a process by PID. |
| `get_config` / `set_config_value` | Read/write server configuration. |

**Usage Notes:**
- **Mandatory** for any operation on sensitive files (`.env`, `.mcp.json`, credentials, API keys). Claude Code's permission system blocks these; Desktop Commander does not.
- **Mandatory** for all `rm -rf` operations.
- Always use absolute paths.
- For data analysis: `start_process("python3 -i")` then `interact_with_process` for pandas/numpy workflows.

---

### FileScopeMCP

| | |
|---|---|
| **Type** | Local stdio |
| **Config** | Global-level (`~/.mcp.json`) |
| **Purpose** | File tree analysis with importance ranking, dependency tracking, and Mermaid diagram generation. Currently configured for `multi-controller-app`. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `create_file_tree` / `select_file_tree` | Create or load a file tree configuration. |
| `list_files` | List all files with their importance rankings. |
| `find_important_files` | Find the most important files by score threshold. |
| `get_file_importance` / `set_file_importance` | Read or manually set a file's importance (0-10). |
| `get_file_summary` / `set_file_summary` | Read or set a file's summary text. |
| `read_file_content` | Read file content through FileScopeMCP. |
| `recalculate_importance` | Recalculate all importance values based on dependencies. |
| `generate_diagram` | Generate Mermaid diagrams (dependency, directory, hybrid, package-deps). |
| `exclude_and_remove` | Exclude a file/pattern from the tree. |
| `toggle_file_watching` | Enable/disable file system watching. |

**Usage Notes:**
- Base directory is currently set to `/home/wtyler/multi-controller-app`.
- File watching is disabled by default (`FILE_WATCHING_ENABLED=false`).
- Min importance score filter set to 6; max results capped at 25 with pagination enabled.

---

### Clear Thought (Local)

| | |
|---|---|
| **Type** | Local stdio |
| **Config** | Global-level (`~/.mcp.json`) |
| **Purpose** | Unified structured reasoning engine. Provides 20+ reasoning operations including sequential thinking, mental models, debugging approaches, decision frameworks, tree-of-thought, and more. Supports code execution. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `clear_thought` | Single unified tool accepting an `operation` parameter. Operations include: `sequential_thinking`, `mental_model`, `debugging_approach`, `creative_thinking`, `scientific_method`, `decision_framework`, `systems_thinking`, `tree_of_thought`, `beam_search`, `mcts`, `graph_of_thought`, `optimization`, `ethical_analysis`, `code_execution`, `notebook_create/add_cell/run_cell/export`, and many more. |

**Usage Notes:**
- Code execution is enabled (`ALLOW_CODE_EXECUTION=true`).
- Notebooks directory: `~/.gemini/extensions/clear-thought/srcbook-notebook-examples`.
- Use for complex debugging with multiple hypotheses, architecture decisions, multi-step planning, or comparing 3+ approaches.
- Do **not** use for simple single-step tasks.

---

### Memory

| | |
|---|---|
| **Type** | Local stdio |
| **Config** | Global-level (`~/.mcp.json`) |
| **Purpose** | Persistent knowledge graph for storing entities, relations, and observations across sessions. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `create_entities` | Create new entities in the knowledge graph. |
| `create_relations` | Create relations between entities (active voice). |
| `add_observations` | Add observations to existing entities. |
| `delete_entities` | Delete entities and their associated relations. |
| `delete_observations` | Delete specific observations from entities. |
| `delete_relations` | Delete specific relations. |
| `read_graph` | Read the entire knowledge graph. |
| `search_nodes` | Search nodes by query against names, types, and observations. |
| `open_nodes` | Retrieve specific nodes by name. |

**Usage Notes:**
- Max response tokens set to 20,000; pagination size 50.
- Store key decisions, architectural choices, and non-trivial bug solutions for future sessions.
- Call at session start to recall user preferences and project context.

---

### Arduino CLI MCP

| | |
|---|---|
| **Type** | Local stdio |
| **Config** | Global-level (`~/.mcp.json`) |
| **Purpose** | Arduino board management, compilation, and uploading via `arduino-cli`. Configured for the `multi-controller-app` project. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `upload` | Upload compiled sketch to a connected Arduino board. (Auto-approved) |
| `compile` | Compile an Arduino sketch. (Auto-approved) |
| `install_board` | Install board support packages. (Auto-approved) |

**Usage Notes:**
- Working directory: `/home/wtyler/multi-controller-app`.
- Arduino CLI binary expected at `/home/wtyler/arduino-cli` (added to PATH).
- Upload, compile, and install_board are auto-approved (no confirmation prompt).

---

## Cloud-Hosted Servers

These are connected through Claude.ai and run on remote infrastructure. No local configuration needed.

---

### Notion

| | |
|---|---|
| **Type** | Cloud-hosted (Claude.ai) |
| **Purpose** | Full Notion workspace integration: search, read/write pages, manage databases, comments, and teams. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `search` | Semantic search across Notion workspace and connected sources (Slack, Google Drive, GitHub, Jira, Teams, etc.). Supports date and creator filters. |
| `fetch` | Retrieve full page/database content by URL or ID. Returns enhanced Markdown. |
| `notion-create-pages` | Create one or more pages under a parent page or database. |
| `notion-update-page` | Update page properties or content (replace, insert, range replace). |
| `notion-move-pages` | Move pages/databases to a new parent. |
| `notion-duplicate-page` | Duplicate a page (async). |
| `notion-create-database` | Create a new database with a property schema. |
| `notion-update-data-source` | Update database properties, schema, or title. |
| `notion-create-comment` | Add comments to pages or specific content. |
| `notion-get-comments` | Retrieve discussion threads from pages. |
| `notion-get-teams` | List teamspaces in the workspace. |
| `notion-get-users` | List workspace members and guests. |

**Usage Notes:**
- Always `fetch` a database first to get data source IDs before creating pages in it.
- Page content uses Notion-flavored Markdown. Fetch `notion://docs/enhanced-markdown-spec` for the full spec.
- Date properties require expanded format: `date:{property}:start`, `date:{property}:end`, `date:{property}:is_datetime`.

---

### Mermaid Chart

| | |
|---|---|
| **Type** | Cloud-hosted (Claude.ai) |
| **Purpose** | Render and validate Mermaid diagrams, generate titles and summaries. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `validate_and_render_mermaid_diagram` | Render a Mermaid diagram from code. Returns image on success, error details on failure. |
| `get_diagram_title` | Generate a descriptive title for a diagram. |
| `get_diagram_summary` | Generate a 2-4 sentence summary of a diagram. |
| `list_tools` | List all available MCP servers and tools. |

**Usage Notes:**
- Requires `mermaidCode`, `prompt`, `diagramType`, and `clientName` parameters.
- Validation happens automatically during rendering; no separate validation step needed.

---

### BrainGrid

| | |
|---|---|
| **Type** | Cloud-hosted (Claude.ai) |
| **Purpose** | AI-powered project management: requirements, task breakdown, implementation workflows, and acceptance reviews. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `get_project` | Discover or fetch a project ID. Reads `.braingrid/project.json` locally. |
| `get_profile` | Get current user profile and organization info. |
| `create_project_requirement` | Create a requirement from a brief prompt using AI refinement. |
| `capture_project_requirement` | Capture a pre-written, fully-formed requirement. |
| `breakdown_project_requirement` | Break a requirement into implementation tasks via AI. |
| `list_project_requirements` | List requirements with optional status filter. |
| `get_project_requirement` | Get detailed requirement info. |
| `update_project_requirement` | Update requirement status, name, description, or assignee. |
| `list_project_tasks` / `get_project_task` | List or get task details. |
| `create_project_task` / `update_project_task` / `delete_project_task` | CRUD operations on tasks. |
| `build_project_requirement` | Guided implementation workflow for a requirement's tasks. |
| `create_git_branch` | Create a GitHub branch for a requirement. |
| `acceptance_review` | AI-powered PR review against a requirement. |

**Usage Notes:**
- All tools require `project_id`. Read it from `.braingrid/project.json`; if missing, call `get_project` first.
- `build_project_requirement` is the main workflow tool. It retrieves tasks and guides implementation, automatically updating task statuses via `update_project_task`.

---

### Hugging Face

| | |
|---|---|
| **Type** | Cloud-hosted (Claude.ai) |
| **Purpose** | ML research, model discovery, documentation, and running inference via Hugging Face Spaces. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `paper_search` | Semantic search for ML research papers. |
| `hub_repo_search` | Search models, datasets, and spaces. |
| `hub_repo_details` | Get details for specific repos (auto-detects type). |
| `space_search` | Semantic search for HF Spaces (supports MCP-only filter). |
| `dynamic_space` | Discover, view parameters, and invoke HF Spaces for tasks (image gen, OCR, TTS, etc.). |
| `hf_doc_search` / `hf_doc_fetch` | Search and fetch Hugging Face library documentation. |
| `hf_hub_community` | Community API: profiles, followers, discussions, PRs, collections. |
| `hf_whoami` | Get authenticated user info. |

**Usage Notes:**
- Authenticated as user `wtyler2505`.
- Use for AI/ML features and research only, not general development.
- `dynamic_space` supports discover/view_parameters/invoke operations for running models without local setup.

---

### GitHubMCP

| | |
|---|---|
| **Type** | Cloud-hosted (Claude.ai) |
| **Purpose** | Full GitHub integration: repositories, issues, pull requests, branches, tags, code search, and file management. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `search_repositories` / `get_repository` | Search for or get details of GitHub repos. |
| `search_code` | Search code across GitHub repositories. |
| `search_users` | Search GitHub users. |
| `list_issues` / `get_issue` / `create_issue` / `update_issue` | Full issue CRUD. |
| `get_issue_comments` / `add_issue_comment` | Issue comment management. |
| `list_pull_requests` / `get_pull_request` / `create_pull_request` / `update_pull_request` / `merge_pull_request` | Full PR lifecycle. |
| `get_pull_request_files` / `get_pull_request_status` / `get_pull_request_comments` | PR inspection. |
| `get_pull_request_review_comments` / `create_pull_request_review_comment` | Line-level code review comments. |
| `get_file_contents` / `create_or_update_file` / `push_files` | File operations on GitHub. |
| `list_branches` / `create_branch` / `list_tags` / `get_tag` | Branch and tag management. |
| `list_commits` / `get_commit` | Commit history. |
| `create_repository` / `fork_repository` | Repo creation and forking. |

**Usage Notes:**
- Prefer `gh` CLI (via Bash) for local git operations. Use GitHubMCP for remote GitHub API operations.
- `get_file_contents` has two modes: `overview` (truncated preview) and `full` (complete file).
- `push_files` allows pushing multiple files in a single commit.

---

### Clear-ThoughtMCP (Cloud)

| | |
|---|---|
| **Type** | Cloud-hosted (Claude.ai) |
| **Purpose** | Flexible chain-of-thought reasoning with branching, revision, and hypothesis verification. Lighter-weight than the local Clear Thought server. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `clear_thought` | Dynamic thinking steps with adjustable depth, branching, and revision. Supports forward thinking (1 to N), backward thinking (N to 1), and mixed approaches. |
| `reset_session` | Clear thought history for a session. |

**Usage Notes:**
- Supports `thoughtNumber`, `totalThoughts`, `isRevision`, `branchFromThought`, `branchId` for sophisticated reasoning flows.
- Includes a patterns cookbook (auto-provided at thought 1 and final thought).
- Different from the local Clear Thought server: this one focuses on sequential chain-of-thought; the local one provides 20+ specialized reasoning operations.

---

### VibeCheckMCP

| | |
|---|---|
| **Type** | Cloud-hosted (Claude.ai) |
| **Purpose** | Metacognitive questioning and pattern learning. Identifies assumptions, prevents tunnel vision, and tracks recurring mistakes/successes. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `vibe_check` | Metacognitive analysis of current goal, plan, and progress. Identifies hidden assumptions and potential errors. |
| `vibe_learn` | Record a mistake, preference, or success with category tagging. Categories: Complex Solution Bias, Feature Creep, Premature Implementation, Misalignment, Overtooling, Preference, Success, Other. |
| `update_constitution` | Add a constitutional rule for the session. |
| `reset_constitution` | Overwrite all constitutional rules. |
| `check_constitution` | View current constitution rules. |

**Usage Notes:**
- Use `vibe_check` when stuck, when a plan feels off, or before committing to a complex approach.
- Use `vibe_learn` after solving tricky bugs or making mistakes to build a pattern library.
- Constitutional rules persist per session only (in-memory).

---

### Context7-MCP (Cloud)

| | |
|---|---|
| **Type** | Cloud-hosted (Claude.ai) |
| **Purpose** | Same as the local Context7 server -- library documentation lookup. This is the cloud-hosted variant. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `resolve-library-id` | Resolve a library name to a Context7-compatible ID. |
| `query-docs` | Fetch documentation for a resolved library ID. |

**Usage Notes:**
- Functionally identical to the local Context7 server.
- Same limits apply: max 3 `resolve-library-id` calls and 3 `query-docs` calls per question.

---

### FetchMCP

| | |
|---|---|
| **Type** | Cloud-hosted (Claude.ai) |
| **Purpose** | Fetch web content in multiple formats: HTML, Markdown, plain text, or JSON. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `fetch_html` | Fetch a URL and return raw HTML. |
| `fetch_markdown` | Fetch a URL and return content as Markdown. |
| `fetch_txt` | Fetch a URL and return plain text (no HTML). |
| `fetch_json` | Fetch a URL and parse as JSON. |

**Usage Notes:**
- All tools support `max_length` (default 5000 chars) and `start_index` for pagination through large pages.
- Optional `headers` parameter for custom HTTP headers.
- Prefer this over `curl` when you need structured output formats.

---

### TimeMCP

| | |
|---|---|
| **Type** | Cloud-hosted (Claude.ai) |
| **Purpose** | Time utilities: current time, timezone conversion, relative time, timestamps, and calendar queries. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `current_time` | Get current date/time in a specified format and timezone. |
| `relative_time` | Get how long ago or until a given time. |
| `convert_time` | Convert between IANA timezones. |
| `get_timestamp` | Get Unix timestamp for a datetime. |
| `days_in_month` | Get the number of days in a given month. |
| `get_week_year` | Get ISO week number for a date. |

**Usage Notes:**
- All timezone parameters use IANA names (e.g., `America/New_York`, `Europe/London`).
- Supported date formats include `YYYY-MM-DD HH:mm:ss`, `MM/DD/YYYY`, `h:mm A`, and others.

---

### Dev Manager

| | |
|---|---|
| **Type** | Cloud-hosted (Claude.ai) |
| **Purpose** | Manage development server sessions: start, stop, check status, and tail logs. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `start` | Start a dev server. Returns a session key, port, and status. |
| `stop` | Stop a running dev server session. |
| `status` | Get status of one or all dev server sessions. |
| `tail` | Get stdout/stderr logs for a session. |

**Usage Notes:**
- Sessions are identified by auto-generated session keys.
- Use `status` with no arguments to see all active sessions.
- Use `tail` to stream logs for debugging.

---

### SequentialThinkingTools (Cloud)

| | |
|---|---|
| **Type** | Cloud-hosted (Claude.ai) |
| **Purpose** | Sequential problem-solving with tool recommendation awareness. Analyzes available tools and suggests which to use at each reasoning step. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `sequentialthinking_tools` | Chain-of-thought reasoning that recommends tools for each step, tracks previous steps, and suggests execution order with confidence scores. |

**Usage Notes:**
- Unlike plain Clear-ThoughtMCP, this tool is **tool-aware**: it recommends which MCP tools to use at each step.
- Supports branching, revision, and dynamic thought count adjustment.
- Best for multi-step tasks where tool selection is part of the problem.

---

### Claude-Mem (Search)

| | |
|---|---|
| **Type** | Cloud-hosted (Claude.ai) |
| **Purpose** | Vector memory search with a 3-layer workflow optimized for token efficiency. |

**Key Tools:**

| Tool | Description |
|------|-------------|
| `search` | Step 1: Search memory index. Returns IDs with minimal tokens. Params: `query`, `limit`, `project`, `type`, `obs_type`, `dateStart`, `dateEnd`. |
| `timeline` | Step 2: Get context around results. Params: `anchor` (observation ID) or `query`, `depth_before`, `depth_after`. |
| `get_observations` | Step 3: Fetch full details for filtered IDs only. Params: `ids` (array, required). |

**Usage Notes:**
- **Always follow the 3-layer workflow**: search (get IDs) -> timeline (get context) -> get_observations (full details for filtered IDs).
- Never fetch full details without filtering first. This saves approximately 10x tokens.
- Different from the local Memory server: this is vector-based search; the local one is a knowledge graph.

---

## Quick Reference: Server Selection

| Need | Server | Notes |
|------|--------|-------|
| Read/write sensitive files | Desktop Commander | `.env`, credentials, `.mcp.json` |
| General file operations | Desktop Commander | Preferred over Claude Code builtins |
| Code structure search | Desktop Commander (`start_search`) or Bash (`ast-grep`) | ast-grep for structural patterns |
| Library API docs | Context7 (local or cloud) | Always resolve ID first |
| Notion pages/databases | Notion | Fetch before create |
| GitHub issues/PRs | GitHubMCP | Or `gh` CLI for local ops |
| Project management | BrainGrid | Requirements + tasks |
| ML research/models | Hugging Face | Papers, models, Spaces |
| Structured reasoning | Clear Thought (local) | 20+ operations |
| Quick chain-of-thought | Clear-ThoughtMCP (cloud) | Forward/backward/branching |
| Tool-aware reasoning | SequentialThinkingTools | Recommends tools per step |
| Metacognition/bias check | VibeCheckMCP | Assumption identification |
| Web content fetching | FetchMCP | HTML/Markdown/text/JSON |
| Time/timezone queries | TimeMCP | IANA timezone support |
| Dev server management | Dev Manager | Start/stop/tail sessions |
| Arduino boards | Arduino CLI MCP | Compile/upload/install |
| File importance analysis | FileScopeMCP | Rankings, diagrams |
| Knowledge graph | Memory (local) | Entities, relations |
| Vector memory search | Claude-Mem (cloud) | 3-layer token-efficient search |
| Diagram rendering | Mermaid Chart | Validate + render |
