export default function SectionCard({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-7">
      <header className="mb-5">
        <h2 className="heading-card text-xl md:text-2xl">{title}</h2>
        {subtitle ? <p className="mt-1 text-sm text-prose-muted">{subtitle}</p> : null}
      </header>
      {children}
    </section>
  );
}

