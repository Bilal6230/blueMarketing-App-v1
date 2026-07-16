# Components

## AppTabScaffold

Used by:

- Staff home
- Administrator home
- CRM list
- Attendance

Behaviour:

- Bottom navigation stays fixed while content scrolls
- Bottom safe area is respected
- Scroll content reserves space for the navigation bar
- Web preview remains constrained to the mobile frame

## PressableScale

Supports:

- Static styles
- Dynamic `style={({ pressed }) => ...}` callbacks
- Reduced-motion fallback
- Disabled state without scale animation
- Visible keyboard focus outline on web

## AppInput

Supports:

- Visible label text
- Focus tracking and focused border
- Error and success borders
- Disabled background and disabled text
- Helper and error description linkage
- Password visibility toggle through `PasswordInput`

## SectionHeader

Action buttons render only when both `actionLabel` and `onPressAction` are present.

## ProjectPill

May be used as static context or a preview-only project selector entry point.
