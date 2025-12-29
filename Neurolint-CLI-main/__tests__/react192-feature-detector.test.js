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


const React192FeatureDetector = require('../scripts/react192-feature-detector');
const fs = require('fs').promises;
const path = require('path');

describe('React 19.2 Feature Detector', () => {
  let detector;
  let testDir;

  beforeEach(async () => {
    testDir = path.join(__dirname, 'fixtures', 'react192-test');
    await fs.mkdir(testDir, { recursive: true });
    detector = new React192FeatureDetector({ 
      verbose: false, 
      projectPath: testDir 
    });
  });

  afterEach(async () => {
    try {
      await fs.rm(testDir, { recursive: true, force: true });
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  describe('View Transitions Detection', () => {
    test('should detect framer-motion usage', async () => {
      await fs.writeFile(
        path.join(testDir, 'animation.tsx'),
        `import { motion } from 'framer-motion';
        
        export default function AnimatedComponent() {
          return (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Content
            </motion.div>
          );
        }`
      );
      
      const opportunities = await detector.detectViewTransitionOpportunities();
      
      expect(opportunities.length).toBeGreaterThan(0);
      expect(opportunities[0]).toMatchObject({
        type: 'view-transition',
        description: expect.stringContaining('View Transitions')
      });
    });

    test('should detect react-spring usage', async () => {
      await fs.writeFile(
        path.join(testDir, 'spring.tsx'),
        `import { useSpring, animated } from 'react-spring';
        
        export default function SpringComponent() {
          const props = useSpring({ opacity: 1, from: { opacity: 0 } });
          return <animated.div style={props}>Content</animated.div>;
        }`
      );
      
      const opportunities = await detector.detectViewTransitionOpportunities();
      
      expect(opportunities.length).toBeGreaterThan(0);
      expect(opportunities[0].type).toBe('view-transition');
    });

    test('should detect useTransition animation patterns', async () => {
      await fs.writeFile(
        path.join(testDir, 'transition.tsx'),
        `import { useTransition } from 'react-spring';
        
        export default function Component() {
          const transitions = useTransition(items, {
            from: { opacity: 0 },
            enter: { opacity: 1 }
          });
          return <div>{transitions((style, item) => <div style={style}>{item}</div>)}</div>;
        }`
      );
      
      const opportunities = await detector.detectViewTransitionOpportunities();
      
      expect(opportunities.length).toBeGreaterThan(0);
    });

    test('should detect navigation with animation', async () => {
      await fs.writeFile(
        path.join(testDir, 'nav.tsx'),
        `import { useRouter } from 'next/navigation';
        import { motion } from 'framer-motion';
        
        export default function Navigation() {
          const router = useRouter();
          
          const handleNavigate = () => {
            router.push('/page');
          };
          
          return <motion.button onClick={handleNavigate}>Navigate</motion.button>;
        }`
      );
      
      const opportunities = await detector.detectViewTransitionOpportunities();
      
      expect(opportunities.length).toBeGreaterThan(0);
      expect(opportunities[0].description).toContain('animation');
    });

    test('should not detect non-animation code', async () => {
      await fs.writeFile(
        path.join(testDir, 'static.tsx'),
        `export default function StaticComponent() {
          return <div>Static content without animations</div>;
        }`
      );
      
      const opportunities = await detector.detectViewTransitionOpportunities();
      
      expect(opportunities.length).toBe(0);
    });

    test('should include example code in opportunities', async () => {
      await fs.writeFile(
        path.join(testDir, 'anim.tsx'),
        `import { motion } from 'framer-motion';
        export default function Anim() { return <motion.div />; }`
      );
      
      const opportunities = await detector.detectViewTransitionOpportunities();
      
      expect(opportunities[0]).toHaveProperty('example');
      expect(opportunities[0].example).toContain('useTransition');
      expect(opportunities[0].example).toContain('startTransition');
    });
  });

  describe('useEffectEvent Detection', () => {
    test('should detect useEffect with callbacks', async () => {
      await fs.writeFile(
        path.join(testDir, 'effect.tsx'),
        `import { useEffect } from 'react';
        
        export default function Component({ onClick }) {
          useEffect(() => {
            onClick();
          }, []);
          
          return <div>Content</div>;
        }`
      );
      
      const opportunities = await detector.detectUseEffectEventOpportunities();
      
      expect(opportunities.length).toBeGreaterThan(0);
      expect(opportunities[0]).toMatchObject({
        type: 'use-effect-event',
        description: expect.stringContaining('useEffectEvent')
      });
    });

    test('should detect useEffect with handleClick pattern', async () => {
      await fs.writeFile(
        path.join(testDir, 'handler.tsx'),
        `import { useEffect } from 'react';
        
        export default function Component({ handleClick }) {
          useEffect(() => {
            handleClick('event');
          }, []);
          
          return <div>Content</div>;
        }`
      );
      
      const opportunities = await detector.detectUseEffectEventOpportunities();
      
      expect(opportunities.length).toBeGreaterThan(0);
      expect(opportunities[0].type).toBe('use-effect-event');
    });

    test('should detect eslint-disable exhaustive-deps', async () => {
      await fs.writeFile(
        path.join(testDir, 'eslint.tsx'),
        `import { useEffect } from 'react';
        
        export default function Component({ value }) {
          useEffect(() => {
            console.log(value);
          // eslint-disable-next-line react-hooks/exhaustive-deps
          }, []);
          
          return <div>Content</div>;
        }`
      );
      
      const opportunities = await detector.detectUseEffectEventOpportunities();
      
      expect(opportunities.length).toBeGreaterThan(0);
      expect(opportunities[0].description).toContain('non-reactive logic');
    });

    test('should detect onSubmit callbacks', async () => {
      await fs.writeFile(
        path.join(testDir, 'submit.tsx'),
        `import { useEffect } from 'react';
        
        export default function Form({ onSubmit }) {
          useEffect(() => {
            onSubmit();
          }, []);
          
          return <form>Form</form>;
        }`
      );
      
      const opportunities = await detector.detectUseEffectEventOpportunities();
      
      expect(opportunities.length).toBeGreaterThan(0);
    });

    test('should not detect regular useEffect without callbacks', async () => {
      await fs.writeFile(
        path.join(testDir, 'regular.tsx'),
        `import { useEffect, useState } from 'react';
        
        export default function Component() {
          const [count, setCount] = useState(0);
          
          useEffect(() => {
            setCount(c => c + 1);
          }, []);
          
          return <div>{count}</div>;
        }`
      );
      
      const opportunities = await detector.detectUseEffectEventOpportunities();
      
      expect(opportunities.length).toBe(0);
    });

    test('should include example code in opportunities', async () => {
      await fs.writeFile(
        path.join(testDir, 'example.tsx'),
        `import { useEffect } from 'react';
        export default function Component({ onClick }) {
          useEffect(() => { onClick(); }, []);
          return <div />;
        }`
      );
      
      const opportunities = await detector.detectUseEffectEventOpportunities();
      
      expect(opportunities[0]).toHaveProperty('example');
      expect(opportunities[0].example).toContain('useEffectEvent');
    });

    test('should only report one opportunity per file', async () => {
      await fs.writeFile(
        path.join(testDir, 'multiple.tsx'),
        `import { useEffect } from 'react';
        
        export default function Component({ onClick, onSubmit, handleClick }) {
          useEffect(() => {
            onClick();
          }, []);
          
          useEffect(() => {
            onSubmit();
          }, []);
          
          useEffect(() => {
            handleClick();
          }, []);
          
          return <div>Content</div>;
        }`
      );
      
      const opportunities = await detector.detectUseEffectEventOpportunities();
      
      expect(opportunities.length).toBe(1);
    });
  });

  describe('Activity Component Detection', () => {
    test('should detect display:none pattern', async () => {
      await fs.writeFile(
        path.join(testDir, 'hidden.tsx'),
        `export default function Component({ isVisible }) {
          return (
            <div style={{ display: "none" }}>
              Content
            </div>
          );
        }`
      );
      
      const opportunities = await detector.detectActivityOpportunities();
      
      expect(opportunities.length).toBeGreaterThan(0);
      expect(opportunities[0]).toMatchObject({
        type: 'activity',
        description: expect.stringContaining('Activity component')
      });
    });

    test('should detect conditional rendering with hidden', async () => {
      await fs.writeFile(
        path.join(testDir, 'conditional.tsx'),
        `export default function Component({ isVisible }) {
          return (
            <div>
              {isVisible ? <ExpensiveComponent /> : <div hidden>Placeholder</div>}
            </div>
          );
        }`
      );
      
      const opportunities = await detector.detectActivityOpportunities();
      
      expect(opportunities.length).toBeGreaterThan(0);
    });

    test('should detect hidden components with conditional rendering', async () => {
      await fs.writeFile(
        path.join(testDir, 'attr.tsx'),
        `export default function Component({ show }) {
          return (
            <div>
              {show ? <Content /> : <div hidden>Placeholder</div>}
            </div>
          );
        }`
      );
      
      const opportunities = await detector.detectActivityOpportunities();
      
      expect(opportunities.length).toBeGreaterThan(0);
      expect(opportunities[0].type).toBe('activity');
    });

    test('should not detect normal components', async () => {
      await fs.writeFile(
        path.join(testDir, 'normal.tsx'),
        `export default function Component() {
          return <div>Always visible content</div>;
        }`
      );
      
      const opportunities = await detector.detectActivityOpportunities();
      
      expect(opportunities.length).toBe(0);
    });

    test('should include example code in opportunities', async () => {
      await fs.writeFile(
        path.join(testDir, 'activity.tsx'),
        `export default function Component() {
          return <div style={{ display: "none" }}>Hidden</div>;
        }`
      );
      
      const opportunities = await detector.detectActivityOpportunities();
      
      expect(opportunities[0]).toHaveProperty('example');
      expect(opportunities[0].example).toContain('Activity');
      expect(opportunities[0].example).toContain('mode');
    });
  });

  describe('Full Detection', () => {
    test('should detect all three types of opportunities', async () => {
      await fs.writeFile(
        path.join(testDir, 'animation.tsx'),
        `import { motion } from 'framer-motion';
        export default function Anim() { return <motion.div />; }`
      );
      
      await fs.writeFile(
        path.join(testDir, 'effect.tsx'),
        `import { useEffect } from 'react';
        export default function Effect({ onClick }) {
          useEffect(() => { onClick(); }, []);
          return <div />;
        }`
      );
      
      await fs.writeFile(
        path.join(testDir, 'hidden.tsx'),
        `export default function Hidden() {
          return <div style={{ display: "none" }}>Content</div>;
        }`
      );
      
      const result = await detector.detect();
      
      expect(result.viewTransitions.length).toBeGreaterThan(0);
      expect(result.useEffectEvent.length).toBeGreaterThan(0);
      expect(result.activity.length).toBeGreaterThan(0);
      expect(result.total).toBe(3);
    });

    test('should calculate total correctly', async () => {
      await fs.writeFile(
        path.join(testDir, 'anim1.tsx'),
        `import { motion } from 'framer-motion';
        export default function A1() { return <motion.div />; }`
      );
      
      await fs.writeFile(
        path.join(testDir, 'anim2.tsx'),
        `import { useSpring } from 'react-spring';
        export default function A2() { const s = useSpring({}); return <div />; }`
      );
      
      const result = await detector.detect();
      
      expect(result.total).toBe(result.viewTransitions.length + 
                                 result.useEffectEvent.length + 
                                 result.activity.length);
    });

    test('should handle empty project gracefully', async () => {
      const result = await detector.detect();
      
      expect(result.viewTransitions).toEqual([]);
      expect(result.useEffectEvent).toEqual([]);
      expect(result.activity).toEqual([]);
      expect(result.total).toBe(0);
    });

    test('should include file paths in opportunities', async () => {
      await fs.writeFile(
        path.join(testDir, 'test-file.tsx'),
        `import { motion } from 'framer-motion';
        export default function Test() { return <motion.div />; }`
      );
      
      const result = await detector.detect();
      
      expect(result.viewTransitions[0]).toHaveProperty('file');
      expect(result.viewTransitions[0].file).toContain('test-file.tsx');
    });
  });

  describe('File Discovery', () => {
    test('should find TypeScript files', async () => {
      await fs.writeFile(
        path.join(testDir, 'component.tsx'),
        `import { motion } from 'framer-motion';
        export default function Component() { return <motion.div />; }`
      );
      
      const files = await detector.findSourceFiles();
      
      expect(files.some(f => f.endsWith('component.tsx'))).toBe(true);
    });

    test('should find JavaScript files', async () => {
      await fs.writeFile(
        path.join(testDir, 'component.jsx'),
        `import { motion } from 'framer-motion';
        export default function Component() { return <motion.div />; }`
      );
      
      const files = await detector.findSourceFiles();
      
      expect(files.some(f => f.endsWith('component.jsx'))).toBe(true);
    });

    test('should ignore node_modules', async () => {
      await fs.mkdir(path.join(testDir, 'node_modules', 'package'), { recursive: true });
      await fs.writeFile(
        path.join(testDir, 'node_modules', 'package', 'index.js'),
        'module.exports = {};'
      );
      
      const files = await detector.findSourceFiles();
      
      expect(files.some(f => f.includes('node_modules'))).toBe(false);
    });

    test('should ignore build directories', async () => {
      await fs.mkdir(path.join(testDir, '.next'), { recursive: true });
      await fs.mkdir(path.join(testDir, 'dist'), { recursive: true });
      await fs.writeFile(path.join(testDir, '.next', 'test.js'), 'test');
      await fs.writeFile(path.join(testDir, 'dist', 'test.js'), 'test');
      
      const files = await detector.findSourceFiles();
      
      expect(files.some(f => f.includes('.next'))).toBe(false);
      expect(files.some(f => f.includes('dist'))).toBe(false);
    });

    test('should find files in nested directories', async () => {
      await fs.mkdir(path.join(testDir, 'src', 'components', 'ui'), { recursive: true });
      await fs.writeFile(
        path.join(testDir, 'src', 'components', 'ui', 'button.tsx'),
        `import { motion } from 'framer-motion';
        export const Button = () => <motion.button />;`
      );
      
      const files = await detector.findSourceFiles();
      
      expect(files.some(f => f.endsWith('button.tsx'))).toBe(true);
    });
  });
});
