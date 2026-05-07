# Copilot Instructions — Waffle

## Architecture

Two independent apps that communicate only via SignalR WebSockets:

- **`frontend/`** — React SPA (Vite). Connects to the backend hub at `/hubs/chat`. In dev, Vite proxies `/hubs` → `http://localhost:5227`. In production, the frontend is hosted on Azure Static Web Apps and talks directly to the Container App URL.
- **`backend/`** — ASP.NET Core 10 Minimal API. No REST endpoints — all real-time logic lives in `ChatHub`. State is entirely in-memory via `UserRegistry` (singleton, `ConcurrentDictionary`). No database.
- **`infra/`** — Terraform only. Three modules: `container-registry`, `container-app`, `static-web-app`.

### SignalR contract

All client/server communication goes through `ChatHub`. The full contract (client→server methods and server→client events) is the source of truth in `backend/src/Waffle.Api/Hubs/ChatHub.cs` and mirrored in `frontend/src/hooks/useChatHub.ts`. Keep these in sync when adding hub methods.

IRC command parsing happens entirely on the **frontend** (`frontend/src/hooks/parseInput.ts`). `ChatPage` dispatches parsed commands to the appropriate hub method (`SendMessage`, `SendAction`, `ChangeNick`, `WhoIs`).

## Commands

### Backend

```bash
cd backend
dotnet run --project src/Waffle.Api          # http://localhost:5227
dotnet test                                   # all tests
dotnet test --filter "DisplayName~TryAdd"    # single test by name fragment
dotnet build
```

### Frontend

```bash
cd frontend
npm run dev      # http://localhost:5173 (proxies /hubs → localhost:5227)
npm run build    # tsc -b && vite build
npm run lint
```

## Key Conventions

### TypeScript — strict import rules
`verbatimModuleSyntax` and `erasableSyntaxOnly` are enabled. This means:
- **No `enum`** — use `const` objects with `as const` instead (see `MessageKind` in `types.ts`)
- Type imports must use `import type` — e.g. `import type { MessageDto } from '../types'`

### Frontend component structure
Each component/page lives in its own folder with a named export file and a barrel `index.ts`:
```
components/ChatMessage/
  ChatMessage.tsx   ← named export
  index.ts          ← re-exports ChatMessage
```
Always import from the folder (`from '../../components/ChatMessage'`), not the file directly.

### Backend — primary constructor injection
Hub and services use C# primary constructors:
```csharp
public class ChatHub(UserRegistry registry) : Hub { ... }
```

### Backend — `UserRegistry` is the single source of truth
All user state (nick ↔ connectionId mapping, join time) lives in `UserRegistry`. `ChatHub` never stores state itself — it always delegates to `UserRegistry`.

### Shared types
`frontend/src/types.ts` mirrors the backend DTOs (`MessageDto`, `UserInfoDto`, `MessageKind`). When adding or changing a DTO in `backend/.../Models/`, update `types.ts` to match.

### CORS
Allowed origins are configured via `appsettings.json` (`AllowedOrigins` array). In production, this is set via the `AllowedOrigins__0` environment variable in the Container App (see `infra/modules/container-app/main.tf`).

## Chat Log

`docs/CHATLOG.md` tracks notable decisions and changes made during Copilot sessions. When making non-trivial changes, append an entry in this format:

```markdown
**User:** <what was asked>

**Copilot:** <what was done / decided>

---
```

Keep entries brief — one or two sentences each. Focus on decisions that affect architecture, conventions, or configuration (not routine edits).
