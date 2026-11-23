# Ubuntu setup: local first, hosted features second

These are instructions for you to execute when ready. Creating this guide did **not** install software, run migrations, create an environment file, or change your environment. You already have the repository and VS Code; skip installation steps for tools that work.

The simplest first session needs Node/npm, the repository's dependencies, and a browser. A Supabase account, Docker, local PostgreSQL, Ollama, Gemini key, headset, and Vercel account are **not required** to inspect built-in units and learn manual editing.

## 1. Check what is installed

```bash
cd /home/maheer/Plotline
pwd
git status --short
git --version
node --version
npm --version
code --version
firefox --version
```

A missing command tells you what to install. Do not replace working tools simply because an installation command appears below. Keep any current source changes and browser drafts; setup should not require discarding them.

## 2. Choose a compatible Node version

No `.nvmrc`, `.node-version`, or root `engines` pin was found. These constraints come from **this lockfile**, not a guessed framework requirement:

| Locked tool | Declared Node engine |
|---|---|
| Vite 8.3.1 / React plugin 6.1.1 | `^20.19.0 \|\| >=22.12.0` |
| Vitest 5.0.1 | `^22.12.0 \|\| ^24.0.0 \|\| >=26.0.0` |
| Playwright 1.63.0 | `>=20` |
| TypeScript 7.0.2 | `>=16.20.0` |

**Proposed baseline: Node 24.x LTS with its bundled npm.** It satisfies the recorded tool engines. This is a setup recommendation, not an existing project pin or a successfully tested compatibility certification. Node 22.22.1 and npm 9.2.0 were present during documentation inspection, but application dependencies were absent. `@types/node` 26.6.2 is a type-definition version; it does not force Node 26. Check maintained versions at the [official Node download page](https://nodejs.org/en/download).

If your current runtime fits all constraints, use it initially. Avoid assuming Ubuntu's default `apt install nodejs` provides a sufficiently recent version.

## 3. Install missing system tools only

For a machine missing Git, curl, certificates, or ripgrep:

```bash
sudo apt update
sudo apt install git curl ca-certificates ripgrep
```

VS Code and Firefox are already common Ubuntu installations. If missing, Ubuntu Snap installations are options:

```bash
sudo snap install code --classic
sudo snap install firefox
```

Use the [official VS Code Linux instructions](https://code.visualstudio.com/docs/setup/linux) or [Mozilla Linux instructions](https://support.mozilla.org/en-US/kb/install-firefox-linux) if your machine does not use Snap. These are editor/browser installation options, not extra project dependencies.

## 4. Install/manage Node if necessary

nvm is an optional per-user Node version manager, not a Plotline dependency. If already installed, skip its installer. The following downloads a versioned installer to a file so you can inspect it before executing:

```bash
curl -fL https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.8/install.sh -o /tmp/plotline-nvm-install.sh
less /tmp/plotline-nvm-install.sh
bash /tmp/plotline-nvm-install.sh
```

The installer can modify shell initialization files. Open a fresh terminal afterward, then:

```bash
command -v nvm
nvm install 24
nvm use 24
node --version
npm --version
```

If `nvm` is missing in the new Bash session, consult the [official nvm instructions](https://github.com/nvm-sh/nvm); it is a shell function and must be loaded by your shell. Do not install npm packages with `sudo`. Do not add a runtime pin to this repository as an unexplained side effect; propose that separately after verifying the team's baseline.

## 5. Install locked project dependencies

```bash
cd /home/maheer/Plotline
npm ci
```

`npm ci` installs both runtime and development dependencies from `package-lock.json`, refusing manifest/lock inconsistencies instead of silently repairing them. It recreates `node_modules`, so use the repository root intentionally. It does not erase browser drafts, database records, or source files. Preserve the lockfile; do not delete it as a troubleshooting shortcut.

No global Vite, React, TypeScript, or Vitest installation is required. Do not use a production-only dependency install on a machine expected to build: TypeScript, Vite, and even the config's Vitest import are development dependencies needed by the build workflow.

After installation:

```bash
npm ls --depth=0
npm run typecheck
npm test -- src/core/units.test.ts
```

A registry/DNS failure means installation is incomplete. Do not claim the project passed these checks unless they actually execute successfully.

## 6. Start the local application without backend configuration

```bash
npm run dev
```

Open the address printed by Vite; configured port is 5173. Visit `/u/type-a` for a built-in unit, `/studio` for editing, and use the manual/key reference to learn controls. A missing Supabase configuration is expected to disable remote sharing; it need not prevent local built-in viewing. Optional external assets/services can still require a network connection, so this is not an offline-completeness guarantee.

Use one consistent origin for local work, such as `http://localhost:5173`. Switching to `127.0.0.1` or another port changes where browser storage is found. Stop the server with `Ctrl+C`.

## 7. Optional: configure an isolated Supabase development project

Create a separate development project in Supabase if you want to learn remote sharing. Read [database setup and access rules](06-DATABASE-GUIDE.md). Review and apply the share migration first and events migration second through the SQL editor. Running SQL changes that remote project. The migrations print the staff key at the end; keep that output private. No migration is run automatically by npm/Vite.

There is no committed `.env.example` or existing `.env.local` in the inspected checkout. If you decide to enable this feature, create `.env.local` yourself in the root with **development project** public settings:

```dotenv
# Placeholder values: replace with your isolated development project settings.
VITE_SUPABASE_URL=https://YOUR_DEV_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

Do not copy these placeholders unchanged and expect networking to work. Use the project's publishable/public key, never `sb_secret_...`, `service_role`, a database password, or the staff key. The staff key is supplied through the current staff UI, not this environment block.

Vite loads `.env`/`.env.local` and mode-specific variants; existing process variables have precedence. `VITE_` values reach the browser. Root `.gitignore` excludes `.env*`, but ignore rules do not remove a previously tracked secret. Check without displaying values:

```bash
git check-ignore .env.local
git status --short
```

Restart the dev server after changes. A production build captures public configuration when built; changing a hosting variable later requires another build. See [Vite environment handling](https://vite.dev/guide/env-and-mode).

The Vercel-oriented aliases `SUPABASE_URL` and `SUPABASE_KEY` are explicitly injected by `vite.config.ts`; they also become public. Prefer the direct `VITE_` names locally to avoid conflicting sources. The alias secret-format guard is not comprehensive and does not inspect the direct `VITE_` path. Manually verify key type before any build. Current RPC header behavior also merits a compatibility check with modern keys; see [backend](05-BACKEND-GUIDE.md).

## 8. Verify build and local static output

```bash
npm run typecheck
npm test
npm run build
npm run preview
```

`build` runs `tsc -b` then `vite build`. TypeScript checking uses `noEmit`; Vite emits `dist/`. Preview serves those already-built files, normally on port 4173; use its printed URL. Test deep links and asset requests there. Preview is neither your hosted backend nor a production operations solution.

## Optional tooling, later

- **Browser automation:** after `npm ci`, `npm exec -- playwright install firefox` installs browser binaries matching the local Playwright version. Some Ubuntu systems need system libraries; use [Playwright's browser guidance](https://playwright.dev/docs/browsers). Existing scripts still contain Windows-specific paths; browser installation alone does not make them portable.
- **VR:** a supported physical headset/browser and secure context are needed for actual WebXR testing. `?xr=emulate` is a DEV-only IWER path, not physical-device acceptance.
- **Local AI:** not necessary for editor startup. `studio/localAI.ts` defaults to an Ollama-compatible server at port 11434. Its displayed `E:`/PowerShell startup instructions are Windows-specific. If you already have Ollama and the configured model installed, `ollama serve` starts its server; check browser-origin/CORS configuration separately. Model downloads can be large; do not install them merely to learn React.
- **Cloud AI:** optional user-supplied Gemini key and service availability, with cropped drawing data sent externally. No backend secret proxy exists.
- **Supabase CLI/Docker/psql:** optional database-development improvements, not part of the current minimum local workflow.

## Troubleshooting by symptom

| Symptom | Diagnose | Safe next step |
|---|---|---|
| `vite`, `tsc`, or `vitest` not found | Did `npm ci` succeed? Are you in the root? Were dev dependencies omitted? | Resolve installation first; use npm scripts, not a random global tool. |
| `EBADENGINE` / incompatible runtime | Compare `node --version` with the table above. | Select a matching installed runtime, reopen terminal/editor as needed. |
| Port 5173 occupied | `ss -ltnp` and inspect the line for that port; identify the process before stopping anything. | Use `npm run dev -- --port 5174 --strictPort` if appropriate; remember the different storage origin. |
| Registry `EAI_AGAIN` / timeout | DNS/network/proxy configuration and `npm config get registry`. | Retry after connectivity is repaired; do not rewrite the lockfile to mask networking. |
| Missing build import on Ubuntu | Exact filename case, installed package, import path. | Fix the real mismatch on a branch; Ubuntu is case-sensitive. |
| “Supabase is not configured” | Names loaded by Vite, root file location, server restart. | Set only intended public development settings; do not print secrets to debug. |
| Request 401/403 | Response body, key type, current Authorization header, staff-key check/grants. | Follow the function-specific cause; do not substitute a service-role key. |
| Function not found / no data | Correct project and migrations; token validity; local vs remote storage. | Inspect schema and source path before assuming database downtime. |
| Draft/picture appears missing | Same origin/profile/drawing ID? Storage disabled/full? | Inspect storage read-only and preserve exports; avoid blanket clearing. |
| Blank 3D area | Console/WebGL capability and model/texture requests. | Try documented quality/fallback behavior and isolate the failing asset. |

During analysis, dependency-based build/typecheck/test commands could not start because dependencies were absent; a registry audit attempt also encountered DNS failure. The setup above is a documented workflow, not a claim of a completed clean Ubuntu run. No real Supabase/Vercel project, model service, or headset was verified.

Next: [08 — Git workflow](08-GIT-WORKFLOW.md).
