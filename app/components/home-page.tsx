"use client";

import { useMemo, useState } from "react";
import { BeautifyDialog } from "./beautify-dialog";
import { QrStylingCanvas } from "./qr-styling-canvas";
import type { TypeNumber } from "qr-code-styling";
import {
  buildQrCodeStylingOptions,
  defaultQrEditorModel,
  type QrEditorModel,
} from "@/app/lib/qr-styling-options";

const HERO_QR_PX = 280;

function normalizeUrl(input: string): string {
  const t = input.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function HomePage() {
  const [urlInput, setUrlInput] = useState("https://happyaicoding.com/");
  const [qrContent, setQrContent] = useState("https://happyaicoding.com/");
  const [styleModel, setStyleModel] = useState<QrEditorModel>(() =>
    defaultQrEditorModel("https://happyaicoding.com/", HERO_QR_PX),
  );
  const [dialogOpen, setDialogOpen] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpeg">("png");
  const topTestimonials = [
    {
      quote:
        "\"Finally, a QR tool that doesn't ruin our luxury packaging design. The customization is unmatched.\"",
      name: "Elena Vance",
      role: "Creative Director, Lumina Labs",
      card: "bg-surface-container-high text-on-surface",
      roleClass: "text-on-surface-variant",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuAbprfNDhEfywWOMwzE-xanKTbLL68vQY6kQPGYjFmvnlUmlm0M3Gg8vRKT35qjwALks1f_Fo6q7mcgVF_0EJ3GYMwM-U6HCyMHn-BmC8dB6nHpyTgVtIrQqmSry4ly2Tw5PtlCGiGftA08gC96bXZGfOn3QLBxT_TdJnqsayNOsRDOrfHJX4EH4knE9yiZrdvm_tqERUeDiEF_g6ZSy4c2WluuGF_OZa-ga-Zag8FdJ29BlzRjJ07UatVjbTRPDbgT-mQjA5jkzCw",
    },
    {
      quote:
        "\"The Beautify feature is a game changer. We increased our scan rate by 40% after switching to QR Curator.\"",
      name: "Marcus Chen",
      role: "Head of Growth, AeroFlow",
      card: "bg-primary text-on-primary shadow-xl shadow-primary/10",
      roleClass: "text-on-primary/70",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuDePfGMvru5iMcKCpZAVu9yhqnLRO6SNT3o5vX5f0uW1PDBb6mdsRWeIMMx4Zs-6e6Pu7KiHgul_g-EVxyRC9lxByIybKxmX39CznKkqWUZBZdjCRif-K5MCm04fDrzdea2ySg66Rp6Qt42xRTb_LtPIIB__hNxNZqiV0PpUhWaL43fPH7Jv6Z5nEBrq-EWxv-_991Ty_vU-uoDFLtOboFFkNjUtFwjB_K_W8Y2VdBkrYpH0cmeREuvg6snBa28_lov1BS53x_08fI",
    },
    {
      quote:
        "\"Minimalist, functional, and beautiful. It's the only QR generator our studio recommends to clients.\"",
      name: "Sarah Jenkins",
      role: "Identity Designer",
      card: "bg-surface-container-high text-on-surface",
      roleClass: "text-on-surface-variant",
      img: "https://lh3.googleusercontent.com/aida-public/AB6AXuCs-BhfqIrqI47H_C4D9P0lIl3EVaTcdTryrg6RHiWt3R4G5jozpFwlWgkABACqT9t2pPV19GnBaZDWYRplNkqmV6S_rfE_VkQqa45SQZxDwMT0d2Qqq2mOZr4bNj-5szDD56L0TSk4V1TDXz-YeLuW-RGbr1DnONFrGgyKoQEJqNkPC4VpaKRqAaAaq4F6NZRqTUBMtDW9syTMJRdwpLAK7CVDqzpl1fLoVa_7VUyIE6tGf0UNVzikF2UhQ47CMUDHMl9az_riZcU",
    },
    {
      quote:
        "\"We tested QR Curator across three campaigns, and scans improved on every print size without re-tuning settings.\"",
      name: "Ava Rodriguez",
      role: "Marketing Ops, Beacon Studio",
      card: "bg-surface-container-high text-on-surface",
      roleClass: "text-on-surface-variant",
      img: "https://randomuser.me/api/portraits/women/20.jpg",
    },
    {
      quote:
        "\"The templates look premium, and stakeholders stopped asking for 'just one more tweak'.\"",
      name: "Liam Walker",
      role: "Brand Manager, Northwind",
      card: "bg-primary text-on-primary shadow-xl shadow-primary/10",
      roleClass: "text-on-primary/70",
      img: "https://randomuser.me/api/portraits/men/10.jpg",
    },
  ];
  const bottomTestimonials = [
    {
      quote:
        "\"Our event booth scans doubled after switching to styled QR layouts.\"",
      name: "Jason Reed",
      role: "Brand Manager, Northline",
      card: "bg-surface-container-high text-on-surface",
      roleClass: "text-on-surface-variant",
      img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&q=80&auto=format&fit=crop",
    },
    {
      quote:
        "\"The editor feels like a design tool, not a utility. Exactly what we needed.\"",
      name: "Nina Park",
      role: "Product Designer",
      card: "bg-surface-container-high text-on-surface",
      roleClass: "text-on-surface-variant",
      img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=120&q=80&auto=format&fit=crop",
    },
    {
      quote:
        "\"The style presets gave our marketing team a perfect baseline in minutes.\"",
      name: "Olivia Hart",
      role: "Growth Lead, Mintly",
      card: "bg-primary text-on-primary shadow-xl shadow-primary/10",
      roleClass: "text-on-primary/70",
      img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=120&q=80&auto=format&fit=crop",
    },
    {
      quote:
        "\"We finally have QR visuals that match our product packaging language.\"",
      name: "Daniel Kim",
      role: "Creative Technologist",
      card: "bg-surface-container-high text-on-surface",
      roleClass: "text-on-surface-variant",
      img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&q=80&auto=format&fit=crop",
    },
    {
      quote:
        "\"From URL to QR artwork, the workflow is quick and reliable—no fiddly controls.\"",
      name: "Sophia Martin",
      role: "Design Engineer, Paperwave",
      card: "bg-surface-container-high text-on-surface",
      roleClass: "text-on-surface-variant",
      img: "https://randomuser.me/api/portraits/women/40.jpg",
    },
    {
      quote:
        "\"Color and logo options finally match our brand guidelines without compromise.\"",
      name: "Ethan Brooks",
      role: "Creative Lead, Prismworks",
      card: "bg-primary text-on-primary shadow-xl shadow-primary/10",
      roleClass: "text-on-primary/70",
      img: "https://randomuser.me/api/portraits/men/30.jpg",
    },
  ];

  const heroOptions = useMemo(
    () =>
      buildQrCodeStylingOptions({
        ...styleModel,
        data: qrContent,
        width: HERO_QR_PX,
        height: HERO_QR_PX,
      }),
    [styleModel, qrContent],
  );

  const generate = () => {
    const next = normalizeUrl(urlInput);
    if (!next) return;
    setQrContent(next);
    setStyleModel((m) => ({ ...m, data: next }));
  };

  const downloadHero = async () => {
    const { default: QRCodeStyling } = await import("qr-code-styling");
    const w = Math.round(HERO_QR_PX * 3);
    const baseOpts = buildQrCodeStylingOptions({
      ...styleModel,
      data: qrContent,
      width: w,
      height: w,
    });

    try {
      const qr = new QRCodeStyling({
        ...baseOpts,
        type: "svg",
      });
      await qr.download({ name: "qr-curator", extension: downloadFormat });
    } catch {
      // Fallback to Auto version to avoid "code length overflow".
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

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-[#f4fcf1] dark:bg-emerald-950">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-8 py-6">
          <div className="font-headline text-2xl font-bold tracking-tight text-[#006d34] dark:text-[#00a854]">QR Curator</div>
          <div className="hidden items-center space-x-8 font-headline font-semibold tracking-tight md:flex">
            <a className="border-b-2 border-[#006d34] pb-1 text-[#006d34] transition-colors duration-300 dark:text-[#00a854]" href="#generator">Generator</a>
            <a className="text-[#3d4a3e] transition-colors duration-300 hover:text-[#00a854] dark:text-emerald-100/70" href="#features">Features</a>
            <a className="text-[#3d4a3e] transition-colors duration-300 hover:text-[#00a854] dark:text-emerald-100/70" href="#showcase">Showcase</a>
            <a className="text-[#3d4a3e] transition-colors duration-300 hover:text-[#00a854] dark:text-emerald-100/70" href="#pricing">Pricing</a>
            <a className="text-[#3d4a3e] transition-colors duration-300 hover:text-[#00a854] dark:text-emerald-100/70" href="#faq">FAQ</a>
          </div>
        </nav>
      </header>

      <main>
        <section
          id="generator"
          className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-8 pb-24 pt-16 lg:grid-cols-12"
        >
          <div className="space-y-8 lg:col-span-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-secondary-container px-4 py-2 text-sm font-medium text-on-secondary-container">
              <span className="material-symbols-outlined text-sm">auto_awesome</span>
              Introducing AI-Powered Customization
            </div>
            <h1 className="font-headline text-5xl font-extrabold leading-[1.1] tracking-tighter text-on-surface lg:text-7xl">
              The Art of <br />
              <span className="font-normal italic text-primary">Connection.</span>
            </h1>
            <p className="max-w-md text-lg leading-relaxed text-on-surface-variant">Transform standard QR codes into sophisticated brand assets. Enter your link to begin the design journey.</p>
            <div className="space-y-4">
              <label className="mb-1 block text-sm font-medium text-on-surface-variant">Destination URL</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input className="flex-grow rounded-md border border-outline-variant/20 bg-surface-container-lowest px-6 py-4 text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary" placeholder="https://yourbrand.com/curate" type="text" value={urlInput} onChange={(e) => setUrlInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} />
                <button type="button" onClick={generate} className="flex items-center justify-center gap-2 rounded-md bg-primary px-8 py-4 font-bold text-on-primary shadow-sm transition-all hover:brightness-110">
                  Generate
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-center lg:col-span-7 lg:justify-end">
            <div className="glass-card relative flex w-full max-w-lg flex-col items-center justify-center space-y-8 overflow-hidden rounded-xl p-12 shadow-[0px_20px_40px_rgba(22,29,23,0.06)]">
              <div className="absolute -right-24 -top-24 size-64 rounded-full bg-primary/5 blur-3xl" />
              <div className="absolute -bottom-24 -left-24 size-64 rounded-full bg-secondary/5 blur-3xl" />
              <div className="relative z-10 cursor-pointer overflow-hidden rounded-xl border border-outline-variant/10 bg-white p-6 shadow-inner">
                <QrStylingCanvas options={heroOptions} className="flex size-64 items-center justify-center [&_svg]:max-h-64 [&_svg]:max-w-64" />
              </div>
              <div className="flex w-full gap-4">
                <button type="button" onClick={downloadHero} className="flex flex-1 items-center justify-center gap-2 rounded-md border border-outline-variant/30 py-4 font-semibold text-on-surface transition-colors hover:bg-surface-container-high">
                  <span className="material-symbols-outlined">download</span>
                  Download {downloadFormat === "jpeg" ? "JPG" : "PNG"}
                </button>
                <button type="button" onClick={() => setDialogOpen(true)} className="flex flex-1 items-center justify-center gap-2 rounded-md bg-gradient-to-r from-primary to-primary-container py-4 font-bold text-on-primary shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95">
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>palette</span>
                  Beautify
                </button>
              </div>
              <div className="w-full">
                <label className="mb-1 block text-xs font-medium text-on-surface-variant">
                  Download format
                </label>
                <select
                  value={downloadFormat}
                  onChange={(e) =>
                    setDownloadFormat(e.target.value as "png" | "jpeg")
                  }
                  className="w-full rounded-md border border-outline-variant/20 bg-surface-container-lowest px-3 py-2 text-sm text-on-surface outline-none transition-all focus:border-primary focus:ring-2 focus:ring-primary"
                >
                  <option value="png">PNG</option>
                  <option value="jpeg">JPG</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="bg-surface-container-low py-24">
          <div className="mx-auto max-w-7xl px-8">
            <div className="mb-16 space-y-4 text-center">
              <h2 className="font-headline text-3xl font-bold text-on-surface lg:text-4xl">
                Curation Process
              </h2>
              <p className="mx-auto max-w-xl text-on-surface-variant">
                Three simple steps to elevate your digital physical presence.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              {[
                {
                  icon: "link",
                  title: "Input Link",
                  body: "Paste your URL, social profile, or digital business card into our generator.",
                  box: "bg-secondary-container text-on-secondary-container",
                },
                {
                  icon: "brush",
                  title: "Apply Style",
                  body: "Choose from our curated library of editorial frames, gradients, and logos.",
                  box: "bg-primary-fixed text-on-primary-fixed",
                },
                {
                  icon: "share",
                  title: "Deploy Anywhere",
                  body: "Download in high-resolution vector formats for print or digital use.",
                  box: "bg-tertiary-fixed text-on-tertiary-fixed",
                },
              ].map((s) => (
                <div
                  key={s.title}
                  className="space-y-6 rounded-xl bg-surface-container-lowest p-10 transition-transform hover:-translate-y-2"
                >
                  <div
                    className={`flex size-14 items-center justify-center rounded-lg ${s.box}`}
                  >
                    <span className="material-symbols-outlined text-3xl">
                      {s.icon}
                    </span>
                  </div>
                  <h3 className="font-headline text-xl font-bold">{s.title}</h3>
                  <p className="leading-relaxed text-on-surface-variant">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="showcase" className="overflow-hidden py-24">
          <div className="mx-auto mb-12 max-w-7xl px-8">
            <div className="flex items-end justify-between">
              <div className="space-y-4">
                <h2 className="font-headline text-3xl font-bold text-on-surface">
                  The Curator Community
                </h2>
                <p className="text-on-surface-variant">
                  Used by high-end brands and design studios globally.
                </p>
              </div>
            </div>
          </div>
          <div className="space-y-6 overflow-hidden px-8">
            <div className="marquee-mask">
              <div className="marquee-track marquee-left">
                {[...topTestimonials, ...topTestimonials].map((t, idx) => (
                  <article
                    key={`${t.name}-a-${idx}`}
                    className={`flex min-w-[360px] max-w-[360px] flex-col gap-5 rounded-xl p-6 ${t.card}`}
                  >
                    <p className="font-body text-base italic leading-relaxed">{t.quote}</p>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.img} alt={t.name} className="size-10 rounded-full object-cover" />
                      <div>
                        <div className="font-semibold">{t.name}</div>
                        <div className={`text-xs ${t.roleClass}`}>{t.role}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
            <div className="marquee-mask">
              <div className="marquee-track marquee-right">
                {[...bottomTestimonials, ...bottomTestimonials].map((t, idx) => (
                  <article
                    key={`${t.name}-b-${idx}`}
                    className={`flex min-w-[320px] max-w-[320px] flex-col gap-4 rounded-xl p-5 ${t.card}`}
                  >
                    <p className="font-body text-sm italic leading-relaxed">{t.quote}</p>
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.img} alt={t.name} className="size-9 rounded-full object-cover" />
                      <div>
                        <div className="text-sm font-semibold">{t.name}</div>
                        <div className={`text-xs ${t.roleClass}`}>{t.role}</div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="faq" className="mx-auto max-w-4xl px-8 py-24">
          <h2 className="mb-16 text-center font-headline text-3xl font-bold text-on-surface">
            Curator Knowledge Base
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Are these QR codes permanent?",
                a: "Yes, all standard QR codes generated are static and will work forever without subscription fees.",
              },
              {
                q: "Can I use my own brand logo?",
                a: "Absolutely. The Beautify modal allows you to upload PNG or SVG logos to center within your design.",
              },
              {
                q: "What file formats are supported?",
                a: "We provide downloads in high-res PNG, SVG for vector scaling, and PDF for print production.",
              },
              {
                q: "Is there a scan limit?",
                a: "Never. Our QR codes offer unlimited scans and zero tracking redirections for maximum security.",
              },
            ].map((f) => (
              <div
                key={f.q}
                className="group cursor-pointer rounded-xl bg-surface-container-low p-6 transition-colors hover:bg-surface-container-high"
              >
                <div className="flex items-center justify-between">
                  <h4 className="text-lg font-bold">{f.q}</h4>
                  <span className="material-symbols-outlined text-primary transition-transform group-hover:rotate-180">
                    expand_more
                  </span>
                </div>
                <p className="mt-4 hidden leading-relaxed text-on-surface-variant group-hover:block">
                  {f.a}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer
        id="pricing"
        className="mt-20 w-full border-t border-[#bccabb]/20 bg-[#eef6eb] py-12 dark:bg-emerald-900/20"
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-8 md:flex-row">
          <div className="space-y-2">
            <div className="text-lg font-bold text-[#161d17] dark:text-emerald-50">
              QR Curator
            </div>
            <p className="font-body text-sm text-[#3d4a3e] dark:text-emerald-100/60">
              © 2024 QR Curator. Designed for the digital collector.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            {[
              "Privacy Policy",
              "Terms of Service",
              "API Documentation",
              "Contact Support",
            ].map((x) => (
              <a
                key={x}
                className="font-body text-sm text-[#3d4a3e] underline decoration-2 underline-offset-4 opacity-80 transition-all hover:text-[#006d34] hover:opacity-100"
                href="#"
              >
                {x}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <BeautifyDialog
        open={dialogOpen}
        content={qrContent}
        downloadFormat={downloadFormat}
        onDownloadFormatChange={setDownloadFormat}
        onContentChange={setQrContent}
        baseModel={{ ...styleModel, data: qrContent }}
        onClose={() => setDialogOpen(false)}
        onSave={(saved) => {
          setStyleModel({ ...saved, width: HERO_QR_PX, height: HERO_QR_PX });
          setQrContent(saved.data);
          setUrlInput(saved.data);
        }}
      />
    </>
  );
}
