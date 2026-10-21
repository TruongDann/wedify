import { MUSIC_LIBRARY } from "@/constants/music";
import { photoUrl } from "./templateKit";
import { getDefaultContent, getTemplateMeta, type TemplateContent } from "./templates";

/** Dữ liệu người dùng nhập ở form "Dùng mẫu này". Chỉ gồm các thông tin chính của thiệp. */
export interface GuidedFormValues {
  title: string;
  nameA: string;
  nameB: string;
  /** Tuổi (sinh nhật). */
  age: string;
  subtitle: string;
  date: string;
  time: string;

  // Gia đình (cưới / đính hôn)
  groomFather: string;
  groomMother: string;
  groomAddress: string;
  brideFather: string;
  brideMother: string;
  brideAddress: string;
  /** Dòng giới thiệu chủ tiệc / gia đình bé (sinh nhật, thôi nôi). */
  hostLines: string;

  guestDefault: string;
  body: string;
  story: string;
  schedule: Array<{ time: string; title: string; note: string }>;
  venue: string;
  address: string;
  mapUrl: string;
  thanks: string;

  photoHero: string;
  photoStory: [string, string];
  gallery: [string, string, string, string, string];

  bankName: string;
  accountNumber: string;
  accountHolder: string;

  musicId: number;
}

export type TemplateKind = "wedding" | "engagement" | "birthday" | "baby";

export const hasFamilyFields = (kind: TemplateKind) => kind === "wedding" || kind === "engagement";

/** Bỏ dòng trống, ghép tiền tố (Ông/Bà) cho tên bố mẹ. */
const parentLine = (prefix: string, name: string) => (name.trim() ? `${prefix} ${name.trim()}` : "");
const joinLines = (...lines: string[]) => lines.map((line) => line.trim()).filter(Boolean).join("\n");

const SAMPLE_FAMILY = {
  groomFather: "Nguyễn Văn A",
  groomMother: "Trần Thị B",
  groomAddress: "Hà Nội",
  brideFather: "Lê Văn C",
  brideMother: "Phạm Thị D",
  brideAddress: "Hải Phòng",
};

const DEFAULT_MUSIC_ID = 7;

export const defaultFormValues = (templateId: string): GuidedFormValues | null => {
  const meta = getTemplateMeta(templateId);
  const content = getDefaultContent(templateId);
  if (!meta || !content) return null;

  const family = hasFamilyFields(meta.kind);
  return {
    title: content.nameB ? `${content.nameA} & ${content.nameB}` : content.nameA,
    nameA: content.nameA,
    nameB: content.nameB ?? "",
    age: content.bigNumber ?? "",
    subtitle: meta.kind === "baby" ? content.subtitle : "",
    date: content.date,
    time: content.time,
    ...(family ? SAMPLE_FAMILY : { groomFather: "", groomMother: "", groomAddress: "", brideFather: "", brideMother: "", brideAddress: "" }),
    hostLines: family ? "" : (content.hosts[0]?.lines ?? ""),
    guestDefault: content.guest,
    body: content.body,
    story: content.story,
    schedule: content.schedule.map((item) => ({ ...item })),
    venue: content.venue,
    address: content.address,
    mapUrl: "",
    thanks: content.thanks,
    photoHero: content.photos.hero,
    photoStory: [...content.photos.story],
    gallery: [...content.photos.gallery],
    bankName: "",
    accountNumber: "",
    accountHolder: "",
    musicId: DEFAULT_MUSIC_ID,
  };
};

const musicById = (id: number) => MUSIC_LIBRARY.find((track) => track.id === id) ?? MUSIC_LIBRARY[0];

/** Chuyển giá trị form thành nội dung để dựng thiệp. Trường bỏ trống được lược khỏi thiệp. */
export const contentFromForm = (templateId: string, values: GuidedFormValues): TemplateContent | null => {
  const meta = getTemplateMeta(templateId);
  const base = getDefaultContent(templateId);
  if (!meta || !base) return null;

  const nameA = values.nameA.trim() || base.nameA;
  const nameB = hasFamilyFields(meta.kind) ? values.nameB.trim() : "";
  const couple = nameB ? `${nameA} & ${nameB}` : nameA;
  const filledSchedule = values.schedule.filter((item) => item.title.trim() || item.time.trim());
  const track = musicById(values.musicId);

  let hosts = base.hosts;
  if (hasFamilyFields(meta.kind)) {
    hosts = [
      { title: "NHÀ TRAI", lines: joinLines(parentLine("Ông", values.groomFather), parentLine("Bà", values.groomMother), values.groomAddress) },
      { title: "NHÀ GÁI", lines: joinLines(parentLine("Ông", values.brideFather), parentLine("Bà", values.brideMother), values.brideAddress) },
    ];
  } else {
    hosts = [{ title: base.hosts[0]?.title ?? "CHỦ TIỆC", lines: values.hostLines.trim() || nameA }];
  }

  return {
    ...base,
    nameA,
    nameB: nameB || undefined,
    bigNumber: meta.kind === "birthday" ? values.age.trim() || base.bigNumber : undefined,
    subtitle:
      meta.kind === "birthday"
        ? `Sinh nhật lần thứ ${values.age.trim() || base.bigNumber || ""}`
        : meta.kind === "baby"
          ? values.subtitle.trim() || base.subtitle
          : "",
    date: values.date || base.date,
    time: values.time || base.time,
    guest: values.guestDefault.trim() || base.guest,
    body: values.body.trim() || base.body,
    hosts,
    story: values.story.trim() || base.story,
    schedule: filledSchedule.length ? filledSchedule : base.schedule,
    venue: values.venue.trim() || base.venue,
    address: values.address.trim() || base.address,
    thanks: values.thanks.trim() || base.thanks,
    closing: couple,
    photos: {
      hero: values.photoHero || base.photos.hero,
      story: [values.photoStory[0] || base.photos.story[0], values.photoStory[1] || base.photos.story[1]],
      gallery: values.gallery.map((src, i) => src || base.photos.gallery[i]) as TemplateContent["photos"]["gallery"],
    },
    musicSrc: track.src ?? base.musicSrc,
    musicName: track.name,
    musicArtist: track.artist,
  };
};

/** Hồ sơ lưu kèm thiệp: trang xuất bản dùng để hiện tên, ngày, quà mừng, ảnh mở thiệp... */
export const profileFromForm = (templateId: string, values: GuidedFormValues, content: TemplateContent) => {
  const meta = getTemplateMeta(templateId);
  return {
    guided: true,
    templateId,
    templateName: meta?.name ?? "",
    formValues: values,
    groomName: content.nameA,
    brideName: content.nameB ?? "",
    weddingDate: content.date,
    weddingTime: content.time,
    location: content.venue,
    address: content.address,
    mapUrl: values.mapUrl.trim(),
    story: content.story,
    timeline: content.schedule,
    gallery: content.photos.gallery.map((src) => photoUrl(src, 600, 600)),
    guestDefault: content.guest,
    bankName: values.bankName.trim(),
    accountNumber: values.accountNumber.trim(),
    accountHolder: values.accountHolder.trim(),
    // Dữ liệu cho màn hình "Mở thiệp" ở trang xuất bản
    cover: {
      image: photoUrl(content.photos.hero, 600, 800),
      accent: meta?.accent ?? "#be123c",
      kind: meta?.kind ?? "wedding",
      eyebrow: content.eyebrow,
    },
  };
};
