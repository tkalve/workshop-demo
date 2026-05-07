# Waffle — Chat Log

## 2026-05-07

---

**User:** Create a simple web based chat app. Let's call it "Waffle". Have users pick a nick name before joining. Allow IRC-like commands (`/who @nick`, `/me slaps @nick around a bit with a large trout`, `/nick [newNick]`).

**Copilot:** Asked clarifying questions:
- Message persistence → **Ephemeral (in-memory only)**
- Chat rooms → **Single global room**
- Infrastructure → **Include Terraform infra**

Created implementation plan and built the full app:

- **Backend:** ASP.NET Core 10 + SignalR (`ChatHub`, `UserRegistry`), xUnit tests (26 passing)
- **Frontend:** React + TypeScript + Vite, Join page, Chat page, `useChatHub` hook, `parseInput` for IRC commands, SASS theme
- **Infra:** Terraform → Azure Container Apps (backend) + Static Web Apps (frontend) + ACR
- **Dockerfile** for backend

---

**User:** backend starts at http://localhost:5227

**Copilot:** Updated Vite proxy target in `vite.config.ts` from `5062` → `5227`.

---

**User:** Update README.md and commit this

**Copilot:** Updated `README.md` local dev instructions to show port `5227`. Committed both changes (`29b5b8c`).

---

**User:** Analyze this codebase and create a `.github/copilot-instructions.md` file.

**Copilot:** Created `.github/copilot-instructions.md` covering architecture, SignalR contract sync rule, build/test/lint commands (incl. single-test), TypeScript strict conventions (`no enum`, `import type`), component folder/barrel pattern, and CORS wiring.

---

**User:** Add instructions on how to update `docs/CHATLOG.md`, and update the chat log.

**Copilot:** Added a "Chat Log" section to `copilot-instructions.md` describing the format and what warrants an entry. Updated this file.

---

