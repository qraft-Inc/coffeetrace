import localforage from 'localforage';

const draftStore = localforage.createInstance({
  name: 'coffeetrace',
  storeName: 'farm_identity_draft',
});

const queueStore = localforage.createInstance({
  name: 'coffeetrace',
  storeName: 'farm_identity_queue',
});

const DRAFT_KEY = 'current_draft';

export async function saveFarmDraft(draft) {
  await draftStore.setItem(DRAFT_KEY, {
    ...draft,
    savedAt: new Date().toISOString(),
  });
}

export async function loadFarmDraft() {
  return draftStore.getItem(DRAFT_KEY);
}

export async function clearFarmDraft() {
  await draftStore.removeItem(DRAFT_KEY);
}

export async function queueFarmSubmission(payload) {
  const id = payload.localQueueId || crypto.randomUUID();
  await queueStore.setItem(id, {
    ...payload,
    localQueueId: id,
    queuedAt: new Date().toISOString(),
  });
  return id;
}

export async function listQueuedFarmSubmissions() {
  const items = [];
  await queueStore.iterate((value) => {
    items.push(value);
  });
  return items.sort((a, b) => new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime());
}

export async function removeQueuedFarmSubmission(id) {
  if (!id) return;
  await queueStore.removeItem(id);
}

export async function syncQueuedFarmSubmissions() {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { synced: 0, failed: 0 };
  }

  const queued = await listQueuedFarmSubmissions();
  let synced = 0;
  let failed = 0;

  for (const item of queued) {
    try {
      const response = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item.payload),
      });

      if (!response.ok) {
        failed += 1;
        continue;
      }

      synced += 1;
      await removeQueuedFarmSubmission(item.localQueueId);
    } catch (error) {
      failed += 1;
    }
  }

  return { synced, failed };
}
