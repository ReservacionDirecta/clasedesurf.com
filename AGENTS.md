# AGENTS.md: Development Guidelines for Autonomous Agents

This document outlines the standard operational procedures, command conventions, and stylistic guidelines for all agentic systems interacting with this repository. **Autonomous agents must adhere strictly to these rules.**

## 1. Build, Lint, Test, and Execution Commands

Agents should prioritize using the defined scripts in `package.json` for standardized operations. If `package.json` is unavailable or lacks a command, infer the standard command (e.g., `npm run build`, `tsc`, or `pytest`).

| Operation | Standard Command (Inferred/Assumed) | Single Unit Execution | Notes |
| :--- | :--- | :--- | :--- |
| **Build** | `npm run build` | `npm run build` | Compiles all source code. |
| **Lint** | `npm run lint` | `npm run lint` | Applies static analysis and formatting rules. |
| **Format** | `npm run format` | `npm run format -- <file_path>` | Formats a specific file. |
| **Test (All)** | `npm test` or `npm run test` | `npm test` | Runs the entire test suite. |
| **Test (Single)** | **Varies heavily by framework.** | See below. | **Must be inferred/confirmed.** |
| **Type Check** | `npm run typecheck` or `tsc --noEmit` | `tsc --noEmit <file_path>` | Checks TypeScript for type errors. |

### Running a Single Test

The command for running a single test is highly framework-dependent. **Agents must search for existing test file patterns** (e.g., files ending in `.test.js`, `.spec.ts`, or similar) or inspect test runner configurations to find the precise command.

**Common Inferences (Prioritize existing conventions):**
- **Jest:** `npm test -- <path/to/testFile.ts>` or `jest <path/to/testFile.ts>`
- **Vitest:** `vitest run <path/to/testFile.ts>`
- **Mocha:** `npx mocha 'path/to/testFile.js'`

*If no specific test command pattern is found, agents should attempt to deduce the command based on the extension of the test file found via `glob`.*

## 2. Code Style and Conventions

Agents must mimic the existing style of the surrounding codebase. The following conventions are *highly recommended* for new code:

### 2.1. Imports and Ordering
- **Order:** Imports must be grouped and ordered consistently:
    1.  Node.js built-in modules (e.g., `path`, `fs`).
    2.  External libraries (e.g., `react`, `lodash`).
    3.  Internal modules (relative paths from the project root or `@/alias` if configured).
- **Style:** Prefer named imports over default imports when available. Use absolute imports via configured path aliases (e.g., `@/components/Button`) if `tsconfig.json` or `jsconfig.json` is present and configured.

### 2.2. Formatting and Layout
- **Indentation:** Use **2 spaces** for indentation. **Tabs are forbidden.**
- **Braces:** Use K&R style (opening brace on the same line for functions/conditionals, new line for blocks).
- **Semicolons:** Use semicolons to terminate statements.
- **Trailing Commas:** Must be used in all objects, arrays, and function parameter lists.
- **Line Length:** Maximum line length is **120 characters**.

### 2.3. Typing (TypeScript/JavaScript)
- **Strictness:** If TypeScript is used, code must compile with strict mode enabled (`"strict": true` in `tsconfig.json`).
- **Props/State:** Define types/interfaces explicitly. Avoid inline types for component props or complex state definitions.
- **Variables:** Use `const` by default, followed by `let`. Avoid `var`. Infer types where possible, but explicitly type function arguments and return values.

### 2.4. Naming Conventions
- **Components (React/Vue):** PascalCase (e.g., `UserProfileCard`).
- **Variables/Functions/Methods:** camelCase (e.g., `calculateTotalAmount`).
- **Constants (Top Level):** SCREAMING_SNAKE_CASE (e.g., `MAX_RETRIES`).
- **Files (Source):** kebab-case (e.g., `user-profile-card.tsx`).
- **Files (Tests):** suffix with `.test.` or `.spec.` (e.g., `user-profile-card.test.ts`).

### 2.5. Error Handling
- **Asynchronous Code:** Use `try...catch` blocks around all `async/await` calls that can throw.
- **API Calls:** All network requests must be wrapped to ensure a consistent error response structure is returned to the caller or handled gracefully to prevent application crashes.
- **Logging:** Use `console.error()` for production errors. Do not use `console.log()` for debugging in committed code.

## 3. Agent-Specific Context Rules

### 3.1. Cursor Rules
*(No `.cursor/rules/` directory found. If rules are added later, they must be followed.)*

### 3.2. Copilot Instructions
*(No `.github/copilot-instructions.md` found. Agents should refer to project documentation for any specialized Copilot guidance.)*

## 4. Agent Protocol Summary
1.  **Always read first:** Use `read` or `glob` to understand context before editing.
2.  **Never assume:** Verify file paths, dependencies, and command names from existing project configuration.
3.  **Adhere to Style:** Formatting must match the surrounding code exactly.
4.  **Commit Safely:** Never commit sensitive data. Always create a descriptive commit message.
5.  **Verify Changes:** Run linting and unit tests after any code modification.