# Principles

## Intent

Blue Marketing Mobile uses a premium operational UI language with:

- Clear hierarchy for field and administrator workflows
- High-contrast copy in both light and dark themes
- Calm motion with reduced-motion fallback
- Honest prototype behaviour when functionality is not connected

## Product hierarchy

- Staff home prioritizes daily action, attendance, and recent lead activity.
- Administrator home prioritizes portfolio visibility, alerts, approvals context, and executive metrics.
- Prototype-only routes must show explicit notice copy instead of pretending to complete real work.

## Tab shell

`AppTabScaffold` enforces:

- Safe area at the root
- Scrollable content in the middle
- Fixed bottom navigation outside the scroll view
- Reserved bottom padding so content is not hidden behind the navigation bar
- Preserved web preview frame via `MobilePreviewFrame`

## Interaction rules

- Every visible action must navigate, change local preview state, or show a clear preview notice.
- Foundation login does not simulate authentication success.
- Preview login may demonstrate loading, but it must end with a visible "no request sent" message.
