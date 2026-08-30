# Premium UI System

This sprint introduces the Blue Intelligence mobile design system for Blue Marketing.

## Scope

- Semantic light and dark theme tokens under `src/theme/`
- Motion primitives under `src/motion/`
- Haptic wrapper functions under `src/services/haptics.ts`
- Reusable branded, control, data-display, feedback, layout, and navigation components under `src/components/`
- Development-only preview routes under `app/(preview)/`
- Static mock data isolated under `src/mocks/`

## Design direction

The system is built for:

- Executive-dashboard clarity
- Premium fintech-level discipline
- Fast field-operations usability
- Calm, trustworthy visual hierarchy
- Strong accessibility in light and dark themes

The interface avoids generic template styling, overused gradients, decorative motion, and feature-specific hard-coded colors in screens.

## Theme architecture

Global tokens are split into:

- `colors.ts`
- `spacing.ts`
- `radius.ts`
- `elevation.ts`
- `motion.ts`
- `typography.ts`
- `componentTokens.ts`
- `theme.ts`
- `types.ts`

Components consume semantic tokens directly so ordinary UI code does not need light or dark conditional color logic.

## Preview routes

Preview routes are available only in development builds:

- `/(preview)`
- `/(preview)/login`
- `/(preview)/staff-home`
- `/(preview)/admin-home`
- `/(preview)/crm`
- `/(preview)/lead-detail`
- `/(preview)/attendance`
- `/(preview)/design-system`

These routes do not persist preview state and do not mutate the real authentication store.

## Testing

Representative tests cover:

- Theme token structure and key parity
- Haptic wrapper behavior
- Core component accessibility behavior

Run the full validation suite before review:

```bash
npx expo-doctor
npm run typecheck
npm run lint
npm run test
npm run format:check
npm run validate
npx expo export --platform web
```
