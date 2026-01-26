# DAKA News Terminal — Project Notes

Architecture

- React + TypeScript frontend built with Vite.
- Layout: columns by country then by source.
- Each article opens in a side panel; content is translated/contextualized client-side or via backend.

Feature flags

- External feeds integration controlled via VITE_EXTERNAL_FEEDS env variable.

Next steps

- Integrate real feed endpoints behind a backend service to avoid CORS and to handle API keys securely.
- Add translation/context modules and caching.
- Add tests and accessibility checks.
