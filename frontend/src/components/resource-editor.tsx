"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";

import type { Resource, ResourceImage, AvailabilityRule, BlackoutPeriod } from "@/types/api";
import type { ResourceMutationInput } from "@/lib/api";

const imageSchema = z.object({
  image_url: z.url("Enter a valid image URL."),
  alt_text: z.string().min(1, "Alt text is required."),
  sort_order: z.coerce.number().min(0, "Sort order must be 0 or higher."),
});

const availabilitySchema = z.object({
  day_of_week: z.coerce.number().min(0).max(6),
  start_time: z.string().min(1, "Start time is required."),
  end_time: z.string().min(1, "End time is required."),
  is_active: z.boolean(),
});

const blackoutSchema = z.object({
  start_datetime: z.string().min(1, "Start datetime is required."),
  end_datetime: z.string().min(1, "End datetime is required."),
  reason: z.string().min(1, "Reason is required."),
});

const resourceFormSchema = z.object({
  name: z.string().min(1, "Name is required."),
  short_description: z.string().min(1, "Short description is required."),
  full_description: z.string().min(1, "Full description is required."),
  category: z.string().min(1, "Category is required."),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1."),
  price: z.string().min(1, "Price is required."),
  currency: z.string().min(3).max(3),
  price_mode: z.string().min(1),
  duration_mode: z.string().min(1),
  min_booking_duration: z.coerce.number().min(1),
  max_booking_duration: z.coerce.number().min(1),
  status: z.string().min(1),
  is_active: z.boolean(),
  primary_staff: z.string().nullable(),
  images: z.array(imageSchema),
  availability_rules: z.array(availabilitySchema),
  blackout_periods: z.array(blackoutSchema),
});

export type ResourceFormValues = z.output<typeof resourceFormSchema>;

type ResourceFormInput = z.input<typeof resourceFormSchema>;

const EMPTY_IMAGE = { image_url: "", alt_text: "", sort_order: 0 };
const EMPTY_AVAILABILITY = { day_of_week: 1, start_time: "09:00", end_time: "17:00", is_active: true };
const EMPTY_BLACKOUT = { start_datetime: "", end_datetime: "", reason: "" };

function toLocalDateTime(value: string) {
  if (!value) return "";
  return value.slice(0, 16);
}

export function mapResourceToForm(resource: Resource): ResourceFormInput {
  return {
    name: resource.name,
    short_description: resource.short_description,
    full_description: resource.full_description,
    category: resource.category,
    capacity: resource.capacity,
    price: resource.price,
    currency: resource.currency,
    price_mode: resource.price_mode,
    duration_mode: resource.duration_mode,
    min_booking_duration: resource.min_booking_duration,
    max_booking_duration: resource.max_booking_duration,
    status: resource.status,
    is_active: resource.is_active,
    primary_staff: resource.primary_staff ?? null,
    images: resource.images.map((image: ResourceImage) => ({ image_url: image.image_url, alt_text: image.alt_text, sort_order: image.sort_order })),
    availability_rules: resource.availability_rules.map((rule: AvailabilityRule) => ({ day_of_week: rule.day_of_week, start_time: rule.start_time.slice(0, 5), end_time: rule.end_time.slice(0, 5), is_active: rule.is_active })),
    blackout_periods: resource.blackout_periods.map((period: BlackoutPeriod) => ({ start_datetime: toLocalDateTime(period.start_datetime), end_datetime: toLocalDateTime(period.end_datetime), reason: period.reason })),
  };
}

function defaultValues(initial?: ResourceFormInput): ResourceFormInput {
  return initial ?? {
    name: "",
    short_description: "",
    full_description: "",
    category: "meeting",
    capacity: 1,
    price: "0.00",
    currency: "USD",
    price_mode: "hourly",
    duration_mode: "flexible",
    min_booking_duration: 60,
    max_booking_duration: 240,
    status: "published",
    is_active: true,
    primary_staff: null,
    images: [EMPTY_IMAGE],
    availability_rules: [EMPTY_AVAILABILITY],
    blackout_periods: [],
  };
}

export function ResourceEditor({
  initial,
  submitLabel,
  onSubmit,
}: {
  initial?: ResourceFormInput;
  submitLabel: string;
  onSubmit: (values: ResourceMutationInput) => Promise<void>;
}) {
  const form = useForm<ResourceFormInput, undefined, ResourceFormValues>({
    resolver: zodResolver(resourceFormSchema),
    defaultValues: defaultValues(initial),
  });
  const images = useFieldArray({ control: form.control, name: "images" });
  const availability = useFieldArray({ control: form.control, name: "availability_rules" });
  const blackouts = useFieldArray({ control: form.control, name: "blackout_periods" });

  const submit = form.handleSubmit(async (values) => {
    await onSubmit({
      ...values,
      images: values.images.filter((image) => image.image_url.trim().length > 0),
      blackout_periods: values.blackout_periods.filter((period) => period.start_datetime && period.end_datetime).map((period) => ({ ...period, start_datetime: new Date(period.start_datetime).toISOString(), end_datetime: new Date(period.end_datetime).toISOString() })),
      primary_staff: values.primary_staff || null,
    });
  });

  return (
    <form className="space-y-8" onSubmit={submit}>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium">Name</label><input {...form.register("name")} className="w-full rounded-sm border border-stone-300 px-3 py-2" /><p className="mt-1 text-sm text-red-700">{form.formState.errors.name?.message}</p></div>
        <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium">Short description</label><input {...form.register("short_description")} className="w-full rounded-sm border border-stone-300 px-3 py-2" /></div>
        <div className="md:col-span-2"><label className="mb-1 block text-sm font-medium">Full description</label><textarea rows={5} {...form.register("full_description")} className="w-full rounded-sm border border-stone-300 px-3 py-2" /></div>
        <div><label className="mb-1 block text-sm font-medium">Category</label><select {...form.register("category")} className="w-full rounded-sm border border-stone-300 px-3 py-2"><option value="room">Room</option><option value="meeting">Meeting</option><option value="clinic">Clinic</option><option value="salon">Salon</option><option value="vehicle">Vehicle</option><option value="table">Table</option><option value="venue">Venue</option><option value="other">Other</option></select></div>
        <div><label className="mb-1 block text-sm font-medium">Capacity</label><input type="number" min={1} {...form.register("capacity")} className="w-full rounded-sm border border-stone-300 px-3 py-2" /></div>
        <div><label className="mb-1 block text-sm font-medium">Price</label><input {...form.register("price")} className="w-full rounded-sm border border-stone-300 px-3 py-2" /></div>
        <div><label className="mb-1 block text-sm font-medium">Currency</label><input maxLength={3} {...form.register("currency")} className="w-full rounded-sm border border-stone-300 px-3 py-2 uppercase" /></div>
        <div><label className="mb-1 block text-sm font-medium">Price mode</label><select {...form.register("price_mode")} className="w-full rounded-sm border border-stone-300 px-3 py-2"><option value="fixed">Fixed</option><option value="hourly">Hourly</option><option value="daily">Daily</option></select></div>
        <div><label className="mb-1 block text-sm font-medium">Duration mode</label><select {...form.register("duration_mode")} className="w-full rounded-sm border border-stone-300 px-3 py-2"><option value="flexible">Flexible</option><option value="fixed_slot">Fixed slot</option></select></div>
        <div><label className="mb-1 block text-sm font-medium">Min booking duration</label><input type="number" min={1} {...form.register("min_booking_duration")} className="w-full rounded-sm border border-stone-300 px-3 py-2" /></div>
        <div><label className="mb-1 block text-sm font-medium">Max booking duration</label><input type="number" min={1} {...form.register("max_booking_duration")} className="w-full rounded-sm border border-stone-300 px-3 py-2" /></div>
        <div><label className="mb-1 block text-sm font-medium">Status</label><select {...form.register("status")} className="w-full rounded-sm border border-stone-300 px-3 py-2"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></div>
        <div><label className="mb-1 block text-sm font-medium">Primary staff ID</label><input placeholder="Optional UUID" {...form.register("primary_staff")} className="w-full rounded-sm border border-stone-300 px-3 py-2" /></div>
        <label className="flex items-center gap-2 text-sm font-medium"><input type="checkbox" {...form.register("is_active")} /> Active</label>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Images</h2><button type="button" onClick={() => images.append(EMPTY_IMAGE)} className="rounded-sm border border-stone-300 px-3 py-2 text-sm">Add image</button></div>
        {images.fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-sm border border-stone-200 p-4 md:grid-cols-[1.6fr_1fr_120px_auto]">
            <input placeholder="Image URL" {...form.register(`images.${index}.image_url`)} className="rounded-sm border border-stone-300 px-3 py-2" />
            <input placeholder="Alt text" {...form.register(`images.${index}.alt_text`)} className="rounded-sm border border-stone-300 px-3 py-2" />
            <input type="number" min={0} {...form.register(`images.${index}.sort_order`)} className="rounded-sm border border-stone-300 px-3 py-2" />
            <button type="button" onClick={() => images.remove(index)} className="rounded-sm border border-stone-300 px-3 py-2 text-sm">Remove</button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Availability rules</h2><button type="button" onClick={() => availability.append(EMPTY_AVAILABILITY)} className="rounded-sm border border-stone-300 px-3 py-2 text-sm">Add rule</button></div>
        {availability.fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-sm border border-stone-200 p-4 md:grid-cols-[120px_1fr_1fr_auto_auto]">
            <select {...form.register(`availability_rules.${index}.day_of_week`)} className="rounded-sm border border-stone-300 px-3 py-2"><option value={0}>Sun</option><option value={1}>Mon</option><option value={2}>Tue</option><option value={3}>Wed</option><option value={4}>Thu</option><option value={5}>Fri</option><option value={6}>Sat</option></select>
            <input type="time" {...form.register(`availability_rules.${index}.start_time`)} className="rounded-sm border border-stone-300 px-3 py-2" />
            <input type="time" {...form.register(`availability_rules.${index}.end_time`)} className="rounded-sm border border-stone-300 px-3 py-2" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" {...form.register(`availability_rules.${index}.is_active`)} /> Active</label>
            <button type="button" onClick={() => availability.remove(index)} className="rounded-sm border border-stone-300 px-3 py-2 text-sm">Remove</button>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Blackout periods</h2><button type="button" onClick={() => blackouts.append(EMPTY_BLACKOUT)} className="rounded-sm border border-stone-300 px-3 py-2 text-sm">Add blackout</button></div>
        {blackouts.fields.map((field, index) => (
          <div key={field.id} className="grid gap-3 rounded-sm border border-stone-200 p-4 md:grid-cols-[1fr_1fr_1.2fr_auto]">
            <input type="datetime-local" {...form.register(`blackout_periods.${index}.start_datetime`)} className="rounded-sm border border-stone-300 px-3 py-2" />
            <input type="datetime-local" {...form.register(`blackout_periods.${index}.end_datetime`)} className="rounded-sm border border-stone-300 px-3 py-2" />
            <input placeholder="Reason" {...form.register(`blackout_periods.${index}.reason`)} className="rounded-sm border border-stone-300 px-3 py-2" />
            <button type="button" onClick={() => blackouts.remove(index)} className="rounded-sm border border-stone-300 px-3 py-2 text-sm">Remove</button>
          </div>
        ))}
      </div>

      <button type="submit" disabled={form.formState.isSubmitting} className="rounded-sm bg-[var(--accent)] px-5 py-3 text-sm text-white disabled:opacity-60">{submitLabel}</button>
    </form>
  );
}
