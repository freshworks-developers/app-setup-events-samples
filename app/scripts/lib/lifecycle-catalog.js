/** Registered and reference-only app setup event handlers for NovaBridge MSP Sync. */
const LIFECYCLE_HANDLERS = [
  {
    event: 'onAppInstall',
    registered: true,
    api: '$schedule.create + generateTargetUrl()'
  },
  {
    event: 'afterAppUpdate',
    registered: true,
    api: '$schedule.fetch validation'
  },
  {
    event: 'onAppUninstall',
    registered: true,
    api: '$schedule.delete cleanup'
  },
  {
    event: 'onScheduledEvent',
    registered: true,
    api: 'Recurring PSA sync stub'
  },
  {
    event: 'onExternalEvent',
    registered: true,
    api: 'Webhook callback demo'
  },
  {
    event: 'onAppUpdate',
    registered: false,
    api: 'Pre-update hook (reference only in FDK 10.1.2)'
  }
];

if (typeof window !== 'undefined') {
  window.LIFECYCLE_HANDLERS = LIFECYCLE_HANDLERS;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LIFECYCLE_HANDLERS };
}
