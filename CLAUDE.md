# Meowdoku

See README.md for what the app is and how the game logic is laid out.

## Code style

- Formatting is owned by oxfmt (`.oxfmtrc.json`): no semicolons, single quotes, trailing commas, 120 columns, imports sorted. Don't hand-format; run `pnpm format`.
- Linting is oxlint (`.oxlintrc.json`) and warnings fail. Fix the code rather than adding `oxlint-disable` comments; if a rule is wrong for this project, turn it off in the config with a reason.
- Use `import type` / inline `type` for type-only imports.
- Prefer non-mutating array methods (`toSorted`, `toReversed`) and `Set#has` over `Array#includes` for fixed lookup lists.
- Use `addEventListener` rather than `on*` handler properties.

## Before committing

Run `pnpm check` (format check, lint, `tsc -b`, tests). The pre-commit hook runs the format check and lint too.
