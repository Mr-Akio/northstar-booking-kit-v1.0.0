import type {
  ApiDataResponse,
  ApiErrorPayload,
  AvailabilityDay,
  Booking,
  PaginatedResponse,
  Resource,
  User,
} from "@/types/api";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/$/, "");

export class ApiError extends Error {
  code: string;
  fields: Record<string, string[]>;

  constructor(payload: ApiErrorPayload["error"]) {
    super(payload.message);
    this.code = payload.code;
    this.fields = payload.fields;
  }
}

interface RequestOptions extends RequestInit {
  accessToken?: string | null;
}

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (options.accessToken) {
    headers.set("Authorization", `Bearer ${options.accessToken}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json()) as T | ApiErrorPayload;
  if (!response.ok) {
    throw new ApiError((payload as ApiErrorPayload).error);
  }
  return payload as T;
}

export interface ResourceMutationInput {
  name: string;
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
  primary_staff: string | null;
  images: Array<{ image_url: string; alt_text: string; sort_order: number }>;
  availability_rules: Array<{ day_of_week: number; start_time: string; end_time: string; is_active: boolean }>;
  blackout_periods: Array<{ start_datetime: string; end_datetime: string; reason: string }>;
}

export const authApi = {
  register: (input: Record<string, string>) => apiFetch<ApiDataResponse<User>>("/api/v1/auth/register/", { method: "POST", body: JSON.stringify(input) }),
  login: (input: { email: string; password: string }) => apiFetch<{ data: { access: string; user: User } }>("/api/v1/auth/login/", { method: "POST", body: JSON.stringify(input) }),
  logout: (accessToken: string | null) => apiFetch<void>("/api/v1/auth/logout/", { method: "POST", accessToken }),
  refresh: () => apiFetch<{ data: { access: string } }>("/api/v1/auth/token/refresh/", { method: "POST", body: JSON.stringify({}) }),
  me: (accessToken: string) => apiFetch<ApiDataResponse<User>>("/api/v1/auth/me/", { accessToken }),
  forgotPassword: (email: string) => apiFetch<{ data: { message: string } }>("/api/v1/auth/forgot-password/", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (input: { uid: string; token: string; new_password: string; confirm_password: string }) => apiFetch<void>("/api/v1/auth/reset-password/", { method: "POST", body: JSON.stringify(input) }),
  verifyEmail: (uid: string, token: string) => apiFetch<ApiDataResponse<User>>("/api/v1/auth/verify-email/", { method: "POST", body: JSON.stringify({ uid, token }) }),
  updateProfile: (accessToken: string, input: { first_name: string; last_name: string }) => apiFetch<ApiDataResponse<User>>("/api/v1/auth/me/", { method: "PATCH", accessToken, body: JSON.stringify(input) }),
  changePassword: (accessToken: string, input: { current_password: string; new_password: string; confirm_password: string }) => apiFetch<void>("/api/v1/auth/change-password/", { method: "POST", accessToken, body: JSON.stringify(input) }),
  users: (accessToken: string) => apiFetch<PaginatedResponse<User>>("/api/v1/auth/users/", { accessToken }),
};

export const resourceApi = {
  list: (search = "") => apiFetch<PaginatedResponse<Resource>>(`/api/v1/resources/${search ? `?search=${encodeURIComponent(search)}` : ""}`),
  detailBySlug: (slug: string) => apiFetch<ApiDataResponse<Resource>>(`/api/v1/resources/slug/${slug}/`),
  detail: (accessToken: string, id: string) => apiFetch<ApiDataResponse<Resource>>(`/api/v1/resources/${id}/`, { accessToken }),
  availability: (id: string, startDate: string, endDate: string) => apiFetch<ApiDataResponse<AvailabilityDay[]>>(`/api/v1/resources/${id}/availability/?start_date=${startDate}&end_date=${endDate}`),
  adminList: (accessToken: string) => apiFetch<PaginatedResponse<Resource>>("/api/v1/resources/", { accessToken }),
  create: (accessToken: string, input: ResourceMutationInput) => apiFetch<ApiDataResponse<Resource>>("/api/v1/resources/", { method: "POST", accessToken, body: JSON.stringify(input) }),
  update: (accessToken: string, id: string, input: Partial<ResourceMutationInput>) => apiFetch<ApiDataResponse<Resource>>(`/api/v1/resources/${id}/`, { method: "PATCH", accessToken, body: JSON.stringify(input) }),
  remove: (accessToken: string, id: string) => apiFetch<void>(`/api/v1/resources/${id}/`, { method: "DELETE", accessToken }),
};

export const bookingApi = {
  list: (accessToken: string) => apiFetch<PaginatedResponse<Booking>>("/api/v1/bookings/", { accessToken }),
  detail: (accessToken: string, id: string) => apiFetch<ApiDataResponse<Booking>>(`/api/v1/bookings/${id}/`, { accessToken }),
  create: (accessToken: string, input: Record<string, unknown>) => apiFetch<ApiDataResponse<Booking>>("/api/v1/bookings/", { method: "POST", accessToken, body: JSON.stringify(input) }),
  cancel: (accessToken: string, id: string, reason: string) => apiFetch<ApiDataResponse<Booking>>(`/api/v1/bookings/${id}/cancel/`, { method: "POST", accessToken, body: JSON.stringify({ reason }) }),
  confirm: (accessToken: string, id: string) => apiFetch<ApiDataResponse<Booking>>(`/api/v1/bookings/${id}/confirm/`, { method: "POST", accessToken, body: JSON.stringify({}) }),
  reject: (accessToken: string, id: string, reason: string) => apiFetch<ApiDataResponse<Booking>>(`/api/v1/bookings/${id}/reject/`, { method: "POST", accessToken, body: JSON.stringify({ reason }) }),
  complete: (accessToken: string, id: string) => apiFetch<ApiDataResponse<Booking>>(`/api/v1/bookings/${id}/complete/`, { method: "POST", accessToken, body: JSON.stringify({}) }),
};
