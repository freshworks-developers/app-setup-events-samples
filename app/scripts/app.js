const LIFECYCLE_HANDLERS = [
  { event: 'onAppInstall', api: '$schedule.create + generateTargetUrl' },
  { event: 'onAppUpdate', api: 'Pre-update hook (renderData)' },
  { event: 'afterAppUpdate', api: '$schedule.fetch validation' },
  { event: 'onAppUninstall', api: '$schedule.delete cleanup' },
  { event: 'onScheduledEvent', api: 'Recurring PSA sync stub' },
  { event: 'onExternalEvent', api: 'Webhook callback demo' }
];

document.onreadystatechange = function () {
  if (document.readyState === 'interactive') {
    renderLifecycleList();
    initApp();
  }
};

function renderLifecycleList() {
  const list = document.getElementById('lifecycle-status');
  list.innerHTML = LIFECYCLE_HANDLERS.map(function (item) {
    return '<li><strong>' + item.event + '</strong> — ' + item.api + '</li>';
  }).join('');
}

function initApp() {
  app.initialized()
    .then(function (client) {
      window.client = client;
      client.events.on('app.activated', showTicketContext);
    })
    .catch(handleErr);
}

function showTicketContext() {
  const contextEl = document.getElementById('ticket-context');
  client.data.get('ticket')
    .then(function (payload) {
      contextEl.textContent = 'Ticket #' + payload.ticket.id + ' — use fdk run to simulate server events.';
    })
    .catch(function () {
      contextEl.textContent = 'Open a ticket sidebar to confirm frontend loads. Use fdk run to test server handlers.';
    });
}

function handleErr(err) {
  console.error('NovaBridge UI error:', err);
}
