Use Cases - NovaBridge MSP / App Setup Events
==============================================

Company Overview
----------------

**NovaBridge MSP** is a managed service provider using **Freshdesk** to run multi-tenant support for retail and fintech clients. Each client installs NovaBridge's marketplace app to sync tickets with an external PSA platform. Install, upgrade, and uninstall must be reliable — a failed webhook registration or orphaned schedule must not leave integrations running in production.

* * * * *

Use Case Scenarios
------------------

### 1\. First-Time Marketplace Install

**Scenario**: A Freshdesk admin installs NovaBridge Sync for a new client. The app must register a recurring serverless job and an external webhook before the install completes.

**Use Case**: `onAppInstallHandler` creates `syncSchedule` (10-minute repeat) and calls `generateTargetUrl()` for PSA webhook registration. Non-200 schedule status or registration failure calls `renderData({ message })` to block install.

* * * * *

### 2\. Manual App Version Upgrade

**Scenario**: NovaBridge ships v2.0. Admins click **Update** in Manage Apps. The existing sync schedule must still be valid before the new version runs.

**Use Case**: `afterAppUpdateHandler` uses `$schedule.fetch({ name: 'syncSchedule' })`. Success calls `renderData()`; failure calls `renderData({ message })` to revert to the previous version.

* * * * *

### 3\. Uninstall Hygiene

**Scenario**: A client offboards from NovaBridge. Recurring jobs must not keep firing against a deprovisioned tenant.

**Use Case**: `onAppUninstallHandler` deletes `syncSchedule` via `$schedule.delete`. Cleanup errors are logged but do not block uninstall.

* * * * *

### 4\. Recurring Ticket–PSA Sync

**Scenario**: Every 10 minutes, NovaBridge pulls ticket deltas and pushes updates to the PSA without an agent opening the sidebar.

**Use Case**: The schedule `data` from install is passed to `onScheduledEventHandler`, which logs a stub sync cycle. Production apps would call `$request.invokeTemplate` here.

* * * * *

### 5\. External PSA Webhook

**Scenario**: The PSA pushes ticket status changes to Freshworks via the URL generated during install.

**Use Case**: `onExternalEventHandler` logs webhook headers and body. Register the target URL during `onAppInstall` with `generateTargetUrl()`.
