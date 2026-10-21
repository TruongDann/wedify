"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { App, Button, Input, Modal, Result, Select, Spin } from "antd";
import { ArrowLeft, Camera, ChevronDown, Crown, Plus, Trash2 } from "lucide-react";
import { MUSIC_LIBRARY } from "@/constants/music";
import { userAuth } from "@/lib/auth";
import { REQUIRE_PREMIUM, isPremiumProfile } from "@/lib/premium";
import { uploadPhoto } from "@/lib/upload";
import { buildTemplateFromContent, getTemplateMeta } from "@/data/templates";
import { photoUrl } from "@/data/templateKit";
import {
  contentFromForm,
  defaultFormValues,
  hasFamilyFields,
  profileFromForm,
  type GuidedFormValues,
} from "@/data/templateForm";
import GuidedPreview from "@/components/invitation/GuidedPreview";

const { TextArea } = Input;
const BRAND = "#ef4565";

// ---------------------------------------------------------------- UI nhỏ

const Section: React.FC<{ title: string; hint?: string; defaultOpen?: boolean; children: React.ReactNode }> = ({ title, hint, defaultOpen = true, children }) => {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center justify-between px-5 py-4 text-left">
        <span>
          <span className="block text-base font-semibold text-slate-800">{title}</span>
          {hint ? <span className="mt-0.5 block text-xs text-slate-400">{hint}</span> : null}
        </span>
        <ChevronDown size={18} className={`text-slate-400 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {open ? <div className="space-y-4 border-t border-slate-100 px-5 pb-5 pt-4">{children}</div> : null}
    </section>
  );
};

const Field: React.FC<{ label: string; required?: boolean; children: React.ReactNode; className?: string }> = ({ label, required, children, className }) => (
  <label className={`block ${className ?? ""}`}>
    <span className="mb-1.5 block text-xs font-medium text-slate-500">
      {label} {required ? <span className="text-rose-500">*</span> : null}
    </span>
    {children}
  </label>
);

const PhotoTile: React.FC<{ label: string; value: string; onChange: (url: string) => void; onError: (message: string) => void; size?: number }> = ({ label, value, onChange, onError, size = 112 }) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const pick = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    try {
      onChange(await uploadPhoto(file));
    } catch (err) {
      onError(err instanceof Error ? err.message : "Không thể tải ảnh lên");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  return (
    <div className="text-center">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="group relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
        style={{ width: size, height: size }}
        aria-label={`Đổi ${label}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={photoUrl(value, size * 2, size * 2)} alt={label} className="h-full w-full object-cover" />
        <span className="absolute inset-0 flex items-center justify-center bg-black/45 text-xs font-medium text-white opacity-0 transition group-hover:opacity-100">
          {uploading ? "Đang tải…" : <><Camera size={14} className="mr-1" /> Đổi ảnh</>}
        </span>
        {uploading ? <span className="absolute inset-0 flex items-center justify-center bg-white/70"><Spin size="small" /></span> : null}
      </button>
      <div className="mt-1 text-[11px] text-slate-400">{label}</div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => pick(e.target.files?.[0])} />
    </div>
  );
};

// ---------------------------------------------------------------- trang

function GuidedCreateInner() {
  const { message } = App.useApp();
  const router = useRouter();
  const params = useParams<{ templateId: string }>();
  const search = useSearchParams();
  const templateId = decodeURIComponent(params.templateId);
  const editingId = search.get("id");

  const meta = getTemplateMeta(templateId);
  const [values, setValues] = useState<GuidedFormValues | null>(() => defaultFormValues(templateId));
  const [debounced, setDebounced] = useState<GuidedFormValues | null>(values);
  const [gate, setGate] = useState<"loading" | "ok" | "premium">("loading");
  const [invitationId, setInvitationId] = useState<string | null>(editingId);
  const [saving, setSaving] = useState<"draft" | "publish" | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewHeight, setPreviewHeight] = useState(720);

  // Đăng nhập + kiểm tra gói Premium
  useEffect(() => {
    (async () => {
      const profile = await userAuth.hydrateSession();
      if (!userAuth.getAccess()) {
        router.replace(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      setGate(REQUIRE_PREMIUM && !isPremiumProfile(profile) ? "premium" : "ok");
    })();
  }, [router]);

  // Mở lại thiệp đã tạo để sửa thông tin
  useEffect(() => {
    if (!editingId || gate !== "ok") return;
    userAuth
      .apiFetch<{ profileJson?: { formValues?: GuidedFormValues } }>(`/invitations/${editingId}`)
      .then((invitation) => {
        const saved = invitation.profileJson?.formValues;
        const base = defaultFormValues(templateId);
        if (saved && base) setValues({ ...base, ...saved });
      })
      .catch((err) => message.error(err instanceof Error ? err.message : "Không thể tải thiệp"));
  }, [editingId, gate, templateId, message]);

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(values), 350);
    return () => clearTimeout(timer);
  }, [values]);

  useEffect(() => {
    const update = () => setPreviewHeight(Math.max(480, Math.min(780, window.innerHeight - 130)));
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const template = useMemo(() => {
    if (!debounced) return null;
    const content = contentFromForm(templateId, debounced);
    return content ? buildTemplateFromContent(templateId, content) : null;
  }, [debounced, templateId]);

  if (!meta || !values) {
    return <Result status="404" title="Không tìm thấy mẫu thiệp" extra={<Link href="/#templates"><Button type="primary">Chọn mẫu khác</Button></Link>} />;
  }

  if (gate === "loading") {
    return <div className="flex min-h-screen items-center justify-center"><Spin size="large" /></div>;
  }

  if (gate === "premium") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-pink-50 to-white px-4">
        <Result
          icon={<Crown size={56} className="mx-auto text-amber-500" />}
          title="Tính năng dành cho gói Premium"
          subTitle="Chọn mẫu và điền thông tin để có ngay thiệp hoàn chỉnh dành cho tài khoản Premium. Vui lòng nâng cấp gói để tiếp tục."
          extra={[
            <Link key="plans" href="/dashboard/profile"><Button type="primary">Xem gói của tôi</Button></Link>,
            <Link key="home" href="/"><Button>Về trang chủ</Button></Link>,
          ]}
        />
      </div>
    );
  }

  const family = hasFamilyFields(meta.kind);
  const set = <K extends keyof GuidedFormValues>(key: K, value: GuidedFormValues[K]) => setValues((prev) => (prev ? { ...prev, [key]: value } : prev));
  const text = (key: keyof GuidedFormValues) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => set(key, e.target.value as never);
  const photoError = (m: string) => message.error(m);

  const validate = () => {
    if (!values.nameA.trim()) return family ? "Vui lòng nhập tên chú rể" : "Vui lòng nhập tên";
    if (family && !values.nameB.trim()) return "Vui lòng nhập tên cô dâu";
    if (!values.date) return "Vui lòng chọn ngày tổ chức";
    if (!values.venue.trim()) return "Vui lòng nhập tên địa điểm";
    return null;
  };

  const persist = async (publish: boolean) => {
    const problem = validate();
    if (problem) {
      message.warning(problem);
      return null;
    }
    const content = contentFromForm(templateId, values);
    const built = content ? buildTemplateFromContent(templateId, content) : null;
    if (!content || !built) return null;

    setSaving(publish ? "publish" : "draft");
    try {
      const payload = {
        title: values.title.trim() || (content.nameB ? `${content.nameA} & ${content.nameB}` : content.nameA),
        eventDate: new Date(`${values.date}T12:00:00`).toISOString(),
        location: content.venue,
        profileJson: profileFromForm(templateId, values, content),
        contentJson: { canvasSettings: built.canvasSettings, elements: built.elements },
      };

      let id = invitationId;
      let slug: string | undefined;
      if (id) {
        const updated = await userAuth.apiFetch<{ slug?: string }>(`/invitations/${id}`, { method: "PATCH", body: JSON.stringify(payload) });
        slug = updated.slug;
      } else {
        const created = await userAuth.apiFetch<{ id: string; slug?: string }>("/invitations", { method: "POST", body: JSON.stringify(payload) });
        id = created.id;
        slug = created.slug;
        setInvitationId(created.id);
        const url = new URL(window.location.href);
        url.searchParams.set("id", created.id);
        window.history.replaceState({}, "", url.toString());
      }

      if (publish) {
        const published = await userAuth.apiFetch<{ slug?: string }>(`/invitations/${id}/publish`, { method: "POST" });
        slug = published.slug ?? slug;
      }
      return { id: id as string, slug };
    } catch (err) {
      message.error(err instanceof Error ? err.message : "Không thể lưu thiệp");
      return null;
    } finally {
      setSaving(null);
    }
  };

  const saveDraft = async () => {
    if (await persist(false)) message.success("Đã lưu bản nháp");
  };

  const publish = async () => {
    const result = await persist(true);
    if (!result) return;
    message.success("Thiệp đã được xuất bản!");
    if (result.slug) window.open(`/invitation/${result.slug}`, "_blank", "noopener,noreferrer");
    router.push("/dashboard/invitations");
  };

  const openEditor = async () => {
    const result = await persist(false);
    if (result) router.push(`/editor?id=${result.id}&title=${encodeURIComponent(values.title)}`);
  };

  const nameLabels =
    meta.kind === "wedding" || meta.kind === "engagement"
      ? ["Tên chú rể", "Tên cô dâu"]
      : meta.kind === "birthday"
        ? ["Tên người sinh nhật", ""]
        : ["Tên bé", ""];

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-3">
          <Link href="/#templates" aria-label="Quay lại" className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-100"><ArrowLeft size={18} /></Link>
          <div>
            <div className="text-sm font-semibold text-slate-800">{meta.name}</div>
            <div className="text-xs text-slate-400">Điền thông tin — thiệp tự động cập nhật</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button className="lg:!hidden" onClick={() => setPreviewOpen(true)}>Xem trước</Button>
          <Button onClick={saveDraft} loading={saving === "draft"} disabled={saving !== null}>Lưu nháp</Button>
          <Button type="primary" onClick={publish} loading={saving === "publish"} disabled={saving !== null}>Xuất bản</Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[400px_1fr]">
        <aside className="hidden lg:block">
          <div className="sticky top-[84px] flex flex-col items-center gap-3">
            <GuidedPreview template={template} width={380} height={previewHeight} />
            <p className="text-center text-xs text-slate-400">Cuộn trong khung để xem toàn bộ thiệp</p>
          </div>
        </aside>

        <main className="space-y-4 pb-24">
          <Section title="Thông tin cơ bản">
            <Field label="Tên thiệp (hiển thị trong danh sách & link)"><Input value={values.title} onChange={text("title")} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={nameLabels[0]} required><Input value={values.nameA} onChange={text("nameA")} placeholder="VD: Nguyễn Minh Anh" /></Field>
              {family ? <Field label={nameLabels[1]} required><Input value={values.nameB} onChange={text("nameB")} placeholder="VD: Trần Thu Hà" /></Field> : null}
              {meta.kind === "birthday" ? <Field label="Tuổi"><Input value={values.age} onChange={text("age")} inputMode="numeric" maxLength={3} placeholder="VD: 24" /></Field> : null}
              {meta.kind === "baby" ? <Field label="Dòng phụ"><Input value={values.subtitle} onChange={text("subtitle")} placeholder="VD: Tròn một tuổi" /></Field> : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ngày tổ chức" required><input type="date" value={values.date} onChange={text("date")} className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-pink-400" /></Field>
              <Field label="Giờ"><input type="time" value={values.time} onChange={text("time")} className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-pink-400" /></Field>
            </div>
          </Section>

          <Section title={family ? "Thông tin gia đình" : meta.kind === "baby" ? "Gia đình của bé" : "Chủ tiệc"}>
            {family ? (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Bố chú rể"><Input value={values.groomFather} onChange={text("groomFather")} /></Field>
                <Field label="Mẹ chú rể"><Input value={values.groomMother} onChange={text("groomMother")} /></Field>
                <Field label="Bố cô dâu"><Input value={values.brideFather} onChange={text("brideFather")} /></Field>
                <Field label="Mẹ cô dâu"><Input value={values.brideMother} onChange={text("brideMother")} /></Field>
                <Field label="Địa chỉ nhà trai"><Input value={values.groomAddress} onChange={text("groomAddress")} /></Field>
                <Field label="Địa chỉ nhà gái"><Input value={values.brideAddress} onChange={text("brideAddress")} /></Field>
              </div>
            ) : (
              <Field label="Nội dung hiển thị (mỗi dòng một ý)"><TextArea rows={3} value={values.hostLines} onChange={text("hostLines")} /></Field>
            )}
          </Section>

          <Section title="Lời mời">
            <Field label="Cách gọi khách (khi mở link thường)"><Input value={values.guestDefault} onChange={text("guestDefault")} placeholder="VD: Bạn & người thương" /></Field>
            <Field label="Lời mời"><TextArea rows={3} value={values.body} onChange={text("body")} /></Field>
          </Section>

          <Section title="Lịch trình" hint="Tối đa 5 mục">
            {values.schedule.map((item, index) => (
              <div key={index} className="grid gap-2 rounded-xl border border-slate-200 p-3 sm:grid-cols-[90px_1fr_auto]">
                <Input value={item.time} placeholder="09:00" onChange={(e) => set("schedule", values.schedule.map((s, i) => (i === index ? { ...s, time: e.target.value } : s)))} />
                <div className="space-y-2">
                  <Input value={item.title} placeholder="Hoạt động" onChange={(e) => set("schedule", values.schedule.map((s, i) => (i === index ? { ...s, title: e.target.value } : s)))} />
                  <Input value={item.note} placeholder="Ghi chú ngắn" onChange={(e) => set("schedule", values.schedule.map((s, i) => (i === index ? { ...s, note: e.target.value } : s)))} />
                </div>
                <button type="button" aria-label="Xoá mục" disabled={values.schedule.length <= 1} onClick={() => set("schedule", values.schedule.filter((_, i) => i !== index))} className="flex h-8 w-8 items-center justify-center rounded-full text-rose-500 hover:bg-rose-50 disabled:opacity-30">
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
            {values.schedule.length < 5 ? (
              <Button block type="dashed" icon={<Plus size={14} />} onClick={() => set("schedule", [...values.schedule, { time: "", title: "", note: "" }])}>Thêm mục</Button>
            ) : null}
          </Section>

          <Section title="Địa điểm tổ chức">
            <Field label="Tên địa điểm" required><Input value={values.venue} onChange={text("venue")} /></Field>
            <Field label="Địa chỉ"><Input value={values.address} onChange={text("address")} /></Field>
            <Field label="Link Google Maps (không bắt buộc)"><Input value={values.mapUrl} onChange={text("mapUrl")} placeholder="https://maps.google.com/..." /></Field>
          </Section>

          <Section title="Câu chuyện & lời cảm ơn">
            <Field label={meta.kind === "baby" || meta.kind === "birthday" ? "Lời giới thiệu" : "Câu chuyện của chúng mình"}><TextArea rows={4} value={values.story} onChange={text("story")} /></Field>
            <Field label="Lời cảm ơn"><TextArea rows={3} value={values.thanks} onChange={text("thanks")} /></Field>
          </Section>

          <Section title="Hình ảnh" hint="Bấm vào ảnh để thay bằng ảnh của bạn (JPG, PNG, WEBP – tối đa 10MB)">
            <div className="flex flex-wrap gap-4">
              <PhotoTile label="Ảnh bìa" size={132} value={values.photoHero} onChange={(url) => set("photoHero", url)} onError={photoError} />
              <PhotoTile label="Ảnh câu chuyện 1" value={values.photoStory[0]} onChange={(url) => set("photoStory", [url, values.photoStory[1]])} onError={photoError} />
              <PhotoTile label="Ảnh câu chuyện 2" value={values.photoStory[1]} onChange={(url) => set("photoStory", [values.photoStory[0], url])} onError={photoError} />
            </div>
            <div className="text-xs font-medium text-slate-500">Album ảnh</div>
            <div className="flex flex-wrap gap-4">
              {values.gallery.map((src, index) => (
                <PhotoTile key={index} label={`Ảnh ${index + 1}`} value={src} onError={photoError} onChange={(url) => set("gallery", values.gallery.map((g, i) => (i === index ? url : g)) as GuidedFormValues["gallery"])} />
              ))}
            </div>
          </Section>

          <Section title="Mừng cưới / nhận quà" hint="Không bắt buộc — hiển thị trong mục Quà mừng của thiệp" defaultOpen={false}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Ngân hàng"><Input value={values.bankName} onChange={text("bankName")} placeholder="VD: Vietcombank" /></Field>
              <Field label="Số tài khoản"><Input value={values.accountNumber} onChange={text("accountNumber")} /></Field>
              <Field label="Chủ tài khoản" className="sm:col-span-2"><Input value={values.accountHolder} onChange={text("accountHolder")} /></Field>
            </div>
          </Section>

          <Section title="Nhạc nền" defaultOpen={false}>
            <Select
              className="w-full"
              value={values.musicId}
              onChange={(id) => set("musicId", id)}
              options={MUSIC_LIBRARY.map((track) => ({ value: track.id, label: `${track.name} — ${track.artist}` }))}
            />
          </Section>

          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-500">
            Cần chỉnh sửa tự do hơn (di chuyển, thêm hiệu ứng, đổi font)?{" "}
            <button type="button" onClick={openEditor} className="font-semibold" style={{ color: BRAND }}>Mở trong trình chỉnh sửa nâng cao</button>
            . Lưu ý: sau khi chỉnh trong editor, form này sẽ dựng lại thiệp từ thông tin và ghi đè các chỉnh sửa đó.
          </div>
        </main>
      </div>

      <Modal open={previewOpen} onCancel={() => setPreviewOpen(false)} footer={null} centered width={420} title="Xem trước thiệp" destroyOnHidden>
        <div className="flex justify-center">
          <GuidedPreview template={template} width={360} height={Math.min(previewHeight, 620)} />
        </div>
      </Modal>
    </div>
  );
}

export default function GuidedCreatePage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Spin size="large" /></div>}>
      <App>
        <GuidedCreateInner />
      </App>
    </Suspense>
  );
}
