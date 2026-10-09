## Package audit: My Analytics App

Installed from `package-lock.json` / `node_modules`. `npm outdated --json` and `npm audit --json` collected in one shot each. Deprecated status spot-checked with `npm view <pkg> deprecated` for packages that were ≥1 major behind, in audit advisories, or otherwise flagged (`react-pdf`, `@tanstack/react-table`, `@cognite/aura`, `vitest@4.1.10`). All returned empty (not deprecated).

### Dependencies

| Package | Used version | Latest | Deprecated | CVEs | Health |
| ------- | ------------ | ------ | ---------- | ---- | ------ |
| @cognite/app-sdk | 0.9.0 | 0.10.0 | No | 0 | Pass |
| @cognite/aura | 0.3.5 | 0.3.5 | No | 1 low (transitive mermaid/katex) | Pass |
| @cognite/sdk | 10.14.0 | 10.14.0 | No | 0 | Pass |
| @tabler/icons-react | 3.48.0 | 3.49.0 | No | 0 | Pass |
| @tanstack/react-query | 5.104.1 | 5.104.1 | No | 0 | Pass |
| @tanstack/react-table | 8.21.3 | 9.2.6 | No | 0 | Warn |
| @tanstack/react-virtual | 3.14.13 | 3.14.13 | No | 0 | Pass |
| clsx | 2.1.1 | 2.1.1 | No | 0 | Pass |
| react | 18.3.1 | 19.3.0 | No | 0 | Warn |
| react-dom | 18.3.1 | 19.3.0 | No | 0 | Warn |
| react-pdf | 9.2.1 | 11.0.0 | No | 0 | Fail |
| recharts | 3.10.1 | 3.10.1 | No | 0 | Pass |
| tailwind-merge | 3.7.0 | 3.7.0 | No | 0 | Pass |

Health: **9 pass**, **3 warn**, **1 fail**.

Notes:
- `react-pdf` is two majors behind (`9` → `11`) and is pulled in by the vendored Cognite file viewer. Not deprecated; upgrade needs a viewer compatibility check.
- `react` / `react-dom` 18 vs 19 and `@tanstack/react-table` 8 vs 9 are one-major lags in `dependencies` (Warn). Aura currently targets React 18.
- `@cognite/app-sdk` is one minor behind (`0.9.0` → `0.10.0`) — Pass per rubric (≤1 minor).
- `clsx` and `tailwind-merge` exist only to support unused `cn()` in `src/lib/utils.ts`.

### Dev dependencies (flagged)

| Package | Used version | Latest | Deprecated | CVEs | Health |
| ------- | ------------ | ------ | ---------- | ---- | ------ |
| vitest | 4.1.10 | 4.1.11 | No | 1 moderate (GHSA-82fw-gwwq-j7x9) | Warn |
| @vitest/coverage-v8 | 4.1.10 | 5.0.3 (wanted 4.1.11) | No | 1 moderate (via vitest) | Warn |
| @vitest/ui | 4.1.10 | 5.0.3 (wanted 4.1.11) | No | 1 moderate (via vitest) | Warn |

Patch available in-range: **vitest 4.1.11**.

### Security audit

| Severity | Count |
| -------- | ----- |
| Critical | 0 |
| High | 0 |
| Moderate | 4 |
| Low | 4 |

`npm audit` metadata: 8 total advisories; 0 critical, 0 high. The four moderate entries are the same Vitest path-traversal advisory propagating through `vitest`, `@vitest/mocker`, `@vitest/coverage-v8`, and `@vitest/ui`. The four low entries are `@cognite/aura` → `@streamdown/mermaid` → `mermaid` → `katex`.

#### Vulnerabilities

| Package | Severity | Title | Patched in | Advisory |
| ------- | -------- | ----- | ---------- | -------- |
| vitest / @vitest/mocker | Moderate | Vitest: Path Traversal / Arbitrary File Read via @vitest/mocker Redirect Mock | >=4.1.11 | https://github.com/advisories/GHSA-82fw-gwwq-j7x9 |
| @vitest/coverage-v8 | Moderate | Same advisory via vitest | vitest >=4.1.11 | https://github.com/advisories/GHSA-82fw-gwwq-j7x9 |
| @vitest/ui | Moderate | Same advisory via vitest | vitest >=4.1.11 | https://github.com/advisories/GHSA-82fw-gwwq-j7x9 |
| katex (via mermaid / @cognite/aura) | Low | KaTeX: Existing prototype pollution can bypass trust restrictions | katex >=0.18.2 | https://github.com/advisories/GHSA-238p-pmpm-9mq7 |
| mermaid / @streamdown/mermaid / @cognite/aura | Low | Transitive via katex | Aura would need a mermaid bump; `npm audit` suggests aura 0.1.2 (downgrade — do not take) | https://github.com/advisories/GHSA-238p-pmpm-9mq7 |
