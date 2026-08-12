export type BookingStatus = "confirmed" | "cancelled";
export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "OWNER_NOT_FOUND"
  | "EVENT_TYPE_NOT_FOUND"
  | "EVENT_TYPE_INACTIVE"
  | "SLOT_OUTSIDE_BOOKING_WINDOW"
  | "SLOT_UNAVAILABLE"
  | "BOOKING_CONFLICT"
  | "AVAILABILITY_EXCEPTION_CONFLICT";

export interface ApiError { code: ApiErrorCode; message: string; field?: string }
export interface Owner { id: string; fullName: string; email: string; timezone: string }
export interface EventType { id: string; title: string; description?: string; durationMinutes: number; isActive: boolean; createdAt: string; updatedAt: string }
export interface Slot { startsAt: string; endsAt: string }
export interface Booking { id: string; eventTypeId: string; eventTypeTitle: string; guestName: string; guestEmail: string; startsAt: string; endsAt: string; status: BookingStatus; createdAt: string; cancelledAt?: string }
export interface AvailabilityException { id: string; startsAt: string; endsAt: string; reason?: string; createdAt: string }

export interface CreateEventTypeRequest { title: string; description?: string; durationMinutes: number }
export interface UpdateEventTypeRequest { title?: string; description?: string; durationMinutes?: number; isActive?: boolean }
export interface CreateBookingRequest { eventTypeId: string; startsAt: string; guestName: string; guestEmail: string }
export interface CreateAvailabilityExceptionRequest { startsAt: string; endsAt: string; reason?: string }
