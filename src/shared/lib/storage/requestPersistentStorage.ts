/**
 * Ask the browser to keep our storage durable so it is not silently evicted
 * under storage pressure. All auction data — lots (IndexedDB autosave), players,
 * pistols/bombs, rage %, event settings (localStorage) — lives in the browser
 * per origin. This is best-effort: when unsupported or denied, storage simply
 * stays in its default "best-effort" mode.
 *
 * Note: data is tied to the exact address (protocol + host + port) you open the
 * app at, so always use the same URL and browser to keep it.
 */
export const requestPersistentStorage = async (): Promise<void> => {
  try {
    if (typeof navigator === 'undefined' || !navigator.storage?.persist) return;
    if (await navigator.storage.persisted?.()) return;
    await navigator.storage.persist();
  } catch {
    // Best-effort; ignore failures (e.g. private mode or unsupported browsers).
  }
};
