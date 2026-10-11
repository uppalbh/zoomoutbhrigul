import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, User, X } from "lucide-react";

const links = [
  { label: "How it works", href: "/#how" },
  { label: "Algorithm", href: "/#algorithm" },
  { label: "Features", href: "/#how" },
  { label: "Research", href: "/#algorithm" },
  { label: "About", href: "/#try" },
];

export function Wordmark({ small = false, tone = "ink" }: { small?: boolean; tone?: "ink" | "paper" }) {
  return (
    <Link to="/" className={`relative inline-block pb-1 font-display font-bold leading-none tracking-[-0.05em] ${tone === "paper" ? "text-background" : "text-ink"}`}>
      <span className={small ? "text-2xl" : "text-[40px]"}>zoomout</span>
      <span className={`absolute bottom-0 right-[-6px] -skew-x-[40deg] bg-accent-red ${small ? "h-[3px] w-[60%]" : "h-[5px] w-[62%]"}`} />
    </Link>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 bg-ink text-background">
      <div className="mx-auto flex h-[84px] max-w-[1480px] items-center justify-between px-9">
        <div className="flex items-center gap-14">
          <Wordmark tone="paper" />
          <nav className="hidden gap-9 text-[17px] lg:flex">
            {links.map((l) => (
              <a key={l.label} href={l.href} className="opacity-90 hover:opacity-100">{l.label}</a>
            ))}
          </nav>
        </div>
        <div className="hidden items-center gap-3 md:flex">
          <button className="h-[54px] rounded-md px-4 text-[17px] font-semibold opacity-90 hover:opacity-100">Sign in</button>
          <button aria-label="Account" className="grid h-[54px] w-[54px] place-items-center rounded-md border border-background/30 hover:border-background">
            <User className="h-5 w-5" />
          </button>
          <a href="/#try" className="inline-flex h-[54px] items-center rounded-md bg-background px-7 text-[17px] font-semibold text-ink">Try now</a>
        </div>
        <button aria-label="Open menu" className="md:hidden" onClick={() => setOpen(true)}>
          <Menu className="h-6 w-6" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background px-6 py-5 text-ink md:hidden">
          <div className="flex items-center justify-between">
            <Wordmark small />
            <button aria-label="Close menu" onClick={() => setOpen(false)}><X className="h-6 w-6" /></button>
          </div>
          <nav className="mt-12 flex flex-col">
            {links.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="border-b border-line py-4 font-display text-3xl font-medium tracking-tight">{l.label}</a>
            ))}
            <button className="py-4 text-left text-ink-muted">Sign in</button>
          </nav>
          <a href="/#try" onClick={() => setOpen(false)} className="mt-auto flex h-12 items-center justify-center rounded-md bg-ink font-semibold text-background">Try now</a>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[1480px] px-9 py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <Wordmark small />
          <div className="font-mono text-xs text-ink-muted">How it works · Algorithm · Research · GitHub · Privacy</div>
        </div>
        <div className="mt-8 border-t border-line pt-6 font-mono text-xs text-ink-faint">© 2026 Zoomout. Media context, not verdicts.</div>
      </div>
    </footer>
  );
}
