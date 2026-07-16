export type UserRole = "customer" | "staff" | "admin";

export interface ApiErrorPayload {
  error: {
    code: string;
    message: string;
    fields: Record<string, string[]>;
  };
}

export interface ApiDataResponse<T> {
  data: T;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    count: number;
    page: number;
    page_size: number;
    next: string | null;
    previous: string | null;
  };
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ResourceImage {
  id: number;
  image_url: string;
  alt_text: string;
  sort_order: number;
}

export interface AvailabilityRule {
  id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export interface BlackoutPeriod {
  id: number;
  start_datetime: string;
  end_datetime: string;
  reason: string;
}

export interface Resource {
  id: string;
  name: string;
  slug: string;
  short_description: string;
  full_description: string;
  category: string;
  capacity: number;
  price: string;
  currency: string;
  price_mode: string;
  duration_mode: string;
  min_booking_duration: number;
  max_booking_duration: number;
  status: string;
  is_active: boolean;
  primary_staff?: string | null;
  primary_staff_details?: Pick<User, "id" | "email" | "first_name" | "last_name"> | null;
  images: ResourceImage[];
  availability_rules: AvailabilityRule[];
  blackout_periods: BlackoutPeriod[];
  created_at: string;
  updated_at: string;
}

export interface AvailabilityDay {
  date: string;
  windows: Array<{
    start: string;
    end: string;
    is_available: boolean;
    reason: string | null;
  }>;
}

export interface BookingGuest {
  id?: number;
  full_name: string;
  email: string;
  phone: string;
  notes: string;
}

export interface Booking {
  id: string;
  booking_reference: string;
  user: User;
  resource: Resource;
  start_datetime: string;
  end_datetime: string;
  number_of_guests: number;
  status: string;
  unit_price: string;
  total_price: string;
  notes: string;
  cancellation_reason: string;
  cancelled_at: string | null;
  guests: BookingGuest[];
  created_at: string;
  updated_at: string;
}
