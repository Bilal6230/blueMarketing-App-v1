# Blue Marketing Mobile

Blue Marketing Mobile is the React Native foundation for Blue Marketing operational users, including superadmins, administrators, staff, and other permission-controlled roles. This sprint establishes routing, state boundaries, security defaults, theming, testing, and CI only. Business modules and live authentication are intentionally not implemented yet.

## Prerequisites

- Node.js `22.13.x` minimum for Expo SDK 57, per Expo's SDK reference: https://docs.expo.dev/versions/latest/
- npm `10+`
- Android Studio for emulator-based Android testing
- Xcode for iOS simulator testing on macOS

## Installation

```bash
npm install
```

## Environment setup

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_API_URL` to the Laravel mobile API base path, for example `http://YOUR_LOCAL_IP/api/v1/mobile`.
3. Do not place secrets in `EXPO_PUBLIC_*` variables because Expo bundles them into the client application.

## Development commands

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
npm run typecheck
npm run test
npm run format:check
npm run validate
```

## Android testing

1. Start an Android emulator from Android Studio.
2. Run `npm run android`.
3. Confirm the placeholder login screen loads and the not-found screen returns to `/`.

## iOS testing

1. On macOS, start an iOS simulator in Xcode.
2. Run `npm run ios`.
3. Confirm the placeholder login screen loads and theme colors render correctly in light and dark mode.

## Validation commands

Run these before review:

```bash
npx expo-doctor
npm run typecheck
npm run lint
npm run test
npm run format:check
npm run validate
npx expo export --platform web
```

## Folder architecture

- `app/`: thin Expo Router route files and route-group layouts
- `src/api/`: contracts, normalized error handling, request IDs, and the centralized Axios client
- `src/components/`: reusable UI primitives and state foundations
- `src/features/`: feature-oriented screen composition
- `src/providers/`: root provider composition, query client, and theme context
- `src/services/`: secure storage and sanitized development logging
- `src/store/`: client-side session state only
- `src/theme/`: semantic design tokens for light and dark themes
- `tests/`: unit and component coverage for the foundation

## Security rules

- `.env` is not committed.
- Access tokens use Expo SecureStore, not AsyncStorage.
- Passwords, full user records, roles, permissions, and API payloads are not persisted in secure storage.
- Logger metadata is sanitized and limited to development output.
- Authorization headers, tokens, passwords, phone numbers, addresses, CNIC/NIC values, and similar sensitive fields are redacted.
- TanStack Query cache is not persisted.
- Session bootstrap never treats a restored token as authenticated until server validation is added in the authentication sprint.
- Restored candidate tokens remain globally inactive until the authentication sprint validates them through an explicit session-validation request, such as `/auth/me`, and promotes the session to `authenticated`.
- If secure token deletion fails during logout, in-memory session state is still cleared immediately. Any residual token is treated as untrusted on the next bootstrap and must be deleted again or invalidated by the later `/auth/me` and `401` flow.

## Git workflow

1. Work from `feature/app-foundation`.
2. Use conventional commits.
3. Push the branch and open a draft pull request against `main`.
4. Do not merge from this sprint task.

Initial repository baseline handling:
The repository started with `feature/app-foundation` as the only branch and remote default because there was no earlier `main` commit. The safe correction path is to preserve that initial foundation commit unchanged, create `main` from that exact commit, and place all follow-up hardening work in later commits on `feature/app-foundation` so pull requests show a real reviewable diff.

## Current sprint status

Sprint 1 establishes the application foundation only. Routing, theme tokens, placeholder screens, session bootstrap, query lifecycle integration, API normalization, secure storage wrappers, tests, and CI are included.

Licensing and distribution terms for this application must be confirmed by Blue Marketing before production release.

## Explicitly unimplemented modules

- CRM
- Attendance
- Labour
- Stock
- Reports
- Approvals
- Project reports
- Real authentication API requests
- Analytics
- Crash reporting
- Push notifications
- Biometric authentication

## Bundle identifiers

Android package and iOS bundle identifiers are intentionally left unset. Final values must be agreed before signed production builds.

## Temporary assets

Application icons and splash assets are temporary Blue Marketing placeholders only. Final branded assets will be delivered during the design-system sprint.
