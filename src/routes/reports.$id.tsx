import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Wordmark } from "@/components/site/Nav";
import { DetailList } from "@/components/site/Detail";
import { API_BASE, apiHeaders } from "@/lib/api";

export const Route = createFileRoute("/reports/$id")({
  head: () => ({
    meta: [
      { title: "Analysis report — Zoomout" },
      { name: "description", content: "Source match, fact check, historical parallels and manipulation check for a political excerpt." },
      { property: "og:title", content: "Analysis report — Zoomout" },
      { property: "og:description", content: "Source match, fact check, historical parallels and manipulation check for a political excerpt." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ReportPage,
});

/* eslint-disable @typescript-eslint/no-explicit-any */
type Any = any;

class NotFound extends Error {}

function ReportPage() {
  const { id } = Route.useParams();
  const q = useQuery({
    queryKey: ["report", id],
    retry: false,
    queryFn: async () => {
      if (!API_BASE) throw new Error("Analysis service is not configured.");
      const res = await fetch(`${API_BASE}/reports/${id}`, { headers: apiHeaders() });
      if (res.status === 404) throw new NotFound();
      if (!res.ok) throw new Error(`Request failed (${res.status})`);
      return (await res.json()) as Any;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <TopBar id={id} />
      {q.isLoading ? <Skeleton /> : q.error ? <Missing notFound={q.error instanceof NotFound} message={q.error.message} /> : <Report r={q.data?.report ?? q.data} id={id} />}
    </div>
  );
}

function TopBar({ id }: { id: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-background">
      <div className="mx-auto flex h-14 max-w-[800px] items-center gap-4 px-6">
        <Wordmark small />
        <span className="ml-auto truncate font-mono text-[11px] tracking-[0.12em] text-ink-muted">REPORT · {id}</span>
        <button
          onClick={() => { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1500); }}
          className="h-8 rounded-md border border-line px-3 text-sm hover:border-ink"
        >{copied ? "Copied" : "Share"}</button>
      </div>
    </header>
  );
}

const na = (v: unknown, label = "Unavailable"): ReactNode =>
  v === null || v === undefined || v === "" ? <span className="text-ink-faint">{label}</span> : String(v);

function Report({ r, id }: { r: Any; id: string }) {
  const matched = r?.outcome === "matched";
  const source = r?.source;
  return (
    <main>
      <div className="mx-auto max-w-[800px] px-6 pb-8 pt-16 fade-up">
        <span className="red-bar mb-5" />
        <div className="eyebrow">Analysis report</div>
        <h1 className="mt-4 font-display text-[clamp(40px,7vw,64px)] font-medium leading-[0.95] tracking-[-0.05em]">
          {matched ? "Found the original" : "No verified source found"}<span className="text-accent-red">.</span>
        </h1>
        <DetailList className="mt-8" rows={[
          ["Clip URL", na(r?.submitted?.post?.post_url)],
          ["Clip title", na(r?.submitted?.post?.title)],
          ["Source title", source ? na(source?.post?.title) : "—"],
          ["Published", na(source?.post?.published_at)],
        ]} />
        {r?.summary && <p className="mt-8 text-[17px] leading-[1.6]">{r.summary}</p>}
      </div>

      <Section n="01" name="Source match" title="Where it came from" sub="How the submitted excerpt maps to the original recording.">
        <SourceMatchCard data={r?.source_match} />
      </Section>
      <Section n="02" name="Fact check" title="What the claims say" sub="Claims made in the excerpt, checked against available evidence.">
        <FactCheckCard data={r?.fact_check} />
      </Section>
      <Section n="03" name="Historical parallels" title="What it echoes" sub="Earlier statements and events that resemble this exchange.">
        <ParallelsCard data={r?.historical_parallels} />
      </Section>
      <Section n="04" name="Manipulation check" title="Whether it was altered" sub="Signs of edits, splices or synthetic changes in the clip.">
        <ManipulationCard data={r?.manipulation_check} />
      </Section>

      <footer className="border-t border-line bg-elevated px-6 py-12">
        <div className="mx-auto max-w-[800px]">
          <div className="eyebrow">Limitations</div>
          <ul className="mt-5 space-y-2 text-ink-muted">
            {(Array.isArray(r?.limitations) ? r.limitations : []).map((l: Any, i: number) => (
              <li key={i} className="flex gap-3"><span className="font-mono">—</span><span>{typeof l === "string" ? l : l?.text ?? JSON.stringify(l)}</span></li>
            ))}
          </ul>
          <p className="mt-10 text-center font-mono text-[11px] text-ink-faint">Confidence levels describe the available evidence. They are not calibrated probabilities.</p>
          <p className="mt-2 text-center font-mono text-[11px] text-ink-faint">REPORT · {id}</p>
        </div>
      </footer>
    </main>
  );
}

function Section({ n, name, title, sub, children }: { n: string; name: string; title: string; sub: string; children: ReactNode }) {
  return (
    <section className="border-t border-line">
      <div className="mx-auto max-w-[800px] px-6 py-20 fade-up">
        <span className="red-bar mb-5" />
        <div className="eyebrow">Section {n} · {name}</div>
        <h2 className="mt-4 font-display text-[clamp(36px,5vw,48px)] font-medium leading-none tracking-[-0.045em]">{title}<span className="text-accent-red">.</span></h2>
        <p className="mt-4 font-mono text-[12px] text-ink-muted">{sub}</p>
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}

/* ---------- helpers ---------- */

const HIDDEN = /method|algorithm|_rules|internal|score|probab|percent/i;
const CHIP = /confidence|verdict|rating|status|level|result|assessment/i;
const humanize = (k: string) => k.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());

function Chip({ value }: { value: unknown }) {
  if (value === null || value === undefined || value === "") return <span className="text-ink-faint">Not assessed</span>;
  const v = String(value).toLowerCase();
  const tone = /high|true|accurate|supported|verified|none|no evidence/.test(v) ? "bg-chip-high-bg text-chip-high-fg"
    : /med|mixed|partial|context|uncertain/.test(v) ? "bg-chip-med-bg text-chip-med-fg"
    : /low|false|misleading|altered|detected|unsupported/.test(v) ? "bg-chip-low-bg text-chip-low-fg"
    : "bg-chip-na-bg text-chip-na-fg";
  return <span className={`inline-block rounded-sm px-2 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] ${tone}`}>{String(value).replace(/_/g, " ")}</span>;
}

function renderValue(k: string, v: unknown): ReactNode {
  if (CHIP.test(k)) return <Chip value={v} />;
  if (v === null || v === undefined || v === "") return <span className="text-ink-faint">Unavailable</span>;
  if (typeof v === "string" && /^https?:\/\//.test(v)) return <a href={v} target="_blank" rel="noreferrer" className="underline decoration-line hover:decoration-ink">{v}</a>;
  if (Array.isArray(v)) return v.every((x) => typeof x !== "object") ? v.join(", ") : `${v.length} items`;
  if (typeof v === "object") return Object.entries(v as object).filter(([kk]) => !HIDDEN.test(kk)).map(([kk, vv]) => `${humanize(kk)}: ${vv ?? "—"}`).join(" · ");
  return String(v);
}

const TITLE_KEYS = ["claim", "title", "statement", "text", "headline", "name", "event"];
const BODY_KEYS = ["explanation", "summary", "description", "rationale", "notes", "context"];

function ItemCard({ item }: { item: Any }) {
  if (typeof item !== "object" || item === null) return <div className="rounded-md border border-line p-5">{String(item)}</div>;
  const tk = TITLE_KEYS.find((k) => typeof item[k] === "string");
  const bk = BODY_KEYS.find((k) => typeof item[k] === "string");
  const rest = Object.entries(item).filter(([k]) => k !== tk && k !== bk && !HIDDEN.test(k) && (typeof item[k] !== "object" || item[k] === null || Array.isArray(item[k]) || CHIP.test(k)));
  return (
    <div className="rounded-md border border-line bg-elevated p-6 transition-colors hover:border-ink">
      {tk && <h3 className="font-display text-[22px] font-medium leading-snug tracking-[-0.02em]">{item[tk]}</h3>}
      {bk && <p className="mt-3 text-ink-muted">{item[bk]}</p>}
      {rest.length > 0 && <DetailList className="mt-5" rows={rest.map(([k, v]) => [humanize(k), renderValue(k, v)])} />}
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="hatch rounded-sm">
      <div className="bg-panel px-6 py-14 text-center">
        <div className="eyebrow">Not assessed</div>
        <p className="mt-3 text-ink-muted">{text}</p>
      </div>
    </div>
  );
}

function GenericCard({ data }: { data: Any }) {
  if (data === null || data === undefined) return <Empty text="This section was not assessed for this clip." />;
  if (Array.isArray(data)) return data.length ? <div className="space-y-4">{data.map((it, i) => <ItemCard key={i} item={it} />)}</div> : <Empty text="Nothing to report in this section." />;
  if (typeof data !== "object") return <p>{String(data)}</p>;
  const entries = Object.entries(data).filter(([k]) => !HIDDEN.test(k));
  const lists = entries.filter(([, v]) => Array.isArray(v) && (v as Any[]).some((x) => typeof x === "object"));
  const scalars = entries.filter(([, v]) => !lists.some(([, lv]) => lv === v));
  const body = BODY_KEYS.find((k) => typeof data[k] === "string");
  return (
    <div className="space-y-8">
      {body && <p className="text-[17px] leading-[1.6]">{data[body]}</p>}
      {scalars.filter(([k]) => k !== body).length > 0 && (
        <DetailList rows={scalars.filter(([k]) => k !== body).map(([k, v]) => [humanize(k), renderValue(k, v)])} />
      )}
      {lists.map(([k, v]) => (
        <div key={k}>
          <div className="eyebrow mb-4">{humanize(k)}</div>
          <div className="space-y-4">{(v as Any[]).map((it, i) => <ItemCard key={i} item={it} />)}</div>
        </div>
      ))}
    </div>
  );
}

function SourceMatchCard({ data, matched }: { data: Any; matched: boolean }) {
  if (!matched || !data) {
    return (
      <div className="hatch rounded-sm">
        <div className="bg-panel px-6 py-16 text-center">
          <div className="eyebrow">No verified source</div>
          <h3 className="mt-3 font-display text-3xl font-medium tracking-[-0.03em]">We couldn't confirm the original recording.</h3>
          <p className="mx-auto mt-3 max-w-md text-ink-muted">{data?.summary ?? data?.explanation ?? "No candidate recording met the evidence threshold for this excerpt."}</p>
        </div>
      </div>
    );
  }
  const ex = data.excerpt ?? data.submitted ?? {};
  const full = data.full_recording ?? data.source ?? {};
  const t = (o: Any) => o?.start != null || o?.end != null ? `${o?.start ?? "?"}–${o?.end ?? "?"}` : o?.timestamp ?? null;
  return (
    <div className="space-y-8">
      <div className="hatch rounded-sm">
        <div className="grid grid-cols-2 gap-6 bg-panel p-8">
          {[["Excerpt", t(ex)], ["Full recording", t(full)]].map(([label, ts], i) => (
            <div key={i} style={{ transform: `rotate(${i ? -3 : -5}deg)` }}>
              <div className="mb-2 text-[12px] text-ink-muted">• {label} <span className="font-mono">{na(ts)}</span></div>
              <div className="card-stripe aspect-[4/5] rounded-md border border-line" />
            </div>
          ))}
        </div>
      </div>
      <GenericCard data={Object.fromEntries(Object.entries(data).filter(([k]) => !["excerpt", "full_recording", "submitted", "source"].includes(k)))} />
    </div>
  );
}

function Skeleton() {
  const b = "rounded-sm bg-line";
  return (
    <main className="mx-auto max-w-[800px] animate-pulse px-6 pt-16">
      <div className="h-[3px] w-10 bg-line" />
      <div className={`${b} mt-5 h-3 w-32`} />
      <div className={`${b} mt-5 h-14 w-3/4`} />
      <div className="mt-8 space-y-3">{[0, 1, 2, 3].map((i) => <div key={i} className={`${b} h-3 w-2/3`} />)}</div>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="mt-16 border-t border-line pt-16">
          <div className={`${b} h-3 w-40`} />
          <div className={`${b} mt-4 h-10 w-1/2`} />
          <div className={`${b} mt-8 h-40 w-full`} />
        </div>
      ))}
    </main>
  );
}

function Missing({ notFound, message }: { notFound: boolean; message: string }) {
  return (
    <div className="grid min-h-[70vh] place-items-center px-6">
      <div className="w-full max-w-md rounded-md border border-line bg-elevated p-8 text-center">
        <span className="red-bar mx-auto mb-5" />
        <h1 className="font-display text-3xl font-medium tracking-[-0.03em]">{notFound ? "Report not found." : "Report unavailable."}</h1>
        {!notFound && <p className="mt-3 font-mono text-xs text-ink-muted">{message}</p>}
        <Link to="/" className="mt-6 inline-flex h-10 items-center rounded-md bg-ink px-5 text-sm font-semibold text-background">Back to Zoomout</Link>
      </div>
    </div>
  );
}
