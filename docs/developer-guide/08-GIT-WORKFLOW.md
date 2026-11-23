# Git and GitHub: experiment with a recoverable history

Git tracks source snapshots on your computer. GitHub hosts a remote copy and reviews. Your browser's Studio draft, IndexedDB pictures, and hosted database rows are separate data: making a Git commit does not back them up. Export important user work using supported product workflows before risky experiments.

## Vocabulary connected to Plotline

| Term | Meaning | Practical consequence |
|---|---|---|
| Repository | Files plus Git's history/metadata. | Work from the cloned Plotline root. |
| Working tree | Your current files, including uncommitted edits. | A branch switch does not automatically isolate every uncommitted file. |
| Staging area/index | The exact proposed content of the next commit. | Review it with `git diff --cached`. |
| Commit | A recorded snapshot with message, author, and parent history. | A local checkpoint; not yet published. |
| Branch | Movable name for a line of commits. | Use a separate branch for one learning task. |
| Remote | Named repository URL, commonly `origin`. | This clone points at the GitHub Plotline repository. |
| Fetch | Download remote history/reference updates. | Does not merge changes into your current working files. |
| Pull | Fetch plus integrate into the current branch. | Can change files; use an intentional integration policy. |
| Push | Send local commits to a remote branch. | Requires access; makes commits available to collaborators. |
| Merge | Combine histories, potentially producing a merge commit. | Conflicting edits need a reasoned combined result. |
| Pull request | GitHub proposal to review/merge one branch into another. | Not the same as `git pull`. |
| Merge conflict | Git cannot automatically choose the combined content. | Resolve the intended behavior, not merely remove markers. |
| `.gitignore` | Patterns for files Git should not newly track by default. | Does not untrack existing committed files or secure a leaked secret. |

## The commands you will use

| Command | When and why |
|---|---|
| `git status` | Before edits, staging, switching, and committing. Shows branch and changed/untracked files. |
| `git branch` | List local branches; `git branch --show-current` prints the active one. |
| `git switch -c feature-name` | Create and switch to a branch at your current commit. Choose a descriptive name. |
| `git add .` | Stage all changes under the current directory, including unrelated new files. Understand it, but prefer explicit file paths for small changes. |
| `git add src/viewer/Notes.tsx` | Stage one intended file; use this narrower form when learning. |
| `git commit -m "message"` | Record staged content; working-tree content not staged is excluded. |
| `git push` | Update the configured upstream branch. The first push generally needs `git push -u origin your-branch`. |
| `git pull` | Fetch and integrate remote changes. Prefer `git pull --ff-only` for a clean shared/default branch to avoid an unexpected merge. |
| `git log --oneline` | Inspect recent commit history; add `-8` for a short view. |
| `git diff` | Read unstaged tracked edits; add `--cached` for staged edits or a comparison reference for committed changes. |
| `git fetch origin` | Refresh remote references before deciding how to integrate. |

Untracked files do not appear in ordinary `git diff`; `git status` is necessary too. At documentation creation time, existing `audit-reports/` was already untracked. A blanket `git add .` would include those reports and these guides together; stage the paths intended for your commit.

## A safe small-change workflow

These commands are examples for your next task, not changes performed by this guide. Start by understanding your current state:

```bash
cd /home/maheer/Plotline
git status
git branch --show-current
git remote -v
git log --oneline -8
git diff
```

If existing edits belong to you or another task, preserve and understand them first. Do not discard them to obtain a clean screen. You can commit a coherent checkpoint on its own branch; a separate worktree is an advanced option. Stashing is possible, but untracked files need special handling and a stash is not a remote backup.

With the intended starting revision selected:

```bash
git switch -c learn/note-counter
```

Make one small change, such as the exercise's Notes character counter. Check the affected behavior and required product docs, then:

```bash
npm run typecheck
npm test -- src/core/units.test.ts
npm run build
git diff
git status
git add src/viewer/Notes.tsx
git diff --cached
git commit -m "Show note length while writing a comment"
git push -u origin learn/note-counter
```

Choose tests relevant to the actual change; the units test above is a simple command example, not coverage of a note counter. A UI-only counter needs a browser check and a build, while a persistence change needs targeted behavioral tests. Stage any intentionally updated manual/key documentation explicitly too. Commit only after reviewing exactly what is staged.

In GitHub, open a pull request from your branch to the repository's actual default branch. Explain the user-visible change and how you verified it. Include screenshots only if helpful and free of keys, tokens, or buyer information. A pull request should be reviewable without reading the conversation that produced it.

## Updating from the default branch

Do not assume every repository uses `main`. Inspect the remote's default branch:

```bash
git remote show origin
```

The following assumes you confirmed it is `main`. Run integration commands only with your work preserved and the relevant working tree clean:

```bash
git fetch origin
git switch main
git pull --ff-only
git switch learn/note-counter
git merge origin/main
```

This preserves a straightforward history and avoids rewriting published commits. If `--ff-only` refuses, inspect `git log --oneline --graph --all` and discuss the divergence; do not jump to reset/force-push. Rebase is another workflow, but learn it only after understanding which commits have already been shared and the team's policy.

## Resolving a conflict

1. Run `git status` to identify conflicted paths.
2. Open the file. Conflict markers show the local and incoming alternatives; read surrounding code and requirements.
3. Produce a coherent final implementation. For a reducer, ensure both intended actions/invariants remain represented; for a schema change, account for compatibility.
4. Remove markers and review `git diff`.
5. Run type checking and the relevant tests/browser workflow.
6. Stage resolved paths, inspect `git diff --cached`, then complete the merge with `git commit` if required.

Do not resolve a lockfile by blindly choosing one side when both manifests changed. Understand the desired dependency declarations, then regenerate a consistent lock intentionally in a separately reviewed dependency task. Do not commit credentials just because they appeared in one side of a conflict.

## Plotline's ignored/generated files

[.gitignore](../../.gitignore) excludes `node_modules`, `dist`, `.env*`, `.vercel`, logs, TypeScript build-info files, local VS Code configuration, and other machine-local files. Source and package lockfiles belong in Git; installed packages/build outputs normally do not. Existing product docs use capital `Docs`; this developer guide uses requested lowercase `docs`.

An ignored file already tracked remains tracked. Use `git ls-files .env.local` to check tracking without printing its contents. If a real secret was ever committed, removing it from the newest file does not revoke it; rotation and history handling need a deliberate incident response.

For an ordinary mistaken published source change, a reviewed revert commit is usually easier to reason about than rewriting shared history. No `reset --hard`, `clean -fd`, force-push, or destructive cleanup is needed for the learning workflow above.

Next: [09 — Debugging and testing](09-DEBUGGING-AND-TESTING.md).
