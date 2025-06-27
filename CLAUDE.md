# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

Essential commands for building and testing:

- `pnpm dev` - Start Next.js development server with Turbo
- `pnpm build` - Run database migrations and build Next.js app
- `pnpm lint` - Run Next.js ESLint and Biome linting with auto-fix
- `pnpm test` - Run Playwright e2e tests
- `pnpm db:migrate` - Run database migrations manually
- `pnpm db:studio` - Open Drizzle database studio

Electron desktop app commands:

- `pnpm dev:e` - Build and run Electron app in development
- `pnpm build:e` - Build Electron app for production
- `pnpm start:e` - Start built Electron app

## Architecture Overview

This is a Next.js AI chatbot with Electron desktop support and MCP (Model Context Protocol) integration.

### Core Structure

**Authentication System**: NextAuth.js with dual auth modes - regular users (email/password) and guest users. Guest users are auto-created without credentials. Auth config in `app/(auth)/auth.ts` and `app/(auth)/auth.config.ts`.

**AI Provider Architecture**: Multi-provider system supporting xAI (Grok), Anthropic (Claude), and OpenAI. Provider selection via `AI_PROVIDER` env var, defaulting to Anthropic. Each provider has chat, reasoning, title, and artifact models. Test environment uses mock models from `lib/ai/models.test.ts`. Configuration in `lib/ai/providers.ts`.

**Database Schema**: PostgreSQL with Drizzle ORM. Key tables:

- `User` - Basic user info with optional password
- `Chat` - Conversation threads with visibility settings
- `Message_v2` - Modern message format with parts and attachments
- `Document` - Artifacts (text, code, image, sheet types)
- `Suggestion` - Document editing suggestions
- Deprecated tables (`Message`, `Vote`) exist for migration

**MCP Integration**: Model Context Protocol for tool integration. Supports both stdio and HTTP transports. MCP servers configured via environment. Transport creation and client management in `lib/ai/mcp.ts`. Permission system for human-in-the-loop tool execution.

### Key Patterns

**App Router Structure**: Route groups `(auth)` and `(chat)` for layout organization. API routes follow REST patterns with specific handlers for chat, document, file upload, etc.

**shadcn/ui Framework**: Component system built on Radix UI primitives with Tailwind CSS. Components use `class-variance-authority` (cva) for variant management and `cn()` utility for class merging. Base color is zinc with CSS variables for theming. Path aliases: `@/components/ui` for primitives, `@/components` for composed components. Use `asChild` prop pattern for polymorphic components.

**Artifacts System**: Documents created by AI with interactive editing. Four types: text, code, image, sheet. Server-side rendering and client-side editing components.

**Message Handling**: Streaming AI responses with parts-based message structure. Supports text, tool calls, and attachments. Data stream handler manages real-time updates.

### Detailed Coding Conventions and Style Guides

While you mention linting tools (`ESLint`, `Biome`), explicitly documenting key coding style preferences would be highly beneficial. This helps the AI generate code that is consistent with the existing codebase.

- **Formatting and Naming:**
  - Specific naming conventions (e.g., `camelCase` for variables/functions, `PascalCase` for components/classes, `UPPER_SNAKE_CASE` for constants).
  - File naming conventions (e.g., `feature-name.component.tsx`, `feature-name.utils.ts`).
  - Preferred code formatting rules if not entirely covered by linters (e.g., max line length, import order).
- **Component Patterns (React/Next.js):**
  - Preference for functional components with Hooks.
  - Guidelines for component composition and props handling.
  - Specific usage patterns for `shadcn/ui` components beyond `asChild`, including any project-specific wrappers or common customizations.
- **TypeScript Usage:**
  - Best practices for type definitions, interfaces vs. types.
  - Guidance on using generics or advanced types in specific scenarios within the project.
- **Comments and Documentation:**
  - Expectations for inline comments, JSDoc for functions, or other code documentation.

### State Management Strategy

If your application has a client-side state management solution (e.g., React Context, Zustand, Jotai, Redux), provide details on:

- **Chosen Solution:** Which library/pattern is used and why.
- **Structure:** How state is organized (e.g., stores, slices, contexts).
- **Usage Patterns:** How to access and update state, dispatch actions, or use selectors. Examples of how the AI should implement new state or modify existing state.

### API Development Guidelines

Expand on the REST patterns for API routes:

- **Request/Response Structures:** Standard formats for API request bodies and responses.
- **Error Handling:** How errors should be handled in API routes (e.g., specific HTTP status codes for different error types, error response formats).
- **Authentication/Authorization:** How API routes should enforce authentication and authorization, beyond what NextAuth.js handles by default.
- **Input Validation:** Preferred methods or libraries for validating incoming data.
- **Middleware:** Any common middleware used and how to apply it.

### Database Interaction (Drizzle ORM)

Provide more specific guidance on working with the database:

- **Query Patterns:** Examples of common Drizzle ORM query patterns used in the project (e.g., complex joins, aggregations).
- **Writing Migrations:** Best practices for writing and testing database migrations with `pnpm db:migrate`.
- **Schema Design:** Principles to follow when adding or modifying tables/columns.
- **Data Integrity:** How to ensure data integrity and consistency.

### Electron-Specific Development

If the Electron app has unique considerations:

- IPC (Inter-Process Communication): Guidelines for communication between the main process and renderer process(es).
- Native Features: How to interact with native OS features or Electron APIs.
- Build/Packaging Details: Any specific configurations or steps the AI should be aware of for Electron builds, beyond the commands listed.

### MCP (Model Context Protocol) Implementation Details

For AI interaction with MCP:

- Defining New Tools: How to structure the definition for a new tool.
- Tool Execution Flow: The lifecycle of a tool call via MCP.
- Error Handling in Tools: Best practices for handling errors within MCP tools.

### Performance Considerations

If there are specific performance targets or known bottlenecks:

- Frontend: Tips for optimizing React components, minimizing re-renders, lazy loading.
- Backend: Efficient database querying, optimizing API response times.

## Important Notes

- Default AI provider is Anthropic Claude, configurable via `AI_PROVIDER`
- Database requires manual migration before build: `tsx lib/db/migrate && next build`
- MCP servers enable tool integration - configuration drives available tools
- Electron build requires specific Node.js version (>=22.0.0)
- Test environment uses Playwright with mock AI models

## AI Assistant Workflow: Step-by-Step Methodology

When responding to user instructions, the AI assistant (Claude, Cursor, GPT, etc.) should follow this process to ensure clarity, correctness, and maintainability:

- Consult Relevant Guidance: When the user gives an instruction, consult the relevant instructions from AGENTS.md files (both root and directory-specific) for the request.
- Clarify Ambiguities: Based on what you could gather, see if there's any need for clarifications. If so, ask the user targeted questions before proceeding.
- Break Down & Plan: Break down the task at hand and chalk out a rough plan for carrying it out, referencing project conventions and best practices.
- Trivial Tasks: If the plan/request is trivial, go ahead and get started immediately.
- Non-Trivial Tasks: Otherwise, present the plan to the user for review and iterate based on their feedback.
- Track Progress: Use a to-do list (internally, or optionally in a TODOS.md file) to keep track of your progress on multi-step or complex tasks.
- If Stuck, Re-plan: If you get stuck or blocked, return to step 3 to re-evaluate and adjust your plan.
- Update Documentation: Once the user's request is fulfilled, update relevant anchor comments (AIDEV-NOTE, etc.) and AGENTS.md files in the files and directories you touched.
- User Review: After completing the task, ask the user to review what you've done, and repeat the process as needed.
- Session Boundaries: If the user's request isn't directly related to the current context and can be safely started in a fresh session, suggest starting from scratch to avoid context confusion.

## "How To" Scenarios / Common Tasks

This would be extremely valuable for an AI. Provide step-by-step instructions or checklists for common development tasks, incorporating project-specific practices:

- Example: "How to add a new shadcn/ui component and customize it for the project theme."
- Example: "How to create a new API endpoint with request validation and database interaction."
- Example: "How to add a new field to a Message_v2 and update relevant parts of the system."
- Example: "How to add a new AI provider or model."

## Coding Guide

- Using utility functions, sub-routines function, general functions to understanable and readable code

### Javascript / Typescript

- Lint error is evil, fix them
  - Use Number.parseInt instead of the equivalent global

## Git Commit Guide

- DO checking lint and cleanup code to remove unused and unnecessary code in all of changes for the task
- DO write CHANGELOG.md for what changed and purpose
- DONT test, lint, update CHANGELOG.md for `commit wip` because it is for temporary commit
