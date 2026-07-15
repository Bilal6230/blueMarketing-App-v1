# Foundation Architecture

## Why Expo

Expo SDK 57 provides a supported cross-platform React Native baseline with first-party support for routing, secure storage modules, splash handling, and web smoke-test export without forcing native project files into this sprint.

## Why Expo Router

Expo Router keeps navigation file-based, predictable, and reviewable. Route files stay thin by delegating real UI and future business logic to feature screens and providers.

## Why TanStack Query owns server state

TanStack Query is responsible for server data, online state, and focus-driven refetch behavior. It avoids coupling API lifecycles to screen components and gives clear retry control for retryable versus non-retryable failures.

## Why Zustand is limited to client session state

Zustand is used only for lightweight client state: session token presence, route guard status, selected project, and restored client context. It does not replace server state management and is not persisted wholesale.

## Why SecureStore is used

Expo SecureStore is the correct baseline for mobile token storage in this sprint. Only the access token and selected project ID are stored. Passwords, user objects, permissions, and API payloads are excluded.

Session persistence is treated as durable only after token and selected-project storage complete successfully. If token persistence fails, the store returns a typed failure result and does not mark the session authenticated. If logout deletion fails, the in-memory session is still cleared and any residual token remains untrusted during the next bootstrap until server validation or deletion succeeds.

## Why there is no generic UI framework

Blue Marketing needs a custom premium design system. External component libraries would impose visual defaults too early, so this sprint establishes only semantic tokens and a few reusable primitives.

## Thin route files

Routes in `app/` only redirect, compose layouts, or render a feature screen. API calls, validation rules, and business calculations remain outside routes.

## Feature module growth

Each feature will expand under `src/features/<feature-name>/` with local screens, components, hooks, and types. Shared cross-feature concerns remain in `src/components`, `src/api`, `src/services`, `src/store`, and `src/theme`.

## Permissions and backend authorization

Permission utilities normalize values with trimming and lowercase comparison, making checks case-insensitive and exact-match only. They are for UI visibility and client flow only. Backend authorization remains authoritative.

## API error normalization

All Axios failures are normalized into `AppApiError`. This collapses Laravel `error_key` and legacy `error` fields into one internal `errorKey`, preserves validation errors, captures request IDs when available, and marks only network and server failures as retryable.

## Sensitive logging controls

The logger sanitizes nested metadata by redacting keys that contain sensitive fragments such as `token`, `authorization`, `password`, `phone`, `address`, `nic`, and `cnic`. Development logs remain useful without leaking sensitive fields.
