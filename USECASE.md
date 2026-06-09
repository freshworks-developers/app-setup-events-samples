# Use Cases — NovaBridge MSP (App Setup Events Sample)

**Sample repo:** [freshworks-developers/app-setup-events-samples](https://github.com/freshworks-developers/app-setup-events-samples)  
**Features demonstrated:** Full app lifecycle — `onAppInstall`, `onAppUpdate`, `afterAppUpdate`, `onAppUninstall`, `onScheduledEvent`, `onExternalEvent`, `$schedule.create` / `$schedule.fetch` / `$schedule.delete`, `generateTargetUrl()`, `renderData()` success/failure paths

## Company Overview

**NovaBridge MSP** is a managed service provider using **Freshdesk** to run multi-tenant support for retail and fintech clients. Each client account installs NovaBridge’s marketplace app to sync tickets with an external PSA (Professional Services Automation) platform. Install, upgrade, and uninstall must be reliable: a failed webhook registration, broken sync schedule, or half-migrated upgrade must not leave integrations live in production.

---

## Handler mapping

| Scenario | Event | Handler | API / behavior |
|----------|-------|---------|----------------|
| First-time install | `onAppInstall` | `onAppInstallHandler` | `$schedule.create` + `generateTargetUrl()` → `renderData()` or block install |
| Pre-update gate | `onAppUpdate` | `onAppUpdateHandler` | Handler + test payload included; manifest registration blocked by FDK 10.1.2 |
| Post-update validation | `afterAppUpdate` | `afterAppUpdateHandler` | `$schedule.fetch({ name: 'syncSchedule' })` → success or revert via `renderData({ message })` |
| Uninstall cleanup | `onAppUninstall` | `onAppUninstallHandler` | `$schedule.delete({ name: 'syncSchedule' })` |
| Recurring PSA sync | `onScheduledEvent` | `onScheduledEventHandler` | Logs tenant sync stub every 10 minutes |
| PSA webhook callback | `onExternalEvent` | `onExternalEventHandler` | Logs headers + body from external system |

Manifest registration: all handlers in `modules.common.events` (`manifest.json` at repo root).

---

## Use Case Scenarios

### 1. First-Time Marketplace Install (`onAppInstall`)

**Scenario:** A Freshdesk admin installs NovaBridge Sync for a new client. The app must register a recurring serverless job and an external webhook before the install completes.

**Use Case:** `onAppInstallHandler` creates `syncSchedule` (10-minute repeat) and calls `generateTargetUrl()` for PSA webhook registration. Non-200 schedule status or registration failure calls `renderData({ message })` to block install.

---

### 2. Pre-Update Hook (`onAppUpdate`)

**Scenario:** NovaBridge ships v2.0. Before the new version activates, operations need a hook to log the upgrade window or pause non-critical syncs.

**Use Case:** `onAppUpdateHandler` runs before the new version is active (distinct from `afterAppUpdate`). It logs the payload and calls `renderData()` so the update proceeds unless you add blocking logic.

---

### 3. Manual App Version Upgrade (`afterAppUpdate`)

**Scenario:** Admins click **Update** in Manage Apps. The existing schedule must be validated before v2 runs.

**Use Case:** `afterAppUpdateHandler` uses `$schedule.fetch`. Success → `renderData()`. Failure → `renderData({ message })` reverts to the previous version.

---

### 4. Uninstall Hygiene (`onAppUninstall`)

**Scenario:** Client offboards from NovaBridge. Recurring jobs must not keep firing against a deprovisioned tenant.

**Use Case:** `onAppUninstallHandler` deletes `syncSchedule` via `$schedule.delete`. Cleanup errors are logged but do not block uninstall.

---

### 5. Recurring Ticket–PSA Sync (`onScheduledEvent`)

**Scenario:** Every 10 minutes, NovaBridge pulls ticket deltas and pushes updates to the PSA without an agent opening the sidebar.

**Use Case:** Schedule `data` from install is passed to `onScheduledEventHandler`, which logs a stub sync cycle. Production apps would call `$request.invokeTemplate` here.

---

### 6. External PSA Webhook (`onExternalEvent`)

**Scenario:** The PSA pushes ticket status changes to Freshworks via the URL from `generateTargetUrl()`.

**Use Case:** `onExternalEventHandler` logs webhook headers and body. Register the target URL during `onAppInstall`.

---

## Frontend (dev testing)

The ticket sidebar (`app/index.html`) lists all lifecycle handlers and shows the current ticket ID when opened on a ticket — useful to confirm the app loads while you simulate server events with `fdk run`.
