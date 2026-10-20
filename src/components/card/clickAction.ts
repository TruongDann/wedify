import type { ClickAction, EditorElement } from "@/types/editor";

/** Hành động hiện tại của phần tử; thiệp cũ chỉ có `hyperlink` thì coi là mở liên kết. */
export const getClickAction = (el: EditorElement): ClickAction => {
  if (el.clickAction) return el.clickAction;
  const hyperlink = (el as { hyperlink?: string }).hyperlink;
  return hyperlink ? { type: "link", url: hyperlink } : { type: "none" };
};

/** Sự kiện yêu cầu mở hộp QR mừng cưới — CardViewer lắng nghe và hiện hộp. */
export const OPEN_GIFT_EVENT = "wedify:open-gift";

export const scrollToElement = (id: string) =>
  document
    .querySelector(`[data-el-id="${CSS.escape(id)}"]`)
    ?.scrollIntoView({ behavior: "smooth", block: "center" });
