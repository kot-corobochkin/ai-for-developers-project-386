# Integration scenarios

The E2E suite runs the real React frontend and Fastify backend in a Chromium
browser.

Covered scenarios:

1. A guest opens the public page, selects an event type and free slot, submits
   contact details, sees the confirmation, and finds the booking in the admin
   workspace.
2. A slot booked by one guest is removed from the next availability response,
   so it cannot be offered to a second guest. The backend `409 BOOKING_CONFLICT`
   response is covered by the backend integration tests.

Run locally:

```bash
cd e2e
npm install
npx playwright install chromium
npm test
```

The backend uses in-memory storage, so every test run starts with seeded data.
