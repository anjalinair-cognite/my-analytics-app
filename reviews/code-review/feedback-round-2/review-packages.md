## Package audit: My Analytics App

Installed from `package-lock.json` / `node_modules`. `npm outdated --json` and `npm audit --json` collected in one shot each. Deprecated status spot-checked with `npm view <pkg> deprecated` for `react-pdf`, `@tanstack/react-table`, and `@cognite/aura` (flagged by major lag or advisory). All returned empty (not deprecated).

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
| react-error-boundary | 6.1.6 | 6.1.6 | No | 0 | Pass |
| react-pdf | 9.2.1 | 11.0.0 | No | 0 | Fail |
| recharts | 3.10.1 | 3.10.1 | No | 0 | Pass |
| tailwind-merge | 3.7.0 | 3.7.0 | No | 0 | Pass |

Health: **10 pass**, **3 warn**, **1 fail**.

Notes:
- Vitest GHSA-82fw-gwwq-j7x9 is closed (4.1.11). No moderate/high/critical advisories remain.
- `react-pdf` remains two majors behind (`9` → `11`); it is pulled in by the vendored file viewer.
- `react` / `react-dom` 18 vs 19 and `@tanstack/react-table` 8 vs 9 are one-major lags. Aura currently targets React 18.
- `@cognite/app-sdk` is one minor behind (`0.9.0` → `0.10.0`) — Pass.
- `clsx` / `tailwind-merge` still exist only for unused `cn()`.

### Security audit

| Severity | Count |
| -------- | ----- |
| Critical | 0 |
| High | 0 |
| Moderate | 0 |
| Low | 4 |

The four low entries are `@cognite/aura` → `@streamdown/mermaid` → `mermaid` → `katex`. `npm audit` still suggests aura `0.1.2` (a downgrade — do not take).

#### Vulnerabilities

| Package | Severity | Title | Patched in | Advisory |
| ------- | -------- | ----- | ---------- | -------- |
| katex (via mermaid / @cognite/aura) | Low | KaTeX: Existing prototype pollution can bypass trust restrictions | katex >=0.18.2 | https://github.com/advisories/GHSA-238p-pmpm-9mq7 |
| mermaid / @streamdown/mermaid / @cognite/aura | Low | Transitive via katex | Aura mermaid bump (do not downgrade aura) | https://github.com/advisories/GHSA-238p-pmpm-9mq7 |
