import { Controller } from 'react-hook-form';
import ReactPhoneInput from 'react-phone-input-2';

export default function PhoneInput({
  name,
  control,
  label,
  required,
  error,
  isDark,
}) {
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
          <ReactPhoneInput
            country="in"
            value={field.value || ''}
            onChange={(val) => field.onChange(`+${val}`)}
            containerClass="va-phone-container"
            dropdownClass="va-phone-dropdown"
            inputStyle={{
              width: '100%',
              borderRadius: 12,
              height: 44,
              background: isDark ? '#171717' : '#ffffff',
              color: isDark ? '#e5e7eb' : '#111827',
              border: `1px solid ${error ? '#f87171' : isDark ? '#3f3f46' : '#d4d4d8'}`,
            }}
            buttonStyle={{
              borderTopLeftRadius: 12,
              borderBottomLeftRadius: 12,
              borderRight: 0,
              background: isDark ? '#171717' : '#ffffff',
              borderColor: error ? '#f87171' : isDark ? '#3f3f46' : '#d4d4d8',
            }}
            dropdownStyle={{
              background: isDark ? '#171717' : '#ffffff',
              color: isDark ? '#e5e7eb' : '#111827',
              zIndex: 25,
            }}
          />
        )}
      />
      {error ? <p className="mt-1 text-xs text-red-500">{error}</p> : null}
    </label>
  );
}

