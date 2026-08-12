# Calendar Service frontend

React + TypeScript + Vite frontend for the API in `../typespec/openapi/openapi.yaml`.

## Run with Prism mock API

```bash
npm install
npm run dev:mock
```

Open <http://localhost:5173>. In this mode Vite points directly to the Prism
mock API at `http://127.0.0.1:4010`.

## Run against a separately started backend

Create `.env` from `.env.example`, set the API URL, then run:

```bash
npm install
npm run dev
```

For a backend on port 8000, use `VITE_API_BASE_URL=http://localhost:8000/api`.

The public booking flow is available at `/`, and the owner workspace at `/admin`.
