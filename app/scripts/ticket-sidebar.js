(function () {
  const MAX_SIDEBAR_HEIGHT = '520px';

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  async function init() {
    renderLifecycleList();
    document.getElementById('refresh-btn').addEventListener('fwClick', refreshContext);

    try {
      const client = await app.initialized();
      client.events.on('app.activated', refreshContext);
      await refreshContext();
      await resizeIfSidebar(client);
    } catch (err) {
      console.error('[NovaBridge] init error:', err);
      setText('ticket-context', 'Failed to initialize sidebar.');
    }
  }

  function renderLifecycleList() {
    const list = document.getElementById('lifecycle-list');
    const handlers = window.LIFECYCLE_HANDLERS || [];
    list.innerHTML = handlers.map(function (item) {
      const badge = item.registered ? 'registered' : 'reference';
      return (
        '<li class="nb-lifecycle-list__item">' +
        '<span class="nb-lifecycle-list__event">' + item.event + '</span>' +
        '<span class="nb-lifecycle-list__badge nb-lifecycle-list__badge--' + badge + '">' +
        badge +
        '</span>' +
        '<span class="nb-lifecycle-list__api">' + item.api + '</span>' +
        '</li>'
      );
    }).join('');
  }

  async function refreshContext() {
    const client = await app.initialized();
    await loadTenantContext(client);
    await loadTicketContext(client);
  }

  async function loadTenantContext(client) {
    const tenantEl = document.getElementById('tenant-id');
    const banner = document.getElementById('tenant-banner');

    try {
      const iparams = await client.iparams.get();
      const tenantId = (iparams && iparams.psaTenantId) || '';

      if (tenantId) {
        tenantEl.textContent = tenantId;
        banner.hidden = true;
      } else {
        tenantEl.textContent = 'Not set (demo OK)';
        banner.hidden = false;
      }
    } catch (err) {
      console.error('[NovaBridge] iparams error:', err);
      tenantEl.textContent = 'Unavailable in this surface';
      banner.hidden = false;
    }
  }

  async function loadTicketContext(client) {
    try {
      const { ticket } = await client.data.get('ticket');
      setText(
        'ticket-context',
        'Ticket #' + ticket.id + ' — simulate server events in fdk run.'
      );
    } catch {
      setText(
        'ticket-context',
        'Open a ticket with ?dev=true, then simulate events in fdk run.'
      );
    }
  }

  async function resizeIfSidebar(client) {
    try {
      await client.instance.resize({ height: MAX_SIDEBAR_HEIGHT });
    } catch {
      /* ignore on surfaces that do not support resize */
    }
  }

  function setText(id, text) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = text;
    }
  }
})();
