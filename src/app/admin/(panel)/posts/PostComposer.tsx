"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useRef, useState, type FormEvent, type ReactNode } from "react";
import { admin, categoryEnglish } from "@/content/admin-en";
import { t } from "@/content/ta-LK";
import { MAX_GALLERY_PHOTOS } from "@/lib/limits";
import type { PostFormValues } from "@/lib/post-form";
import { uploadErrorMessage, uploadImage } from "@/lib/upload-client";
import { savePostAction, type PostFormState } from "./actions";

type CategoryOption = { id: number; slug: string; name: string };
type PhotoItem = { key: string; url: string };
type PostStatus = "new" | "published" | "draft";

const inputClass =
  "mt-1 w-full rounded-lg border border-line bg-white px-3 py-2.5 text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor">
      {children}
    </svg>
  );
}

function AddButton({
  label,
  active,
  disabled,
  onClick,
  children,
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors disabled:opacity-50 ${
        active ? "bg-brand text-white" : "text-brand hover:bg-sand"
      }`}
    >
      <Icon>{children}</Icon>
      <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

const tileButton =
  "grid h-8 w-8 place-items-center rounded-full bg-white/90 text-sm font-bold text-ink shadow hover:bg-white disabled:opacity-40";

export function PostComposer({
  initialValues,
  categories,
  initialPhotos,
  status,
}: {
  initialValues: PostFormValues;
  categories: CategoryOption[];
  initialPhotos: PhotoItem[];
  status: PostStatus;
}) {
  const text = admin.posts.composer;
  const initial: PostFormState = { status: "idle", values: initialValues, errors: {} };
  const [state, action, pending] = useActionState(savePostAction, initial);
  const { values, errors } = state;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const data = new FormData(event.currentTarget, submitter);
    startTransition(() => action(data));
  }

  const [categoryId, setCategoryId] = useState(initialValues.categoryId);
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const [showVideo, setShowVideo] = useState(Boolean(initialValues.youtubeUrl));
  const [showFacebook, setShowFacebook] = useState(Boolean(initialValues.facebookUrl));
  const [showDate, setShowDate] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const textRef = useRef<HTMLTextAreaElement>(null);

  const uploading = progress !== null;

  function grow() {
    const el = textRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.max(el.scrollHeight, 160)}px`;
  }

  async function addPhotos(files: File[]) {
    setUploadMessage(null);
    const chosen = files.slice(0, Math.max(0, MAX_GALLERY_PHOTOS - photos.length));
    const notice = files.length > chosen.length ? text.photosFull : null;
    if (chosen.length === 0) {
      setUploadMessage(notice);
      return;
    }

    let failure: string | null = null;
    for (let i = 0; i < chosen.length; i++) {
      setProgress({ done: i + 1, total: chosen.length });
      try {
        const uploaded = await uploadImage(chosen[i], 1600);
        setPhotos((prev) => [...prev, uploaded]);
      } catch (err) {
        failure = uploadErrorMessage(err);
      }
    }
    setProgress(null);
    setUploadMessage(failure ?? notice);
  }

  function movePhoto(index: number, direction: -1 | 1) {
    setPhotos((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  const primaryLabel =
    status === "new" ? text.post : status === "draft" ? text.publishNow : text.saveChanges;
  const secondaryLabel = status === "published" ? text.unpublish : text.saveDraft;
  const photoMessage = uploadMessage ?? errors.photoKeys ?? null;

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl">
      <input type="hidden" name="id" value={values.id} />
      {photos.map((photo) => (
        <input key={photo.key} type="hidden" name="photoKeys" value={photo.key} />
      ))}

      <div className="rounded-2xl border border-line bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-line p-4">
          <Image
            src="/logos/logo-anbin.webp"
            alt=""
            width={96}
            height={96}
            unoptimized
            className="h-11 w-11 rounded-full"
          />
          <div className="min-w-0">
            <p lang="ta" className="font-semibold leading-tight">
              {t.siteShortName}
            </p>
            <label className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted">
              {text.postingTo}
              <select
                name="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                aria-invalid={Boolean(errors.categoryId)}
                className="max-w-full rounded-full border border-line bg-sand px-3 py-1 text-sm font-semibold text-ink focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand/30"
              >
                <option value="">{text.chooseCategory}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({categoryEnglish[c.slug] ?? c.slug})
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
        {errors.categoryId && (
          <p role="alert" className="px-4 pt-3 text-sm font-semibold text-red-700">
            {errors.categoryId}
          </p>
        )}

        <div className="px-4 pt-3">
          <textarea
            ref={textRef}
            name="text"
            lang="ta"
            defaultValue={values.text}
            placeholder={text.placeholder}
            aria-label={text.placeholder}
            aria-invalid={Boolean(errors.text)}
            maxLength={10000}
            onInput={grow}
            className="min-h-40 w-full resize-none border-0 bg-transparent text-lg leading-relaxed text-ink placeholder:text-muted focus:outline-none"
          />
          {errors.text && (
            <p role="alert" className="pb-2 text-sm font-semibold text-red-700">
              {errors.text}
            </p>
          )}
        </div>

        {photos.length > 0 && (
          <ul className="grid grid-cols-2 gap-2 px-4 pb-2 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <li key={photo.key} className="relative">
                <Image
                  src={photo.url}
                  alt=""
                  width={400}
                  height={400}
                  unoptimized
                  className="aspect-square w-full rounded-lg object-cover"
                />
                <button
                  type="button"
                  onClick={() => setPhotos((prev) => prev.filter((p) => p.key !== photo.key))}
                  aria-label={text.removePhoto}
                  title={text.removePhoto}
                  className={`${tileButton} absolute right-2 top-2`}
                >
                  ×
                </button>
                <div className="absolute bottom-2 left-2 flex gap-1">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => movePhoto(index, -1)}
                    aria-label={text.movePhotoEarlier}
                    title={text.movePhotoEarlier}
                    className={tileButton}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    disabled={index === photos.length - 1}
                    onClick={() => movePhoto(index, 1)}
                    aria-label={text.movePhotoLater}
                    title={text.movePhotoLater}
                    className={tileButton}
                  >
                    →
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {(photos.length > 0 || uploading || photoMessage) && (
          <div className="px-4 pb-2 text-sm">
            {uploading ? (
              <p className="text-muted">{text.uploadingPhotos(progress.done, progress.total)}</p>
            ) : (
              <p className="text-muted">{text.photoCount(photos.length, MAX_GALLERY_PHOTOS)}</p>
            )}
            {photoMessage && (
              <p role="alert" className="font-semibold text-red-700">
                {photoMessage}
              </p>
            )}
          </div>
        )}

        {showVideo && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between">
              <label htmlFor="youtubeUrl" className="font-semibold">
                {text.youtubeLabel}
              </label>
              <button
                type="button"
                onClick={() => setShowVideo(false)}
                className="text-sm font-semibold text-red-700 hover:underline"
              >
                {text.hide}
              </button>
            </div>
            <p className="text-sm text-muted">{text.youtubeHelp}</p>
            <input
              id="youtubeUrl"
              name="youtubeUrl"
              type="text"
              inputMode="url"
              defaultValue={values.youtubeUrl}
              maxLength={200}
              aria-invalid={Boolean(errors.youtubeUrl)}
              className={inputClass}
            />
            {errors.youtubeUrl && <p className="mt-1 text-sm font-semibold text-red-700">{errors.youtubeUrl}</p>}
          </div>
        )}

        {showFacebook && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between">
              <label htmlFor="facebookUrl" className="font-semibold">
                {text.facebookLabel}
              </label>
              <button
                type="button"
                onClick={() => setShowFacebook(false)}
                className="text-sm font-semibold text-red-700 hover:underline"
              >
                {text.hide}
              </button>
            </div>
            <p className="text-sm text-muted">{text.facebookHelp}</p>
            <input
              id="facebookUrl"
              name="facebookUrl"
              type="text"
              inputMode="url"
              defaultValue={values.facebookUrl}
              maxLength={500}
              aria-invalid={Boolean(errors.facebookUrl)}
              className={inputClass}
            />
            {errors.facebookUrl && <p className="mt-1 text-sm font-semibold text-red-700">{errors.facebookUrl}</p>}
          </div>
        )}

        {showDate && (
          <div className="px-4 pb-3">
            <div className="flex items-center justify-between">
              <label htmlFor="publishDate" className="font-semibold">
                {text.dateLabel}
              </label>
              <button
                type="button"
                onClick={() => setShowDate(false)}
                className="text-sm font-semibold text-red-700 hover:underline"
              >
                {text.hide}
              </button>
            </div>
            <p className="text-sm text-muted">{text.dateHelp}</p>
            <input
              id="publishDate"
              name="publishDate"
              type="date"
              defaultValue={values.publishDate}
              aria-invalid={Boolean(errors.publishDate)}
              className={`${inputClass} max-w-xs`}
            />
            {errors.publishDate && <p className="mt-1 text-sm font-semibold text-red-700">{errors.publishDate}</p>}
          </div>
        )}

        <div className="mx-4 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-line p-2">
          <span className="px-2 text-sm font-semibold">{text.addToPost}</span>
          <div className="flex items-center gap-1">
            <input
              ref={fileRef}
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              tabIndex={-1}
              aria-hidden="true"
              onChange={(e) => {
                const files = Array.from(e.target.files ?? []);
                e.target.value = "";
                if (files.length > 0) void addPhotos(files);
              }}
            />
            <AddButton
              label={text.addPhotos}
              disabled={uploading || photos.length >= MAX_GALLERY_PHOTOS}
              onClick={() => fileRef.current?.click()}
            >
              <path d="M21 19V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2ZM8.5 13.5l2.5 3 3.5-4.5 4.5 6H5l3.5-4.5ZM8 8a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3Z" />
            </AddButton>
            <AddButton label={text.video} active={showVideo} onClick={() => setShowVideo((v) => !v)}>
              <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z" />
            </AddButton>
            <AddButton label={text.facebook} active={showFacebook} onClick={() => setShowFacebook((v) => !v)}>
              <path d="M12 2a10 10 0 1 0 1.5 19.9v-7h-2.3V12h2.3V9.8c0-2.3 1.4-3.5 3.4-3.5.7 0 1.4.1 2 .2v2.3h-1.1c-1.1 0-1.4.7-1.4 1.4V12h2.6l-.4 2.9h-2.2v7A10 10 0 0 0 12 2Z" />
            </AddButton>
            <AddButton label={text.date} active={showDate} onClick={() => setShowDate((v) => !v)}>
              <path d="M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm-2 8h14v10H5V10Z" />
            </AddButton>
          </div>
        </div>

        <div className="space-y-3 border-t border-line p-4">
          <button
            type="submit"
            name="intent"
            value="publish"
            disabled={pending || uploading}
            className="w-full rounded-lg bg-brand px-6 py-3 text-lg font-semibold text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
          >
            {pending ? text.working : primaryLabel}
          </button>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <button
              type="submit"
              name="intent"
              value="draft"
              disabled={pending || uploading}
              className="font-semibold text-brand underline-offset-4 hover:underline disabled:opacity-60"
            >
              {secondaryLabel}
            </button>
            <Link href="/admin/posts" className="font-semibold text-muted underline-offset-4 hover:underline">
              {admin.common.cancel}
            </Link>
          </div>
          {uploading && <p className="text-sm text-muted">{text.waitForUploads}</p>}
          {state.message && (
            <p
              role={state.status === "error" ? "alert" : "status"}
              className={`font-semibold ${state.status === "error" ? "text-red-700" : "text-cat-green"}`}
            >
              {state.message}
            </p>
          )}
        </div>
      </div>
    </form>
  );
}
