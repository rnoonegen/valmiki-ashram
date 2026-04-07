import clsx from 'clsx';
import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

function FaqAnswer({ item }) {
  const { answer, intro, bullets, links, comparisonTable } = item;

  return (
    <div className="space-y-3 text-prose-muted">
      {answer ? <p className="leading-relaxed">{answer}</p> : null}
      {intro ? <p className="font-medium text-prose">{intro}</p> : null}
      {bullets?.length ? (
        <ul className="list-disc space-y-2 pl-5 marker:text-accent dark:marker:text-emerald-500">
          {bullets.map((b, i) => (
            <li key={i} className="leading-relaxed">
              {b}
            </li>
          ))}
        </ul>
      ) : null}
      {links?.length
        ? links.map((l) => (
            <p key={l.href}>
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="link-app break-all sm:break-normal"
              >
                {l.label}
              </a>
            </p>
          ))
        : null}
      {comparisonTable ? (
        <div className="mt-2 overflow-x-auto rounded-xl border border-theme bg-neutral-50/50 dark:bg-neutral-950/50">
          <table className="w-full min-w-[300px] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-theme bg-primary/40 dark:bg-emerald-950/50">
                {comparisonTable.headers.map((h) => (
                  <th
                    key={h}
                    scope="col"
                    className="px-3 py-3 font-semibold text-accent dark:text-emerald-200"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonTable.rows.map((row, ri) => (
                <tr
                  key={ri}
                  className="border-b border-theme last:border-0 odd:bg-white/60 even:bg-neutral-100/40 dark:odd:bg-neutral-900/40 dark:even:bg-neutral-900/20"
                >
                  {row.map((cell, ci) => (
                    <td key={ci} className="px-3 py-2.5 align-top leading-snug">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}

export function FaqItem({ item }) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start justify-between gap-3 rounded-lg py-4 text-left transition-colors hover:bg-neutral-100/70 dark:hover:bg-neutral-800/50"
      >
        <span className="font-semibold text-neutral-900 dark:text-neutral-100">
          {item.question}
        </span>
        <ChevronDown
          className={clsx(
            'mt-0.5 h-5 w-5 shrink-0 text-accent transition-transform duration-200 dark:text-emerald-400',
            open && 'rotate-180'
          )}
          aria-hidden
        />
      </button>
      <div
        className={clsx(
          'grid transition-[grid-template-rows] duration-300 ease-out',
          open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="pb-4 pl-0.5 pr-1 pt-0">
            <FaqAnswer item={item} />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FaqCategorySection({ category }) {
  return (
    <section
      id={category.id}
      className="rounded-2xl border border-neutral-200 bg-white/90 p-4 shadow-sm ring-1 ring-black/5 dark:border-neutral-700 dark:bg-neutral-900/60 dark:ring-white/5 md:p-6"
    >
      <h2 className="heading-card mb-1 border-b border-theme pb-4 text-xl md:text-2xl">
        {category.title}
      </h2>
      <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
        {category.items.map((item) => (
          <FaqItem key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}
