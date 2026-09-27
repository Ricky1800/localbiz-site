"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";
import type { BusinessConfig } from "@/lib/config";
import { RenderSection, Header, Footer } from "@/components/sections";
import { buildConfigSnippet } from "@/lib/sections/copy-config";
import {
  FOOTER_VARIANTS,
  HEADER_VARIANTS,
  SECTION_KINDS,
  SECTION_VARIANTS,
  type SectionEntry,
  type SectionKind,
} from "@/lib/sections/schema";
import { isValidHexColor } from "@/lib/theme/color";
import { FONT_KEYS, type FontKey } from "@/lib/theme/font-registry";
import { PRESET_KEYS, THEME_PRESETS, type PresetKey } from "@/lib/theme/presets";
import {
  DENSITY_SCALES,
  MOTION_SCALES,
  RADIUS_SCALES,
  SHADOW_SCALES,
} from "@/lib/theme/styles";
import { resolveTheme, themeToCssVariables, type ResolvedTheme } from "@/lib/theme/tokens";
import type { ThemeConfig } from "@/lib/theme/schema";

const RADIUS_KEYS = Object.keys(RADIUS_SCALES) as Array<keyof typeof RADIUS_SCALES>;
const SHADOW_KEYS = Object.keys(SHADOW_SCALES) as Array<keyof typeof SHADOW_SCALES>;
const MOTION_KEYS = Object.keys(MOTION_SCALES) as Array<keyof typeof MOTION_SCALES>;
const DENSITY_KEYS = Object.keys(DENSITY_SCALES) as Array<keyof typeof DENSITY_SCALES>;

const VIEWPORTS = {
  mobile: { label: "Mobile", width: 375 },
  tablet: { label: "Tablet", width: 768 },
  desktop: { label: "Desktop", width: 1280 },
} as const;
type ViewportKey = keyof typeof VIEWPORTS;

interface SectionRowState {
  enabled: boolean;
  variant: string;
}

function initialSectionRows(sections: SectionEntry[]): Record<SectionKind, SectionRowState> {
  const byKind = new Map(sections.map((s) => [s.type, s.variant] as const));
  const result = {} as Record<SectionKind, SectionRowState>;
  for (const kind of SECTION_KINDS) {
    const existing = byKind.get(kind);
    result[kind] = {
      enabled: existing !== undefined,
      variant: existing ?? SECTION_VARIANTS[kind][0],
    };
  }
  return result;
}

export function DesignPanel({ initialConfig }: { initialConfig: BusinessConfig }) {
  const [preset, setPreset] = useState<PresetKey>(initialConfig.theme.preset);
  const [brandColorInput, setBrandColorInput] = useState(initialConfig.theme.brandColor ?? "");
  const [headingFont, setHeadingFont] = useState<FontKey | "">(initialConfig.theme.fonts?.heading ?? "");
  const [bodyFont, setBodyFont] = useState<FontKey | "">(initialConfig.theme.fonts?.body ?? "");
  const [radius, setRadius] = useState<(typeof RADIUS_KEYS)[number] | "">(initialConfig.theme.radius ?? "");
  const [shadow, setShadow] = useState<(typeof SHADOW_KEYS)[number] | "">(initialConfig.theme.shadow ?? "");
  const [motion, setMotion] = useState<(typeof MOTION_KEYS)[number] | "">(initialConfig.theme.motion ?? "");
  const [density, setDensity] = useState<(typeof DENSITY_KEYS)[number] | "">(initialConfig.theme.density ?? "");

  const [sectionRows, setSectionRows] = useState(() => initialSectionRows(initialConfig.sections));
  const [headerVariant, setHeaderVariant] = useState(initialConfig.layout.header.variant);
  const [footerVariant, setFooterVariant] = useState(initialConfig.layout.footer.variant);

  const [viewport, setViewport] = useState<ViewportKey>("desktop");
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");

  const brandColor = isValidHexColor(brandColorInput) ? brandColorInput : undefined;

  const themeConfig: ThemeConfig = {
    preset,
    ...(brandColor ? { brandColor } : {}),
    ...(headingFont || bodyFont
      ? { fonts: { ...(headingFont ? { heading: headingFont } : {}), ...(bodyFont ? { body: bodyFont } : {}) } }
      : {}),
    ...(radius ? { radius } : {}),
    ...(shadow ? { shadow } : {}),
    ...(motion ? { motion } : {}),
    ...(density ? { density } : {}),
  };

  const { theme, error } = useMemo<{ theme: ResolvedTheme | null; error: string | null }>(() => {
    try {
      return { theme: resolveTheme(themeConfig), error: null };
    } catch (err) {
      return { theme: null, error: err instanceof Error ? err.message : String(err) };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- themeConfig is a fresh object every render by construction
  }, [preset, brandColor, headingFont, bodyFont, radius, shadow, motion, density]);

  const activeSections: SectionEntry[] = SECTION_KINDS.filter((k) => sectionRows[k].enabled).map(
    (k) => ({ type: k, variant: sectionRows[k].variant }) as SectionEntry,
  );

  const snippet = buildConfigSnippet({
    preset,
    brandColor,
    headingFont: headingFont || undefined,
    bodyFont: bodyFont || undefined,
    radius: radius || undefined,
    shadow: shadow || undefined,
    motion: motion || undefined,
    density: density || undefined,
    sections: activeSections,
    layout: { header: { variant: headerVariant }, footer: { variant: footerVariant } },
  });

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(snippet);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
    setTimeout(() => setCopyState("idle"), 2000);
  }

  const previewConfig: BusinessConfig = { ...initialConfig, sections: activeSections };
  const previewStyle = theme ? (themeToCssVariables(theme) as CSSProperties) : undefined;

  return (
    <div className="flex min-h-screen flex-col bg-zinc-950 text-zinc-100 lg:flex-row">
      <aside className="w-full shrink-0 overflow-y-auto border-b border-zinc-800 bg-zinc-900 p-5 lg:h-screen lg:w-96 lg:border-b-0 lg:border-r">
        <h1 className="text-lg font-bold">Design panel</h1>
        <p className="mt-1 text-xs text-zinc-400">
          Dev-only. Tune the theme and section variants, then copy the config
          snippet into <code>business.config.ts</code>.
        </p>

        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Preset</h2>
          <select
            value={preset}
            onChange={(e) => setPreset(e.target.value as PresetKey)}
            className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
          >
            {PRESET_KEYS.map((key) => (
              <option key={key} value={key}>
                {THEME_PRESETS[key].label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-xs text-zinc-400">{THEME_PRESETS[preset].description}</p>
        </section>

        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Brand color override
          </h2>
          <div className="mt-2 flex items-center gap-2">
            <input
              type="text"
              value={brandColorInput}
              onChange={(e) => setBrandColorInput(e.target.value)}
              placeholder={THEME_PRESETS[preset].brandColor}
              className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm"
            />
            <span
              aria-hidden="true"
              className="h-8 w-8 shrink-0 rounded-md border border-zinc-700"
              style={{ background: brandColor ?? THEME_PRESETS[preset].brandColor }}
            />
          </div>
          {brandColorInput && !brandColor ? (
            <p className="mt-1 text-xs text-amber-400">Not a valid hex color yet.</p>
          ) : null}
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Heading font</h2>
            <select
              value={headingFont}
              onChange={(e) => setHeadingFont(e.target.value as FontKey | "")}
              className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2 text-sm"
            >
              <option value="">Preset default</option>
              {FONT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Body font</h2>
            <select
              value={bodyFont}
              onChange={(e) => setBodyFont(e.target.value as FontKey | "")}
              className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2 text-sm"
            >
              <option value="">Preset default</option>
              {FONT_KEYS.map((key) => (
                <option key={key} value={key}>
                  {key}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3">
          <StyleSelect label="Radius" value={radius} onChange={setRadius} options={RADIUS_KEYS} />
          <StyleSelect label="Shadow" value={shadow} onChange={setShadow} options={SHADOW_KEYS} />
          <StyleSelect label="Motion" value={motion} onChange={setMotion} options={MOTION_KEYS} />
          <StyleSelect label="Density" value={density} onChange={setDensity} options={DENSITY_KEYS} />
        </section>

        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Header / Footer</h2>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <select
              value={headerVariant}
              onChange={(e) => setHeaderVariant(e.target.value as (typeof HEADER_VARIANTS)[number])}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2 text-sm"
            >
              {HEADER_VARIANTS.map((v) => (
                <option key={v} value={v}>
                  header: {v}
                </option>
              ))}
            </select>
            <select
              value={footerVariant}
              onChange={(e) => setFooterVariant(e.target.value as (typeof FOOTER_VARIANTS)[number])}
              className="rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2 text-sm"
            >
              {FOOTER_VARIANTS.map((v) => (
                <option key={v} value={v}>
                  footer: {v}
                </option>
              ))}
            </select>
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Sections</h2>
          <ul className="mt-2 space-y-2">
            {SECTION_KINDS.map((kind) => {
              const row = sectionRows[kind];
              return (
                <li key={kind} className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id={`section-${kind}`}
                    checked={row.enabled}
                    onChange={(e) =>
                      setSectionRows((prev) => ({
                        ...prev,
                        [kind]: { ...prev[kind], enabled: e.target.checked },
                      }))
                    }
                  />
                  <label htmlFor={`section-${kind}`} className="w-28 shrink-0 text-sm">
                    {kind}
                  </label>
                  <select
                    value={row.variant}
                    disabled={!row.enabled}
                    onChange={(e) =>
                      setSectionRows((prev) => ({
                        ...prev,
                        [kind]: { ...prev[kind], variant: e.target.value },
                      }))
                    }
                    className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs disabled:opacity-40"
                  >
                    {SECTION_VARIANTS[kind].map((variant) => (
                      <option key={variant} value={variant}>
                        {variant}
                      </option>
                    ))}
                  </select>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="mt-6">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            Contrast report
          </h2>
          {error ? (
            <p role="alert" className="mt-2 rounded-md bg-red-950 p-3 text-xs text-red-300">
              {error}
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-xs">
              {theme?.contrastReport.map((check) => (
                <li
                  key={check.name}
                  className={`flex items-center justify-between gap-2 rounded px-2 py-1 ${
                    check.passes ? "bg-emerald-950 text-emerald-300" : "bg-red-950 text-red-300"
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <span
                      aria-hidden="true"
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full border border-black/20"
                      style={{ background: check.foreground }}
                    />
                    {check.name}
                  </span>
                  <span>
                    {check.ratio.toFixed(2)}:1 {check.passes ? "✓" : "✗"}
                    {check.adjusted ? " (adjusted)" : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Copy config
            </h2>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-zinc-900 hover:opacity-90"
            >
              {copyState === "copied" ? "Copied!" : copyState === "failed" ? "Copy failed" : "Copy"}
            </button>
          </div>
          <textarea
            readOnly
            value={snippet}
            rows={14}
            className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-800 p-3 font-mono text-[11px] leading-relaxed text-zinc-200"
          />
        </section>
      </aside>

      <main className="flex-1 overflow-x-auto bg-zinc-800 p-4">
        <div className="mb-4 flex gap-2">
          {(Object.keys(VIEWPORTS) as ViewportKey[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setViewport(key)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium ${
                viewport === key ? "bg-white text-zinc-900" : "bg-zinc-700 text-zinc-200"
              }`}
            >
              {VIEWPORTS[key].label} ({VIEWPORTS[key].width}px)
            </button>
          ))}
        </div>

        <div
          className="mx-auto overflow-hidden rounded-lg border border-zinc-700 bg-white shadow-2xl transition-[width] duration-300"
          style={{ width: VIEWPORTS[viewport].width, maxWidth: "100%" }}
        >
          {theme ? (
            <div style={previewStyle}>
              <Header config={previewConfig} variant={headerVariant} />
              {activeSections.map((entry) => (
                <RenderSection key={entry.type} entry={entry} config={previewConfig} />
              ))}
              <Footer config={previewConfig} variant={footerVariant} />
            </div>
          ) : (
            <div className="p-8 text-center text-sm text-red-600">
              Fix the theme error in the sidebar to preview the page.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

function StyleSelect<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T | "";
  onChange: (value: T | "") => void;
  options: readonly T[];
}) {
  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</h2>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T | "")}
        className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-800 px-2 py-2 text-sm"
      >
        <option value="">Preset default</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
}
