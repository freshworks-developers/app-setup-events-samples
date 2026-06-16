const { LIFECYCLE_HANDLERS } = require('../app/scripts/lib/lifecycle-catalog.js');

global.LIFECYCLE_HANDLERS = LIFECYCLE_HANDLERS;
global.app = {
  initialized: vi.fn(() =>
    Promise.resolve({
      events: { on: vi.fn() },
      data: {
        get: vi.fn(() =>
          Promise.resolve({
            ticket: { id: 42 }
          })
        )
      },
      iparams: {
        get: vi.fn(() =>
          Promise.resolve({
            psaTenantId: 'tenant-acme-001'
          })
        )
      },
      instance: {
        resize: vi.fn(() => Promise.resolve())
      }
    })
  )
};

describe('ticket-sidebar.js', function () {
  beforeEach(function () {
    document.body.innerHTML = `
      <div id="tenant-banner" hidden></div>
      <dd id="tenant-id"></dd>
      <dd id="ticket-context"></dd>
      <ul id="lifecycle-list"></ul>
      <fw-button id="refresh-btn"></fw-button>
    `;
    vi.clearAllMocks();
  });

  test('lifecycle catalog lists registered handlers', function () {
    const registered = LIFECYCLE_HANDLERS.filter(function (item) {
      return item.registered;
    });

    expect(registered.length).toBe(5);
    expect(LIFECYCLE_HANDLERS.some(function (item) {
      return item.event === 'onAppInstall';
    })).toBe(true);
  });

  test('sidebar initializes and loads tenant + ticket context', async function () {
    await import('../app/scripts/ticket-sidebar.js');

    await new Promise(function (resolve) {
      setTimeout(resolve, 0);
    });

    expect(global.app.initialized).toHaveBeenCalled();
    expect(document.getElementById('tenant-id').textContent).toBe('tenant-acme-001');
    expect(document.getElementById('ticket-context').textContent).toContain('Ticket #42');
  });
});
