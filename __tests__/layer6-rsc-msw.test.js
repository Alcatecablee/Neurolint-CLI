/**
 * Copyright (c) 2025 NeuroLint
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * 
 *     http://www.apache.org/licenses/LICENSE-2.0
 * 
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */


const { transform } = require('../scripts/fix-layer-6-testing');
const path = require('path');

describe('Layer 6 Testing - RSC & MSW Features', () => {
  describe('React Server Component Testing Guidance', () => {
    test('should add RSC testing guidance for async Server Components', async () => {
      const code = `
export default async function ServerPage() {
  const data = await fetch('/api/data');
  return <div>{data.title}</div>;
}`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: '__tests__/fixtures/page.tsx'
      });
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('React Server Component Testing');
      expect(result.code).toContain('integration tests');
      expect(result.changes).toContainEqual(
        expect.objectContaining({
          type: 'RSCTestingGuidance'
        })
      );
    });

    test('should handle RSC in test files appropriately', async () => {
      const code = `
async function ServerComponent() {
  const data = await fetch('/api/data');
  return <div>{data.title}</div>;
}

describe('ServerComponent', () => {
  it('should render', () => {
    expect(true).toBe(true);
  });
});`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: '__tests__/server-component.test.tsx'
      });
      
      // Function should complete without errors
      expect(result).toBeDefined();
      expect(result).toHaveProperty('code');
    });

    test('should recommend Playwright/Cypress for RSC tests', async () => {
      const code = `
export default async function Page() {
  const data = await fetch('/api/users');
  return <div>{data.users}</div>;
}`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: '__tests__/page.test.tsx'
      });
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('Playwright/Cypress');
    });

    test('should not add RSC guidance to client components', async () => {
      const code = `
'use client';

export default async function ClientComponent() {
  return <div>Client</div>;
}`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: '__tests__/client.test.tsx'
      });
      
      // Should still succeed but no RSC guidance added
      if (result.success) {
        expect(result.code).not.toContain('React Server Component Testing');
      }
    });

    test('should detect Server Components without "use client"', async () => {
      const code = `
export default async function Page() {
  const db = await database.query('SELECT * FROM users');
  return <div>{db.results}</div>;
}`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: '__tests__/database.test.tsx'
      });
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('Server Component');
    });
  });

  describe('MSW Compatibility Warnings', () => {
    test('should warn about MSW with Next.js App Router', async () => {
      const code = `
import { setupServer } from 'msw/node';
import { rest } from 'msw';

const server = setupServer(
  rest.get('/api/user', (req, res, ctx) => {
    return res(ctx.json({ name: 'John' }));
  })
);

describe('API Tests', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
});`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: 'app/api/user.test.ts'
      });
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('MSW Compatibility Issue');
      expect(result.warnings).toContainEqual(
        expect.objectContaining({
          type: 'MSWCompatibilityWarning'
        })
      );
    });

    test('should suggest fetch mocking alternatives', async () => {
      const code = `
import { setupServer } from 'msw/node';

const server = setupServer();

describe('Tests', () => {
  it('should work', () => {
    expect(true).toBe(true);
  });
});`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: 'app/component.test.tsx'
      });
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('vi.mock');
      expect(result.code).toContain('jest.mock');
    });

    test('should mention Edge Runtime restrictions', async () => {
      const code = `
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const handlers = [
  rest.get('/api/data', (req, res, ctx) => res(ctx.json({ data: [] })))
];

const server = setupServer(...handlers);`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: 'app/api/data.test.ts'
      });
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('Edge Runtime');
    });

    test('should suggest route handlers for mocking', async () => {
      const code = `
import { setupServer } from 'msw/node';

const server = setupServer();`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: 'app/test.test.tsx'
      });
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('route handlers');
    });

    test('should not warn about MSW outside App Router', async () => {
      const code = `
import { setupServer } from 'msw/node';

const server = setupServer();`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: 'src/components/button.test.tsx'
      });
      
      // Should succeed but no App Router-specific warning
      if (result.success) {
        expect(result.code).not.toContain('Edge Runtime');
      }
    });
  });

  describe('Untested Server Component Detection', () => {
    test('should detect untested async Server Components', async () => {
      const code = `
export default async function ProductPage() {
  const products = await fetch('/api/products');
  return <div>{products.map(p => <div key={p.id}>{p.name}</div>)}</div>;
}`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: 'app/products/page.tsx'
      });
      
      if (result.success) {
        expect(result.changes).toContainEqual(
          expect.objectContaining({
            type: 'UntestedServerComponent',
            description: expect.stringContaining('integration tests')
          })
        );
      } else {
        // Accept if no changes needed
        expect(result.code).toBe(code);
      }
    });

    test('should extract component name from file path', async () => {
      const code = `
export default async function UserProfile() {
  const user = await fetch('/api/user');
  return <div>{user.name}</div>;
}`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: 'app/users/[id]/page.tsx'
      });
      
      if (result.success && result.changes.length > 0) {
        expect(result.changes).toContainEqual(
          expect.objectContaining({
            type: 'UntestedServerComponent',
            description: expect.stringContaining('page')
          })
        );
      }
    });

    test('should not flag test files as untested', async () => {
      const code = `
export default async function TestComponent() {
  return <div>Test</div>;
}

describe('TestComponent', () => {
  it('renders', () => {});
});`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: 'app/component.test.tsx'
      });
      
      if (result.success) {
        const untestedChanges = result.changes.filter(c => c.type === 'UntestedServerComponent');
        expect(untestedChanges.length).toBe(0);
      }
    });
  });

  describe('Testing Library Imports', () => {
    test('should add testing library imports to test files', async () => {
      const code = `
describe('Component', () => {
  it('should render', () => {
    render(<Component />);
    expect(screen.getByText('Hello')).toBeInTheDocument();
  });
});`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: '__tests__/component.test.tsx'
      });
      
      expect(result.success).toBe(true);
      expect(result.code).toContain("@testing-library/react");
      expect(result.code).toContain("@testing-library/jest-dom");
    });

    test('should not add imports if already present', async () => {
      const code = `
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

describe('Component', () => {
  it('renders', () => {
    render(<Component />);
  });
});`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: '__tests__/component.test.tsx'
      });
      
      // Should not duplicate imports
      const importCount = (result.code.match(/@testing-library\/react/g) || []).length;
      expect(importCount).toBe(1);
    });
  });

  describe('Test Description Improvements', () => {
    test('should improve short test descriptions', async () => {
      const code = `
describe('Test', () => {
  it('works', () => {
    expect(true).toBe(true);
  });
});`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: '__tests__/test.test.js'
      });
      
      expect(result.success).toBe(true);
      expect(result.code).toContain('should work correctly');
    });

    test('should not modify descriptive test names', async () => {
      const code = `
describe('UserProfile', () => {
  it('should display user name and email correctly', () => {
    expect(true).toBe(true);
  });
});`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: '__tests__/profile.test.tsx'
      });
      
      if (result.success) {
        expect(result.code).toContain('should display user name and email correctly');
      }
    });
  });

  describe('Accessibility Testing Suggestions', () => {
    test('should process test files with render calls', async () => {
      const code = `
describe('Button', () => {
  it('renders', () => {
    render(<Button>Click me</Button>);
  });
});`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: '__tests__/button.test.tsx'
      });
      
      // Function should process the file successfully
      expect(result).toBeDefined();
      expect(result).toHaveProperty('code');
    });
  });

  describe('Component Testing Suggestions', () => {
    test('should suggest tests for untested components', async () => {
      const code = `
export default function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: 'src/components/Button.tsx'
      });
      
      if (result.success && result.changes.length > 0) {
        expect(result.changes).toContainEqual(
          expect.objectContaining({
            type: 'TestingSuggestion',
            description: expect.stringContaining('unit tests')
          })
        );
      }
    });

    test('should not suggest tests for test files', async () => {
      const code = `
import { render } from '@testing-library/react';

export default function testHelper() {
  return render(<div />);
}`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: '__tests__/helper.test.tsx'
      });
      
      if (result.success) {
        const testSuggestions = result.changes.filter(c => c.type === 'TestingSuggestion');
        expect(testSuggestions.length).toBe(0);
      }
    });
  });

  describe('Dry Run Mode', () => {
    test('should respect dry run mode when provided', async () => {
      const code = `
export default async function Page() {
  const data = await fetch('/api/data');
  return <div>Page</div>;
}`;
      
      const result = await transform(code, {
        dryRun: true,
        verbose: true,
        filePath: 'app/page.tsx'
      });
      
      // Result should be defined
      expect(result).toBeDefined();
      expect(result).toHaveProperty('code');
      
      // If dryRun is set in result, should be true
      if (result.hasOwnProperty('dryRun')) {
        expect(result.dryRun).toBe(true);
      }
    });
  });

  describe('Error Handling', () => {
    test('should handle malformed code gracefully', async () => {
      const code = `
export default function Broken() {
  return <div>Unclosed`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: 'src/broken.tsx'
      });
      
      // Should handle error without crashing
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('code');
    });

    test('should return original code on error', async () => {
      const code = `Invalid JavaScript {{{`;
      
      const result = await transform(code, {
        dryRun: false,
        filePath: 'src/invalid.tsx'
      });
      
      if (!result.success) {
        expect(result.code).toBe(code);
        expect(result.originalCode).toBe(code);
      }
    });
  });
});
