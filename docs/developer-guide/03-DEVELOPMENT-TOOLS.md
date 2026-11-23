# Development tools: what you use and why

Use [Ubuntu setup](07-UBUNTU-SETUP.md) for installation and first run. Commands here are reference instructions for you to run later, not actions performed while preparing this guide. Run project commands from the repository root. When `npm run` executes, npm puts `node_modules/.bin` on that command's executable search path; a global Vite or TypeScript installation is unnecessary.

## Ubuntu terminal and Bash

**Introduction and purpose.** The terminal is a text interface to programs; Bash interprets commands, arguments, paths, and shell operators. The current directory determines what relative paths refer to. Ubuntu paths are case-sensitive: existing `Docs/` and these new `docs/` are different directories.

**Plotline integration.** npm scripts, Git, and diagnostic commands run here. VS Code's integrated terminal is a convenient terminal, not a different application runtime.

**Practical use and commands:**

```bash
cd /home/maheer/Plotline
pwd
ls
command -v node
node --version
npm --version
git status --short
rg 'publishUnit' src
rg --files src/core
```

`rg` searches file contents; `rg --files` lists files. `Ctrl+C` stops the foreground dev server. Quote paths containing spaces, such as `'Demo drawings'`. Avoid pasting unexplained destructive commands or printing credential files into terminal history/logs.

**Common problems.** “Command not found” means a missing executable or PATH problem, not necessarily a source bug. “Permission denied” can indicate an incorrect file owner; do not make `sudo npm` your default workaround. A command in the wrong directory may not find `package.json`.

**Priority: Essential — learn immediately.**

## Visual Studio Code

**Introduction and purpose.** VS Code edits files and provides navigation, diagnostics, source control, and debugger interfaces. Extensions add capabilities, but no project extension list or shared launch configuration was found.

**Plotline integration.** TypeScript understands imports, types, and symbols across the project. Open the folder, not just an isolated file, so project configuration is available.

**Practical use.** Start with `code .` from the root. Use Quick Open (`Ctrl+P`) for `src/main.tsx`, workspace search (`Ctrl+Shift+F`) for `publishUnit`, Go to Definition (`F12`) on `Unit`, and Find All References on a reducer action or callback. The Problems panel shows type diagnostics. In a TypeScript file, choose **TypeScript: Select TypeScript Version → Use Workspace Version** after dependencies are installed, especially if the editor's bundled version disagrees with this repository's compiler.

**Commands/debugging.** The Command Palette (`Ctrl+Shift+P`) exposes TypeScript server restart and **Debug: JavaScript Debug Terminal**. Running a focused Node-based test there lets you place breakpoints in pure TypeScript/test code. For browser React code, use Firefox Developer Tools; a VS Code browser-debugging extension/config is optional and not currently committed.

**Common problems.** Stale diagnostics may need a TypeScript server restart; first compare with `npm run typecheck`. An editor breakpoint is not enough unless the relevant process is attached. Local `.vscode/` settings are ignored by this repository, so do not assume your colleagues have them.

**Priority: Essential for efficient work; specific extensions optional.**

## Git and GitHub

**Introduction and purpose.** Git stores local history and branches. GitHub hosts this repository and its pull-request review interface. A local commit and a remote push are separate actions.

**Plotline integration.** The checked-out remote points to `https://github.com/zaysiallabib/Plotline.git`. `.gitignore` excludes installed/build files, environment files, and machine-local state.

**Practical commands:**

```bash
git status
git diff
git log --oneline -8
git branch --show-current
git switch -c learn/first-change
```

See [the complete workflow](08-GIT-WORKFLOW.md) before staging or publishing. Read-only inspection does not require a GitHub login. Pushing requires access and an authenticated Git transport; neither a GitHub CLI nor a GitHub extension is required by this project.

**Common problems.** Ignored files can still be tracked if committed earlier. A push rejection often means the remote has commits you lack, not that force-push is appropriate. Inspect and integrate history before retrying.

**Priority: Essential — learn immediately.**

## Node.js and npm

**Introduction and purpose.** Node runs JavaScript tooling outside the browser. npm installs dependencies and launches scripts. Neither replaces React or PostgreSQL.

**Plotline integration.** Node executes Vite/Vitest/configuration and `.mjs` scripts. The deployed application is static browser output plus hosted Supabase, not this Node process. `package-lock.json` v3 records exact dependency resolutions.

**Commands:**

```bash
node --version
npm --version
npm ci
npm run
npm ls --depth=0
```

`npm ci` installs the locked tree and recreates `node_modules`; it does not upgrade the lockfile. `npm install some-package` deliberately changes dependency declarations/lock state and belongs in a reviewed change. `npm ls` describes installed packages; reading the lockfile describes recorded packages. Do not confuse the two.

**Common problems.** Missing `tsc`/`vite`/`vitest` generally means dependencies are not installed or dev dependencies were omitted. `EBADENGINE` points to a runtime constraint mismatch. DNS/proxy/registry errors occur before source compilation. Avoid deleting the lockfile to hide an installation error. Version constraints and the proposed Node baseline are in [setup](07-UBUNTU-SETUP.md).

**Priority: Essential — learn immediately.**

## TypeScript compiler

**Introduction and purpose.** TypeScript analyzes source for incompatible types and other configured mistakes. It cannot prove that a network response or loaded file is trustworthy.

**Plotline integration.** Root `tsconfig.json` references app and tool configurations. The app uses strict checks, unused-variable checks, bundler-style imports, DOM APIs, TSX, and `noEmit`. `tsc -b` checks the project; Vite separately produces deployable assets.

**Commands:**

```bash
npm run typecheck
npm run build
```

**Practical use.** Follow the first error to its file/line. Inspect the expected type rather than silencing the error with `any` or a cast. A `number | null` from `parseLength` forces you to handle invalid text before editing geometry.

**Common problems.** Unused imports fail this project's checks. A browser `window` reference in code run by a Node test may fail at runtime despite DOM types being available. `skipLibCheck` skips checking declaration-file internals; it does not disable checking your source.

**Priority: Essential — learn immediately.**

## Vite and the React plugin

**Introduction and purpose.** Vite is the development server and production bundler. During development it serves transformed modules and updates changed code quickly; builds produce optimized browser files.

**Plotline integration.** [vite.config.ts](../../vite.config.ts) registers `react()`, sets port 5173, defines public Supabase aliases, and includes Vitest settings. Its import of `vitest/config` means the test package is also required to load this configuration.

**Commands:**

```bash
npm run dev
npm run build
npm run preview
```

Open the URL printed by the server, not an assumed port. `preview` serves an already built `dist/` for local inspection. Hot module replacement helps during development but is not a substitute for checking a reload and production build.

**Common problems.** Restart Vite after editing environment files. A module-resolution error may be a case mismatch on Ubuntu. The configured chunk warning threshold is 2000 kB; raising a warning threshold does not shrink JavaScript. Environment variables embedded in a build need a rebuild to change. [Vite's environment guide](https://vite.dev/guide/env-and-mode) explains its public-variable model.

**Priority: Important — learn during initial development.**

## React and React Developer Tools

**Introduction and purpose.** React is the UI library, rather than a separate command-line utility. Components render from props/state. React Developer Tools is an optional browser extension for inspecting component state/props.

**Plotline integration.** Studio editing uses a reducer; Viewer and panels use hooks. Event callbacks bridge UI to pure model operations and imperative Three objects.

**Practical use.** Follow `Notes.tsx`'s textarea state and `onSave` prop, then follow `ViewerApp.tsx`'s `savePin`. Inspect the component tree with the optional extension or use ordinary browser breakpoints. No extra React installation command is necessary beyond `npm ci`.

**Common problems.** Mutating a state object can prevent correct updates. An effect with missing cleanup can leave listeners/renderers running. Development StrictMode may expose these mistakes through extra checks; it does not imply identical production execution. Read [frontend](04-FRONTEND-GUIDE.md).

**Priority: Essential — learn immediately.**

## Firefox and browser Developer Tools

**Introduction and purpose.** The browser is the actual runtime for the product. Its tools inspect DOM/CSS, JavaScript execution, storage, network, graphics behavior, and performance.

**Plotline integration.** Repository guidance specifies Firefox for browser testing. Desktop WebGL capability and headset WebXR capability are separate questions.

**Practical use.** Open tools with `F12`. Use Inspector to find a button, Console for errors, Network for failed RPC/assets, Debugger for source breakpoints, and Storage for browser-local data. Dev-mode source maps let you inspect TS/TSX source. Preserve logs while reproducing a navigation issue. Avoid exposing staff keys, tokens, buyer names, or request bodies in screenshots.

**Essential actions.** Reload with Network open; filter `rpc`, `gltf`, or `bin`; inspect status, timing, request parameters, and response. Use responsive design mode to examine side panels and canvas sizing. Export important drafts before changing storage; a blanket “clear site data” can erase work.

**Common problems.** A 200 response containing HTML for a supposed JavaScript/JSON asset is a routing problem. CORS errors differ from application 401/403 errors. A blocked font is not necessarily the reason a scene is blank.

**Priority: Essential — learn immediately.**

## Vitest and optional Playwright

**Introduction and purpose.** Vitest runs automated logic tests. Playwright controls a real browser and needs matching browser binaries.

**Plotline integration.** Tests match `src/**/*.test.ts` and run in a Node environment. `playwright` is declared, but no general committed end-to-end runner configuration was found. Extra scripts include machine-specific assumptions; they are not a portable Ubuntu acceptance suite.

**Commands, after dependencies are present:**

```bash
npm test
npm test -- src/core/units.test.ts
npm exec -- vitest src/core/units.test.ts
```

The last command opens Vitest's interactive/watch workflow. Optional browser preparation, only if you will use automation:

```bash
npm exec -- playwright install firefox
```

Some Ubuntu systems need additional browser system libraries; follow the [official browser installation instructions](https://playwright.dev/docs/browsers) for that machine. Installing browsers does not create tests. Do not assume `playwright test` works: this repository declares the library, not a completed `@playwright/test` suite.

**Common problems.** A passing geometry test does not prove a GPU scene renders. An RPC mock does not execute PostgreSQL permissions. Evaluation suites may be gated by opt-in settings or fixture paths. See [testing](09-DEBUGGING-AND-TESTING.md).

**Priority: Vitest important; browser automation optional until needed.**

## Supabase dashboard and SQL editor

**Introduction and purpose.** Supabase hosts PostgreSQL and its HTTP interface. Its dashboard lets you inspect tables, execute SQL, and read service logs. SQL editor actions can change remote data; they are not ordinary local file edits.

**Plotline integration.** Apply the two migrations in order to an isolated development project to enable shares/events. There is no committed Supabase CLI project configuration or locally managed database service.

**Practical use.** Compare function definitions and grants with `supabase/migrations/`; inspect error logs after reproducing a failed call. Use the browser Network panel as the first API client. A read-only `unit_by_token` request may also be reproduced with curl in a test project; [backend](05-BACKEND-GUIDE.md) explains safe placeholders.

**Commands.** The current app accesses functions over HTTP, not through a `psql` command or npm database package. Supabase CLI and Docker are optional future tools for isolated migration testing, not requirements for opening the local demo.

**Common problems.** An absent function often means migrations were not applied to the configured project. A public key is not the staff key. Dashboard-admin queries do not demonstrate that anonymous browser permissions are correct.

**Priority: Important for sharing/backend work; optional for your first local session.**

## Vercel dashboard and hosting logs

**Introduction and purpose.** Vercel builds and hosts frontend files. It is separate from the Supabase database host.

**Plotline integration.** `vercel.json` defines SPA rewrites. Vite supports the documented Vercel aliases `SUPABASE_URL` and `SUPABASE_KEY`, which are explicitly injected into browser code.

**Practical use.** Review build logs, Node selection, install/build commands, output directory, and environment scopes in the dashboard. Verify a preview deployment before updating production. A Vercel account/CLI is unnecessary for local development; no Vercel CLI dependency is committed.

**Commands.** Local prerequisites are `npm ci`, `npm run typecheck`, `npm test`, `npm run build`, and `npm run preview`. Actual dashboard deployment is described in [deployment](10-DEPLOYMENT-GUIDE.md).

**Common problems.** A successful build does not prove database functions exist or staff access is scoped correctly. A production deep-link failure can come from fallback settings even if `/` loads. Local drafts do not travel to the deployed origin.

**Priority: Important before deploying; optional for initial learning.**

## Tools you can defer

Three's scene APIs are important when you reach graphics work; their execution tool is still the browser. IWER, a physical headset, Ollama/model management, and cloud AI configuration are feature-specific. Postman/Insomnia can be useful API clients but are not repository requirements. Docker, an ORM, an Express server, a new CSS framework, global TypeScript, and a monitoring service are not necessary additions to begin understanding this application.

Next: [04 — Frontend guide](04-FRONTEND-GUIDE.md).
