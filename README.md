# Blue Marketing Mobile

Blue Marketing Mobile is the Expo React Native app for Blue Marketing operations teams. The application opens on login, restores authenticated sessions, and routes staff and administrators into role-specific dashboards backed by typed local data services that can later be replaced with API calls.

## Prerequisites

- Node.js `22.13.x` or later
- npm `10+`
- Android Studio for Android testing
- Xcode for iOS simulator testing on macOS

## Installation

```bash
npm install
```

## Environment setup

1. Copy `.env.example` to `.env`.
2. Set `EXPO_PUBLIC_API_URL` to the future mobile API base URL.
3. Keep secrets out of `EXPO_PUBLIC_*` variables.

## Application flow

- Unauthenticated users land on the login screen.
- Staff users sign in to the staff dashboard.
- Administrators sign in to the administrator dashboard.
- The authenticated shell includes `Home`, `CRM`, `Attendance`, and `Profile`.
- CRM supports lead search, status filtering, detail views, follow-up logging, and lead updates.
- Attendance supports check-in, check-out, and shift history.
- Profile shows account details, project selection, and logout.

## Development commands

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
npm run typecheck
npm run test
npm run format
npm run format:check
```

## Validation commands

```bash
npx expo-doctor
npm run typecheck
npm run lint
npm run test
npm run format:check
npx expo export --platform android --clear
```

## Folder architecture

- `app/`: Expo Router route files and layouts
- `src/api/`: shared API client infrastructure for later backend integration
- `src/components/`: reusable UI primitives
- `src/features/`: feature-level screens, services, stores, and typed local data sources
- `src/providers/`: root app providers
- `src/services/`: shared runtime services
- `src/store/`: auth and application state
- `src/theme/`: design tokens and theme definitions
- `tests/`: unit and component tests

## Notes

- `app/` remains the only Expo Router directory.
- Expo SDK 57, Expo Router, `expo-dev-client`, the EAS project ID, and the Android package ID remain unchanged.
- Local typed services currently power authentication, dashboard data, CRM data, and attendance state. Those contracts are intended for later API replacement without redesigning screens.
