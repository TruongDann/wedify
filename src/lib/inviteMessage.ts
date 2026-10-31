/** Mẫu lời mời gửi khách qua Zalo / Messenger. {xung_ho}, {ten}, {link} được thay theo từng khách. */
export interface InviteTemplate {
  key: string;
  label: string;
  text: string;
}

export const INVITE_TEMPLATES: InviteTemplate[] = [
  {
    key: "formal",
    label: "Trang trọng (người lớn, họ hàng)",
    text:
      "Kính gửi {xung_ho} {ten},\n" +
      "Gia đình chúng con trân trọng kính mời {xung_ho} tới dự lễ thành hôn của chúng con. " +
      "Sự hiện diện của {xung_ho} là niềm vinh hạnh cho gia đình.\n" +
      "Thông tin chi tiết trong thiệp mời: {link}",
  },
  {
    key: "friend",
    label: "Thân mật (bạn bè)",
    text:
      "Hi {ten}! Tụi mình sắp cưới rồi nè 💍\n" +
      "Mời {ten} tới chung vui với tụi mình nha, có {ten} là vui lắm luôn.\n" +
      "Thiệp đây nè: {link}",
  },
  {
    key: "colleague",
    label: "Lịch sự (đồng nghiệp, đối tác)",
    text:
      "Chào {xung_ho} {ten},\n" +
      "Mình xin trân trọng mời {xung_ho} tới dự tiệc cưới của mình. " +
      "Thời gian và địa điểm có trong thiệp: {link}\n" +
      "Rất mong được đón tiếp {xung_ho}!",
  },
];

/** Gợi ý mẫu theo nhóm khách */
export const templateForGroup = (group?: string) =>
  group === "FAMILY" ? "formal" : group === "FRIEND" ? "friend" : "colleague";

/** Điền thông tin khách vào mẫu; khách chưa có xưng hô thì dùng "bạn" */
export const fillInviteMessage = (
  template: string,
  guest: { name: string; honorific?: string },
  link: string,
) =>
  template
    .replaceAll("{xung_ho}", guest.honorific?.trim() || "bạn")
    .replaceAll("{ten}", guest.name.trim())
    .replaceAll("{link}", link)
    .replace(/[ \t]{2,}/g, " ");
