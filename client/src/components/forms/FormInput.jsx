export default function FormInput({
  label,
  error,
  required,
  className = '',
  ...inputProps
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <input
        {...inputProps}
        className={`w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-neutral-900 outline-none transition placeholder:text-neutral-500 focus:ring-2 dark:bg-neutral-900 dark:text-white dark:placeholder:text-neutral-400 ${
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200 dark:focus:ring-red-900/30'
            : 'border-neutral-300 focus:border-accent focus:ring-accent/20 dark:border-neutral-700 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30'
        }`}
      />
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </label>
  );
}

