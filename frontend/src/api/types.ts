export type EntityId = string;
export type Rfc3339DateTime = string;
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

export interface ApiError {
  code: ApiErrorCode;
  message: string;
  field?: string;
}

export interface Owner {
  id?: EntityId;
  fullName: string;
  email: string;
  timezone: string;
}

export type PublicOwner = Omit<Owner, "id">;

export interface EventType {
  id: EntityId;
  title: string;
  description?: string;
  durationMinutes: number;
  isActive: boolean;
  createdAt: Rfc3339DateTime;
  updatedAt: Rfc3339DateTime;
}

export interface CreateEventTypeRequest {
  title: string;
  description?: string;
  durationMinutes: number;
}

export interface UpdateEventTypeRequest {
  title?: string;
  description?: string;
  durationMinutes?: number;
  isActive?: boolean;
}

export interface Slot {
  startsAt: Rfc3339DateTime;
  endsAt: Rfc3339DateTime;
}

export interface Booking {
  id: EntityId;
  eventTypeId: EntityId;
  eventTypeTitle: string;
  guestName: string;
  guestEmail: string;
  startsAt: Rfc3339DateTime;
  endsAt: Rfc3339DateTime;
  status: BookingStatus;
  createdAt: Rfc3339DateTime;
  cancelledAt?: Rfc3339DateTime;
}

export interface CreateBookingRequest {
  eventTypeId: EntityId;
  startsAt: Rfc3339DateTime;
  guestName: string;
  guestEmail: string;
}

export interface AvailabilityException {
  id: EntityId;
  startsAt: Rfc3339DateTime;
  endsAt: Rfc3339DateTime;
  reason?: string;
  createdAt: Rfc3339DateTime;
}

export interface CreateAvailabilityExceptionRequest {
  startsAt: Rfc3339DateTime;
  endsAt: Rfc3339DateTime;
  reason?: string;
}
