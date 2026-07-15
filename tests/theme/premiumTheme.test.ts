import { darkTheme, lightTheme } from '@/theme';

describe('premium theme tokens', () => {
  it('keeps matching color keys across light and dark themes', () => {
    expect(Object.keys(lightTheme.colors)).toEqual(
      Object.keys(darkTheme.colors),
    );
  });

  it('exposes the refined premium brand tokens', () => {
    expect(lightTheme.colors.primary).toBe('#2878F0');
    expect(lightTheme.colors.background).toBe('#F4F7FB');
    expect(darkTheme.colors.surfaceElevated).toBe('#132238');
  });

  it('provides component token groups required by the design system', () => {
    expect(Object.keys(lightTheme.component)).toEqual(
      expect.arrayContaining([
        'avatar',
        'badge',
        'button',
        'card',
        'divider',
        'input',
        'navigation',
        'overlay',
        'skeleton',
      ]),
    );
  });
});
