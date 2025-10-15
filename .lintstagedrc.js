module.exports = {
  '*.{ts,tsx,js,jsx}': [
    'eslint --fix',
    'prettier --write',
    () => 'tsc --noEmit',
    'jest --bail --findRelatedTests --passWithNoTests',
  ],
  '*.{json,md}': ['prettier --write'],
};
