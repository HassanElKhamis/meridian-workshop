# Timeline

**Prepared for:** Meridian Components, Inc.
**RFP:** MC-2026-0417 — Inventory Dashboard Modernization

---

## Phased Delivery Plan — 10 Weeks

We propose a 10-week engagement structured in three phases. Each phase ends with a working demo and a sign-off checkpoint. You will see functional software every two weeks.

### Phase 1 — Stabilize (Weeks 1–3)

| Week | Activity | Deliverable |
|------|----------|-------------|
| **1** | Onboarding: architecture review, environment setup, audit of Reports module defects | Defect log (confirmed list of all Reports issues) |
| **1** | Playwright test infrastructure setup | Test scaffolding, CI configuration |
| **2** | Reports remediation — fix filter wiring, i18n gaps, console errors | Working Reports page (partial, filters fixed) |
| **2** | Dashboard browser tests (R3) | Test suite: Dashboard + Inventory flows |
| **3** | Reports remediation — complete remaining fixes | Working Reports page (all fixes verified) |
| **3** | Reports browser tests (R3) | Test suite: Reports + Orders flows |
| **3** | Phase 1 demo & sign-off | **Demo:** Reports fixed, Dashboard/Inventory tests passing |

**Checkpoint:** Meridian IT reviews test coverage and architecture notes. If tests pass, IT unblocks further changes.

---

### Phase 2 — Extend (Weeks 4–7)

| Week | Activity | Deliverable |
|------|----------|-------------|
| **4** | Restocking backend API — `/api/restock` endpoint with budget logic | FastAPI endpoint (tested, documented) |
| **5** | Restocking frontend — new view with warehouse selector, budget input, results table | Working Restocking view |
| **5** | Restocking browser tests (R3) | Test suite: Restocking flow |
| **6** | i18n extension — Japanese locale for Tokyo warehouse | Translated views (priority: Inventory, Orders, Reports) |
| **7** | Polish — edge cases, validation, UX refinement | Completed Restocking view + i18n |
| **7** | Phase 2 demo & sign-off | **Demo:** Restocking feature live, Japanese locale active |

**Checkpoint:** R. Tanaka's team tests Restocking in a staging environment. Feedback incorporated before Phase 3.

---

### Phase 3 — Harden (Weeks 8–10)

| Week | Activity | Deliverable |
|------|----------|-------------|
| **8** | Architecture documentation — system overview, API reference, data flow diagrams | Draft architecture docs in `docs/architecture/` |
| **9** | Test hardening — gap analysis, additional edge-case tests, CI/CD integration guide | Complete test suite with CI configuration |
| **9** | Knowledge transfer — runbook, handoff notes | Operations runbook |
| **10** | Final review — Meridian IT sign-off, PR merge, documentation complete | **Demo:** Full system walkthrough, PR merged, docs handed off |

**Checkpoint:** Meridian IT signs off on test coverage and architecture documentation. Project closes.

---

## Desired Items — Phase 2 Option

If desired items (D1–D3) are to be pursued, we propose a separate Phase 2 engagement:

| Item | Duration | Timing |
|------|----------|--------|
| D1 — UI Modernization | 2 weeks | After Phase 1 sign-off |
| D2 — i18n Full Extension | 1 week | After D1 or parallel with Phase 2 core |
| D3 — Dark Mode | 1 week | After D1 |

These can be scoped as a fixed-fee add-on or incorporated into the core engagement if timeline permits.

---

## Dependencies & Risks

| Risk | Mitigation |
|------|------------|
| IT team unavailable for sign-off checkpoints | Schedule checkpoints in advance; provide async demo recordings |
| Reports defect count exceeds initial estimate | Phase 1 budget absorbs up to 12 defects; beyond that, we propose a free follow-up sprint for critical items |
| Tokyo warehouse staff unavailable for i18n validation | Use translation memory tools; validate with remote Japanese speaker from our team |
| Restocking demand data incomplete from `/api/demand` | Discovery in Week 4; if data is insufficient, we prototype with synthetic data and document the gap |

---

## Communication Cadence

- **Weekly sync call** (30 min) with R. Tanaka's team — demo progress, gather feedback
- **Biweekly IT checkpoint** (60 min) with Meridian IT — review test coverage, architecture docs
- **Slack/Teams channel** — daily async updates, questions, and quick decisions