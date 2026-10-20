# Wedify – agent instructions

Next.js 16 / React 19 wedding-card editor. Node 22, npm.

## Commands

- `npm run typecheck` – must pass
- `npm run build` – must pass
- `npm run lint` – has known pre-existing errors; do not add new ones

## "Ship" workflow

When the user asks to "up", "đẩy", "push", "ship" or "tạo PR" for a change, do the **whole** flow without asking again:

1. **Scope** – decide which files belong to the request (`git status`). Never stage secrets (`.env*`), `.next/`, `*.tsbuildinfo`, or unrelated work; pass them via `-Paths`.
2. **Run** `scripts/ship.ps1` (alias `npm run ship --`). It does: typecheck → create issue → create branch → commit → push → open PR to `main`:

   ```powershell
   npm run ship -- -Type feat -Title "add card viewer page" -Scope viewer -Body "details" -Paths src/app/preview,src/components/card
   ```

   Useful flags: `-Draft`, `-Watch` (wait for CI), `-NoIssue`, `-DryRun`, `-SkipChecks`.
3. **Report** the issue URL, branch, and PR URL. If CI fails, fix and push to the same branch.
4. **Merging** to `main` only when the user explicitly asks (`gh pr merge --squash --delete-branch`).

### Conventions

- Commit / PR title: Conventional Commits in English, lowercase, imperative: `type(scope): summary`
  (`feat fix refactor chore docs ci style perf test`).
- Branch: `feature/<issue>-<slug>` for feat, otherwise `<type>/<issue>-<slug>`.
- Base branch is `main` (`dev` is stale). Every PR contains `Closes #<issue>`.
- Issue labels: `bug` for fix, `documentation` for docs, `enhancement` otherwise.
- Never force-push or push directly to `main`.

## CI/CD

- `.github/workflows/ci.yml` – on PR/push to `main`: `npm ci`, lint (non-blocking for now), typecheck, build.
- `.github/workflows/deploy.yml` – on push to `main`: deploys to Vercel if `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` secrets exist; otherwise skipped.
