import type {
  ApiError,
  AvailabilityException,
  Booking,
  BookingStatus,
  CreateAvailabilityExceptionRequest,
  CreateBookingRequest,
  CreateEventTypeRequest,
  EventType,
  PublicOwner,
  Slot,
  UpdateEventTypeRequest,
} from "./types";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, "");

export class ApiRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly payload?: ApiError,
  ) {
    super(payload?.message || `API request failed with status ${status}`);
    this.name = "ApiRequestError";
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  if (!response.ok) {
    let payload: ApiError | undefined;
    try {
      payload = (await response.json()) as ApiError;
    } catch {
      payload = undefined;
    }
    throw new ApiRequestError(response.status, payload);
  }

  if (response.status === 204) return undefined as T;
  return (await response.json()) as T;
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  body: JSON.stringify(body),
});

export const api = {
  public: {
    owner: () => request<PublicOwner>("/public/owner"),
    eventTypes: () => request<EventType[]>("/public/event-types"),
    eventType: (id: string) => request<EventType>(`/public/event-types/${id}`),
    slots: (id: string, from: string, to: string) =>
      request<Slot[]>(`/public/event-types/${id}/slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
    createBooking: (body: CreateBookingRequest) =>
      request<Booking>("/public/bookings", json(body)),
  },
  admin: {
    eventTypes: () => request<EventType[]>("/admin/event-types"),
    createEventType: (body: CreateEventTypeRequest) =>
      request<EventType>("/admin/event-types", json(body)),
    updateEventType: (id: string, body: UpdateEventTypeRequest) =>
      request<EventType>(`/admin/event-types/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
    deleteEventType: (id: string) =>
      request<void>(`/admin/event-types/${id}`, { method: "DELETE" }),
    bookings: (from?: string, to?: string, status?: BookingStatus) => {
      const params = new URLSearchParams();
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      if (status) params.set("status", status);
      const query = params.toString();
      return request<Booking[]>(`/admin/bookings${query ? `?${query}` : ""}`);
    },
    exceptions: (from: string, to: string) =>
      request<AvailabilityException[]>(`/admin/availability-exceptions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`),
    createException: (body: CreateAvailabilityExceptionRequest) =>
      request<AvailabilityException>("/admin/availability-exceptions", json(body)),
    deleteException: (id: string) =>
      request<void>(`/admin/availability-exceptions/${id}`, { method: "DELETE" }),
  },
};

export function getApiError(error: unknown): string {
  if (error instanceof ApiRequestError) {
    const code = error.payload?.code;
    const messages: Record<string, string> = {
      BOOKING_CONFLICT: "Это время уже заняли. Выберите другой слот.",
      SLOT_UNAVAILABLE: "Слот больше недоступен. Обновите список времени.",
      EVENT_TYPE_INACTIVE: "Этот тип встречи больше недоступен.",
      AVAILABILITY_EXCEPTION_CONFLICT: "Интервал пересекается с существующим бронированием.",
    };
    return (code && messages[code]) || error.payload?.message || error.message;
  }
  return error instanceof Error ? error.message : "Произошла неизвестная ошибка";
}
