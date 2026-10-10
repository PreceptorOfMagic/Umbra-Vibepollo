<script setup lang="ts">
// Umbra (Vibepollo): this edition's panel on the Overview page -- version, the Vibepollo release it is
// built on, the update notice, Umbra's links and legal. Strings: umbra.* in identity.ts.
import { onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import { apiGet } from '@/api/client';
import { InlineAlert, UiIcon } from '@/components/ui';
import {
  ECLIPSE_REPO,
  HUB,
  UMBRA_RELEASES_API,
  UMBRA_REPO,
  UPSTREAM_RELEASES_API,
} from '@/umbra/edition';

interface Parsed {
  base: string | null;
  umbra: number | null;
}
interface Release extends Parsed {
  tag: string;
  url: string;
}

const { t } = useI18n();
const installed = ref<(Parsed & { raw: string }) | null>(null);
const upstream = ref<Release | null>(null);
const umbra = ref<Release | null>(null);
const state = ref<'loading' | 'unknown' | 'up_to_date' | 'upstream_new_umbra_not' | 'upstream_new_umbra_has' | 'umbra_update'>('loading');

// This edition's versions are '<Vibepollo release>-umbra.<n>', e.g. 2.0.0-umbra.1 (BUILD_VERSION at build
// time). Anything else installed -- a dev build reads 0.0.0.<commit> -- has NO known Vibepollo base.
function parse(version: string | undefined): Parsed {
  const m = /^v?(\d+\.\d+\.\d+)(?:-umbra\.(\d+))?$/.exec(version || '');
  return m && m[1] !== '0.0.0'
    ? { base: m[1], umbra: m[2] !== undefined ? Number(m[2]) : null }
    : { base: null, umbra: null };
}

// A release tag: its leading x.y.z (Vibepollo pre-releases look like 2.0.0-beta.4).
function parseTag(tag: string): Parsed {
  const m = /^v?(\d+\.\d+\.\d+)(?:-umbra\.(\d+))?/.exec(tag || '');
  return m ? { base: m[1], umbra: m[2] !== undefined ? Number(m[2]) : null } : { base: null, umbra: null };
}

function cmp(a: string, b: string): number {
  const x = a.split('.').map(Number);
  const y = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if (x[i] !== y[i]) return x[i] - y[i];
  return 0;
}

// Newest published release; pre-releases count only when "notify_pre_releases" is on.
async function latest(api: string, pre: boolean): Promise<Release | null> {
  try {
    const r = await fetch(pre ? api + '?per_page=10' : api + '/latest', {
      headers: { Accept: 'application/json' },
      credentials: 'omit',
    });
    if (!r.ok) return null;
    const body = await r.json();
    const j = pre ? (Array.isArray(body) ? body.find((x: { draft?: boolean }) => !x.draft) : null) : body;
    return j && j.tag_name && (pre || !j.prerelease)
      ? { tag: j.tag_name, url: j.html_url, ...parseTag(j.tag_name) }
      : null;
  } catch {
    return null;
  }
}

onMounted(async () => {
  let pre = false;
  try {
    const config = await apiGet<Record<string, unknown>>('/api/config');
    installed.value = { raw: String(config.version ?? ''), ...parse(String(config.version ?? '')) };
    pre = ['true', 'yes', 'enable', 'enabled', 'on', '1'].includes(
      String(config.notify_pre_releases ?? '').trim().toLowerCase(),
    );
  } catch {
    // Leave the installed version unknown.
  }
  const [a, u] = await Promise.all([latest(UPSTREAM_RELEASES_API, pre), latest(UMBRA_RELEASES_API, pre)]);
  upstream.value = a && a.base ? a : null;
  umbra.value = u && u.base ? u : null;
  const base = installed.value?.base;
  if (!upstream.value || !base) {
    state.value = 'unknown';
  } else if (cmp(upstream.value.base!, base) > 0) {
    state.value =
      umbra.value && cmp(umbra.value.base!, upstream.value.base!) >= 0 ? 'upstream_new_umbra_has' : 'upstream_new_umbra_not';
  } else if (
    umbra.value &&
    (cmp(umbra.value.base!, base) > 0 ||
      (cmp(umbra.value.base!, base) === 0 && (umbra.value.umbra ?? 0) > (installed.value?.umbra ?? 0)))
  ) {
    state.value = 'umbra_update';
  } else {
    state.value = 'up_to_date';
  }
});
</script>

<template>
  <section class="overview-panel umbra-card" aria-labelledby="umbra-card-title">
    <div class="overview-panel__heading">
      <h2 id="umbra-card-title">{{ t('umbra.title') }}</h2>
    </div>
    <p v-if="installed" class="umbra-card__muted">
      {{ installed.umbra !== null ? t('umbra.version', { version: installed.raw }) : t('umbra.dev_build', { version: installed.raw }) }}
      ·
      {{ installed.base ? t('umbra.built_on', { upstream: installed.base }) : t('umbra.base_unknown') }}
    </p>
    <p>{{ t('umbra.thin_fork') }}</p>

    <p v-if="state === 'loading'" class="umbra-card__muted">{{ t('umbra.checking') }}</p>
    <template v-else>
      <InlineAlert v-if="!upstream" tone="info" :title="t('umbra.upstream_check_failed')" />
      <InlineAlert v-else-if="state === 'up_to_date'" tone="success" :title="t('umbra.up_to_date', { upstream: upstream.tag })" />
      <InlineAlert v-else-if="state === 'upstream_new_umbra_not'" tone="warning" :title="t('umbra.upstream_new_umbra_not', { upstream: upstream.tag })">
        <a :href="upstream.url" target="_blank" rel="noopener noreferrer">{{ t('umbra.upstream_notes') }}</a>
      </InlineAlert>
      <InlineAlert
        v-else-if="state === 'upstream_new_umbra_has' && umbra"
        tone="warning"
        :title="t('umbra.upstream_new_umbra_has', { upstream: upstream.tag, umbra: umbra.tag })"
      >
        <a :href="umbra.url" target="_blank" rel="noopener noreferrer">{{ t('umbra.download_umbra', { umbra: umbra.tag }) }}</a>
      </InlineAlert>
      <InlineAlert v-else-if="state === 'umbra_update' && umbra" tone="warning" :title="t('umbra.umbra_update', { umbra: umbra.tag })">
        <a :href="umbra.url" target="_blank" rel="noopener noreferrer">{{ t('umbra.download_umbra', { umbra: umbra.tag }) }}</a>
      </InlineAlert>
      <p v-if="upstream && !umbra" class="umbra-card__muted">{{ t('umbra.umbra_unknown') }}</p>
    </template>

    <h3>{{ t('umbra.resources') }}</h3>
    <p>{{ t('umbra.resources_desc') }}</p>
    <nav class="umbra-card__links" :aria-label="t('umbra.resources')">
      <a :href="HUB" target="_blank" rel="noopener noreferrer">{{ t('umbra.project_hub') }}<UiIcon name="external-link" :size="14" /></a>
      <a :href="UMBRA_REPO" target="_blank" rel="noopener noreferrer">{{ t('umbra.source') }}<UiIcon name="external-link" :size="14" /></a>
      <a :href="UMBRA_REPO + '/issues'" target="_blank" rel="noopener noreferrer">{{ t('umbra.issues') }}<UiIcon name="external-link" :size="14" /></a>
      <a :href="ECLIPSE_REPO" target="_blank" rel="noopener noreferrer">{{ t('umbra.eclipse') }}<UiIcon name="external-link" :size="14" /></a>
    </nav>

    <h3>{{ t('umbra.legal') }}</h3>
    <p>{{ t('umbra.modified', { upstream: installed?.base ? installed.base : '?' }) }}</p>
    <p>{{ t('umbra.licence') }}</p>
    <p>{{ t('umbra.not_affiliated') }}</p>
    <nav class="umbra-card__links" :aria-label="t('umbra.legal')">
      <a :href="UMBRA_REPO + '/blob/HEAD/LICENSE'" target="_blank" rel="noopener noreferrer">{{ t('umbra.licence_link') }}<UiIcon name="external-link" :size="14" /></a>
      <a :href="UMBRA_REPO + '/blob/HEAD/LICENSES.md'" target="_blank" rel="noopener noreferrer">{{ t('umbra.notices_link') }}<UiIcon name="external-link" :size="14" /></a>
      <a :href="UMBRA_REPO + '/blob/HEAD/THIRD-PARTY-NOTICES.md'" target="_blank" rel="noopener noreferrer">{{ t('umbra.third_party_link') }}<UiIcon name="external-link" :size="14" /></a>
      <a :href="UMBRA_REPO" target="_blank" rel="noopener noreferrer">{{ t('umbra.source_link') }}<UiIcon name="external-link" :size="14" /></a>
    </nav>
  </section>
</template>
