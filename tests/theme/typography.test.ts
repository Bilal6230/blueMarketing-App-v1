import { manropeFontFamilies, typography } from '@/theme/typography';

describe('typography configuration', () => {
  it('uses the registered Manrope font keys consistently', () => {
    expect(manropeFontFamilies.regular).toContain('Manrope_400Regular');
    expect(manropeFontFamilies.medium).toContain('Manrope_500Medium');
    expect(manropeFontFamilies.semiBold).toContain('Manrope_600SemiBold');
    expect(manropeFontFamilies.bold).toContain('Manrope_700Bold');
  });

  it('maps typography variants to Manrope families', () => {
    expect(String(typography.body.fontFamily)).toContain('Manrope_400Regular');
    expect(String(typography.label.fontFamily)).toContain('Manrope_500Medium');
    expect(String(typography.headingSmall.fontFamily)).toContain(
      'Manrope_600SemiBold',
    );
    expect(String(typography.displayMedium.fontFamily)).toContain(
      'Manrope_700Bold',
    );
  });
});
