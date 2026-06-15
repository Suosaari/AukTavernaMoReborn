import { v4 as uuidv4 } from 'uuid';

/**
 * Polyfill `crypto.randomUUID()` for non-secure contexts.
 *
 * `crypto.randomUUID()` is only exposed in **secure contexts** (HTTPS or
 * localhost). When the app is self-hosted over plain HTTP (e.g.
 * `http://<ip>:<port>`) it is `undefined`, so every caller throws
 * "crypto.randomUUID is not a function" — breaking archive import, auction
 * history, rules/settings persistence, etc.
 *
 * We back it with the `uuid` package (which works in any context). Imported for
 * its side effect once, as early as possible, in the app entrypoint.
 *
 * The real long-term fix is to serve the app over HTTPS.
 */
const cryptoObj = (globalThis as { crypto?: { randomUUID?: () => string } }).crypto;

if (cryptoObj && typeof cryptoObj.randomUUID !== 'function') {
  cryptoObj.randomUUID = (): string => uuidv4();
}
