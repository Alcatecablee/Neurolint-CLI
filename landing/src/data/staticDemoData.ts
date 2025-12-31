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


export interface DemoScenario {
  id: string;
  title: string;
  description: string;
  beforeCode: string;
  afterCode: string;
  issues: Array<{
    type: string;
    severity: 'high' | 'medium' | 'low';
    description: string;
    fixedByLayer: number;
    ruleId: string;
  }>;
  layerBreakdown: Array<{
    layerId: number;
    name: string;
    issuesFound: number;
    fixes: string[];
  }>;
}

export const demoScenarios: DemoScenario[] = [
  {
    id: 'hydration',
    title: 'Hydration Error Fix',
    description: 'Adds typeof window guards to fix React hydration mismatches from browser API usage',
    beforeCode: `export default function UserProfile() {
  const userId = localStorage.getItem('userId');
  const width = window.innerWidth;
  const pathname = window.location.pathname;

  return (
    <div>
      <h1>User: {userId}</h1>
      <p>Width: {width}px</p>
      <p>Path: {pathname}</p>
    </div>
  );
}`,
    afterCode: `export default function UserProfile() {
  const userId = typeof window !== "undefined" ? localStorage.getItem('userId') : null;
  const width = typeof window !== "undefined" ? window.innerWidth : null;
  const pathname = typeof window !== "undefined" ? window.location.pathname : null;

  return (
    <div>
      <h1>User: {userId}</h1>
      <p>Width: {width}px</p>
      <p>Path: {pathname}</p>
    </div>
  );
}`,
    issues: [
      {
        type: 'hydration-risk',
        severity: 'high',
        description: 'Direct localStorage access causes hydration mismatch',
        fixedByLayer: 4,
        ruleId: 'hydration-browser-api'
      },
      {
        type: 'hydration-risk',
        severity: 'high',
        description: 'window.innerWidth accessed during render causes mismatch',
        fixedByLayer: 4,
        ruleId: 'hydration-window-api'
      },
      {
        type: 'hydration-risk',
        severity: 'high',
        description: 'window.location.pathname accessed during render causes mismatch',
        fixedByLayer: 4,
        ruleId: 'hydration-window-api'
      }
    ],
    layerBreakdown: [
      {
        layerId: 4,
        name: 'Hydration',
        issuesFound: 3,
        fixes: [
          'Added typeof window !== "undefined" guards for all browser API access',
          'Wrapped localStorage.getItem() in ternary with null fallback',
          'Wrapped window.innerWidth in ternary with null fallback',
          'Wrapped window.location.pathname in ternary with null fallback'
        ]
      }
    ]
  },
  {
    id: 'accessibility',
    title: 'Accessibility Improvements',
    description: 'Enhances component accessibility with ARIA labels and semantic HTML',
    beforeCode: `export function ProductCard({ product }) {
  return (
    <div onClick={() => buyProduct(product.id)}>
      <img src={product.image} />
      <div>{product.name}</div>
      <div>{product.price}</div>
      <div className="icon" onClick={handleFavorite}>
        ♥
      </div>
    </div>
  );
}`,
    afterCode: `export function ProductCard({ product }) {
  return (
    <article role="article">
      <button 
        onClick={() => buyProduct(product.id)}
        aria-label={\`Buy \${product.name}\`}
      >
        <img 
          src={product.image} 
          alt={product.name}
        />
        <h3>{product.name}</h3>
        <p aria-label={\`Price: \${product.price}\`}>
          {product.price}
        </p>
      </button>
      <button 
        className="icon" 
        onClick={handleFavorite}
        aria-label="Add to favorites"
      >
        <span aria-hidden="true">♥</span>
      </button>
    </article>
  );
}`,
    issues: [
      {
        type: 'accessibility',
        severity: 'high',
        description: 'Clickable div should be a button for keyboard navigation',
        fixedByLayer: 3,
        ruleId: 'a11y-interactive-element'
      },
      {
        type: 'accessibility',
        severity: 'high',
        description: 'Image missing alt text for screen readers',
        fixedByLayer: 3,
        ruleId: 'a11y-img-alt'
      },
      {
        type: 'accessibility',
        severity: 'medium',
        description: 'Button missing aria-label for context',
        fixedByLayer: 3,
        ruleId: 'a11y-button-label'
      },
      {
        type: 'accessibility',
        severity: 'medium',
        description: 'Use semantic HTML for better structure',
        fixedByLayer: 3,
        ruleId: 'a11y-semantic-html'
      }
    ],
    layerBreakdown: [
      {
        layerId: 3,
        name: 'Components',
        issuesFound: 4,
        fixes: [
          'Replaced div with semantic button elements',
          'Added descriptive aria-labels for all interactive elements',
          'Added alt text to images',
          'Used semantic article and heading tags'
        ]
      }
    ]
  },
  {
    id: 'performance',
    title: 'Performance Optimization',
    description: 'Optimizes re-renders and prevents memory leaks',
    beforeCode: `export function Dashboard({ data }) {
  const processedData = data.map(item => ({
    ...item,
    calculated: expensiveCalculation(item)
  }));

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUpdates();
    }, 1000);
  }, []);

  return (
    <div>
      {processedData.map(item => (
        <Card key={item.id} data={item} />
      ))}
    </div>
  );
}`,
    afterCode: `import { useMemo, useEffect, useCallback } from 'react';

export function Dashboard({ data }) {
  const processedData = useMemo(
    () => data.map(item => ({
      ...item,
      calculated: expensiveCalculation(item)
    })),
    [data]
  );

  const fetchUpdates = useCallback(() => {
    // fetch logic
  }, []);

  useEffect(() => {
    const interval = setInterval(fetchUpdates, 1000);
    return () => clearInterval(interval);
  }, [fetchUpdates]);

  return (
    <div>
      {processedData.map(item => (
        <Card key={item.id} data={item} />
      ))}
    </div>
  );
}`,
    issues: [
      {
        type: 'performance',
        severity: 'high',
        description: 'Expensive calculation runs on every render',
        fixedByLayer: 2,
        ruleId: 'perf-usememo-missing'
      },
      {
        type: 'memory-leak',
        severity: 'high',
        description: 'setInterval not cleaned up on unmount',
        fixedByLayer: 2,
        ruleId: 'memory-interval-cleanup'
      },
      {
        type: 'performance',
        severity: 'medium',
        description: 'Function recreated on every render in useEffect',
        fixedByLayer: 2,
        ruleId: 'perf-usecallback-missing'
      }
    ],
    layerBreakdown: [
      {
        layerId: 2,
        name: 'Patterns',
        issuesFound: 3,
        fixes: [
          'Wrapped expensive calculation in useMemo',
          'Added cleanup function to useEffect',
          'Used useCallback for stable function reference'
        ]
      }
    ]
  },
  {
    id: 'missing-keys',
    title: 'Missing Key Props',
    description: 'Automatically adds key props to mapped elements',
    beforeCode: `export function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li>
          <input type="checkbox" checked={todo.completed} />
          <span>{todo.title}</span>
        </li>
      ))}
    </ul>
  );
}

function TagList({ tags }) {
  return (
    <div>
      {tags.map(tag => <span className="tag">{tag}</span>)}
    </div>
  );
}`,
    afterCode: `export function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={todo.id || index}>
          <input type="checkbox" checked={todo.completed} />
          <span>{todo.title}</span>
        </li>
      ))}
    </ul>
  );
}

function TagList({ tags }) {
  return (
    <div>
      {tags.map((tag, index) => (
        <span key={index} className="tag">
          {tag}
        </span>
      ))}
    </div>
  );
}`,
    issues: [
      {
        type: 'react-key',
        severity: 'high',
        description: 'Missing key prop in list item inside .map()',
        fixedByLayer: 3,
        ruleId: 'react-missing-key'
      },
      {
        type: 'react-key',
        severity: 'high',
        description: 'Missing key prop in mapped span element',
        fixedByLayer: 3,
        ruleId: 'react-missing-key'
      }
    ],
    layerBreakdown: [
      {
        layerId: 3,
        name: 'Components',
        issuesFound: 2,
        fixes: [
          'Added key prop using unique ID when available',
          'Fallback to index when no unique identifier exists',
          'Added index parameter to map callback for key generation'
        ]
      }
    ]
  },
  {
    id: 'nextjs-migration',
    title: 'Next.js App Router Migration',
    description: 'Migrates Pages Router code to App Router patterns',
    beforeCode: `// pages/blog/[slug].js
import { useRouter } from 'next/router';
import Head from 'next/head';

export default function BlogPost({ post }) {
  const router = useRouter();
  
  if (router.isFallback) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <Head>
        <title>{post.title}</title>
        <meta name="description" content={post.excerpt} />
      </Head>
      <article>
        <h1>{post.title}</h1>
        <div>{post.content}</div>
      </article>
    </>
  );
}

export async function getStaticProps({ params }) {
  const post = await fetchPost(params.slug);
  return { props: { post } };
}`,
    afterCode: `// app/blog/[slug]/page.tsx
import { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default async function BlogPost({ params }: PageProps) {
  const post = await fetchPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
    </article>
  );
}`,
    issues: [
      {
        type: 'nextjs-migration',
        severity: 'high',
        description: 'Pages Router pattern needs migration to App Router',
        fixedByLayer: 5,
        ruleId: 'nextjs-app-router-migration'
      },
      {
        type: 'nextjs-migration',
        severity: 'high',
        description: 'getStaticProps replaced with Server Component data fetching',
        fixedByLayer: 5,
        ruleId: 'nextjs-data-fetching'
      },
      {
        type: 'nextjs-migration',
        severity: 'medium',
        description: 'Head component replaced with Metadata API',
        fixedByLayer: 5,
        ruleId: 'nextjs-metadata-api'
      },
      {
        type: 'nextjs-migration',
        severity: 'medium',
        description: 'useRouter hook removed (Server Component)',
        fixedByLayer: 5,
        ruleId: 'nextjs-server-component'
      }
    ],
    layerBreakdown: [
      {
        layerId: 5,
        name: 'Next.js Router',
        issuesFound: 4,
        fixes: [
          'Converted Pages Router file to App Router structure',
          'Replaced getStaticProps with async Server Component',
          'Migrated Head component to generateMetadata API',
          'Removed client-side router hooks from Server Component'
        ]
      }
    ]
  },
  {
    id: 'layer2-arrow-console',
    title: 'Layer 2: Console.log in Arrow Functions',
    description: 'AST-based transformation correctly handles console.log removal in all arrow function patterns',
    beforeCode: `const handler1 = () => console.log('test');
const handler2 = value => console.log(value);
const handler3 = (a, b) => console.log(a, b);
const handler4 = ({name}) => console.log(name);
const handler5 = () => {
  console.log('only statement');
};

function handleClick() {
  console.log('Button clicked');
  alert('Success!');
}`,
    afterCode: `const handler1 = () => {} /* [NeuroLint] Removed console.log: 'test'*/;
const handler2 = value => {} /* [NeuroLint] Removed console.log: value*/;
const handler3 = (a, b) => {} /* [NeuroLint] Removed console.log: a, b*/;
const handler4 = ({name}) => {} /* [NeuroLint] Removed console.log: name*/;
const handler5 = () => {
  // [NeuroLint] Removed console.log: 'only statement'
  ;
};

function handleClick() {
  // [NeuroLint] Removed console.log: 'Button clicked'
  ;
  // [NeuroLint] Replace with toast notification: 'Success!'
  ;
}`,
    issues: [
      {
        type: 'debug-code',
        severity: 'high',
        description: 'console.log in expression-bodied arrow function',
        fixedByLayer: 2,
        ruleId: 'pattern-console-removal'
      },
      {
        type: 'debug-code',
        severity: 'high',
        description: 'console.log with single parameter (no parentheses) arrow',
        fixedByLayer: 2,
        ruleId: 'pattern-console-removal'
      },
      {
        type: 'debug-code',
        severity: 'high',
        description: 'console.log in block-bodied arrow function',
        fixedByLayer: 2,
        ruleId: 'pattern-console-removal'
      },
      {
        type: 'anti-pattern',
        severity: 'medium',
        description: 'alert() should use toast notification instead',
        fixedByLayer: 2,
        ruleId: 'pattern-alert-replacement'
      }
    ],
    layerBreakdown: [
      {
        layerId: 2,
        name: 'Patterns',
        issuesFound: 4,
        fixes: [
          'AST-based console.log removal preserves valid JavaScript syntax',
          'Handles all arrow function patterns: no params, single param, multi-param, destructured',
          'Expression-bodied arrows convert to empty block: () => {} /* comment */',
          'Block-bodied arrows add EmptyStatement with leading comment and semicolon',
          'Expression contexts (ternary, logical) replace with undefined',
          'Suggests toast notification over alert for better UX'
        ]
      }
    ]
  },
  {
    id: 'layer2-createfactory',
    title: 'Layer 2: React.createFactory Migration',
    description: 'Converts React.createFactory to JSX components (removed in React 19)',
    beforeCode: `import React from 'react';

const divFactory = React.createFactory('div');
const buttonFactory = React.createFactory('button');
const spanFactory = createFactory('span');

function OldComponent() {
  return divFactory(
    { className: 'container' },
    buttonFactory(
      { onClick: handleClick },
      'Click me'
    ),
    spanFactory(null, 'Text')
  );
}`,
    afterCode: `import React from 'react';

const divFactory = (props) => <div {...props} />;
const buttonFactory = (props) => <button {...props} />;
const spanFactory = (props) => <span {...props} />;

function OldComponent() {
  return divFactory(
    { className: 'container' },
    buttonFactory(
      { onClick: handleClick },
      'Click me'
    ),
    spanFactory(null, 'Text')
  );
}`,
    issues: [
      {
        type: 'react19-breaking',
        severity: 'high',
        description: 'React.createFactory is removed in React 19',
        fixedByLayer: 2,
        ruleId: 'react19-createfactory'
      }
    ],
    layerBreakdown: [
      {
        layerId: 2,
        name: 'Patterns',
        issuesFound: 1,
        fixes: [
          'Converted React.createFactory to JSX component functions',
          'Maintains props spreading for compatibility',
          'Works with both React.createFactory and standalone createFactory'
        ]
      }
    ]
  },
  {
    id: 'layer4-deep-nesting',
    title: 'Layer 4: Deep Nesting SSR Guards',
    description: 'Handles deeply nested browser API access with SSR safety',
    beforeCode: `function GeoTracking() {
  const [position, setPosition] = useState(null);
  
  useEffect(() => {
    window.navigator.geolocation.watchPosition = (pos) => {
      setPosition(pos);
    };
    
    document.body.firstElementChild.textContent = 'Tracking...';
  }, []);

  const width = window.innerWidth;
  const theme = localStorage.getItem('theme');
  
  return <div>{position ? 'Located' : 'Locating...'}</div>;
}`,
    afterCode: `function GeoTracking() {
  const [position, setPosition] = useState(null);
  
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.navigator.geolocation.watchPosition = (pos) => {
        setPosition(pos);
      };
    }
    
    if (typeof document !== "undefined") {
      document.body.firstElementChild.textContent = 'Tracking...';
    }
  }, []);

  const width = typeof window !== "undefined" ? window.innerWidth : null;
  const theme = typeof window !== "undefined" ? localStorage.getItem('theme') : null;
  
  return <div>{position ? 'Located' : 'Locating...'}</div>;
}`,
    issues: [
      {
        type: 'hydration-risk',
        severity: 'high',
        description: 'Deep nested window.navigator.geolocation access without SSR guard',
        fixedByLayer: 4,
        ruleId: 'hydration-deep-nesting'
      },
      {
        type: 'hydration-risk',
        severity: 'high',
        description: 'Deep nested document.body access without SSR guard',
        fixedByLayer: 4,
        ruleId: 'hydration-deep-nesting'
      },
      {
        type: 'hydration-risk',
        severity: 'high',
        description: 'window.innerWidth accessed during render',
        fixedByLayer: 4,
        ruleId: 'hydration-window-api'
      }
    ],
    layerBreakdown: [
      {
        layerId: 4,
        name: 'Hydration',
        issuesFound: 3,
        fixes: [
          'Added typeof window guards for deeply nested navigator.geolocation',
          'Added typeof document guards for deeply nested body.firstElementChild',
          'Wrapped window.innerWidth in ternary with null fallback',
          'Handles arbitrary depth member expressions via getRootGlobalName() helper'
        ]
      }
    ]
  },
  {
    id: 'layer5-createroot',
    title: 'Layer 5: ReactDOM.render to createRoot',
    description: 'Converts multiple ReactDOM.render calls with unique variable names (React 19)',
    beforeCode: `import ReactDOM from 'react-dom';
import App from './App';
import Dashboard from './Dashboard';

ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<Dashboard />, document.getElementById('dashboard'));
ReactDOM.render(<App />, document.getElementById('app'));`,
    afterCode: `import ReactDOM from 'react-dom';
import { createRoot } from 'react-dom/client';
import App from './App';
import Dashboard from './Dashboard';

const root = createRoot(typeof document !== "undefined" ? document.getElementById('root') : null);
root.render(<App />);
const root1 = createRoot(typeof document !== "undefined" ? document.getElementById('dashboard') : null);
root1.render(<Dashboard />);
const root2 = createRoot(typeof document !== "undefined" ? document.getElementById('app') : null);
root2.render(<App />);`,
    issues: [
      {
        type: 'react19-breaking',
        severity: 'high',
        description: 'ReactDOM.render is removed in React 19',
        fixedByLayer: 5,
        ruleId: 'react19-createroot'
      },
      {
        type: 'naming-conflict',
        severity: 'high',
        description: 'Multiple ReactDOM.render calls would create duplicate variable names',
        fixedByLayer: 5,
        ruleId: 'react19-unique-root-vars'
      }
    ],
    layerBreakdown: [
      {
        layerId: 5,
        name: 'Next.js Router',
        issuesFound: 2,
        fixes: [
          'Converted ReactDOM.render to createRoot API',
          'Generated unique variable names: root, root1, root2',
          'Added automatic import of createRoot from react-dom/client',
          'Applied SSR guards to document.getElementById() calls',
          'Prevents variable redeclaration errors'
        ]
      }
    ]
  },
  {
    id: 'layer5-hydrateroot',
    title: 'Layer 5: ReactDOM.hydrate to hydrateRoot',
    description: 'Converts ReactDOM.hydrate with correct parameter order (React 19)',
    beforeCode: `import ReactDOM from 'react-dom';
import App from './App';

ReactDOM.hydrate(
  <App />,
  document.getElementById('root')
);`,
    afterCode: `import ReactDOM from 'react-dom';
import { hydrateRoot } from 'react-dom/client';
import App from './App';

hydrateRoot(
  typeof document !== "undefined" ? document.getElementById('root') : null,
  <App />
);`,
    issues: [
      {
        type: 'react19-breaking',
        severity: 'high',
        description: 'ReactDOM.hydrate is removed in React 19',
        fixedByLayer: 5,
        ruleId: 'react19-hydrateroot'
      },
      {
        type: 'parameter-order',
        severity: 'high',
        description: 'hydrateRoot has different parameter order than ReactDOM.hydrate',
        fixedByLayer: 5,
        ruleId: 'react19-hydrateroot-params'
      }
    ],
    layerBreakdown: [
      {
        layerId: 5,
        name: 'Next.js Router',
        issuesFound: 2,
        fixes: [
          'Converted ReactDOM.hydrate to hydrateRoot API',
          'Fixed parameter order: hydrateRoot(container, element) vs hydrate(element, container)',
          'Added automatic import of hydrateRoot from react-dom/client',
          'Applied SSR guard to document.getElementById()'
        ]
      }
    ]
  },
  {
    id: 'layer5-use-client',
    title: 'Layer 5: Automatic \'use client\' Directive',
    description: 'Detects hooks and browser APIs to add Client Component directive',
    beforeCode: `import { useState, useEffect } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
  }, []);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`,
    afterCode: `'use client';

import { useState, useEffect } from 'react';

export default function Counter() {
  const [count, setCount] = useState(0);
  const [theme, setTheme] = useState('light');
  
  useEffect(() => {
    const saved = localStorage.getItem('theme');
    if (saved) setTheme(saved);
  }, []);
  
  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}`,
    issues: [
      {
        type: 'nextjs-app-router',
        severity: 'high',
        description: 'Component uses React hooks (useState, useEffect) but missing \'use client\'',
        fixedByLayer: 5,
        ruleId: 'nextjs-use-client-hooks'
      },
      {
        type: 'nextjs-app-router',
        severity: 'high',
        description: 'Component uses browser API (localStorage) but missing \'use client\'',
        fixedByLayer: 5,
        ruleId: 'nextjs-use-client-browser-api'
      },
      {
        type: 'nextjs-app-router',
        severity: 'high',
        description: 'Component has onClick event handler but missing \'use client\'',
        fixedByLayer: 5,
        ruleId: 'nextjs-use-client-events'
      }
    ],
    layerBreakdown: [
      {
        layerId: 5,
        name: 'Next.js Router',
        issuesFound: 3,
        fixes: [
          'Added \'use client\' directive at top of file',
          'Detected React hooks: useState, useEffect',
          'Detected browser API: localStorage',
          'Detected event handler: onClick',
          'Proper directive placement after imports'
        ]
      }
    ]
  }
];
