# Accessibility

## Typography and contrast

- Light-theme muted text now meets normal-text contrast on both `#FFFFFF` and `#F4F7FB`.
- Warning and information foreground colours were strengthened against their soft backgrounds.

## Inputs

`AppInput` provides:

- Visible label text instead of placeholder-only labelling
- `aria-labelledby` linkage for the label
- `aria-describedby` linkage for helper, success, or error text
- Disabled and invalid accessibility state treatment
- Live-region messaging for helper and error copy where supported

## Navigation and controls

- Bottom navigation items expose selected tab state
- Icon buttons expose disabled and selected state
- Filter chips expose selected state
- Web keyboard focus uses a visible outline

## Prototype honesty

- Foundation login explicitly states authentication is not connected
- Preview login states that no request is sent
- Unavailable actions show preview notices instead of false success
