import { Link } from "@tanstack/react-router";
import { useState } from "react";
import { Menu, User, X } from "lucide-react";

const links = [
  { label: "How it works", href: "/#how" },
  { label: "Algorithm", href: "/#algorithm" },
  { label: "Features", href: "/#features" },
  { label: "Research", href: "/#research" },
  { label: "About", href: "/#about" },
];

export function Wordmark({ small = false }: { small?: boolean }) {
  return (
    <Link to="/" className="relative inline-block font-display leading-none">
      <span className={small ? "text-xl" : "text-[26px]"}>zoomout</span>
      <span className="absolute -bottom-1 left-0 h-[3px] w-5 -skew-x-[30deg] bg-accent-red" />
    </Link>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-background/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1180px] items-center justify-between px-6">
        <Wordmark />
        <nav className="hidden gap-7 text-sm text-ink-muted md:flex">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="hover:text-ink">{l.label}</a>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <button className="h-9 rounded-md px-3 text-sm hover:bg-line">Sign in</button>
          <button aria-label="Account" className="grid h-9 w-9 place-items-center rounded-md border border-line hover:border-ink">
            <User className="h-4 w-4" />
          </button>
          <a href="/#try" className="slash-hover inline-flex h-9 items-center rounded-md bg-ink px-4 text-sm text-background">Try now</a>
        </div>
        <button aria-label="Open menu" className="md:hidden" onClick={() => setOpen(true)}>
          <Menu className="h-5 w-5" />
        </button>
      </div>
      {open && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background px-6 py-5 md:hidden">
          <div className="flex items-center justify-between">
            <Wordmark />
            <button aria-label="Close menu" onClick={() => setOpen(false)}><X className="h-5 w-5" /></button>
          </div>
          <nav className="mt-12 flex flex-col">
            {links.map((l) => (
              <a key={l.label} href={l.href} onClick={() => setOpen(false)} className="border-b border-line py-4 font-display text-3xl">{l.label}</a>
            ))}
            <button className="py-4 text-left text-ink-muted">Sign in</button>
          </nav>
          <a href="/#try" onClick={() => setOpen(false)} className="mt-auto flex h-12 items-center justify-center rounded-md bg-ink text-background">Try now</a>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto max-w-[1180px] px-6 py-10">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <Wordmark small />
          <div className="font-mono text-xs text-ink-muted">
            How it works · Algorithm · Research · GitHub · Privacy
          </div>
        </div>
        <div className="mt-8 border-t border-line pt-6 font-mono text-xs text-ink-faint">
          © 2026 Zoomout. Media context, not verdicts.
        </div>
      </div>
    </footer>
  );
}
