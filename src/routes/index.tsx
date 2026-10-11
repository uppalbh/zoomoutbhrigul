import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Footer, Nav } from "@/components/site/Nav";
import { API_BASE, PHOTON_NUMBER, apiHeaders } from "@/lib/api";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Zoomout — The full exchange" },
      { name: "description", content: "Find the original recording of a political excerpt and review what came before and after." },
      { property: "og:title", content: "Zoomout — The full exchange" },
      { property: "og:description", content: "Find the original recording of a political excerpt and review what came before and after." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="min-h-screen">
      <Nav />
      <Hero />
      <How />
      <TryIt />
      <Footer />
    </div>
  );
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-[1180px] items-center gap-12 px-6 py-20 min-[900px]:grid-cols-2 min-[900px]:py-28">
      <div className="order-2 fade-up min-[900px]:order-1">
        <div className="eyebrow mb-6">Media context, not verdicts</div>
        <h1 className="display">The full exchange<span className="text-accent-red">.</span></h1>
        <p className="mt-6 max-w-md text-ink-muted">
          Zoomout helps you examine excerpts from political debates and speeches. Find the original recording, map the excerpt to it, and review what came before and after.
        </p>
        <div className="mt-8 flex gap-3">
          <a href="#try" className="slash-hover inline-flex h-11 items-center rounded-md bg-ink px-5 text-sm text-background">Try now</a>
          <a href="#how" className="inline-flex h-11 items-center rounded-md border border-line px-5 text-sm hover:border-ink">How it works</a>
        </div>
        {PHOTON_NUMBER && (
          <a href={`sms:${PHOTON_NUMBER}`} className="mt-5 inline-block font-mono text-xs text-ink-muted hover:text-ink">
            or text us at {PHOTON_NUMBER} <span className="text-accent-red">→</span>
          </a>
        )}
      </div>
      <div className="order-1 min-[900px]:order-2">
        <Illustration />
      </div>
    </section>
  );
}

function Illustration() {
  return (
    <div className="hatch mx-auto max-w-[420px] rounded-md border border-line p-4 min-[900px]:max-w-none">
      <div className="relative grid grid-cols-[1fr_1.6fr] gap-4 rounded-md border border-line bg-elevated p-6">
        <div className="rounded-md border border-ink p-3">
          <div className="eyebrow mb-3">Excerpt</div>
          <div className="aspect-[9/16] rounded-sm bg-line" />
        </div>
        <div className="rounded-md border border-line p-3">
          <div className="eyebrow mb-3">Full recording</div>
          <div className="space-y-2">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className={`h-2 rounded-sm ${i === 4 || i === 5 ? "bg-ink" : "bg-line"}`} style={{ width: `${60 + ((i * 17) % 40)}%` }} />
            ))}
          </div>
        </div>
        <span className="absolute left-[34%] top-1/2 h-[3px] w-16 -rotate-[25deg] bg-accent-red" />
      </div>
      <dl className="mt-4 divide-y divide-line rounded-md border border-line bg-elevated font-mono text-xs">
        {[["Excerpt", "0:58"], ["Transcript", "7 sentences"], ["Keyframes", "4 detected"], ["Resolution", "1080×1920"]].map(([k, v]) => (
          <div key={k} className="flex justify-between px-4 py-2">
            <dt className="text-ink-muted">{k}</dt><dd>{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

const steps = [
  { t: "Find the source", d: "We search for the original, full-length recording of the excerpt you submit." },
  { t: "Map the excerpt", d: "Transcripts and keyframes are aligned so you see exactly where the clip sits." },
  { t: "Review the context", d: "Read what came before and after, with claims checked and edits flagged." },
];

function How() {
  return (
    <section id="how" className="border-t border-line">
      <div className="mx-auto max-w-[1180px] px-6 py-24">
        <span className="red-bar mb-4" />
        <div className="eyebrow mb-3">How it works</div>
        <h2 className="font-display text-5xl tracking-tight">Three steps back.</h2>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.t} className="relative rounded-md border border-line bg-elevated p-6 transition-colors hover:border-ink">
              <span className="absolute right-6 top-7 h-[3px] w-6 -skew-x-[30deg] bg-accent-red" />
              <div className="eyebrow">Step 0{i + 1}</div>
              <h3 className="mt-8 font-display text-3xl">{s.t}</h3>
              <p className="mt-3 text-ink-muted">{s.d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function TryIt() {
  const navigate = useNavigate();
  const [url, setUrl] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (!API_BASE) throw new Error("Analysis service is not configured.");
      const res = await fetch(`${API_BASE}/analyze`, {
        method: "POST",
        headers: apiHeaders(),
        body: JSON.stringify({ url, conversation_id: null }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error?.message ?? data?.message ?? `Request failed (${res.status})`);
      navigate({ to: "/jobs/$id", params: { id: String(data.job_id) } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section id="try" className="border-t border-line">
      <div className="mx-auto max-w-[720px] px-6 py-24 text-center">
        <div className="eyebrow">Submit a clip</div>
        <h2 className="mt-4 font-display text-5xl tracking-tight">Paste an excerpt link.</h2>
        <p className="mt-4 text-ink-muted">We'll find the original recording, map the excerpt to it, and show you what changed.</p>
        <form onSubmit={submit} className="mt-10 text-left">
          {error && <p className="mb-3 text-sm text-chip-low-fg">{error}</p>}
          <div className="flex gap-2">
            <input
              type="url" required value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..."
              className={`h-14 flex-1 rounded-md border bg-elevated px-4 outline-none focus:border-ink ${error ? "border-accent-red" : "border-line"}`}
            />
            <button disabled={loading} className="slash-hover h-14 rounded-md bg-ink px-6 text-sm text-background disabled:opacity-60">
              {loading ? "Sending…" : "Analyze"}
            </button>
          </div>
          <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.12em] text-ink-faint">
            Supported · archive.org · direct mp4 · mp3
          </div>
        </form>
      </div>
    </section>
  );
}
