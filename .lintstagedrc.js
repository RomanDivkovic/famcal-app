module.exports = {
  '*.{ts,tsx,js,jsx}': (filenames) => {
    // Exclude Deno test files from Jest
    const nonDenoFiles = filenames.filter((file) => !file.includes('tests/'));

    if (nonDenoFiles.length === 0) {
      return [];
    }

    return [
      `eslint --fix ${nonDenoFiles.join(' ')}`,
      `prettier --write ${nonDenoFiles.join(' ')}`,
      `jest --bail --findRelatedTests --passWithNoTests ${nonDenoFiles.join(' ')}`,
    ];
  },
  '*.{json,md}': ['prettier --write'],
};
