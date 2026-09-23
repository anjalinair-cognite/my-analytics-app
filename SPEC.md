# Feature Specification: My Analytics App

Living product spec for the Flows app **My Analytics App** (`my-analytics-app`). Aligns with `App-Brief.md` (Tier 1: Monitoring & reporting) and the Cognite **Core Data Model (CDM)** in project **publicdatacdm**.

**Sources (do not invent beyond these):**

- `App-Brief.md` — persona, problem, one-sentence story, success criteria
- [Core data model](https://docs.cognite.com/cdf/dm/dm_reference/dm_core_data_model) — `cdf_cdm` / **CogniteCore** `v1`
- [System schemas](https://docs.cognite.com/cdf/dm/dm_concepts/dm_system_schemas) — `cdf_*` spaces are read-only schemas
- [Time series in data modeling](https://docs.cognite.com/cdf/dm/dm_guides/dm_integrate_with_time_series) — instances + Time Series API for datapoints
- [Files in data modeling](https://docs.cognite.com/cdf/dm/dm_guides/dm_integrate_files) — `CogniteFile` + File content API
- [Process industries data model](https://docs.cognite.com/cdf/dm/dm_reference/dm_process_industry_data_model) — optional work-order specialization in `cdf_idm`
- [Open Industrial Data / publicdatacdm](https://docs.cognite.com/dev/quickstart#try-with-sample-data)
- Cognite Toolkit [View YAML](https://docs.cognite.com/cdf/deploy/cdf_toolkit/references/resource_library#views) — how CDM views are referenced (`space` + `externalId` + `version`)

---

## User Scenarios & Testing

### User Stories

1. **P1 — Unified equipment view.** As an Operations Analyst, I want to search for a specific piece of equipment and instantly see its connected time series data, recent work orders (activities), and related documents in one unified view, so that I can quickly understand its status without switching between five different systems.

2. **P1 — Search by tag.** As an Operations Analyst, I want to type an equipment tag (for example `PUMP-101`) and get ranked matches from CDM, so that I can start from the identifier I already have after an alarm or shift report.

3. **P1 — Live trend.** As an Operations Analyst, I want to see a live (recent) time-series chart for a series linked to the selected asset or equipment, so that I do not open a separate historian.

4. **P1 — Documents on the same page.** As an Operations Analyst, I want to open an associated file (manual or P&ID) from the same dashboard page, so that I do not dig through SharePoint.

5. **P2 — Briefing snapshot.** As an Operations Analyst, I want name, description, parent/hierarchy context, and recent activities visible together, so that I can brief maintenance with complete data.

### Acceptance Scenarios

- **Given** the analyst is signed into Fusion on project `publicdatacdm`, **when** they open My Analytics App, **then** they see a search field and can search CDM assets/equipment without leaving the app.
- **Given** search results are listed, **when** they select one instance, **then** the same page shows that instance’s identity, related time series, related activities, and related files (or explicit empty states if a relation has no data).
- **Given** at least one related numeric time series exists, **when** they view the selected instance, **then** they can see a chart of recent datapoints for a series without opening another CDF app.
- **Given** at least one related uploaded file exists, **when** they choose that file, **then** they can preview or open it from the same page.
- **Given** CDF returns an error or the instance has no related series/files/activities, **when** the page renders, **then** they see a clear error or empty message — not a blank or broken layout.
- **Given** a selected instance (and search query) is in the URL via host state, **when** they reload or open a shared link, **then** the same instance and query are restored.

---

## Requirements

### Functional Requirements

- **FR-001:** The app MUST let the user search CDM instances by name, alias, or external id using the Instances **search** API against `cdf_cdm.CogniteAsset:v1` and `cdf_cdm.CogniteEquipment:v1` (search-first, then hydrate — not a full graph scan).
- **FR-002:** After selection, the app MUST show identity fields from CDM describable/sourceable properties: `name`, `description`, `externalId`, `space`, and (for assets) `parent` when present.
- **FR-003:** The app MUST list time series related to the selected asset or equipment (`CogniteTimeSeries` linked via `assets` / `equipment`) and MUST chart recent **datapoints** through the Time Series API (not the Instances API).
- **FR-004:** The app MUST list related maintenance-style records as `cdf_cdm.CogniteActivity:v1` (start/end, name, description, status-like source fields when present). This is the v1 stand-in for SAP work orders on a CDM-only project.
- **FR-005:** The app MUST list related `cdf_cdm.CogniteFile:v1` instances and MUST allow the user to open/preview an uploaded file (P&ID, manual, datasheet) from the same page via the File content API.
- **FR-006:** The app MUST read industrial data only through **data modeling instances** (CDM views). It MUST NOT use legacy `/assets`, `/files` list-by-internal-id, or `/timeseries` metadata endpoints as the primary model (datapoints and file bytes still use their dedicated APIs keyed by instance `space` + `externalId`).
- **FR-007:** Selected instance `{ space, externalId }`, search query, and chart time range MUST be host-synced (`syncInternalState` / `initialState`) so reload and shared links restore the view.
- **FR-008:** Loading, empty, and error states MUST be visible for search, instance header, time series, activities, and files independently (one missing relation must not hide the others).
- **FR-009:** The app is **read-only**. It MUST NOT create, update, or delete CDM instances, datapoints, or files.
- **FR-010:** UI MUST use Aura primitives (search, table/list, chart container, alerts, loaders). Target device is desktop / large monitor in an office (occasionally control room).
- **FR-011:** Users need CDM read access as documented: `dataModelsAcl.READ` on `cdf_cdm`, `dataModelInstancesAcl.READ` on the instance spaces that hold publicdatacdm nodes, plus time-series datapoint read and file-content read for charts and previews.

### Query approach (implementation contract)

1. **Discover:** `instances.search` on Asset and Equipment views (user is matching a tag).
2. **Hydrate:** `instances.query` from the selected node along **single** direct relations (for example Equipment → `asset`, Asset → `parent`).
3. **Reverse list relations:** Asset `timeSeries`, `files`, and `activities` are reverse relations through **list** properties on the related views. If `/query` reverse traversal is not valid for that list property, use `instances.search` / `list` with a `containsAny` (or equivalent) filter on `CogniteTimeSeries.assets`, `CogniteFile`’s asset relation, and `CogniteActivity.assets` / `.equipment`. Confirm against the live view schema in `publicdatacdm`.
4. **Datapoints:** Time Series API using the time series instance id (`space` + `externalId`). Default window: last 24 hours; user can change range (host-synced).
5. **File bytes:** File content API (or CogniteFileViewer) using the file instance id. Do not assume classic numeric file ids.

---

## Success Criteria

- **SC-001:** The analyst can search an asset/equipment tag, view a live time-series chart, and open an associated file from the **same dashboard page** (App-Brief success indicator).
- **SC-002:** Completing that path does not require opening 3–4 siloed apps (SAP, historian, SharePoint, Excel).
- **SC-003:** Investigation for a flagged tag drops from **hours to minutes** for the happy path (search → select → chart + file), measured qualitatively in demo; target under 10 minutes.
- **SC-004:** Empty and error states are understandable without console inspection (no silent failure).
- **SC-005:** Reload and shared Fusion links restore the same search query and selected instance.

---

## Clarifications

- **Work orders vs activities:** SAP-style **maintenance orders** are modeled in CDM as `CogniteActivity` and specialized in Process Industries as `cdf_idm.CogniteMaintenanceOrder:v1`. v1 of this app reads **CogniteActivity** only so it runs on CogniteCore in `publicdatacdm`. If that project later has populated IDM maintenance orders, a follow-up may add `CogniteMaintenanceOrder` without changing the UX contract (“recent work orders”).
- **CogniteFile asset relation name:** The [core model table](https://docs.cognite.com/cdf/dm/dm_reference/dm_core_data_model#file) lists property `asset`; the [files guide](https://docs.cognite.com/cdf/dm/dm_guides/dm_integrate_files) says `assets`. Implementation MUST read the live `cdf_cdm.CogniteFile:v1` view in `publicdatacdm` and use the actual property identifier.
- **Search scope:** Default search covers Asset and Equipment. If a tag exists only as a time series name, v1 does not require finding it until the user selects a parent asset/equipment.
- **Chart series:** If several series are linked, default to the first numeric series; user can pick another (selection host-synced).
- **P&ID overlay:** v1 opens the file; it does **not** require rendering `CogniteDiagramAnnotation` bounding boxes. Annotations remain an optional enhancement.
- **Instance spaces:** Schema lives in `cdf_cdm` (not writable). Instance data lives in project instance spaces. The app must not hardcode a single instance space; it uses `space` + `externalId` from search hits.

---

## Assumptions

- Target CDF project is **publicdatacdm** (org **publicdata**, cluster `https://api.cognitedata.com`) as in `app.json` — Open Industrial Data, CDM-enabled.
- v1 does **not** deploy new Toolkit views, containers, or data models. It only **reads** CogniteCore. Custom views that `implements: CogniteAsset` (Toolkit `*.View.yaml` pattern) are out of scope unless publicdatacdm lacks usable Asset/Equipment instances — which would be a data issue, not a schema-authoring task for this app.
- User evidence is an informed assumption (Asset 360 pattern), not a named-site interview.
- Desktop-first; mobile layout is out of scope for v1.
- No write-back to SAP, historian, or SharePoint.
- 3D / Reveal is out of scope for v1.
- Host integration via `@cognite/app-sdk` (`useCogniteSdk`, `syncInternalState`); no hardcoded cluster URLs or tokens.

---

## Data Models & CDF Integration *(mandatory)*

This app is **CDM-native**. Industrial records are instances of CogniteCore views in system space **`cdf_cdm`**, data model **CogniteCore** version **`v1`**. New development uses the Instances API, not legacy Asset resource APIs ([CDM vs legacy](https://docs.cognite.com/cdf/dm/dm_reference/dm_core_data_model)).

Toolkit equivalent reference (we consume, we do not deploy):

```yaml
# How CDM views are identified in Toolkit View YAML / Instances API
source:
  type: view
  space: cdf_cdm
  externalId: CogniteAsset  # or CogniteEquipment, CogniteTimeSeries, CogniteFile, CogniteActivity
  version: v1
```

### Existing views

Format: `<space>.<view>:<version>`.

| View | Role in this app |
| --- | --- |
| `cdf_cdm.CogniteAsset:v1` | Functional location / tag. Search hub. `name`, `description`, `parent`, reverse lists for equipment, time series, activities, files. |
| `cdf_cdm.CogniteEquipment:v1` | Physical device (pump, valve). `asset`, `serialNumber`, `manufacturer`, `equipmentType`; reverse lists for activities and time series; `files` as a list of file relations. |
| `cdf_cdm.CogniteTimeSeries:v1` | Sensor/historian series. `assets`, `equipment`, `type`, `isStep`, `unit` / `sourceUnit`. Node must have data in this view to be a time series; **datapoints** via Time Series API. |
| `cdf_cdm.CogniteFile:v1` | Documents (P&ID, manual). Linked to assets; **bytes** via File content API. `mimeType`, `isUploaded`. |
| `cdf_cdm.CogniteActivity:v1` | Time-bounded work (maintenance activity / work-order stand-in). `assets`, `equipment`, `timeSeries`, plus schedulable `startTime` / `endTime`. |
| `cdf_cdm.CogniteEquipmentType:v1` | Optional: type label when Equipment.`equipmentType` is set. |
| `cdf_cdm.CogniteUnit:v1` | Optional: engineering unit on a time series. |

**Not in v1 (schema exists, app does not require it):**

| View | Why skipped |
| --- | --- |
| `cdf_idm.CogniteMaintenanceOrder:v1` | Process Industries specialization of activity (“work order”). Use only if `publicdatacdm` actually has instances. |
| `cdf_idm.CogniteOperation:v1` | Line items on a maintenance order. |
| `cdf_cdm.CogniteDiagramAnnotation:v1` | P&ID tag bounding boxes. File open is enough for v1. |

### New views

None for v1. The app does not extend CDM with custom views, containers, or a solution data model.

If a future iteration needs site-specific properties, follow Toolkit practice: a `*.View.yaml` in a customer space with `implements: { space: cdf_cdm, externalId: CogniteAsset, version: v1 }` — that is **not** required to ship this certification app.

### Spaces

| Space | Contents | App usage |
| --- | --- | --- |
| `cdf_cdm` | CogniteCore schema (views, containers, data model). **Not writable** for instances. | `dataModelsAcl.READ`; all view sources above. |
| `cdf_cdm_units` | Unit catalog instances. | Read if displaying `CogniteTimeSeries.unit`. |
| `cdf_idm` | CogniteProcessIndustries schema (not used in v1 queries). | Out of scope unless we add maintenance orders later. |
| Project instance spaces in **publicdatacdm** | Actual Asset, Equipment, TimeSeries, File, Activity **nodes**. Space names are whatever Open Industrial Data uses; discovered from search hits. | `dataModelInstancesAcl.READ`; never hardcode. |

### Relationship map (Asset 360)

```
CogniteEquipment.asset ──► CogniteAsset
CogniteAsset.parent    ──► CogniteAsset (hierarchy)
CogniteTimeSeries.assets / .equipment ──► Asset / Equipment
CogniteActivity.assets / .equipment   ──► Asset / Equipment
CogniteFile ──► Asset (property name: verify live view)
CogniteEquipment.files ──► CogniteFile
```

The Operations Analyst’s “five systems” map onto this graph: tag (Asset/Equipment), historian (TimeSeries + datapoints), SAP work orders (Activity), SharePoint docs (File).
