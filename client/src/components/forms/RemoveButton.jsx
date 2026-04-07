import { Trash2 } from 'lucide-react';

export default function RemoveButton({ children, ...props }) {
  return (
    <button
      type="button"
      {...props}
      className="inline-flex items-center gap-2 rounded-xl border border-red-300 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300 dark:hover:bg-red-950/60"
    >
      <Trash2 className="h-4 w-4" />
      {children}
    </button>
  );
}

