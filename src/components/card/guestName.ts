import { useSyncExternalStore } from "react";

/** Chữ giữ chỗ trong thiệp — trang xem thay bằng tên khách lấy từ link mời. */
export const GUEST_NAME_TOKEN = "{khách mời}";

/** Tên tham số trên link mời: /preview?khach=Anh%20Tuấn */
export const GUEST_NAME_PARAM = "khach";

const FALLBACK = "Quý khách";

const readGuestName = () => {
  const raw = new URLSearchParams(window.location.search).get(GUEST_NAME_PARAM);
  const name = raw?.replace(/\s+/g, " ").trim().slice(0, 60);
  return name || FALLBACK;
};

const noop = () => () => {};

/** Tên khách mời theo link đang mở; khi render phía server dùng "Quý khách". */
export const useGuestName = () => useSyncExternalStore(noop, readGuestName, () => FALLBACK);

export const fillGuestName = (text: string, guestName: string) =>
  text.includes(GUEST_NAME_TOKEN) ? text.split(GUEST_NAME_TOKEN).join(guestName) : text;
