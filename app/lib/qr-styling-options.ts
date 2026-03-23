import type {
  CornerDotType,
  CornerSquareType,
  DotType,
  ErrorCorrectionLevel,
  Gradient,
  Options,
  TypeNumber,
} from "qr-code-styling";

export type FillMode = "solid" | "gradient";

export interface QrEditorModel {
  data: string;
  width: number;
  height: number;
  /** Quiet-zone style margin around modules, in blocks (0-4). */
  marginBlocks: number;
  dotType: DotType;
  dotFill: FillMode;
  dotColor: string;
  dotGradientEnd: string;
  backgroundFill: FillMode;
  backgroundColor: string;
  backgroundGradientEnd: string;
  cornerSquareType: CornerSquareType;
  cornerDotType: CornerDotType;
  customEyeColor: boolean;
  eyeColor: string;
  errorCorrectionLevel: ErrorCorrectionLevel;
  typeNumber: TypeNumber;
  logoDataUrl: string | undefined;
  imageSize: number;
  logoMargin: number;
}

function buildGradient(mode: FillMode, a: string, b: string): Gradient | undefined {
  if (mode !== "gradient") return undefined;
  return {
    type: "linear",
    rotation: 0,
    colorStops: [
      { offset: 0, color: a },
      { offset: 1, color: b },
    ],
  };
}

export function buildQrCodeStylingOptions(m: QrEditorModel): Options {
  const canvasMargin = marginBlocksToPx(m.marginBlocks, m.width);
  const dotsGradient = buildGradient(m.dotFill, m.dotColor, m.dotGradientEnd);
  const bgGradient = buildGradient(m.backgroundFill, m.backgroundColor, m.backgroundGradientEnd);

  const dotsOptions: Options["dotsOptions"] = {
    type: m.dotType,
    ...(dotsGradient ? { gradient: dotsGradient } : { color: m.dotColor }),
  };

  const backgroundOptions: Options["backgroundOptions"] = {
    ...(bgGradient ? { gradient: bgGradient } : { color: m.backgroundColor }),
  };

  const cornersSquareOptions: Options["cornersSquareOptions"] = {
    type: m.cornerSquareType,
    ...(m.customEyeColor ? { color: m.eyeColor } : {}),
  };

  const cornersDotOptions: Options["cornersDotOptions"] = {
    type: m.cornerDotType,
    ...(m.customEyeColor ? { color: m.eyeColor } : {}),
  };

  return {
    type: "svg",
    width: m.width,
    height: m.height,
    margin: canvasMargin,
    data: m.data || "https://example.com",
    image: m.logoDataUrl,
    qrOptions: {
      errorCorrectionLevel: m.errorCorrectionLevel,
      typeNumber: m.typeNumber,
    },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: m.logoDataUrl ? m.imageSize : 0.4,
      margin: m.logoDataUrl ? m.logoMargin : 0,
      crossOrigin: "anonymous",
      saveAsBlob: true,
    },
    dotsOptions,
    backgroundOptions,
    cornersSquareOptions,
    cornersDotOptions,
  };
}

export const DOT_SHAPE_PRESETS: { id: DotType; label: string }[] = [
  { id: "square", label: "Square" },
  { id: "rounded", label: "Rounded" },
  { id: "dots", label: "Dots" },
  { id: "classy", label: "Classy" },
  { id: "classy-rounded", label: "Classy Rounded" },
  { id: "extra-rounded", label: "Extra Rounded" },
];

export type EyeShapePresetId = "square" | "rounded" | "extra_rounded" | "dot" | "classy";

export const EYE_SHAPE_PRESETS: {
  id: EyeShapePresetId;
  label: string;
  square: CornerSquareType;
  dot: CornerDotType;
}[] = [
  { id: "square", label: "Square", square: "square", dot: "square" },
  { id: "rounded", label: "Rounded", square: "rounded", dot: "rounded" },
  { id: "extra_rounded", label: "Extra Rounded", square: "extra-rounded", dot: "dot" },
  { id: "dot", label: "Dots", square: "dot", dot: "dot" },
  { id: "classy", label: "Classy", square: "classy", dot: "classy" },
];

export const ERROR_LEVELS: { level: ErrorCorrectionLevel; label: string }[] = [
  { level: "L", label: "7% (L)" },
  { level: "M", label: "15% (M)" },
  { level: "Q", label: "25% (Q)" },
  { level: "H", label: "30% (H)" },
];

export const VERSION_OPTIONS: { typeNumber: TypeNumber; label: string }[] = [
  { typeNumber: 0, label: "Auto" },
  { typeNumber: 1, label: "1 (21x21)" },
  { typeNumber: 2, label: "2 (25x25)" },
  { typeNumber: 3, label: "3 (29x29)" },
  { typeNumber: 4, label: "4 (33x33)" },
  { typeNumber: 5, label: "5 (37x37)" },
  { typeNumber: 6, label: "6 (41x41)" },
  { typeNumber: 7, label: "7 (45x45)" },
  { typeNumber: 8, label: "8 (49x49)" },
];

export const MARGIN_BLOCK_OPTIONS = [
  { value: 0, label: "No Margin" },
  { value: 1, label: "1 Block" },
  { value: 2, label: "2 Blocks" },
  { value: 3, label: "3 Blocks" },
  { value: 4, label: "4 Blocks" },
];

export const LABEL_SIZE_OPTIONS = [
  { id: "20", label: "20x20 mm", px: 240 },
  { id: "25", label: "25x25 mm", px: 300 },
  { id: "30", label: "30x30 mm", px: 360 },
  { id: "40", label: "40x40 mm", px: 480 },
];

export const DEFAULT_CENTER_LOGO_DATA_URL =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#006d34"/><text x="32" y="42" text-anchor="middle" fill="#ffffff" font-size="26" font-family="Arial, sans-serif">QR</text></svg>`,
  );

export function marginBlocksToPx(blocks: number, qrSize: number): number {
  const base = Math.max(48, Math.round(qrSize * 0.04));
  return blocks * base;
}

export function defaultQrEditorModel(data: string, previewPx: number): QrEditorModel {
  return {
    data,
    width: previewPx,
    height: previewPx,
    marginBlocks: 2,
    dotType: "square",
    dotFill: "solid",
    dotColor: "#000000",
    dotGradientEnd: "#006d34",
    backgroundFill: "solid",
    backgroundColor: "#ffffff",
    backgroundGradientEnd: "#e8f0e5",
    cornerSquareType: "square",
    cornerDotType: "square",
    customEyeColor: false,
    eyeColor: "#000000",
    errorCorrectionLevel: "M",
    typeNumber: 0,
    logoDataUrl: DEFAULT_CENTER_LOGO_DATA_URL,
    imageSize: 0.35,
    logoMargin: 4,
  };
}

export const STYLE_TEMPLATE_IDS = ["basic", "brand", "minimal"] as const;
export type StyleTemplateId = (typeof STYLE_TEMPLATE_IDS)[number];

export function applyStyleTemplate(id: StyleTemplateId, base: QrEditorModel): QrEditorModel {
  if (id === "basic") {
    return {
      ...base,
      dotType: "square",
      dotFill: "solid",
      dotColor: "#000000",
      backgroundFill: "solid",
      backgroundColor: "#ffffff",
      cornerSquareType: "square",
      cornerDotType: "square",
      customEyeColor: false,
    };
  }
  if (id === "brand") {
    return {
      ...base,
      dotType: "rounded",
      dotFill: "solid",
      dotColor: "#006d34",
      backgroundFill: "solid",
      backgroundColor: "#f4fcf1",
      cornerSquareType: "extra-rounded",
      cornerDotType: "dot",
      customEyeColor: true,
      eyeColor: "#006d34",
    };
  }
  return {
    ...base,
    dotType: "dots",
    dotFill: "solid",
    dotColor: "#2b322b",
    backgroundFill: "solid",
    backgroundColor: "#eef6eb",
    cornerSquareType: "rounded",
    cornerDotType: "rounded",
    customEyeColor: false,
  };
}
