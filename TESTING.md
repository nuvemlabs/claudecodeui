# Testing Guide

This document describes the testing setup and practices for the Claude Code UI project.

## Testing Stack

- **Vitest** - Fast unit test framework that works seamlessly with Vite
- **@testing-library/react** - Testing utilities for React components
- **@testing-library/jest-dom** - Custom matchers for DOM elements
- **Supertest** - HTTP assertion library for testing Express endpoints
- **jsdom** - JavaScript implementation of web standards for testing

## Running Tests

```bash
# Run all tests once
npm run test:run

# Run tests in watch mode (re-runs on file changes)
npm run test:watch

# Run tests with UI interface
npm run test:ui

# Run tests with coverage report
npm run test:coverage

# Run tests continuously in development
npm test
```

## Test Structure

```
project/
├── src/
│   ├── components/
│   │   └── *.test.jsx       # Component tests
│   ├── utils/
│   │   └── *.test.js        # Utility function tests
│   ├── lib/
│   │   └── *.test.js        # Library tests
│   ├── integration/
│   │   └── *.test.jsx       # Integration tests
│   └── test/
│       └── setup.js          # Test setup and global mocks
└── server/
    └── test/
        └── *.test.js         # Server/API tests
```

## Writing Tests

### Component Tests

Test React components using `@testing-library/react`:

```javascript
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

describe('MyComponent', () => {
  it('should render correctly', () => {
    render(<MyComponent title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });

  it('should handle user interactions', () => {
    const handleClick = vi.fn();
    render(<MyComponent onClick={handleClick} />);

    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledOnce();
  });
});
```

### API/Server Tests

Test Express endpoints using Supertest:

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';

describe('API Endpoints', () => {
  let app;

  beforeEach(() => {
    app = express();
    // Setup routes
  });

  it('should return data', async () => {
    const response = await request(app)
      .get('/api/data')
      .expect(200);

    expect(response.body).toHaveProperty('data');
  });
});
```

### Utility Function Tests

Test pure functions and utilities:

```javascript
import { describe, it, expect } from 'vitest';
import { formatDate, parseQuery } from './utils';

describe('Utility Functions', () => {
  it('should format date correctly', () => {
    const result = formatDate(new Date('2024-01-01'));
    expect(result).toBe('January 1, 2024');
  });
});
```

## Mocking

### Mocking Modules

```javascript
// Mock an entire module
vi.mock('./api', () => ({
  fetchData: vi.fn().mockResolvedValue({ data: 'test' })
}));

// Partial mock with original implementation
vi.mock('./utils', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    specificFunction: vi.fn()
  };
});
```

### Mocking Browser APIs

Browser APIs are pre-mocked in `src/test/setup.js`:
- `window.matchMedia`
- `IntersectionObserver`
- `ResizeObserver`
- `localStorage`
- `fetch`

## Best Practices

### 1. Test Organization
- Group related tests using `describe` blocks
- Use clear, descriptive test names
- Keep tests focused on a single behavior

### 2. Test Data
- Use realistic test data
- Create reusable test fixtures
- Clean up after each test

### 3. Assertions
- Test the behavior, not implementation details
- Use appropriate matchers for clarity
- Test both success and error cases

### 4. Async Testing
```javascript
// Use async/await for async operations
it('should fetch data', async () => {
  const data = await fetchData();
  expect(data).toBeDefined();
});

// Use waitFor for DOM updates
it('should update after fetch', async () => {
  render(<AsyncComponent />);

  await waitFor(() => {
    expect(screen.getByText('Loaded')).toBeInTheDocument();
  });
});
```

### 5. Coverage Goals
- Aim for meaningful coverage, not 100%
- Focus on critical paths and edge cases
- Test error handling and validation

## Debugging Tests

### Run Single Test File
```bash
npm run test:run src/utils/api.test.js
```

### Debug in VS Code
Add to `.vscode/launch.json`:
```json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Tests",
  "program": "${workspaceFolder}/node_modules/vitest/vitest.mjs",
  "args": ["run", "${file}"],
  "console": "integratedTerminal"
}
```

### Use Test UI
```bash
npm run test:ui
```
Opens a browser interface for interactive test exploration.

## Continuous Integration

Tests should be run in CI/CD pipeline:

```yaml
# Example GitHub Actions workflow
- name: Run Tests
  run: |
    npm ci
    npm run test:run
    npm run test:coverage
```

## Common Issues and Solutions

### Issue: Component not rendering
**Solution:** Check if all required providers are included in the test

### Issue: Mock not working
**Solution:** Ensure mock is defined before component import

### Issue: Async test timing out
**Solution:** Increase timeout or check for unresolved promises

### Issue: Test environment errors
**Solution:** Check that jsdom is properly configured in vitest.config.js

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Library Documentation](https://testing-library.com/)
- [Supertest Documentation](https://github.com/ladjs/supertest)
- [Jest DOM Matchers](https://github.com/testing-library/jest-dom)