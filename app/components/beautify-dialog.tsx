"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { TypeNumber } from "qr-code-styling";
import { QrStylingCanvas } from "./qr-styling-canvas";
import {
  applyStyleTemplate,
  buildQrCodeStylingOptions,
  DEFAULT_CENTER_LOGO_DATA_URL,
  defaultQrEditorModel,
  DOT_SHAPE_PRESETS,
  ERROR_LEVELS,
  EYE_SHAPE_PRESETS,
  LABEL_SIZE_OPTIONS,
  MARGIN_BLOCK_OPTIONS,
  STYLE_TEMPLATE_IDS,
  type EyeShapePresetId,
  type FillMode,
  type QrEditorModel,
  type StyleTemplateId,
  VERSION_OPTIONS,
} from "@/app/lib/qr-styling-options";

const GALLERY_LOGOS: { id: string; label: string; dataUrl: string }[] = [
  {
    id: "leaf",
    label: "Leaf",
    dataUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="#00a854"/><path d="M32 12c8 12 12 24 8 36C28 44 20 32 32 12z" fill="#77fc9d"/></svg>`,
      ),
  },
  {
    id: "dot",
    label: "QR",
    dataUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="12" fill="#006d34"/><text x="32" y="42" text-anchor="middle" fill="white" font-size="28" font-family="sans-serif">QR</text></svg>`,
      ),
  },
  {
    id: "heart",
    label: "Heart",
    dataUrl:
      "data:image/svg+xml," +
      encodeURIComponent(
        `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#aa314b" d="M32 54S8 36 8 22a12 12 0 0 1 24-2 12 12 0 0 1 24 2c0 14-24 32-24 32z"/></svg>`,
      ),
  },
];

const STYLE_LABELS: Record<StyleTemplateId, string> = {
  basic: "Basic Style",
  brand: "Brand Style",
  minimal: "Minimal Style",
};

const selectClass =
  "w-full rounded-lg border border-outline-variant/30 bg-surface-container-lowest px-3 py-2.5 text-sm text-on-surface outline-none focus:border-primary focus:ring-2 focus:ring-primary/20";

function RulerSlider({
  label,
  min,
  max,
  step,
  value,
  disabled,
  onChange,
  formatValue,
  minHint,
  maxHint,
}: {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  disabled?: boolean;
  onChange: (v: number) => void;
  formatValue: (v: number) => string;
  minHint?: string;
  maxHint?: string;
}) {
  const pct = max === min ? 100 : ((value - min) / (max - min)) * 100;
  return (
    <div className="space-y-1">
      <label className="mb-1 block text-xs font-medium text-on-surface-variant">{label}</label>
      <input
        type="range"
        className="qr-ruler-slider w-full disabled:cursor-not-allowed disabled:opacity-50"
        style={{ ["--pct" as string]: `${pct}%` }}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      {(minHint || maxHint) && (
        <div className="flex justify-between text-[10px] text-on-surface-variant/80">
          <span>{minHint}</span>
          <span>{maxHint}</span>
        </div>
      )}
      <p className="text-sm font-medium text-on-surface">
        Current: <span className="text-primary">{formatValue(value)}</span>
      </p>
    </div>
  );
}

type Props = {
  open: boolean;
  content: string;
  downloadFormat: "png" | "jpeg";
  onDownloadFormatChange: (value: "png" | "jpeg") => void;
  onContentChange: (value: string) => void;
  baseModel: QrEditorModel;
  onClose: () => void;
  onSave: (model: QrEditorModel) => void;
};

export function BeautifyDialog({
  open,
  content,
  downloadFormat,
  onDownloadFormatChange,
  onContentChange,
  baseModel,
  onClose,
  onSave,
}: Props) {
  const [model, setModel] = useState<QrEditorModel>(baseModel);
  const [templateId, setTemplateId] = useState<StyleTemplateId>("basic");
  const [eyePreset, setEyePreset] = useState<EyeShapePresetId>("square");
  const [labelSizeId, setLabelSizeId] = useState("30");
  const [overlayTexts, setOverlayTexts] = useState<string[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const wasOpenRef = useRef(false);

  const labelPx = useMemo(() => {
    return LABEL_SIZE_OPTIONS.find((o) => o.id === labelSizeId)?.px ?? 360;
  }, [labelSizeId]);

  const marginSliderValue = useMemo(() => {
    const v = model.marginBlocks;
    return MARGIN_BLOCK_OPTIONS.some((o) => o.value === v) ? v : 2;
  }, [model.marginBlocks]);

  const errorSliderIndex = useMemo(
    () => Math.max(0, ERROR_LEVELS.findIndex((l) => l.level === model.errorCorrectionLevel)),
    [model.errorCorrectionLevel],
  );

  const versionSliderIndex = useMemo(
    () => Math.max(0, VERSION_OPTIONS.findIndex((v) => v.typeNumber === model.typeNumber)),
    [model.typeNumber],
  );

  const labelSliderIndex = useMemo(
    () => Math.max(0, LABEL_SIZE_OPTIONS.findIndex((o) => o.id === labelSizeId)),
    [labelSizeId],
  );

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      const merged: QrEditorModel = {
        ...baseModel,
        data: content || baseModel.data,
      };
      setModel(merged);
      setTemplateId("basic");
      setOverlayTexts([]);
      const found = EYE_SHAPE_PRESETS.find(
        (p) => p.square === merged.cornerSquareType && p.dot === merged.cornerDotType,
      );
      setEyePreset(found?.id ?? "square");
    }
    wasOpenRef.current = open;
  }, [open, baseModel, content]);

  const qrOptions = useMemo(
    () =>
      buildQrCodeStylingOptions({
        ...model,
        data: content || model.data,
        width: labelPx,
        height: labelPx,
      }),
    [model, content, labelPx],
  );

  useEffect(() => {
    const found = EYE_SHAPE_PRESETS.find(
      (p) => p.square === model.cornerSquareType && p.dot === model.cornerDotType,
    );
    if (found) setEyePreset(found.id);
  }, [model.cornerSquareType, model.cornerDotType]);

  const onPickEyePreset = (id: EyeShapePresetId) => {
    const p = EYE_SHAPE_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setEyePreset(id);
    setModel((m) => ({ ...m, cornerSquareType: p.square, cornerDotType: p.dot }));
  };

  const onUploadLogo = (file: File | undefined) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = () => setModel((m) => ({ ...m, logoDataUrl: r.result as string }));
    r.readAsDataURL(file);
  };

  const saveMyStyle = () => {
    try {
      const { logoDataUrl: _, ...rest } = model;
      localStorage.setItem("qr-curator-my-style", JSON.stringify({ ...rest, data: "" }));
    } catch {
      /* ignore */
    }
  };

  const loadMyStyle = () => {
    try {
      const raw = localStorage.getItem("qr-curator-my-style");
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<QrEditorModel> & { canvasMargin?: number };
      const { canvasMargin: _legacy, ...rest } = parsed;
      setModel((m) => ({
        ...m,
        ...rest,
        marginBlocks: typeof rest.marginBlocks === "number" ? rest.marginBlocks : m.marginBlocks,
        data: content || m.data,
      }));
    } catch {
      /* ignore */
    }
  };

  const applyTemplate = (id: StyleTemplateId) => {
    setTemplateId(id);
    setModel((m) => applyStyleTemplate(id, { ...m, data: content || m.data }));
  };

  const clearStyle = () => {
    const fresh = defaultQrEditorModel(content || "https://example.com/", labelPx);
    setModel(fresh);
    setTemplateId("basic");
    setOverlayTexts([]);
  };

  const downloadPrint = async () => {
    const { default: QRCodeStyling } = await import("qr-code-styling");
    const baseOpts = buildQrCodeStylingOptions({
      ...model,
      data: content || model.data,
      width: Math.round(labelPx * 2.5),
      height: Math.round(labelPx * 2.5),
    });

    try {
      const qr = new QRCodeStyling({ ...baseOpts, type: "svg" });
      await qr.download({ name: "qr-curator", extension: downloadFormat });
    } catch {
      // Fallback: if payload is too long for current version/error-correction,
      // switch QR Version to Auto (typeNumber: 0) and try again.
      const fallbackOpts = {
        ...baseOpts,
        qrOptions: {
          ...(baseOpts.qrOptions as NonNullable<typeof baseOpts.qrOptions>),
          typeNumber: 0 as TypeNumber,
        },
      };
      try {
        const qr = new QRCodeStyling({ ...fallbackOpts, type: "svg" });
        await qr.download({ name: "qr-curator", extension: downloadFormat });
      } catch (e) {
        alert("二维码内容过长，当前版本无法编码。请切回 Auto 或选择更高版本/更低容错后再下载。");
        // eslint-disable-next-line no-console
        console.error(e);
      }
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 md:p-8">
      <button
        type="button"
        className="absolute inset-0 bg-on-background/40 backdrop-blur-sm"
        aria-label="Close dialog backdrop"
        onClick={onClose}
      />
      <div className="relative flex max-h-[min(921px,96vh)] w-full max-w-6xl flex-col overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-surface-container-low shadow-2xl">
        <header className="flex shrink-0 items-center justify-between gap-4 border-b border-outline-variant/15 px-6 py-4 md:px-8">
          <h2 className="font-headline text-xl font-bold text-on-surface md:text-2xl">QR Style Editor</h2>
          <div className="flex items-center gap-3">
            <button type="button" onClick={loadMyStyle} className="text-xs font-medium text-on-surface-variant hover:text-primary">Load My Style</button>
            <button type="button" onClick={saveMyStyle} className="text-sm font-semibold text-primary hover:underline">Save as My Style</button>
          </div>
        </header>

        <div className="flex min-h-0 flex-1 flex-col md:flex-row">
          <aside className="no-scrollbar w-full shrink-0 overflow-y-auto border-outline-variant/10 md:w-[40%] md:border-r md:p-8 p-6 space-y-6">
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container-lowest p-4">
              <p className="text-sm font-semibold text-on-surface">Current style: <span className="text-primary">{STYLE_LABELS[templateId]}</span></p>
              <p className="mt-1 text-xs leading-relaxed text-on-surface-variant">0-1 fields, multiple size options, share-friendly output</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {STYLE_TEMPLATE_IDS.map((id) => (
                  <button key={id} type="button" onClick={() => applyTemplate(id)} className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${templateId === id ? "border-primary bg-primary/10 text-primary" : "border-primary/40 bg-white text-on-surface hover:bg-surface-container-high"}`}>
                    {STYLE_LABELS[id]}
                  </button>
                ))}
              </div>
            </div>

            <section>
              <p className="mb-2 text-sm font-semibold text-on-surface">Center Logo</p>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg border border-outline-variant/40 bg-surface-container-lowest px-4 py-2 text-sm font-medium hover:bg-surface-container-high">Upload Logo</button>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" className="hidden" onChange={(e) => onUploadLogo(e.target.files?.[0])} />
                <span className="self-center text-xs text-on-surface-variant">or choose from gallery</span>
              </div>
              <div className="mt-3 flex gap-2">
                {GALLERY_LOGOS.map((g) => (
                  <button key={g.id} type="button" title={g.label} onClick={() => setModel((m) => ({ ...m, logoDataUrl: g.dataUrl }))} className="h-12 w-12 overflow-hidden rounded-lg border border-outline-variant/30 bg-white p-1 hover:ring-2 hover:ring-primary/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.dataUrl} alt={g.label} className="h-full w-full object-contain" />
                  </button>
                ))}
                {model.logoDataUrl && (
                  <button type="button" onClick={() => setModel((m) => ({ ...m, logoDataUrl: DEFAULT_CENTER_LOGO_DATA_URL }))} className="self-center text-xs text-error hover:underline">Reset to Default Logo</button>
                )}
              </div>
            </section>

            <section className="space-y-3">
              <p className="text-sm font-semibold text-on-surface">Dots and Eyes</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-on-surface-variant">Dot Color</label>
                  <div className="flex items-center gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-2">
                    <input type="color" value={model.dotColor} onChange={(e) => setModel((m) => ({ ...m, dotColor: e.target.value }))} className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
                    <select className={`${selectClass} flex-1`} value={model.dotFill} onChange={(e) => setModel((m) => ({ ...m, dotFill: e.target.value as FillMode }))}>
                      <option value="solid">Solid</option>
                      <option value="gradient">Gradient</option>
                    </select>
                  </div>
                  {model.dotFill === "gradient" && <input type="color" className="mt-2 h-9 w-full max-w-[10rem] cursor-pointer" value={model.dotGradientEnd} onChange={(e) => setModel((m) => ({ ...m, dotGradientEnd: e.target.value }))} />}
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-on-surface-variant">Background Color</label>
                  <div className="flex items-center gap-2 rounded-xl border border-outline-variant/15 bg-surface-container-lowest p-2">
                    <input type="color" value={model.backgroundColor} onChange={(e) => setModel((m) => ({ ...m, backgroundColor: e.target.value }))} className="h-9 w-10 cursor-pointer rounded border-0 bg-transparent p-0" />
                    <select className={`${selectClass} flex-1`} value={model.backgroundFill} onChange={(e) => setModel((m) => ({ ...m, backgroundFill: e.target.value as FillMode }))}>
                      <option value="solid">Solid</option>
                      <option value="gradient">Gradient</option>
                    </select>
                  </div>
                  {model.backgroundFill === "gradient" && <input type="color" className="mt-2 h-9 w-full max-w-[10rem] cursor-pointer" value={model.backgroundGradientEnd} onChange={(e) => setModel((m) => ({ ...m, backgroundGradientEnd: e.target.value }))} />}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">Dot Shape</label>
                <select className={selectClass} value={model.dotType} onChange={(e) => setModel((m) => ({ ...m, dotType: e.target.value as QrEditorModel["dotType"] }))}>
                  {DOT_SHAPE_PRESETS.map((d) => <option key={d.id} value={d.id}>{d.label}</option>)}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">Eye Shape</label>
                <select className={selectClass} value={eyePreset} onChange={(e) => onPickEyePreset(e.target.value as EyeShapePresetId)}>
                  {EYE_SHAPE_PRESETS.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
                </select>
              </div>

              <label className="flex cursor-pointer items-center gap-2 text-sm text-on-surface">
                <input type="checkbox" checked={model.customEyeColor} onChange={(e) => setModel((m) => ({ ...m, customEyeColor: e.target.checked }))} className="size-4 rounded border-outline-variant text-primary focus:ring-primary" />
                Custom Eye Color
              </label>
              {model.customEyeColor && <input type="color" value={model.eyeColor} onChange={(e) => setModel((m) => ({ ...m, eyeColor: e.target.value }))} className="h-9 w-20 cursor-pointer" />}
            </section>

            <section className="space-y-4">
              <p className="text-sm font-semibold text-on-surface">More</p>

              <RulerSlider
                label="Margin"
                min={0}
                max={4}
                step={1}
                value={marginSliderValue}
                formatValue={(v) =>
                  MARGIN_BLOCK_OPTIONS.find((o) => o.value === v)?.label ?? `${v} blocks`
                }
                minHint="0"
                maxHint="4"
                onChange={(v) => setModel((m) => ({ ...m, marginBlocks: v }))}
              />

              <RulerSlider
                label="Error Tolerance"
                min={0}
                max={ERROR_LEVELS.length - 1}
                step={1}
                value={errorSliderIndex}
                formatValue={(idx) => ERROR_LEVELS[idx]?.label ?? ""}
                minHint={ERROR_LEVELS[0]?.label}
                maxHint={ERROR_LEVELS[ERROR_LEVELS.length - 1]?.label}
                onChange={(idx) => {
                  const level = ERROR_LEVELS[idx]?.level;
                  if (!level) return;
                  setModel((m) => ({ ...m, errorCorrectionLevel: level }));
                }}
              />

              <RulerSlider
                label="QR Version"
                min={0}
                max={VERSION_OPTIONS.length - 1}
                step={1}
                value={versionSliderIndex}
                formatValue={(idx) => VERSION_OPTIONS[idx]?.label ?? ""}
                minHint={VERSION_OPTIONS[0]?.label}
                maxHint={VERSION_OPTIONS[VERSION_OPTIONS.length - 1]?.label}
                onChange={(idx) => {
                  const tn = VERSION_OPTIONS[idx]?.typeNumber;
                  if (tn === undefined) return;
                  setModel((m) => ({ ...m, typeNumber: tn as TypeNumber }));
                }}
              />

              <div>
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">Encoded Content</label>
                <textarea className={`${selectClass} min-h-[88px] resize-y font-mono text-xs`} value={content} onChange={(e) => onContentChange(e.target.value)} rows={3} />
                <p className="mt-1 text-[10px] text-on-surface-variant">You can edit content directly; save to sync with homepage preview.</p>
              </div>

              <RulerSlider
                label="Label Size"
                min={0}
                max={LABEL_SIZE_OPTIONS.length - 1}
                step={1}
                value={labelSliderIndex}
                formatValue={(idx) => LABEL_SIZE_OPTIONS[idx]?.label ?? ""}
                minHint={LABEL_SIZE_OPTIONS[0]?.label}
                maxHint={LABEL_SIZE_OPTIONS[LABEL_SIZE_OPTIONS.length - 1]?.label}
                onChange={(idx) => {
                  const id = LABEL_SIZE_OPTIONS[idx]?.id;
                  if (!id) return;
                  setLabelSizeId(id);
                }}
              />

              <div>
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">Download Format</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {(
                    [
                      { id: "png" as const, label: "PNG" },
                      { id: "jpeg" as const, label: "JPG" },
                    ] as const
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onDownloadFormatChange(opt.id)}
                      className={`rounded-lg border px-4 py-2 text-sm font-semibold transition-colors ${
                        downloadFormat === opt.id
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-outline-variant/40 bg-surface-container-lowest text-on-surface hover:bg-surface-container-high"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
                <p className="mt-1 text-[10px] text-on-surface-variant">
                  Current: <span className="font-medium text-primary">{downloadFormat === "jpeg" ? "JPG" : "PNG"}</span>
                </p>
              </div>

              <div>
                <RulerSlider
                  label="Center Logo Scale"
                  min={0.15}
                  max={0.45}
                  step={0.01}
                  value={model.imageSize}
                  disabled={!model.logoDataUrl}
                  formatValue={(v) => `${Math.round(v * 100)}%`}
                  minHint="15%"
                  maxHint="45%"
                  onChange={(v) => setModel((m) => ({ ...m, imageSize: v }))}
                />
                {!model.logoDataUrl && (
                  <p className="mt-1 text-[10px] text-error">Upload or select a logo before adjusting scale.</p>
                )}
              </div>
            </section>

            <button type="button" onClick={() => setOverlayTexts((t) => [...t, "New Text"])} className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-outline-variant/40 py-3 text-sm font-semibold text-on-surface hover:bg-surface-container-high">
              <span className="material-symbols-outlined text-base">add</span>
              Add Text
            </button>

            {overlayTexts.length > 0 && (
              <div className="space-y-2">
                {overlayTexts.map((line, i) => (
                  <input key={i} className={selectClass} value={line} onChange={(e) => { const v = e.target.value; setOverlayTexts((rows) => rows.map((x, j) => (j === i ? v : x))); }} />
                ))}
              </div>
            )}
          </aside>

          <div className="relative flex w-full flex-col items-center justify-center bg-surface p-6 md:w-[60%] md:p-12">
            <button type="button" onClick={onClose} className="absolute right-4 top-4 flex size-10 items-center justify-center rounded-full bg-surface-container-lowest/90 text-on-surface-variant shadow-sm backdrop-blur hover:text-error md:right-6 md:top-6" aria-label="Close">
              <span className="material-symbols-outlined">close</span>
            </button>

            <p className="mb-4 self-start text-xs text-on-surface-variant">Current style: {STYLE_LABELS[templateId]}</p>

            <div className="glass-panel relative w-full max-w-md rounded-[2.5rem] border border-white/50 p-8 shadow-2xl">
              <div className="relative flex flex-col items-center rounded-2xl bg-white p-4 shadow-inner">
                <QrStylingCanvas options={qrOptions} className="flex max-h-[min(72vw,320px)] max-w-full items-center justify-center [&_svg]:h-auto [&_svg]:max-w-full" />
                {overlayTexts.length > 0 && (
                  <div className="mt-3 w-full space-y-1 text-center">
                    {overlayTexts.map((t, i) => (
                      <p key={i} className="text-sm font-medium text-on-surface">{t}</p>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button type="button" onClick={() => { onSave({ ...model, data: content || model.data, width: labelPx, height: labelPx }); onClose(); }} className="mt-8 w-full max-w-md rounded-xl bg-gradient-to-r from-primary to-primary-container py-4 font-headline text-lg font-extrabold text-on-primary shadow-lg shadow-primary/20 transition hover:scale-[1.01] active:scale-[0.99]">
              Save Style and Return
            </button>
            <div className="mt-4 flex w-full max-w-md justify-center gap-8 text-sm">
              <button type="button" onClick={clearStyle} className="text-on-surface-variant hover:text-primary">Clear Style</button>
              <button type="button" onClick={downloadPrint} className="text-on-surface-variant hover:text-primary">Download Print</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
