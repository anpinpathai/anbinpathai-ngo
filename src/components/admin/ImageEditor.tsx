"use client";

import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { admin } from "@/content/admin-en";
import { encodeCanvas, loadPhotoCanvas, rotateCanvas } from "@/lib/image-resize";
import { uploadErrorMessage } from "@/lib/upload-client";
import { Icon } from "./Icon";
import { button } from "./ui";

export type EditorSettings = {
  source: Blob;
  // Width divided by height of the finished photo. null keeps the photo's own shape.
  aspect: number | null;
  // The photo is round on the website, so show a round frame.
  circle?: boolean;
  // A dashed box showing the middle part of the photo that is always visible (on a phone).
  guide?: { fraction: number };
  // Longest side of the finished photo, in pixels.
  maxSide: number;
};

const MAX_ZOOM = 4;

const clamp = (value: number, low: number, high: number) => Math.min(Math.max(value, low), high);

// How the photo sits in the frame. At zoom 1 the photo just covers the frame.
function viewOf(photoW: number, photoH: number, frameW: number, frameH: number, zoom: number) {
  const scale = Math.max(frameW / photoW, frameH / photoH) * zoom;
  return { scale, visibleW: frameW / scale, visibleH: frameH / scale };
}

// Keeps the visible part inside the photo. x and y are the centre of the visible part, from 0 to 1 of the photo.
function keepInside(x: number, y: number, photoW: number, photoH: number, visibleW: number, visibleH: number) {
  const halfX = visibleW / photoW / 2;
  const halfY = visibleH / photoH / 2;
  return {
    x: halfX >= 0.5 ? 0.5 : clamp(x, halfX, 1 - halfX),
    y: halfY >= 0.5 ? 0.5 : clamp(y, halfY, 1 - halfY),
  };
}

export function ImageEditor({
  settings,
  onApply,
  onCancel,
}: {
  settings: EditorSettings | null;
  onApply: (blob: Blob) => Promise<void>;
  onCancel: () => void;
}) {
  if (!settings) return null;
  // Shown on top of the page, outside the form, so nothing inside it can submit the form.
  return createPortal(<EditorDialog settings={settings} onApply={onApply} onCancel={onCancel} />, document.body);
}

function EditorDialog({
  settings,
  onApply,
  onCancel,
}: {
  settings: EditorSettings;
  onApply: (blob: Blob) => Promise<void>;
  onCancel: () => void;
}) {
  const text = admin.editor;
  const dialogRef = useRef<HTMLDialogElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [base, setBase] = useState<HTMLCanvasElement | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [turns, setTurns] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [focus, setFocus] = useState({ x: 0.5, y: 0.5 });
  const [stage, setStage] = useState({ width: 0, maxHeight: 400 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rotated = useMemo(
    () => (base ? (turns === 0 ? base : rotateCanvas(base, turns * 90)) : null),
    [base, turns],
  );

  const aspect = settings.aspect ?? (rotated ? rotated.width / rotated.height : 1);
  const frame = useMemo(() => {
    if (!stage.width) return null;
    const width = Math.min(stage.width, stage.maxHeight * aspect);
    return { w: Math.round(width), h: Math.round(width / aspect) };
  }, [stage, aspect]);

  // Open as a modal window, and keep the page behind it from scrolling.
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
      dialog?.close();
    };
  }, []);

  // Read the photo.
  useEffect(() => {
    let cancelled = false;
    loadPhotoCanvas(settings.source, 2400)
      .then((canvas) => {
        if (!cancelled) setBase(canvas);
      })
      .catch(() => {
        if (!cancelled) setLoadFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [settings.source]);

  // Measure the space available for the photo.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const measure = () => setStage({ width: el.clientWidth, maxHeight: Math.min(window.innerHeight * 0.5, 460) });
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    window.addEventListener("resize", measure);
    // The window has just opened; measure once more right after, in case the browser is slow to report it.
    const first = window.setTimeout(measure, 0);
    return () => {
      window.clearTimeout(first);
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Draw what is inside the frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !rotated || !frame) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(frame.w * ratio);
    canvas.height = Math.round(frame.h * ratio);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { visibleW, visibleH } = viewOf(rotated.width, rotated.height, frame.w, frame.h, zoom);
    const at = keepInside(focus.x, focus.y, rotated.width, rotated.height, visibleW, visibleH);
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      rotated,
      at.x * rotated.width - visibleW / 2,
      at.y * rotated.height - visibleH / 2,
      visibleW,
      visibleH,
      0,
      0,
      canvas.width,
      canvas.height,
    );
  }, [rotated, frame, zoom, focus]);

  // The newest values, for the event handlers below.
  const latest = useRef({ rotated, frame, zoom });
  useEffect(() => {
    latest.current = { rotated, frame, zoom };
  });

  function panBy(dx: number, dy: number) {
    const { rotated: photo, frame: box, zoom: z } = latest.current;
    if (!photo || !box) return;
    const { scale, visibleW, visibleH } = viewOf(photo.width, photo.height, box.w, box.h, z);
    setFocus((f) => keepInside(f.x - dx / scale / photo.width, f.y - dy / scale / photo.height, photo.width, photo.height, visibleW, visibleH));
  }

  function changeZoom(next: number) {
    const { rotated: photo, frame: box } = latest.current;
    const z = clamp(next, 1, MAX_ZOOM);
    setZoom(z);
    if (photo && box) {
      const { visibleW, visibleH } = viewOf(photo.width, photo.height, box.w, box.h, z);
      setFocus((f) => keepInside(f.x, f.y, photo.width, photo.height, visibleW, visibleH));
    }
  }

  const actions = useRef({ panBy, changeZoom });
  useEffect(() => {
    actions.current = { panBy, changeZoom };
  });

  // Mouse wheel zooms.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (!latest.current.rotated) return;
      event.preventDefault();
      actions.current.changeZoom(latest.current.zoom * Math.exp(-event.deltaY * 0.002));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  // One finger or the mouse moves the photo; two fingers pinch to zoom.
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    try {
      // Keeps following the finger or mouse even when it slips outside the frame.
      event.currentTarget.setPointerCapture(event.pointerId);
    } catch {
      // Some browsers refuse; dragging still works while the pointer stays over the frame.
    }
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      pinch.current = { distance: Math.hypot(a.x - b.x, a.y - b.y) || 1, zoom: latest.current.zoom };
    }
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    const before = pointers.current.get(event.pointerId);
    if (!before) return;
    const now = { x: event.clientX, y: event.clientY };
    pointers.current.set(event.pointerId, now);
    if (pointers.current.size === 1) {
      panBy(now.x - before.x, now.y - before.y);
    } else if (pointers.current.size === 2 && pinch.current) {
      const [a, b] = [...pointers.current.values()];
      changeZoom((pinch.current.zoom * Math.hypot(a.x - b.x, a.y - b.y)) / pinch.current.distance);
    }
  }

  function onPointerEnd(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    pinch.current = null;
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const step = (latest.current.frame?.w ?? 200) * 0.05;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    if (moves[event.key]) {
      event.preventDefault();
      panBy(...moves[event.key]);
    } else if (event.key === "+" || event.key === "=") {
      event.preventDefault();
      changeZoom(zoom + 0.25);
    } else if (event.key === "-") {
      event.preventDefault();
      changeZoom(zoom - 0.25);
    }
  }

  function rotate(direction: 1 | -1) {
    setTurns((t) => (t + direction + 4) % 4);
    setZoom(1);
    setFocus({ x: 0.5, y: 0.5 });
  }

  async function apply() {
    if (!rotated || !frame) return;
    setBusy(true);
    setError(null);
    try {
      const { visibleW, visibleH } = viewOf(rotated.width, rotated.height, frame.w, frame.h, zoom);
      const at = keepInside(focus.x, focus.y, rotated.width, rotated.height, visibleW, visibleH);
      const shrink = Math.min(1, settings.maxSide / Math.max(visibleW, visibleH));
      const out = document.createElement("canvas");
      out.width = Math.max(1, Math.round(visibleW * shrink));
      out.height = Math.max(1, Math.round(visibleH * shrink));
      const ctx = out.getContext("2d");
      if (!ctx) throw new Error("Canvas is not available");
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(
        rotated,
        at.x * rotated.width - visibleW / 2,
        at.y * rotated.height - visibleH / 2,
        visibleW,
        visibleH,
        0,
        0,
        out.width,
        out.height,
      );
      await onApply(await encodeCanvas(out));
    } catch (err) {
      setError(uploadErrorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  const ready = Boolean(rotated && frame);
  const hint = settings.circle ? text.circleHint : settings.guide ? text.phoneGuide : text.help;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="image-editor-title"
      onCancel={(event) => {
        event.preventDefault();
        if (!busy) onCancel();
      }}
      // Moving the slider must not make the page behind think the form was edited.
      onInput={(event) => event.stopPropagation()}
      className="m-auto w-[min(96vw,40rem)] rounded-2xl border-0 p-0 shadow-2xl backdrop:bg-black/60"
    >
      <div className="max-h-[94vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-3 px-5 pt-4">
          <h2 id="image-editor-title" className="text-lg font-bold text-ink">
            {text.title}
          </h2>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            aria-label={text.close}
            className="grid h-9 w-9 place-items-center rounded-lg text-muted transition-colors hover:bg-panel hover:text-brand disabled:opacity-40"
          >
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <div ref={stageRef} className="flex min-h-40 w-full flex-col items-center justify-center px-5 py-3">
          {loadFailed ? (
            <p role="alert" className="flex items-center gap-1.5 text-sm font-semibold text-red-700">
              <Icon name="alert" className="h-4 w-4" />
              {text.openFailed}
            </p>
          ) : !rotated || !frame ? (
            <p className="text-sm font-semibold text-muted">{text.opening}</p>
          ) : (
            <div
              tabIndex={0}
              role="group"
              aria-label={text.frameLabel}
              onKeyDown={onKeyDown}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerEnd}
              onPointerCancel={onPointerEnd}
              className="relative cursor-grab touch-none select-none overflow-hidden rounded-xl bg-black active:cursor-grabbing"
              style={{ width: frame.w, height: frame.h }}
            >
              <canvas ref={canvasRef} className="block" style={{ width: frame.w, height: frame.h }} />
              {settings.circle ? (
                <div className="pointer-events-none absolute inset-0 rounded-full ring-2 ring-white/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.55)]" />
              ) : (
                <div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-white/40" />
              )}
              {settings.guide && (
                <div
                  className="pointer-events-none absolute inset-y-0 left-1/2 -translate-x-1/2 border-x-2 border-dashed border-white/90"
                  style={{ width: `${settings.guide.fraction * 100}%` }}
                />
              )}
            </div>
          )}
          <p className="mt-2 max-w-md text-center text-sm text-muted">{hint}</p>
        </div>

        <div className="space-y-3 px-5 pb-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={!ready || busy}
              onClick={() => changeZoom(zoom - 0.25)}
              aria-label={text.zoomOut}
              title={text.zoomOut}
              className={button.icon}
            >
              <Icon name="zoomOut" className="h-5 w-5" />
            </button>
            <input
              type="range"
              min={1}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              disabled={!ready || busy}
              onChange={(event) => changeZoom(Number(event.target.value))}
              aria-label={text.zoom}
              className="h-2 flex-1 cursor-pointer accent-brand disabled:opacity-40"
            />
            <button
              type="button"
              disabled={!ready || busy}
              onClick={() => changeZoom(zoom + 0.25)}
              aria-label={text.zoomIn}
              title={text.zoomIn}
              className={button.icon}
            >
              <Icon name="zoomIn" className="h-5 w-5" />
            </button>
          </div>
          <div className="flex justify-center gap-2">
            <button type="button" disabled={!ready || busy} onClick={() => rotate(-1)} className={button.small}>
              <Icon name="rotateLeft" className="h-4 w-4" />
              {text.rotateLeft}
            </button>
            <button type="button" disabled={!ready || busy} onClick={() => rotate(1)} className={button.small}>
              <Icon name="rotateRight" className="h-4 w-4" />
              {text.rotateRight}
            </button>
          </div>
          {error && (
            <p role="alert" className="flex items-center justify-center gap-1.5 text-sm font-semibold text-red-700">
              <Icon name="alert" className="h-4 w-4" />
              {error}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-line px-5 py-4">
          <button type="button" onClick={onCancel} disabled={busy} className={button.secondary}>
            {text.cancel}
          </button>
          <button type="button" onClick={apply} disabled={!ready || busy} className={button.primary}>
            <Icon name="check" className="h-5 w-5" />
            {busy ? text.applying : text.apply}
          </button>
        </div>
      </div>
    </dialog>
  );
}
