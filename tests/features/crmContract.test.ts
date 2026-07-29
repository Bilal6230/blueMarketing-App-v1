const fs = eval('require')('fs') as {
  readFileSync: (filePath: string, encoding: string) => string;
};

describe('crm contract and boundaries', () => {
  const projectRoot = process.cwd();

  it('does not expose email in CRM screens or service types', () => {
    const files = [
      'src/features/crm/screens/LeadListScreen.tsx',
      'src/features/crm/screens/LeadDetailScreen.tsx',
      'src/features/crm/screens/CreateLeadScreen.tsx',
      'src/features/crm/screens/EditLeadScreen.tsx',
      'src/features/crm/services/crmService.ts',
    ];

    files.forEach((file) => {
      const content = fs.readFileSync(`${projectRoot}/${file}`, 'utf8');
      expect(content.toLowerCase()).not.toContain('email');
    });
  });

  it('does not keep unsupported CRM concepts in active source files', () => {
    const files = [
      'src/features/crm/services/crmService.ts',
      'src/features/crm/screens/LeadDetailScreen.tsx',
      'src/features/crm/screens/LeadListScreen.tsx',
    ];

    files.forEach((file) => {
      const content = fs.readFileSync(`${projectRoot}/${file}`, 'utf8');
      expect(content).not.toContain('Pending');
      expect(content).not.toContain('assignedTo');
      expect(content).not.toContain('Proposal');
      expect(content).not.toContain('title="Message"');
      expect(content).not.toContain('deactivate');
    });
  });

  it('screens do not directly import fixture arrays', () => {
    const files = [
      'src/features/crm/screens/LeadListScreen.tsx',
      'src/features/crm/screens/LeadDetailScreen.tsx',
      'src/features/crm/screens/CreateLeadScreen.tsx',
      'src/features/crm/screens/EditLeadScreen.tsx',
    ];

    files.forEach((file) => {
      const content = fs.readFileSync(`${projectRoot}/${file}`, 'utf8');
      expect(content).not.toContain('crmSeed');
      expect(content).not.toContain('leadFixtures');
    });
  });
});
