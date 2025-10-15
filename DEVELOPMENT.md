# Development Tools Setup

This document describes the development tools configured for the GroupCalendar project.

## 🛠 Tools Overview

### ESLint

- **Purpose**: JavaScript/TypeScript linting for code quality
- **Version**: 9.15.0 with new flat config format
- **Config**: `eslint.config.mjs` (ESLint v9+ format)
- **Run**: `npm run lint` or `npm run lint:fix`
- **Features**:
  - TypeScript support with `typescript-eslint`
  - React & React Native rules
  - React Hooks validation
  - Auto-fix on commit via pre-commit hooks
  - Modern flat config format (replaces .eslintrc.js)

### Prettier

- **Purpose**: Code formatting consistency
- **Config**: `.prettierrc.js`
- **Run**: `npm run format` or `npm run format:check`
- **Settings**:
  - 2 spaces indentation
  - Single quotes
  - 100 character line width
  - Semicolons enabled
  - Trailing commas (ES5)

### Deno

- **Purpose**: Additional linting and formatting with modern tooling
- **Config**: `deno.json`
- **Run**:
  - `deno lint src/` - Lint TypeScript files
  - `deno fmt src/` - Format files
  - `deno fmt --check src/` - Check formatting
- **Features**:
  - Modern TypeScript linting
  - Fast performance
  - Built-in formatter
  - Used in CI/CD pipeline

### Jest

- **Purpose**: Unit testing framework
- **Config**: `jest.config.js`, `jest.setup.js`
- **Run**:
  - `npm test` - Run all tests
  - `npm run test:watch` - Watch mode
  - `npm run test:coverage` - With coverage report
- **Features**:
  - React Native Testing Library
  - Firebase mocks
  - AsyncStorage mocks
  - Coverage thresholds: 50% minimum

### Husky

- **Purpose**: Git hooks management
- **Config**: `.husky/pre-commit`
- **Features**:
  - Automatically runs before each commit
  - Executes lint-staged on staged files

### Lint-Staged

- **Purpose**: Run linters on staged files only
- **Config**: `.lintstagedrc.js`
- **Actions on commit**:
  1. ESLint auto-fix on `.ts`, `.tsx`, `.js`, `.jsx` files
  2. Prettier formatting
  3. TypeScript type checking
  4. Jest tests on related files
  5. Prettier on `.json`, `.md` files

## 📋 Available Scripts

```bash
# Development
npm start              # Start Expo development server
npm run android        # Start on Android
npm run ios            # Start on iOS

# Code Quality
npm run lint           # Run ESLint
npm run lint:fix       # Fix ESLint issues automatically
npm run format         # Format all files with Prettier
npm run format:check   # Check formatting without modifying
npm run type-check     # Run TypeScript type checking

# Testing
npm test               # Run Jest tests
npm run test:watch     # Run tests in watch mode
npm run test:coverage  # Run tests with coverage report
```

## 🚀 Pre-Commit Workflow

When you run `git commit`, the following happens automatically:

1. **Lint-staged** identifies staged files
2. **ESLint** checks and fixes code issues
3. **Prettier** formats the code
4. **TypeScript** validates types
5. **Jest** runs tests related to changed files
6. Commit proceeds only if all checks pass ✅

## 🔄 CI/CD with CircleCI

The project includes a CircleCI configuration (`.circleci/config.yml`) that runs on every push:

### Pipeline Jobs:

1. **install-dependencies**: Install npm packages
2. **lint**: Run ESLint and Prettier checks
3. **type-check**: Verify TypeScript types
4. **test**: Run Jest tests with coverage
5. **deno-check**: Run Deno lint and format checks
6. **build**: Build Expo project

### Executors:

- **node-executor**: Node.js 20.18 for npm-based tasks
- **deno-executor**: Deno 2.1.4 for additional code quality checks

### Setting up CircleCI:

1. Connect your GitHub repository to CircleCI
2. Enable the project in CircleCI dashboard
3. Push code to trigger the pipeline
4. View results in CircleCI dashboard

## 📝 Writing Tests

Tests are located in `src/__tests__/` directory.

### Test Files:

- `test-utils.tsx` - Custom render with ThemeProvider wrapper
- `Button.test.tsx` - Button component tests (6 tests)
- `Input.test.tsx` - Input component tests (8 tests)
- `Card.test.tsx` - Card component tests (4 tests)
- `Header.test.tsx` - Header component tests (7 tests)
- `TodoItem.test.tsx` - TodoItem component tests (8 tests)
- `utils.test.ts` - Utility function tests (8 tests)

**Total: 41 tests passing ✅**

### Example Test:

```typescript
import { render, fireEvent } from './test-utils';
import { Button } from '../components';

test('calls onPress when pressed', () => {
  const onPressMock = jest.fn();
  const { getByText } = render(
    <Button title="Click Me" onPress={onPressMock} />
  );

  fireEvent.press(getByText('Click Me'));
  expect(onPressMock).toHaveBeenCalledTimes(1);
});
```

### Running Specific Tests:

```bash
npm test -- Button.test         # Run Button tests
npm test -- --coverage          # Run with coverage
npm test -- --watch             # Watch mode
npm test -- --verbose           # Detailed output
```

## 🔧 Troubleshooting

### ESLint Errors

- Run `npm run lint:fix` to auto-fix most issues
- Check `.eslintrc.js` for rule configuration
- Disable specific rules with inline comments if needed

### TypeScript Errors

- Run `npm run type-check` to see all type errors
- Fix issues in `tsconfig.json` for global settings

### Test Failures

- Check `jest.setup.js` for mock configurations
- Ensure all Firebase and native modules are mocked
- Use `--verbose` flag for detailed test output

### Pre-commit Hook Issues

- If hooks don't run, try: `npx husky install`
- Check `.husky/pre-commit` has execute permissions
- Use `git commit --no-verify` to bypass (not recommended)

## 📚 Further Reading

- [ESLint Documentation](https://eslint.org/docs/latest/)
- [Prettier Documentation](https://prettier.io/docs/en/index.html)
- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [CircleCI Documentation](https://circleci.com/docs/)

## 🎯 Best Practices

1. **Write tests** for all new features and bug fixes
2. **Run lint** before committing if you bypassed hooks
3. **Check coverage** - aim for >70% coverage on critical code
4. **Review CI/CD results** after pushing to ensure pipeline passes
5. **Keep dependencies updated** regularly for security
