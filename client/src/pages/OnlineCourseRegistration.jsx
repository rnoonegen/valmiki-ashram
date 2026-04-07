import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';
import Container from '../components/Container';
import ChildCard from '../components/forms/ChildCard';
import AddButton from '../components/forms/AddButton';
import FormInput from '../components/forms/FormInput';
import FormSelect from '../components/forms/FormSelect';
import PhoneInput from '../components/forms/PhoneInput';
import SectionCard from '../components/forms/SectionCard';
import { useTheme } from '../context/ThemeContext';
import {
  COUNTRY_OPTIONS,
  COURSE_OPTIONS,
} from '../data/registrationOptions';
import PageFade from '../components/PageFade';
import { IST_TIME_SLOTS, convertIstSlotToTimezone } from '../utils/timeSlots';
import 'react-phone-input-2/lib/style.css';

const optionalEmail = z
  .string()
  .optional()
  .or(z.literal(''))
  .refine((v) => !v || z.string().email().safeParse(v).success, {
    message: 'Enter a valid email',
  });

const schema = z.object({
  parents: z.object({
    parent1: z.object({
      name: z.string().min(1, 'Parent 1 name is required'),
      email: z.string().email('Enter a valid email'),
      phone: z.string().min(7, 'Parent 1 phone is required'),
    }),
    parent2: z.object({
      name: z.string().optional(),
      email: optionalEmail,
      phone: z.string().optional(),
    }),
  }),
  address: z.object({
    country: z.string().min(1, 'Country is required'),
    city: z.string().min(1, 'City is required'),
    address: z.string().min(1, 'Address is required'),
    zipcode: z.string().min(1, 'Zipcode is required'),
  }),
  occupation: z.object({
    role: z.string().min(1, 'Occupation is required'),
    type: z.string().min(1, 'Type of work is required'),
  }),
  children: z
    .array(
      z.object({
        name: z.string().min(1, 'Child name is required'),
        age: z.coerce.number().min(1, 'Age is required'),
        dob: z.string().min(1, 'DOB is required'),
        school: z.string().min(1, 'Current school is required'),
        class: z.string().min(1, 'Current class is required'),
        courses: z
          .array(
            z.object({
              courseName: z.string().min(1, 'Course is required'),
              timeSlotIST: z.string().min(1, 'Time slot is required'),
              localTime: z.string().optional(),
            })
          )
          .min(1, 'At least one course is required'),
      })
    )
    .min(1, 'Add at least one child'),
});

const defaultValues = {
  parents: {
    parent1: { name: '', email: '', phone: '' },
    parent2: { name: '', email: '', phone: '' },
  },
  address: {
    country: '',
    city: '',
    address: '',
    zipcode: '',
  },
  occupation: {
    role: '',
    type: '',
  },
  children: [
    {
      name: '',
      age: '',
      dob: '',
      school: '',
      class: '',
      courses: [{ courseName: '', timeSlotIST: '', localTime: '' }],
    },
  ],
};

export default function OnlineCourseRegistration() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    control,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onChange',
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'children',
  });

  const countryValue = useWatch({ control, name: 'address.country' });
  const countryTimezone =
    COUNTRY_OPTIONS.find((c) => c.value === countryValue)?.timezone || '';

  const onSubmit = (values) => {
    const enriched = {
      ...values,
      children: values.children.map((child) => ({
        ...child,
        courses: child.courses.map((course) => ({
          ...course,
          localTime: convertIstSlotToTimezone(course.timeSlotIST, countryTimezone),
        })),
      })),
    };
    console.log(enriched);
  };

  return (
    <PageFade>
      <Container className="pb-24 pt-10 md:pb-28 md:pt-14">
        <header className="mb-8">
          <h1 className="heading-page">Online Course Registration</h1>
          <p className="mt-3 max-w-3xl text-prose">
            Fill in parent details, add children, and assign courses with IST
            slots. Local time is auto-calculated from the selected country.
          </p>
        </header>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <SectionCard
            title="1. Parent Details"
            subtitle="Primary parent is mandatory. Secondary parent is optional."
          >
            <div className="grid gap-4 md:grid-cols-3">
              <FormInput
                label="Parent 1 Name"
                required
                {...register('parents.parent1.name')}
                error={errors?.parents?.parent1?.name?.message}
              />
              <FormInput
                label="Parent 1 Email"
                required
                type="email"
                {...register('parents.parent1.email')}
                error={errors?.parents?.parent1?.email?.message}
              />
              <PhoneInput
                label="Parent 1 Phone"
                required
                name="parents.parent1.phone"
                control={control}
                error={errors?.parents?.parent1?.phone?.message}
                isDark={isDark}
              />
              <FormInput
                label="Parent 2 Name"
                {...register('parents.parent2.name')}
                error={errors?.parents?.parent2?.name?.message}
              />
              <FormInput
                label="Parent 2 Email"
                type="email"
                {...register('parents.parent2.email')}
                error={errors?.parents?.parent2?.email?.message}
              />
              <PhoneInput
                label="Parent 2 Phone"
                name="parents.parent2.phone"
                control={control}
                error={errors?.parents?.parent2?.phone?.message}
                isDark={isDark}
              />
            </div>
          </SectionCard>

          <SectionCard title="2. Address Details">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <FormSelect
                name="address.country"
                control={control}
                label="Country"
                required
                options={COUNTRY_OPTIONS}
                placeholder="Select country"
                error={errors?.address?.country?.message}
                isDark={isDark}
              />
              <FormInput
                label="City"
                required
                {...register('address.city')}
                error={errors?.address?.city?.message}
              />
              <FormInput
                label="Zipcode"
                required
                {...register('address.zipcode')}
                error={errors?.address?.zipcode?.message}
              />
            </div>
            <div className="mt-4">
              <label className="block">
                <span className="mb-1.5 block text-sm font-medium text-neutral-800 dark:text-neutral-200">
                  Address <span className="text-red-500">*</span>
                </span>
                <textarea
                  rows={3}
                  {...register('address.address')}
                  className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20 dark:border-neutral-700 dark:bg-neutral-900 dark:focus:border-emerald-500 dark:focus:ring-emerald-900/30"
                />
              </label>
              {errors?.address?.address?.message ? (
                <p className="mt-1 text-xs text-red-500">
                  {errors.address.address.message}
                </p>
              ) : null}
            </div>
          </SectionCard>

          <SectionCard title="3. Occupation Details">
            <div className="grid gap-4 md:grid-cols-2">
              <FormInput
                label="Occupation"
                required
                {...register('occupation.role')}
                error={errors?.occupation?.role?.message}
              />
              <FormInput
                label="Type of Work"
                required
                {...register('occupation.type')}
                error={errors?.occupation?.type?.message}
              />
            </div>
          </SectionCard>

          <SectionCard
            title={`4. Children (${fields.length})`}
            subtitle="Add one or more children and assign at least one course per child."
          >
            <div className="space-y-4">
              {fields.map((field, childIndex) => (
                <ChildCard
                  key={field.id}
                  control={control}
                  register={register}
                  errors={errors}
                  childIndex={childIndex}
                  onRemoveChild={() => remove(childIndex)}
                  countryTimezone={countryTimezone}
                  isDark={isDark}
                  courseOptions={COURSE_OPTIONS}
                  slotOptions={IST_TIME_SLOTS}
                />
              ))}
            </div>
            <div className="mt-4">
              <AddButton
                onClick={() =>
                  append({
                    name: '',
                    age: '',
                    dob: '',
                    school: '',
                    class: '',
                    courses: [
                      { courseName: '', timeSlotIST: '', localTime: '' },
                    ],
                  })
                }
              >
                Add Child
              </AddButton>
            </div>
          </SectionCard>

          <motion.div
            className="sticky bottom-4 z-10 rounded-2xl border border-neutral-200 bg-white/95 p-4 shadow-nav backdrop-blur-sm dark:border-neutral-700 dark:bg-neutral-900/95 dark:shadow-nav-dark"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
              <p className="text-sm text-prose-muted">
                Review all sections before submission. Errors will be shown inline.
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl border border-accent bg-accent px-5 py-2.5 text-sm font-medium text-white transition hover:bg-accent-light disabled:cursor-not-allowed disabled:opacity-60 dark:border-emerald-600 dark:bg-emerald-800 dark:hover:bg-emerald-700 md:w-auto"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Registration'}
              </button>
            </div>
          </motion.div>
        </form>
      </Container>
    </PageFade>
  );
}
