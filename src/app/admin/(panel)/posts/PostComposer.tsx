"use client";

import Image from "next/image";
import Link from "next/link";
import { startTransition, useActionState, useEffect, useRef, useState, type FormEvent } from "react";
import { ActionBar, FormStatus } from "@/components/admin/ActionBar";
import { Icon, type IconName } from "@/components/admin/Icon";
import { ImageEditor, type EditorSettings } from "@/components/admin/ImageEditor";
import { useUnsavedChanges } from "@/components/admin/UnsavedChanges";
import { button, card, inputClass } from "@/components/admin/ui";
import { useToast } from "@/components/toast/ToastProvider";
import { admin, categoryLabel } from "@/content/admin-en";
import { t, type ColorKey } from "@/content/ta-LK";
import { categoryColor } from "@/lib/category-colors";
import { MAX_GALLERY_PHOTOS } from "@/lib/limits";
import type { PostFormValues } from "@/lib/post-form";
import { fetchStoredImage, uploadBlob, uploadErrorMessage, uploadImage } from "@/lib/upload-client";
import { savePostAction, type PostFormState } from "./actions";

type CategoryOption = { id: number; slug: string; name: string; colorKey: ColorKey };
type PhotoItem = { key: string; url: string };
type PostStatus = "new" | "published" | "draft";

function AddButton({
  label,
  icon,
  active,
  disabled,
  onClick,
}: {
  label: string;
  icon: IconName;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
      className={`flex items-center justify-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-semibold transition-colors disabled:opacity-50 ${
        active ? "border-brand bg-brand text-white" : "border-line bg-white text-brand hover:bg-sand/60"
      }`}
    >
      <Icon name={icon} className="h-5 w-5" />
      {label}
    </button>
  );
}

function ExtraField({
  id,
  label,
  help,
  error,
  onRemove,
  children,
}: {
  id: string;
  label: string;
  help: string;
  error?: string;
  onRemove: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border-t border-line/70 px-5 py-4">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={id} className="font-semibold text-ink">
          {label}
        </label>
        <button
          type="button"
          onClick={onRemove}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-semibold text-red-700 transition-colors hover:bg-red-50"
        >
          <Icon name="x" className="h-4 w-4" />
          {admin.posts.composer.hide}
        </button>
      </div>
      <p className="text-sm text-muted">{help}</p>
      {children}
      {error && (
        <p className="mt-1.5 flex items-center gap-1.5 text-sm font-semibold text-red-700">
          <Icon name="alert" className="h-4 w-4" />
          {error}
        </p>
      )}
    </div>
  );
}

const tileButton =
  "grid h-8 w-8 place-items-center rounded-full bg-white/95 text-ink shadow transition-colors hover:bg-white disabled:opacity-40";

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

  // "Edited" means something changed since the last result from the server.
  const [editedAt, setEditedAt] = useState<PostFormState | null>(null);
  const dirty = editedAt === state;
  useUnsavedChanges(dirty);
  const markEdited = () => setEditedAt(state);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const data = new FormData(event.currentTarget, submitter);
    startTransition(() => action(data));
  }

  const [categoryId, setCategoryId] = useState(initialValues.categoryId);
  const [photos, setPhotos] = useState<PhotoItem[]>(initialPhotos);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);

  // Tell the person how the save went, and about any photo problems, in toasts.
  const toast = useToast();
  useEffect(() => {
    if (state.status === "saved") toast.success(state.message ?? text.saved);
    else if (state.status === "error") toast.error(state.message ?? admin.common.actionFailed);
  }, [state, toast, text.saved]);

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
    el.style.height = `${Math.max(el.scrollHeight, 176)}px`;
  }

  async function addPhotos(files: File[]) {
    const chosen = files.slice(0, Math.max(0, MAX_GALLERY_PHOTOS - photos.length));
    const notice = files.length > chosen.length ? text.photosFull : null;
    if (chosen.length === 0) {
      if (notice) toast.info(notice);
      return;
    }

    let failure: string | null = null;
    for (let i = 0; i < chosen.length; i++) {
      setProgress({ done: i + 1, total: chosen.length });
      try {
        const uploaded = await uploadImage(chosen[i], 1600);
        setPhotos((prev) => [...prev, uploaded]);
        markEdited();
      } catch (err) {
        failure = uploadErrorMessage(err);
      }
    }
    setProgress(null);
    if (failure) toast.error(failure);
    else if (notice) toast.info(notice);
  }

  // Adjust one photo of the post: it is opened, changed, then saved as a new photo in the same place.
  const [adjusting, setAdjusting] = useState<{ key: string; settings: EditorSettings } | null>(null);

  async function adjustPhoto(photo: PhotoItem) {
    try {
      const source = await fetchStoredImage(photo.key);
      setAdjusting({ key: photo.key, settings: { source, aspect: null, maxSide: 1600 } });
    } catch (err) {
      toast.error(uploadErrorMessage(err));
    }
  }

  async function applyAdjustment(blob: Blob) {
    if (!adjusting) return;
    const uploaded = await uploadBlob(blob);
    setPhotos((prev) => prev.map((p) => (p.key === adjusting.key ? uploaded : p)));
    setAdjusting(null);
    markEdited();
  }

  function movePhoto(index: number, direction: -1 | 1) {
    setPhotos((prev) => {
      const target = index + direction;
      if (target < 0 || target >= prev.length) return prev;
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
    markEdited();
  }

  const primaryLabel = status === "new" ? text.post : status === "draft" ? text.publishNow : text.saveChanges;
  const secondaryLabel = status === "published" ? text.unpublish : text.saveDraft;
  const photoMessage = errors.photoKeys ?? null;

  return (
    <form onSubmit={handleSubmit} onInput={markEdited} noValidate className="max-w-3xl">
      {/* Pressing Enter in a field submits with the form's first submit button. Keep that "Post",
          even though the buttons in the bar below put "Post" on the right. */}
      <button
        type="submit"
        name="intent"
        value="publish"
        disabled={pending || uploading}
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      />
      <ImageEditor settings={adjusting?.settings ?? null} onApply={applyAdjustment} onCancel={() => setAdjusting(null)} />
      <input type="hidden" name="id" value={values.id} />
      {photos.map((photo) => (
        <input key={photo.key} type="hidden" name="photoKeys" value={photo.key} />
      ))}

      <div className={`${card} overflow-hidden`}>
        <section className="p-5">
          <h2 id="category-question" className="font-bold text-brand-dark">
            {text.categoryQuestion}
          </h2>
          <div role="radiogroup" aria-labelledby="category-question" className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
            {categories.map((c) => {
              const color = categoryColor[c.colorKey];
              const checked = categoryId === String(c.id);
              return (
                <label
                  key={c.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 p-3 transition-colors focus-within:ring-2 focus-within:ring-brand/30 ${
                    checked ? `${color.border} ${color.soft}` : "border-line hover:bg-panel"
                  }`}
                >
                  <input
                    type="radio"
                    name="categoryId"
                    value={c.id}
                    checked={checked}
                    onChange={() => setCategoryId(String(c.id))}
                    className="sr-only"
                  />
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${checked ? color.solid : "bg-panel"}`}>
                    {checked ? (
                      <Icon name="check" className="h-5 w-5" />
                    ) : (
                      <span aria-hidden="true" className={`h-3 w-3 rounded-full ${color.dot}`} />
                    )}
                  </span>
                  <span lang="ta" className="min-w-0 font-semibold leading-snug! text-ink">
                    {categoryLabel[c.slug] ?? c.name}
                  </span>
                </label>
              );
            })}
          </div>
          {errors.categoryId && (
            <p role="alert" className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-red-700">
              <Icon name="alert" className="h-4 w-4" />
              {errors.categoryId}
            </p>
          )}
        </section>

        <section className="border-t border-line/70 px-5 pb-3 pt-4">
          <div className="flex items-center gap-3">
            <Image src="/logos/logo-anbin.webp" alt="" width={96} height={96} unoptimized className="h-10 w-10 rounded-full" />
            <div className="min-w-0">
              <p lang="ta" className="truncate font-semibold leading-tight text-ink">
                {t.siteShortName}
              </p>
              <label htmlFor="post-text" className="text-sm text-muted">
                {text.writeLabel}
              </label>
            </div>
          </div>
          <textarea
            id="post-text"
            ref={textRef}
            name="text"
            lang="ta"
            defaultValue={values.text}
            placeholder={text.placeholder}
            aria-invalid={Boolean(errors.text)}
            maxLength={10000}
            onInput={grow}
            className="mt-3 min-h-44 w-full resize-none border-0 bg-transparent text-lg leading-relaxed text-ink placeholder:text-muted/70 focus:outline-none"
          />
          {errors.text && (
            <p role="alert" className="flex items-center gap-1.5 pb-1 text-sm font-semibold text-red-700">
              <Icon name="alert" className="h-4 w-4" />
              {errors.text}
            </p>
          )}
        </section>

        {photos.length > 0 && (
          <ul className="grid grid-cols-2 gap-2.5 px-5 pb-2 sm:grid-cols-3">
            {photos.map((photo, index) => (
              <li key={photo.key} className="relative">
                <Image
                  src={photo.url}
                  alt=""
                  width={400}
                  height={400}
                  unoptimized
                  className="aspect-square w-full rounded-xl object-cover"
                />
                {index === 0 && (
                  <span className="absolute left-2 top-2 rounded-full bg-gold px-2.5 py-0.5 text-xs font-bold text-ink shadow">
                    {text.cover}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => {
                    setPhotos((prev) => prev.filter((p) => p.key !== photo.key));
                    markEdited();
                  }}
                  aria-label={text.removePhoto}
                  title={text.removePhoto}
                  className={`${tileButton} absolute right-2 top-2 text-red-700`}
                >
                  <Icon name="x" className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => void adjustPhoto(photo)}
                  aria-label={text.adjustPhoto}
                  title={text.adjustPhoto}
                  className={`${tileButton} absolute bottom-2 right-2`}
                >
                  <Icon name="crop" className="h-4 w-4" />
                </button>
                <div className="absolute bottom-2 left-2 flex gap-1.5">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => movePhoto(index, -1)}
                    aria-label={text.movePhotoEarlier}
                    title={text.movePhotoEarlier}
                    className={tileButton}
                  >
                    <Icon name="arrowLeft" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    disabled={index === photos.length - 1}
                    onClick={() => movePhoto(index, 1)}
                    aria-label={text.movePhotoLater}
                    title={text.movePhotoLater}
                    className={tileButton}
                  >
                    <Icon name="arrowRight" className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        {(photos.length > 0 || uploading || photoMessage) && (
          <div className="px-5 pb-3 text-sm">
            {uploading ? (
              <p className="font-semibold text-brand">{text.uploadingPhotos(progress.done, progress.total)}</p>
            ) : (
              photos.length > 0 && (
                <p className="text-muted">
                  {text.photoCount(photos.length, MAX_GALLERY_PHOTOS)} · {text.photoHint}
                </p>
              )
            )}
            {photoMessage && (
              <p role="alert" className="mt-1 flex items-center gap-1.5 font-semibold text-red-700">
                <Icon name="alert" className="h-4 w-4" />
                {photoMessage}
              </p>
            )}
          </div>
        )}

        {showVideo && (
          <ExtraField
            id="youtubeUrl"
            label={text.youtubeLabel}
            help={text.youtubeHelp}
            error={errors.youtubeUrl}
            onRemove={() => {
              setShowVideo(false);
              markEdited();
            }}
          >
            <input
              id="youtubeUrl"
              name="youtubeUrl"
              type="text"
              inputMode="url"
              defaultValue={values.youtubeUrl}
              maxLength={200}
              aria-invalid={Boolean(errors.youtubeUrl)}
              className={inputClass(errors.youtubeUrl)}
            />
          </ExtraField>
        )}

        {showFacebook && (
          <ExtraField
            id="facebookUrl"
            label={text.facebookLabel}
            help={text.facebookHelp}
            error={errors.facebookUrl}
            onRemove={() => {
              setShowFacebook(false);
              markEdited();
            }}
          >
            <input
              id="facebookUrl"
              name="facebookUrl"
              type="text"
              inputMode="url"
              defaultValue={values.facebookUrl}
              maxLength={500}
              aria-invalid={Boolean(errors.facebookUrl)}
              className={inputClass(errors.facebookUrl)}
            />
          </ExtraField>
        )}

        {showDate && (
          <ExtraField
            id="publishDate"
            label={text.dateLabel}
            help={text.dateHelp}
            error={errors.publishDate}
            onRemove={() => setShowDate(false)}
          >
            <input
              id="publishDate"
              name="publishDate"
              type="date"
              defaultValue={values.publishDate}
              aria-invalid={Boolean(errors.publishDate)}
              className={`${inputClass(errors.publishDate)} max-w-xs`}
            />
          </ExtraField>
        )}

        <section className="border-t border-line/70 bg-panel/50 p-5">
          <p className="mb-2.5 text-sm font-bold uppercase tracking-wide text-muted">{text.addToPost}</p>
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
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <AddButton
              label={text.photos}
              icon="image"
              disabled={uploading || photos.length >= MAX_GALLERY_PHOTOS}
              onClick={() => fileRef.current?.click()}
            />
            <AddButton label={text.video} icon="video" active={showVideo} onClick={() => setShowVideo((v) => !v)} />
            <AddButton label={text.facebook} icon="facebook" active={showFacebook} onClick={() => setShowFacebook((v) => !v)} />
            <AddButton label={text.date} icon="calendar" active={showDate} onClick={() => setShowDate((v) => !v)} />
          </div>
        </section>
      </div>

      <ActionBar
        status={
          uploading ? (
            <span className="text-muted">{text.waitForUploads}</span>
          ) : (
            <FormStatus dirty={dirty} />
          )
        }
      >
        <Link href="/admin/posts" className={button.ghost}>
          {admin.common.cancel}
        </Link>
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending || uploading}
          className={`${button.secondary} flex-1 sm:flex-none`}
        >
          {secondaryLabel}
        </button>
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending || uploading}
          className={`${button.primary} flex-1 sm:flex-none`}
        >
          <Icon name="send" className="hidden h-5 w-5 min-[400px]:block" />
          {pending ? text.working : primaryLabel}
        </button>
      </ActionBar>
    </form>
  );
}
