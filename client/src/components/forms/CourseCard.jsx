import { motion } from 'framer-motion';
import FormSelect from './FormSelect';
import RemoveButton from './RemoveButton';

export default function CourseCard({
  childIndex,
  courseIndex,
  control,
  errors,
  isDark,
  courseOptions,
  slotOptions,
  onRemove,
  localTime,
}) {
  const prefix = `children.${childIndex}.courses.${courseIndex}`;
  const courseErrors =
    errors?.children?.[childIndex]?.courses?.[courseIndex] || {};

  return (
    <motion.div
      layout
      className="rounded-xl border border-neutral-200 bg-neutral-50/70 p-4 dark:border-neutral-700 dark:bg-neutral-800/40"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h5 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Course {courseIndex + 1}
        </h5>
        <RemoveButton onClick={onRemove}>Remove</RemoveButton>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormSelect
          name={`${prefix}.courseName`}
          control={control}
          label="Course"
          required
          options={courseOptions}
          placeholder="Choose a course"
          error={courseErrors?.courseName?.message}
          isDark={isDark}
        />
        <FormSelect
          name={`${prefix}.timeSlotIST`}
          control={control}
          label="Time Slot (IST)"
          required
          options={slotOptions}
          placeholder="Select IST slot"
          error={courseErrors?.timeSlotIST?.message}
          isDark={isDark}
        />
      </div>

      <div className="mt-3 rounded-lg bg-primary/40 px-3 py-2 text-sm text-neutral-700 dark:bg-emerald-950/40 dark:text-neutral-200">
        <span className="font-medium">Your local time:</span>{' '}
        {localTime || 'Select country and slot'}
      </div>
    </motion.div>
  );
}

