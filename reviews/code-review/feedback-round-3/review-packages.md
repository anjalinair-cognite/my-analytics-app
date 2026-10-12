## Package audit: My Analytics App

Installed from `package-lock.json` / `node_modules`. `npm outdated --json` and `npm audit --json` collected in one shot each. `npm view react-pdf deprecated` returned empty (not deprecated).

`npm outdated` reports `@cognite/app-sdk` latest `0.46522.0` and `@cognite/aura` latest `1.46472.0`. Those look like calver/canary tags, not the 0.10 / 0.3 line this app pins. Health below uses the 0.x/10.x track the app actually consumes.

### Dependencies

| Package | Used version | Latest | Deprecated | CVEs | Health |
| ------- | ------------ | ------ | ---------- | ---- | ------ |
| @cognite/app-sdk | 0.10.0 | 0.10.0 (0.x track) | No | 0 | Pass |
| @cognite/aura | 0.3.5 | 0.3.5 (0.x track) | No | 1 low (transitive mermaid/katex) | Pass |
| @cognite/sdk | 10.14.0 | 10.15.0 | No | 0 | Pass |
| @tabler/icons-react | 3.48.0 | 3.49.0 | No | 0 | Pass |
| @tanstack/react-query | 5.104.1 | 5.104.1 | No | 0 | Pass |
| @tanstack/react-table | 8.21.3 | 9.2.8 | No | 0 | Warn |
| @tanstack/react-virtual | 3.14.13 | 3.14.14 | No | 0 | Pass |
| react | 18.3.1 | 19.3.0 | No | 0 | Warn |
| react-dom | 18.3.1 | 19.3.0 | No | 0 | Warn |
| react-error-boundary | 6.1.6 | 6.1.6 | No | 0 | Pass |
| react-pdf | 9.2.1 | 11.0.0 | No | 0 | Fail |
| recharts | 3.10.1 | 3.10.1 | No | 0 | Pass |

Health: **8 pass**, **3 warn**, **1 fail**.

Notes:
- `@cognite/app-sdk` is on 0.10.0 (round-2 should/nice item closed).
- `clsx` / `tailwind-merge` removed with unused `cn()`.
- `react-pdf` remains two majors behind (`9` → `11`); pulled in by the file viewer.
- `react` / `react-dom` 18 vs 19 and `@tanstack/react-table` 8 vs 9 are one-major lags. Aura currently targets React 18.
- Do not `npm audit fix --force` Aura to 0.1.2 (a downgrade).

### Security audit

| Severity | Count |
| -------- | ----- |
| Critical | 0 |
| High | 0 |
| Moderate | 0 |
| Low | 4 |

#### Vulnerabilities

| Package | Severity | Title | Patched in | Advisory |
| ------- | -------- | ----- | ---------- | -------- |
| katex (via mermaid / @cognite/aura) | Low | KaTeX: Existing prototype pollution can bypass trust restrictions | katex >=0.18.2 | https://github.com/advisories/GHSA-238p-pmpm-9mq7 |
| mermaid / @streamdown/mermaid / @cognite/aura | Low | Transitive via katex | Aura mermaid bump (do not downgrade aura) | https://github.com/advisories/GHSA-238p-pmpm-9mq7 |
