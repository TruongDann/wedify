/**
 * Draft Store
 * Lưu bản nháp thiệp đang thiết kế trong IndexedDB của trình duyệt.
 * Không dùng localStorage vì ảnh đang ở dạng data URL, vài tấm là vượt giới hạn ~5MB.
 * Khi có backend, thay các hàm này bằng lời gọi API — phần còn lại giữ nguyên.
 */

import { CardDocument } from "@/types/editor";

const DB_NAME = "wedify";
const STORE = "drafts";
const CURRENT_DRAFT = "current";
const CHANNEL = "wedify-draft";

const openDb = (): Promise<IDBDatabase> =>
  new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });

const run = async <T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest,
): Promise<T> => {
  const db = await openDb();
  try {
    return await new Promise<T>((resolve, reject) => {
      const tx = db.transaction(STORE, mode);
      const req = action(tx.objectStore(STORE));
      tx.oncomplete = () => resolve(req.result as T);
      tx.onerror = () => reject(tx.error);
      tx.onabort = () => reject(tx.error);
    });
  } finally {
    db.close();
  }
};

export const loadDraft = async (): Promise<CardDocument | null> => {
  const doc = await run<CardDocument | undefined>("readonly", (s) => s.get(CURRENT_DRAFT));
  return doc && doc.version === 1 ? doc : null;
};

export const saveDraft = async (
  doc: Omit<CardDocument, "version" | "savedAt">,
): Promise<CardDocument> => {
  const saved: CardDocument = { ...doc, version: 1, savedAt: new Date().toISOString() };
  await run("readwrite", (s) => s.put(saved, CURRENT_DRAFT));
  notifyDraftChanged();
  return saved;
};

/** Báo cho các tab khác (trang xem trước) biết bản nháp vừa thay đổi. */
const notifyDraftChanged = () => {
  if (typeof BroadcastChannel === "undefined") return;
  const channel = new BroadcastChannel(CHANNEL);
  channel.postMessage("changed");
  channel.close();
};

export const onDraftChanged = (callback: () => void): (() => void) => {
  if (typeof BroadcastChannel === "undefined") return () => {};
  const channel = new BroadcastChannel(CHANNEL);
  channel.onmessage = () => callback();
  return () => channel.close();
};
