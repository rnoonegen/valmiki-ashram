import Select from 'react-select';
import { Controller } from 'react-hook-form';

export default function FormSelect({
  name,
  control,
  label,
  options,
  placeholder,
  required,
  error,
  isDark,
  onChangeTransform,
}) {
  const portalTarget = typeof document !== 'undefined' ? document.body : null;

  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
        {label}
        {required ? <span className="text-red-500"> *</span> : null}
      </span>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Select
            value={options.find((op) => op.value === field.value) || null}
            onChange={(selected) =>
              field.onChange(
                onChangeTransform ? onChangeTransform(selected) : selected?.value || ''
              )
            }
            options={options}
            placeholder={placeholder}
            classNamePrefix="va-select"
            menuPortalTarget={portalTarget}
            menuPosition="fixed"
            styles={{
              control: (base, state) => ({
                ...base,
                minHeight: 44,
                borderRadius: 12,
                background: isDark ? '#171717' : '#ffffff',
                borderColor: error ? '#f87171' : state.isFocused ? '#1e4d2b' : '#d4d4d8',
                boxShadow: 'none',
                ':hover': {
                  borderColor: state.isFocused ? '#1e4d2b' : '#a1a1aa',
                },
              }),
              menu: (base) => ({
                ...base,
                background: isDark ? '#171717' : '#ffffff',
                borderRadius: 12,
                overflow: 'hidden',
              }),
              menuPortal: (base) => ({
                ...base,
                zIndex: 80,
              }),
              option: (base, state) => ({
                ...base,
                background: state.isFocused
                  ? isDark
                    ? '#262626'
                    : '#f3f4f6'
                  : 'transparent',
                color: isDark ? '#e5e7eb' : '#111827',
              }),
              singleValue: (base) => ({
                ...base,
                color: isDark ? '#e5e7eb' : '#111827',
              }),
              placeholder: (base) => ({
                ...base,
                color: isDark ? '#9ca3af' : '#6b7280',
              }),
            }}
          />
        )}
      />
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </label>
  );
}

