# NovaBridge MSP — App Setup Events

Full **Platform 3.0** lifecycle sample for managed-service integrations: install, pre-update, post-update, uninstall, recurring schedules, and external webhooks.

**Platform:** 3.0 · **FDK:** 10.1.2 · **Node:** 24.11.0 · **UI:** Crayons v4

---

## Handlers

| Event | Handler | Purpose |
|-------|---------|---------|
| `onAppInstall` | `onAppInstallHandler` | Creates `syncSchedule` via `$schedule.create`, registers webhook URL via `generateTargetUrl()` |
| `onAppUpdate` | `onAppUpdateHandler` | Pre-update hook (handler + test_data included; **not registerable in manifest** — see blockers) |
| `afterAppUpdate` | `afterAppUpdateHandler` | Validates schedule with `$schedule.fetch`; `renderData({ message })` reverts on failure |
| `onAppUninstall` | `onAppUninstallHandler` | Deletes schedule via `$schedule.delete` |
| `onScheduledEvent` | `onScheduledEventHandler` | Stub PSA sync job (logs tenant payload) |
| `onExternalEvent` | `onExternalEventHandler` | Demo webhook callback handler |

All events are registered under `modules.common.events` in `manifest.json`.

---

## Setup

```sh
git clone https://github.com/freshworks-developers/app-setup-events-samples.git
cd app-setup-events-samples
fdk validate
fdk run
```

In the FDK test UI, pick an event from the drop-down (`onAppInstall`, `onAppUpdate`, `afterAppUpdate`, `onAppUninstall`, `onScheduledEvent`, `onExternalEvent`) and invoke the matching handler. Test payloads live in `server/test_data/`.

> **Note:** If your app registers `afterAppUpdate`, admins must click **Update** in Manage Apps — tenants are not auto-upgraded.

```sh
fdk pack
```

---

## Project structure

```
.
├── manifest.json
├── config/iparams.json
├── server/
│   ├── server.js
│   └── test_data/          # Payloads for fdk run simulation
├── app/
│   ├── index.html          # Ticket sidebar — lifecycle status for dev testing
│   ├── scripts/app.js
│   └── styles/
├── README.md
└── USECASE.md
```

---

## Blockers

- **`onAppUpdate`:** FDK 10.1.2 rejects `onAppUpdate` in `modules.common.events` (`Invalid event: 'onAppUpdate' for module: common`). Handler and `server/test_data/onAppUpdate.json` are included for inventory coverage; wire into manifest when the platform adds support.

---

## Tech stack

- **Platform:** Freshworks Platform 3.0
- **Runtime:** Node.js 24.11.0 · FDK 10.1.2
- **UI:** Crayons v4 (minimal dev sidebar)

---

## Resources

- [App setup events](https://developers.freshworks.com/docs/app-sdk/v3.0/common/app-settings/app-setup-events/)
- [External events](https://developers.freshworks.com/docs/app-sdk/v3.0/common/serverless-apps/external-events/)
- [Scheduled events](https://developers.freshworks.com/docs/app-sdk/v3.0/common/serverless-apps/scheduled-events/)
- [USECASE.md](./USECASE.md)
