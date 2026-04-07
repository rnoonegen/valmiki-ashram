import { Plus } from 'lucide-react';

export default function AddButton({ children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className="inline-flex items-center gap-2 rounded-xl border border-accent bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-light dark:border-emerald-600 dark:bg-emerald-800 dark:hover:bg-emerald-700"
    >
      <Plus className="h-4 w-4" />
      {children}
    </button>
  );
}

