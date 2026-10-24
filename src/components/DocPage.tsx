import { SITE } from '../config/site';

export interface DocSection { h: string; p: (string | string[])[] }

export function DocPage({ title, intro, sections }: { title: string; intro: string; sections: DocSection[] }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold">{title}</h1>
      <p className="mt-1 text-sm text-muted">Last updated: {SITE.lastUpdated}</p>
      <div role="note" className="mt-5 rounded border border-warn/40 bg-warn/10 px-3 py-2 text-sm">
        <b>Draft for review.</b> This page is a starting template. Have a qualified legal adviser review it, and replace the bracketed placeholders in <code className="num">src/config/site.ts</code>, before you publish.
      </div>
      <p className="mt-6 text-[15px] leading-relaxed">{intro}</p>
      {sections.map((s, i) => (
        <section key={s.h} className="mt-8">
          <h2 className="text-2xl font-semibold">{i + 1}. {s.h}</h2>
          <div className="mt-2 space-y-3 text-[15px] leading-relaxed text-muted">
            {s.p.map((b, j) => Array.isArray(b)
              ? <ul key={j} className="list-disc space-y-1 pl-5">{b.map((li) => <li key={li}>{li}</li>)}</ul>
              : <p key={j}>{b}</p>)}
          </div>
        </section>
      ))}
    </div>
  );
}
