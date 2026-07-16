# Motion

## Principles

- Motion should clarify interaction, not decorate it.
- Reduced-motion users should not receive scale animation.
- Disabled controls should not animate.

## Press interactions

`PressableScale` applies:

- Gentle scale-in on `pressIn`
- Responsive scale reset on `pressOut`
- No scale transition when disabled
- No scale transition when reduced motion is preferred

## Login preview

Preview login may show a short loading state, but it must resolve to visible preview-only copy and never imply a successful sign-in.
