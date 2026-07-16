# Technical Approach

**Prepared for:** Meridian Components, Inc.
**RFP:** MC-2026-0417 — Inventory Dashboard Modernization

---

## Current-State Assessment

Based on our review of the source code and vendor handoff notes, we understand the current system as follows:

- **Frontend:** Vue 3 with Composition API, served via Vite on port 3000. Some views still use the legacy Options API — migration is incomplete.
- **Backend:** Python FastAPI on port 8001. Data is stored in JSON files under `server/data/` — no relational database. This simplifies deployment but limits concurrency and data integrity at scale.
- **API:** RESTful endpoints covering inventory, orders, dashboard summary, demand, backlog, and spending. Filter system uses query parameters (warehouse, category, status, month).
- **Testing:** No automated test coverage exists. This is the primary blocker for IT approval of changes.
- **Internationalization:** Partially implemented. Tokyo warehouse views are English-only.

### Key Risk

The absence of a database means all data operations are file-based. While acceptable for Meridian's current scale (~180 employees, $9.6M revenue), this architecture requires careful handling during concurrent operations. Our approach will preserve the current data layer while adding defensive patterns (locking, validation) to prevent data corruption during the engagement.

---

## Approach by Requirement

### R1 — Reports Module Remediation

**Objective:** Audit and resolve all defects in the existing Reports page.

**Approach:**

1. **Audit** — We will instrument the Reports page with diagnostic logging and trace each of the four filter controls (Time Period, Warehouse, Category, Order Status) through the full data path: Vue component → `api.js` → FastAPI endpoint → JSON data layer. This will surface every unwired filter, every i18n gap, and every console error.
2. **Fix** — Each defect will be resolved in its own commit with a descriptive message referencing the issue. We will follow the existing code patterns (Composition API, computed properties for derived data) to keep the changes reviewable.
3. **Verify** — Each fix will be paired with a browser test (see R3) so the defect cannot regress.

**Deliverable:** A fully functional Reports page with documented defect log and test coverage for every fix.

**Assumptions:** The ~8 issues referenced in the RFP represent the full set. If additional defects are discovered during the audit, we will log them and propose a follow-up phase at no additional cost for critical items.

---

### R2 — Restocking Recommendations

**Objective:** New view recommending purchase orders based on stock levels, demand forecast, and operator-supplied budget ceiling.

**Approach:**

1. **Backend** — Add a new FastAPI endpoint `POST /api/restock` that accepts:
   - `warehouse` (string)
   - `budget_ceiling` (number, in USD)
   - The endpoint reads current inventory from the data layer, cross-references demand forecast, and computes recommended purchase orders ranked by stockout risk. Results are capped at the budget ceiling.
2. **Frontend** — Build a Restocking view (`client/src/views/Restocking.vue`) with:
   - Warehouse selector and budget input
   - Results table showing: product, current stock, forecasted demand, recommended order quantity, estimated cost
   - "Generate Purchase Order" action per row
   - Summary bar showing total recommended spend vs. budget ceiling
3. **Validation** — Edge cases handled: zero-demand products, out-of-stock items with no forecast, budget exceeded during recommendation generation.

**Deliverable:** A working Restocking view integrated into the dashboard navigation, with backend API and test coverage.

**Assumptions:** Demand forecast data is available from the existing `/api/demand` endpoint. If additional data sources are needed, we will scope them in a discovery phase.

---

### R3 — Automated Browser Testing

**Objective:** End-to-end test coverage for critical user flows.

**Approach:**

We will use **Playwright**, a modern browser automation framework that supports parallel execution, cross-browser testing, and HTML report generation. Playwright is already configured in the project's `.mcp.json`.

**Test suites:**

| Suite | Coverage |
|-------|----------|
| Dashboard | Load dashboard → verify summary cards → switch warehouse → verify data updates |
| Inventory | Apply filters (warehouse, category) → verify table updates → verify row count |
| Reports | Apply each filter independently → verify chart updates → verify export works |
| Orders | Filter by status → open order details → verify data matches |
| Restocking | Select warehouse → enter budget → verify recommendations → verify budget compliance |

**Deliverable:** A Playwright test suite in `tests/e2e/` with CI-ready configuration. Tests can be run locally (`npx playwright test`) or in CI.

**Assumptions:** Tests will run against the development environment. Meridian IT will need to integrate them into their CI/CD pipeline — we will provide configuration guidance.

---

### R4 — Architecture Documentation

**Objective:** Current-state architecture overview for Meridian IT handoff.

**Approach:**

We will produce the following deliverables:

1. **System Overview** — High-level diagram showing frontend, backend, and data layers with deployment topology.
2. **API Reference** — Documented endpoint list with request/response schemas, generated from FastAPI's OpenAPI spec.
3. **Data Flow Diagrams** — Sequence diagrams for each critical flow (inventory query, report generation, restocking recommendation).
4. **Known Limitations** — Honest assessment of the JSON-based data layer, including scaling constraints and recommendations for future database migration.
5. **Runbook** — How to start the application, run tests, and perform common operational tasks.

**Format:** HTML for diagrams (interactive), Markdown for text documents. All stored in `docs/architecture/`.

**Deliverable:** A complete architecture package suitable for Meridian IT review and handoff.

---

## Desired Items (D1–D3)

We propose addressing the desired items in a **Phase 2** following the core engagement, or as stretch goals if Phase 1 finishes ahead of schedule:

| Item | Approach |
|------|----------|
| **D1 — UI Modernization** | Apply a consistent design system (Tailwind CSS utility classes) across all views. Standardize spacing, typography, and component styling. Preserve existing color palette (slate/gray) per handoff notes. |
| **D2 — i18n Extension** | Extend Vue I18n to cover all views. Prioritize Japanese locale for Tokyo warehouse. Ship translation files as separate JSON per locale. |
| **D3 — Dark Mode** | Implement CSS custom properties (CSS variables) for theme tokens. Add operator toggle in dashboard header. Persist preference in localStorage. |

---

## Quality Assurance

- **Code reviews:** Every pull request is reviewed by at least one engineer before merge.
- **Tests:** No code is merged without test coverage. Browser tests run on every PR.
- **Documentation:** All changes are documented in the commit message and reflected in the architecture docs.
- **Knowledge transfer:** Weekly sync calls with R. Tanaka's team to demo progress and gather feedback.