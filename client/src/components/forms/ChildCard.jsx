import { AnimatePresence, motion } from 'framer-motion';
import { useFieldArray, useWatch } from 'react-hook-form';
import { convertIstSlotToTimezone } from '../../utils/timeSlots';
import AddButton from './AddButton';
import CourseCard from './CourseCard';
import DatePicker from './DatePicker';
import FormInput from './FormInput';
import RemoveButton from './RemoveButton';

export default function ChildCard({
  control,
  register,
  errors,
  childIndex,
  onRemoveChild,
  countryTimezone,
  isDark,
  courseOptions,
  slotOptions,
}) {
  const childPrefix = `children.${childIndex}`;
  const childErrors = errors?.children?.[childIndex] || {};

  const { fields, append, remove } = useFieldArray({
    control,
    name: `${childPrefix}.courses`,
  });

  const watchedCourses = useWatch({
    control,
    name: `${childPrefix}.courses`,
  });

  return (
    <motion.article
      layout
      className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm dark:border-neutral-700 dark:bg-neutral-900 md:p-6"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h4 className="heading-card text-lg">
          Child {childIndex + 1}{' '}
          <span className="text-sm font-medium text-prose-muted">
            ({fields.length} course{fields.length !== 1 ? 's' : ''})
          </span>
        </h4>
        <RemoveButton onClick={onRemoveChild}>Remove Child</RemoveButton>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <FormInput
          label="Name"
          required
          {...register(`${childPrefix}.name`)}
          error={childErrors?.name?.message}
        />
        <FormInput
          label="Age"
          required
          type="number"
          min="1"
          max="18"
          {...register(`${childPrefix}.age`)}
          error={childErrors?.age?.message}
        />
        <DatePicker
          label="DOB"
          required
          {...register(`${childPrefix}.dob`)}
          error={childErrors?.dob?.message}
        />
        <FormInput
          label="Current School"
          required
          {...register(`${childPrefix}.school`)}
          error={childErrors?.school?.message}
        />
        <FormInput
          label="Current Class"
          required
          {...register(`${childPrefix}.class`)}
          error={childErrors?.class?.message}
        />
      </div>

      <div className="mt-5 space-y-4">
        <div className="flex items-center justify-between">
          <h5 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
            Courses
          </h5>
          <AddButton
            onClick={() =>
              append({ courseName: '', timeSlotIST: '', localTime: '' })
            }
          >
            Add Course
          </AddButton>
        </div>

        <AnimatePresence>
          {fields.map((field, courseIndex) => {
            const slot = watchedCourses?.[courseIndex]?.timeSlotIST || '';
            const localTime = convertIstSlotToTimezone(slot, countryTimezone);

            return (
              <CourseCard
                key={field.id}
                childIndex={childIndex}
                courseIndex={courseIndex}
                control={control}
                errors={errors}
                isDark={isDark}
                courseOptions={courseOptions}
                slotOptions={slotOptions}
                onRemove={() => remove(courseIndex)}
                localTime={localTime}
              />
            );
          })}
        </AnimatePresence>
      </div>
      {childErrors?.courses?.message ? (
        <p className="mt-2 text-xs text-red-500">{childErrors.courses.message}</p>
      ) : null}
    </motion.article>
  );
}

