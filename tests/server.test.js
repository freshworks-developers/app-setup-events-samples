import { readFileSync } from 'fs';
import { runInNewContext } from 'vm';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const serverPath = join(dirname(fileURLToPath(import.meta.url)), '../server/server.js');

function loadServer() {
  const sandbox = {
    exports: {},
    renderData: vi.fn(),
    $schedule: {
      create: vi.fn(() => Promise.resolve({ status: 200 })),
      fetch: vi.fn(() => Promise.resolve({ name: 'syncSchedule' })),
      delete: vi.fn(() => Promise.resolve())
    },
    generateTargetUrl: vi.fn(() => Promise.resolve('https://example.test/webhook')),
    console
  };

  runInNewContext(readFileSync(serverPath, 'utf8'), sandbox);
  return sandbox;
}

describe('server.js — lifecycle handlers', function () {
  test('defines lifecycle handlers for FDK runtime', function () {
    const src = readFileSync(serverPath, 'utf8');
    expect(src).toContain('onAppInstallHandler');
    expect(src).toContain('afterAppUpdateHandler');
    expect(src).toContain('onAppUninstallHandler');
    expect(src).toContain('onScheduledEventHandler');
    expect(src).toContain('onExternalEventHandler');
    expect(src).toContain('psaTenantId');
  });

  test('onAppInstallHandler stores PSA tenant on schedule data', async function () {
    const sandbox = loadServer();

    await sandbox.exports.onAppInstallHandler({
      iparams: { psaTenantId: 'tenant-acme-001' }
    });

    expect(sandbox.$schedule.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ tenant: 'tenant-acme-001' })
      })
    );
    expect(sandbox.generateTargetUrl).toHaveBeenCalled();
    expect(sandbox.renderData).toHaveBeenCalledWith();
  });

  test('afterAppUpdateHandler validates schedule', async function () {
    const sandbox = loadServer();

    await sandbox.exports.afterAppUpdateHandler({});

    expect(sandbox.$schedule.fetch).toHaveBeenCalledWith({ name: 'syncSchedule' });
    expect(sandbox.renderData).toHaveBeenCalledWith();
  });

  test('onAppUninstallHandler deletes schedule', async function () {
    const sandbox = loadServer();

    await sandbox.exports.onAppUninstallHandler({});

    expect(sandbox.$schedule.delete).toHaveBeenCalledWith({ name: 'syncSchedule' });
    expect(sandbox.renderData).toHaveBeenCalledWith();
  });
});
