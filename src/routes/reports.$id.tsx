import { createFileRoute, Link } from "@tanstack/react-router";
import { Wordmark } from "@/components/site/Nav";

export const Route = createFileRoute("/reports/$id")({
  head: () => ({
    meta: [
      { title: "Report — Zoomout" },
      { name: "description", content: "Your Zoomout excerpt analysis report." },
      { property: "og:title", content: "Report — Zoomout" },
      { property: "og:description", content: "Your Zoomout excerpt analysis report." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Report,
});

function Report() {
  const { id } = Route.useParams();
  return (
    <div className="min-h-screen">
      <div className="mx-auto max-w-[800px] px-6 py-6"><Wordmark small /></div>
      <main className="mx-auto max-w-[800px] px-6 py-16">
        <span className="red-bar mb-4" />
        <div className="eyebrow">Report</div>
        <h1 className="mt-3 font-display text-5xl tracking-tight">Your report is ready.</h1>
        <div className="mt-4 font-mono text-xs text-ink-faint">REPORT · {id}</div>
        <Link to="/" className="mt-8 inline-flex h-10 items-center rounded-md border border-line px-5 text-sm hover:border-ink">Analyze another clip</Link>
      </main>
    </div>
  );
}
