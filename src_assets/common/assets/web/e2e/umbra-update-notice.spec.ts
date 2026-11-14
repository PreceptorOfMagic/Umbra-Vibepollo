import { test, expect, type Page } from '@playwright/test';

// Umbra's update notice on the Overview page (umbra/UmbraCard.vue): Umbra's own release comes from the
// Project Hub's updates.json, and a release published there with "notify": false is not announced.

const INSTALLED = '2.0.0-umbra.1';

async function host(page: Page, releases: Record<string, unknown>[]) {
  await page.route('**/api/**', async (route) => {
    const path = new URL(route.request().url()).pathname;
    let body: unknown = { status: true };
    if (path === '/api/auth/status') body = { authenticated: true, login_required: false, credentials_configured: true };
    else if (path === '/api/configLocale') body = { locale: 'en' };
    else if (path === '/api/csrf-token') body = { csrf_token: 'test-token' };
    else if (path === '/api/config') body = { status: true, version: INSTALLED, platform: 'windows' };
    else if (path === '/api/metadata') body = { platform: 'windows', version: INSTALLED, providers: {} };
    else if (path === '/api/session/status') body = { status: true, activeSessions: 0, appRunning: false };
    else if (path === '/api/clients/list') body = { named_certs: [] };
    else if (path === '/api/apps') body = { apps: [] };
    else if (/games|categories|sessions|history|display/.test(path)) body = [];
    await route.fulfill({ json: body });
  });
  // Vibepollo upstream: not newer than the installed base, so only Umbra's own notice is in play.
  await page.route('https://api.github.com/repos/Nonary/Vibepollo/releases**', (route) =>
    route.fulfill({ json: { tag_name: 'v2.0.0', html_url: 'https://example.invalid/vibepollo', prerelease: false } }),
  );
  await page.route('https://preceptorofmagic.github.io/Eclipse-Umbra-Project-Hub/updates.json', (route) =>
    route.fulfill({
      json: {
        schema: 1,
        'umbra-vibepollo': {
          download_url: 'https://example.invalid/umbra-latest',
          how_to_update: { windows: 'Run the new installer over this version.' },
          releases,
        },
      },
    }),
  );
}

test('an announced release shows as an info line with a folded What\'s new', async ({ page }) => {
  await host(page, [
    { version: '2.0.0-umbra.3', notify: false, highlights: ['Silent fix'] },
    { version: '2.0.0-umbra.2', date: '2026-11-20', highlights: ['Announced feature'] },
    { version: INSTALLED, highlights: [] },
  ]);
  await page.goto('/v2/');
  const card = page.locator('.umbra-card');
  await expect(card.getByText('Umbra (Vibepollo) 2.0.0-umbra.2 is available.')).toBeVisible();
  await expect(card.getByRole('link', { name: 'Download Umbra (Vibepollo) 2.0.0-umbra.2' })).toHaveAttribute(
    'href',
    'https://example.invalid/umbra-latest',
  );
  await expect(card.getByText('Announced feature')).toBeHidden();
  await card.getByText("What's new").click();
  await expect(card.getByText('Announced feature')).toBeVisible();
  await expect(card.getByText('Silent fix')).toHaveCount(0);
  await expect(card.getByText('Run the new installer over this version.')).toBeVisible();
  await card.screenshot({ path: process.env.UMBRA_SHOT || '/tmp/umbra-card.png' });
});

test('a silent release alone is not announced', async ({ page }) => {
  await host(page, [
    { version: '2.0.0-umbra.2', notify: false, highlights: ['Silent fix'] },
    { version: INSTALLED, highlights: [] },
  ]);
  await page.goto('/v2/');
  const card = page.locator('.umbra-card');
  await expect(card.getByText('up to date', { exact: false })).toBeVisible();
  await expect(card.getByText('is available')).toHaveCount(0);
  await expect(card.getByText("What's new")).toHaveCount(0);
});
