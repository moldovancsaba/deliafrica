# Documentation index

Every document under `docs/`, listed once. Root-level documents (README, release notes, audits) are mapped in [HANDOVER.md](../HANDOVER.md#where-things-live). Currency is taken from each file's git history on 2026-10-05.

| Document | What it is for | How current |
| --- | --- | --- |
| [customer-direct/README.md](customer-direct/README.md) | Execution ledger of the original customer.direct engineering backlog (issues #1-#45 in this repository), delivery gates and milestones. | Historical. Written 2026-09-09; a status note dated 2026-10-05 says platform work moved to the `moldovancsaba/customer-direct` repository. |
| [customer-direct/01.md](customer-direct/01.md) | Issue #1 handover: compatibility baseline, `pnpm baseline:check`, synthetic legacy fixtures. | 2026-09-09. Issue closed. Still describes the current check. |
| [customer-direct/02.md](customer-direct/02.md) | Issue #2 handover: `pnpm check`, `pnpm test:integration`, the GitHub workflow with an isolated MongoDB replica. | 2026-09-09. Issue closed. Matches `.github/workflows/check.yml`. |
| [customer-direct/16.md](customer-direct/16.md) | Issue #16 handover: exact money contract in `lib/platform/money.mjs`. | 2026-09-09. Issue closed. States the module is not yet wired into checkout. |
| [customer-direct/39-preserved-storefront-a11y.md](customer-direct/39-preserved-storefront-a11y.md) | Issue #39 handover: accessibility and i18n evidence for the preserved deli storefront, `pnpm test:a11y`, `pnpm test:i18n`. | 2026-09-14. Issue closed. Latest dated evidence in `docs/`. |
| [customer-direct/backlog.json](customer-direct/backlog.json) | Machine-readable list of the 45 backlog issues and their dependencies. | Snapshot of 2026-09-09. Its `project` value (4) no longer resolves; this repository's board is project 70. |
| [customer-direct/baseline/inventory.json](customer-direct/baseline/inventory.json) | Route, model and environment-name inventory of commit `046fe53`. Read by `scripts/baseline-check.mjs`, so `pnpm check` fails if it is moved or if a listed route or model disappears. | Frozen baseline from 2026-09-09. Do not edit casually. |
