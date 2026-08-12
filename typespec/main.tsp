import "@typespec/http";
import "@typespec/openapi3";
import "@typespec/versioning";
import "./versions.tsp";

using TypeSpec.Http;
using TypeSpec.Versioning;

@service(#{ title: "Calendar API" })
@versioned(CalendarApiVersions)
@route("/api")
namespace CalendarService;

/** A stable identifier represented as a string. */
scalar EntityId extends string;

/** RFC 3339 date-time value including its UTC offset. */
scalar Rfc3339DateTime extends utcDateTime;

/** A booking lifecycle state. */
enum BookingStatus {
  confirmed,
  cancelled,
}

/** The single calendar owner's profile. */
model Owner {
  /** Unique owner identifier. */
  id: EntityId;

  /** Display name shown to guests. */
  fullName: string;

  /** Owner's email address. */
  email: string;

  /** IANA timezone, for example Europe/Moscow. */
  timezone: string;
}

/** Public subset of the owner's profile. */
model PublicOwner {
  /** Display name shown to guests. */
  fullName: string;

  /** Owner's email address. */
  email: string;

  /** IANA timezone, for example Europe/Moscow. */
  timezone: string;
}

/** An event type offered for booking. */
model EventType {
  /** Unique event type identifier. */
  id: EntityId;

  /** Non-empty event title. */
  title: string;

  /** Optional event description. */
  description?: string;

  /** Positive meeting duration in minutes. */
  durationMinutes: int32;

  /** Whether this type can receive new bookings. */
  isActive: boolean;

  /** Creation timestamp. */
  createdAt: Rfc3339DateTime;

  /** Last modification timestamp. */
  updatedAt: Rfc3339DateTime;
}

/** Fields accepted when creating an event type. */
model CreateEventTypeRequest {
  /** Non-empty event title. */
  title: string;

  /** Optional event description. */
  description?: string;

  /** Positive meeting duration in minutes. */
  durationMinutes: int32;
}

/** Fields that can be changed on an event type. */
model UpdateEventTypeRequest {
  title?: string;
  description?: string;
  durationMinutes?: int32;
  isActive?: boolean;
}

/** A computed free time interval for a selected event type. */
model Slot {
  /** Start of the available interval. */
  startsAt: Rfc3339DateTime;

  /** End of the available interval. */
  endsAt: Rfc3339DateTime;
}

/** A booking with the event title preserved as historical data. */
model Booking {
  /** Unique booking identifier. */
  id: EntityId;

  /** Identifier of the selected event type. */
  eventTypeId: EntityId;

  /** Event title at the time the booking was created. */
  eventTypeTitle: string;

  /** Guest's name stored on the booking. */
  guestName: string;

  /** Guest's email stored on the booking. */
  guestEmail: string;

  /** Start of the booked meeting. */
  startsAt: Rfc3339DateTime;

  /** End calculated by the server from the event duration. */
  endsAt: Rfc3339DateTime;

  /** Current booking state. */
  status: BookingStatus;

  /** Creation timestamp. */
  createdAt: Rfc3339DateTime;

  /** Set when the booking is cancelled. */
  cancelledAt?: Rfc3339DateTime;
}

/** Fields accepted from a guest when creating a booking. */
model CreateBookingRequest {
  eventTypeId: EntityId;

  /** Requested start; the server calculates endsAt. */
  startsAt: Rfc3339DateTime;

  guestName: string;
  guestEmail: string;
}

/** A period during which the owner is unavailable. */
model AvailabilityException {
  id: EntityId;
  startsAt: Rfc3339DateTime;
  endsAt: Rfc3339DateTime;
  reason?: string;
  createdAt: Rfc3339DateTime;
}

/** Fields accepted when creating an unavailable interval. */
model CreateAvailabilityExceptionRequest {
  startsAt: Rfc3339DateTime;
  endsAt: Rfc3339DateTime;
  reason?: string;
}

/** Standard error payload returned by the API. */
enum ApiErrorCode {
  VALIDATION_ERROR,
  OWNER_NOT_FOUND,
  EVENT_TYPE_NOT_FOUND,
  EVENT_TYPE_INACTIVE,
  SLOT_OUTSIDE_BOOKING_WINDOW,
  SLOT_UNAVAILABLE,
  BOOKING_CONFLICT,
  AVAILABILITY_EXCEPTION_CONFLICT,
}

/** Standard error payload returned by the API. */
model ApiError {
  /** Stable machine-readable error code. */
  code: ApiErrorCode;

  /** Human-readable explanation. */
  message: string;

  /** Optional invalid request field name. */
  field?: string;
}

/** 400 response for malformed parameters or request bodies. */
model BadRequestResponse {
  @statusCode statusCode: 400;
  @body body: ApiError;
}

/** 404 response when a requested entity does not exist. */
model NotFoundResponse {
  @statusCode statusCode: 404;
  @body body: ApiError;
}

/** 409 response when the requested state conflicts with existing data. */
model ConflictResponse {
  @statusCode statusCode: 409;
  @body body: ApiError;
}

/** 422 response when a domain rule is violated. */
model UnprocessableEntityResponse {
  @statusCode statusCode: 422;
  @body body: ApiError;
}

model NoContentResponse {
  @statusCode statusCode: 204;
}

model CreatedBookingResponse {
  @statusCode statusCode: 201;
  @body body: Booking;
}

model CreatedEventTypeResponse {
  @statusCode statusCode: 201;
  @body body: EventType;
}

model CreatedAvailabilityExceptionResponse {
  @statusCode statusCode: 201;
  @body body: AvailabilityException;
}

/** Public guest operations. */
@route("/public")
interface PublicApi {
  /** Returns the public profile of the calendar owner. */
  @get
  @route("/owner")
  getOwner(): PublicOwner | NotFoundResponse;

  /** Returns only active event types. */
  @get
  @route("/event-types")
  listActiveEventTypes(): EventType[] | BadRequestResponse;

  /** Returns one active event type. */
  @get
  @route("/event-types/{eventTypeId}")
  getActiveEventType(@path eventTypeId: EntityId):
    | EventType
    | NotFoundResponse
    | UnprocessableEntityResponse;

  /** Returns free slots in the requested date range, limited to the 14-day booking window. */
  @get
  @route("/event-types/{eventTypeId}/slots")
  getAvailableSlots(
    @path eventTypeId: EntityId,
    @query from: plainDate,
    @query to: plainDate,
  ):
    | Slot[]
    | BadRequestResponse
    | NotFoundResponse
    | UnprocessableEntityResponse;

  /** Creates a booking after rechecking that the requested slot is still free. */
  @post
  @route("/bookings")
  createBooking(@body body: CreateBookingRequest):
    | CreatedBookingResponse
    | BadRequestResponse
    | NotFoundResponse
    | ConflictResponse
    | UnprocessableEntityResponse;
}

/** Administrative operations for the single calendar owner. */
@route("/admin")
interface AdminApi {
  /** Returns all event types, including inactive ones. */
  @get
  @route("/event-types")
  listEventTypes(): EventType[] | BadRequestResponse;

  /** Creates an active event type. */
  @post
  @route("/event-types")
  createEventType(@body body: CreateEventTypeRequest):
    | CreatedEventTypeResponse
    | BadRequestResponse
    | ConflictResponse
    | UnprocessableEntityResponse;

  /** Returns an event type, whether active or inactive. */
  @get
  @route("/event-types/{eventTypeId}")
  getEventType(@path eventTypeId: EntityId): EventType | NotFoundResponse;

  /** Partially updates an event type without changing existing bookings. */
  @patch
  @route("/event-types/{eventTypeId}")
  updateEventType(
    @path eventTypeId: EntityId,
    @body body: UpdateEventTypeRequest,
  ):
    | EventType
    | BadRequestResponse
    | NotFoundResponse
    | ConflictResponse
    | UnprocessableEntityResponse;

  /** Deactivates an event type while preserving existing bookings. */
  @delete
  @route("/event-types/{eventTypeId}")
  deleteEventType(@path eventTypeId: EntityId):
    | NoContentResponse
    | NotFoundResponse
    | ConflictResponse;

  /** Returns upcoming bookings by default, ordered by startsAt. */
  @get
  @route("/bookings")
  listBookings(
    @query from?: plainDate,
    @query to?: plainDate,
    @query status?: BookingStatus,
  ): Booking[] | BadRequestResponse | UnprocessableEntityResponse;

  /** Creates an owner-unavailable interval. */
  @post
  @route("/availability-exceptions")
  createAvailabilityException(@body body: CreateAvailabilityExceptionRequest):
    | CreatedAvailabilityExceptionResponse
    | BadRequestResponse
    | ConflictResponse
    | UnprocessableEntityResponse;

  /** Returns unavailable intervals overlapping the requested period. */
  @get
  @route("/availability-exceptions")
  listAvailabilityExceptions(@query from: plainDate, @query to: plainDate):
    | AvailabilityException[]
    | BadRequestResponse
    | UnprocessableEntityResponse;

  /** Removes an unavailable interval. */
  @delete
  @route("/availability-exceptions/{exceptionId}")
  deleteAvailabilityException(@path exceptionId: EntityId):
    | NoContentResponse
    | NotFoundResponse;
}
