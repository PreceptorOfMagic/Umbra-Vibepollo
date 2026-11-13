// Umbra's update notice: which release updates.json announces (umbra/updates.ts).
import assert from 'node:assert/strict';
import test from 'node:test';

import { compareVersions, evaluateUpdates } from '../umbra/updates.ts';

const doc = {
  schema: 1,
  'umbra-vibepollo': {
    download_url: 'https://example.invalid/latest',
    how_to_update: { windows: 'Run the installer.' },
    releases: [
      { version: '2.0.1-umbra.1', platforms: ['linux'], highlights: ['Linux only'] },
      { version: '2.0.0-umbra.3', notify: false, highlights: ['Quiet'] },
      { version: '2.0.0-umbra.2', date: '2026-11-20', highlights: ['Announced'] },
      { version: '2.0.0-umbra.1', highlights: ['Installed'] },
    ],
  },
};

test('versions: -umbra.n follows its upstream release, other suffixes precede it', () => {
  assert.ok(compareVersions('2.0.0-umbra.2', '2.0.0-umbra.1') > 0);
  assert.ok(compareVersions('2.0.0-umbra.1', '2.0.0') > 0);
  assert.ok(compareVersions('2.0.0-beta.4', '2.0.0') < 0);
  assert.ok(compareVersions('2.0.1', '2.0.0-umbra.9') > 0);
  assert.equal(compareVersions('umbra-v0.5.0', '0.5.0'), 0);
  assert.equal(compareVersions('umbra-linux-v0.5.2', 'v0.5.2'), 0);
});

test('the newest announced release for this platform, silent ones skipped on their own', () => {
  const n = evaluateUpdates(doc, 'umbra-vibepollo', 'windows', '2.0.0-umbra.1');
  assert.ok(n);
  assert.equal(n.latest, '2.0.0-umbra.2');
  assert.deepEqual(n.releases.map((r) => r.version), ['2.0.0-umbra.2']);
  assert.equal(n.howToUpdate, 'Run the installer.');
  assert.equal(evaluateUpdates(doc, 'umbra-vibepollo', 'windows', '2.0.0-umbra.2'), null);
});

test('a silent release is listed beneath a later announced one', () => {
  const later = structuredClone(doc);
  later['umbra-vibepollo'].releases.unshift({ version: '2.0.0-umbra.4', highlights: ['Later'] } as never);
  const n = evaluateUpdates(later, 'umbra-vibepollo', 'windows', '2.0.0-umbra.1');
  assert.deepEqual(n?.releases.map((r) => r.version), ['2.0.0-umbra.4', '2.0.0-umbra.3', '2.0.0-umbra.2']);
});

test('nothing for an unreadable document, another schema or a dev build', () => {
  assert.equal(evaluateUpdates(null, 'umbra-vibepollo', 'windows', '2.0.0-umbra.1'), null);
  assert.equal(evaluateUpdates({ ...doc, schema: 2 }, 'umbra-vibepollo', 'windows', '2.0.0-umbra.1'), null);
  assert.equal(evaluateUpdates(doc, 'umbra-vibepollo', 'windows', '0.0.0.abc1234'), null);
});
