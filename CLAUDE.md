# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Tauri-based course registration assistant application for WHUT (Wuhan University of Technology) educational system. It combines a React frontend with a Rust backend to provide automatic course enrollment capabilities.

**Tech Stack:**
- Frontend: React 19 + TypeScript + Tailwind CSS + Vite
- Backend: Rust + Tauri 2
- Package Manager: Bun

## Development Commands

### Setup
```bash
bun install
```

### Development
```bash
bun tauri dev              # Run in development mode
bun dev                    # Run frontend only (Vite dev server)
```

### Build
```bash
bun tauri build            # Build production app
bun build                  # Build frontend only (tsc + vite build)
```

### Code Formatting
```bash
bunx prettier --write .    # Format code with Prettier
```

### Tauri CLI
```bash
bun tauri [command]        # Access Tauri CLI commands
```

## Architecture

### Frontend (src/)

The React application follows a component-based architecture with custom hooks for state management:

**Key Components:**
- `SessionManager` - Root component handling authentication flow
- `Dashboard` - Main application UI orchestrating all features
- `LoginForm` - Authentication interface with captcha

**Custom Hooks (src/hooks/):**
- `useBatches` - Manages course batch/semester selection
- `useCourseData` - Fetches and manages course lists and selected courses
- `useCourseFilter` - Handles course filtering (search, day, time period)
- `useGrabber` - Core auto-enrollment loop logic with retry mechanism
- `useClassTypes` - Manages course type categories (e.g., 主修, 公选)
- `useLogger` - Application logging system

**Services (src/services/):**
- `jwxk.ts` - Thin TypeScript wrapper around Tauri commands, invoking Rust backend APIs

### Backend (src-tauri/src/)

The Rust backend is organized into modules:

**Core Module (src-tauri/src/core/):**
- `client.rs` - `JwxkClient` struct with reqwest HTTP client, session management (token, student info), and AES encryption for login credentials
- `impl_auth.rs` - Authentication methods (captcha, login, session check)
- `impl_courses.rs` - Course operations (list, selected courses)
- `impl_actions.rs` - Course actions (enroll/grab, drop)
- `models.rs` - Data structures and error types

**API Layer:**
- `api.rs` - Tauri command handlers that bridge frontend to core logic

**State Management:**
- `JwxkClient` is shared as Tauri state across all commands, maintaining session cookies and tokens

### Key Architecture Patterns

1. **Session Management**: `JwxkClient` maintains a single HTTP client with cookie store, keeping users logged in across requests.

2. **Auto-Enrollment Loop** (`useGrabber`):
   - Runs a continuous loop attempting to enroll in courses from a "cart"
   - Configurable interval between attempts (default 500ms)
   - Tracks status per course: idle → pending → success/error
   - Stops automatically when all courses enrolled or after 5 consecutive auth failures

3. **Encryption**: Login credentials are encrypted using AES-128-ECB with a hardcoded key before transmission to match the WHUT system's expected format.

4. **Pagination**: Course lists are fetched page-by-page from the backend API.

5. **Filter Architecture**: The dashboard combines multiple filter dimensions (search term, day of week, time period) applied client-side to course lists.

## Important Implementation Notes

### Adding New Tauri Commands

1. Define the command handler in `src-tauri/src/api.rs`:
```rust
#[tauri::command]
pub async fn your_command(
    state: State<'_, JwxkClient>,
    param: String,
) -> Result<YourResponse, CommandError> {
    state.your_method(&param).await
}
```

2. Implement the method in appropriate `impl_*.rs` file in `src-tauri/src/core/`

3. Register in `src-tauri/src/main.rs` (or `lib.rs`):
```rust
.invoke_handler(tauri::generate_handler![
    // ... existing commands
    your_command,
])
```

4. Add TypeScript binding in `src/services/jwxk.ts`:
```typescript
export const yourCommand = (param: string) =>
  invoke("your_command", { param });
```

### Working with the Grabber

The auto-enrollment logic in `useGrabber.ts` uses refs to access current state within the async loop:
- `cartRef.current` - Always has latest cart state
- `isGrabbingRef.current` - Control flag to stop the loop
- `intervalRef.current` - Current interval setting

When modifying this logic, ensure refs are properly synchronized with state.

### Handling Course IDs

Course data from different API endpoints uses inconsistent field names:
- `JXBID`, `jxb_id`, `do_jxb_id`, or `id`

Code consistently handles all variants when matching courses (see `useGrabber.ts:26-30`).

### TypeScript Configuration

The project uses strict TypeScript with:
- `noUnusedLocals` and `noUnusedParameters` enabled
- Bundler module resolution (not Node)
- React 19's automatic JSX runtime

### Vite Configuration

- Dev server runs on port 1420 (Tauri expects fixed port)
- HMR on port 1421
- Git commit hash is injected as `__COMMIT_HASH__` global variable

## Testing the Application

Since this is a Tauri desktop app, test by:
1. Running `bun tauri dev` to launch the application
2. Manually testing the UI flows (login → course selection → auto-enrollment)

There are no automated tests currently in the project.
