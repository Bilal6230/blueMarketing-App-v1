# Tokens

## Typography

Runtime-loaded Manrope families use the registered Expo font keys:

- `Manrope_400Regular`
- `Manrope_500Medium`
- `Manrope_600SemiBold`
- `Manrope_700Bold`

On web, the font family string keeps the same registered key first and then falls back to `Manrope`, `"Segoe UI"`, and `sans-serif`.

## Light-theme contrast

Measured on Thursday, July 16, 2026:

- `#667085` on `#FFFFFF`: `4.97:1`
- `#667085` on `#F4F7FB`: `4.63:1`
- `#9A5B0F` on `#FFF3DE`: `4.93:1`
- `#0E7090` on `#E7F5FA`: `5.04:1`
- `#667085` on `#EDF2F8`: `4.42:1`

These values support the refined light-theme muted text, warning text, information text, and inactive label treatment without weakening dark mode.

## Key token adjustments

- `textMuted`: `#667085`
- `inputPlaceholder`: `#667085`
- `warning`: `#9A5B0F`
- `info`: `#0E7090`

## Navigation

Bottom navigation uses semantic component tokens for:

- Bar background
- Bar border
- Default and selected icon colours
- Default and selected label colours
- Selection indicator
