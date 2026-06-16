const SCHEDULE_NAME = 'syncSchedule';

exports = {
  onAppInstallHandler: async function (args) {
    console.info('NovaBridge onAppInstall:', JSON.stringify(args));

    try {
      const scheduleAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      const tenantId = args.iparams?.psaTenantId || 'tenant-acme-001';
      const scheduleOpts = {
        name: SCHEDULE_NAME,
        schedule_at: scheduleAt,
        repeat: {
          time_unit: 'minutes',
          frequency: 10
        },
        data: {
          tenant: tenantId,
          desc: 'NovaBridge PSA sync payload'
        }
      };

      const { status } = await $schedule.create(scheduleOpts);
      if (status !== 200) {
        throw new Error('Unable to create sync schedule');
      }

      const targetUrl = await generateTargetUrl();
      console.info('PSA tenant registered for sync:', tenantId);
      console.info('External event target URL registered:', targetUrl);
      console.info('Schedule created successfully');
      renderData();
    } catch (error) {
      console.error('onAppInstall failed:', error);
      renderData({ message: String(error.message) });
    }
  },

  // Pre-update hook — not registerable in manifest until FDK supports onAppUpdate event.
  onAppUpdateHandler: function (args) {
    console.info('NovaBridge onAppUpdate (pre-update):', JSON.stringify(args));
    console.info('Preparing upgrade window; afterAppUpdate will validate schedule migration');
    renderData();
  },

  afterAppUpdateHandler: async function (args) {
    console.info('NovaBridge afterAppUpdate:', JSON.stringify(args));

    try {
      const schedule = await $schedule.fetch({ name: SCHEDULE_NAME });
      if (!schedule) {
        throw new Error('Sync schedule missing after upgrade');
      }

      console.info('Schedule validated after upgrade:', JSON.stringify(schedule));
      renderData();
    } catch (error) {
      console.error('afterAppUpdate validation failed:', error);
      renderData({ message: error.message });
    }
  },

  onAppUninstallHandler: async function (args) {
    console.info('NovaBridge onAppUninstall:', JSON.stringify(args));

    try {
      await $schedule.delete({ name: SCHEDULE_NAME });
      console.info('Sync schedule deleted during uninstall');
    } catch (error) {
      console.warn('Schedule cleanup skipped:', error.message);
    }

    renderData();
  },

  onScheduledEventHandler: function (args) {
    const tenant = (args.data && args.data.tenant) || 'tenant-acme-001';
    console.info('NovaBridge scheduled PSA sync started for tenant:', tenant);
    console.info('Schedule payload:', JSON.stringify(args.data || {}));
    console.info('Simulating ticket delta pull and PSA push');
    console.info('NovaBridge scheduled PSA sync completed for tenant:', tenant);
  },

  onExternalEventHandler: function (args) {
    console.info('NovaBridge external webhook received');
    console.info('Headers:', JSON.stringify(args.headers || {}));
    console.info('Body:', JSON.stringify(args.data || {}));
    console.info('External PSA callback processed');
  }
};
