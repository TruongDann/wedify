# Wedify – agent instructions

Next.js 16 / React 19 wedding-card editor. Node 22, npm.

## Commands

- `npm run typecheck` – must pass
- `npm run build` – must pass
- `npm run lint` – has known pre-existing errors; do not add new ones

## UI / design system

Before building or changing any UI in `src/`, read [`DESIGN.md`](DESIGN.md) and follow it:
use the design tokens (`text-ink`, `border-line`, `bg-primary`…) instead of hex or `slate/gray-*`,
reuse the editor components it lists, `lucide-react` icons, Vietnamese sentence-case copy.
Content rendered on the card itself (user-chosen fonts/colors) is out of scope.

## "Ship" workflow

When the user asks to "up", "đẩy", "push", "ship" or "tạo PR" for a change, do the **whole** flow without asking again:

1. **Scope** – decide which files belong to the request (`git status`). Never stage secrets (`.env*`), `.next/`, `*.tsbuildinfo`, or unrelated work; pass them via `-Paths`.
2. **Run** `scripts/ship.ps1` (alias `npm run ship --`). It does: typecheck → create issue → create branch → commit → push → open PR to `dev`:

   ```powershell
   npm run ship -- -Type feat -Title "add card viewer page" -Scope viewer -Body "details" -Paths src/app/preview,src/components/card
   ```

   Useful flags: `-Draft`, `-Watch` (wait for CI), `-NoIssue`, `-DryRun`, `-SkipChecks`.
3. **Report** the issue URL, branch, and PR URL. If CI fails, fix and push to the same branch.
4. **Merging** only when the user explicitly asks (`gh pr merge --squash --delete-branch`). Release = PR `dev` -> `main` (`-Base main` / `gh pr create --base main --head dev`), which triggers the deploy.

### Conventions

- Commit / PR title: Conventional Commits in English, lowercase, imperative: `type(scope): summary`
  (`feat fix refactor chore docs ci style perf test`).
- Branch: `feature/<issue>-<slug>` for feat, otherwise `<type>/<issue>-<slug>`.
- Feature/fix branches branch off and PR into `dev` (integration); `main` is production and only receives `dev` via release PR. Every PR contains `Closes #<issue>`. Note: `Closes` only auto-closes issues when merged into the default branch (`main`), so close issues manually after merging to `dev`.
- Issue labels: `bug` for fix, `documentation` for docs, `enhancement` otherwise.
- Never force-push or push directly to `main`.

## CI/CD

- `.github/workflows/ci.yml` – on PR/push to `dev` and `main`: `npm ci`, lint (non-blocking for now), typecheck, build.
- Deploy: Vercel Git integration (no workflow). Push to `main` = production (`wedify-ruby.vercel.app`); other branches/PRs get Preview URLs. `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_REQUIRE_PREMIUM` are set in Vercel project env vars.
