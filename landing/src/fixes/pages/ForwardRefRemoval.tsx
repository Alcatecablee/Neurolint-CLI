import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import { ProblemBadge } from "../components/ProblemBadge";
import { TLDRCommandCard } from "../components/TLDRCommandCard";
import { CompetitorCompare } from "../components/CompetitorCompare";
import { CodeBlock } from "../../docs/components/CodeBlock";
import { Callout } from "../../docs/components/Callout";

export function ForwardRefRemoval() {
  return (
    <article className="py-12 md:py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link
          to="/fixes"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fixes
        </Link>

        <div className="flex flex-wrap items-center gap-6 mb-6">
          <ProblemBadge type="deprecated" tool="React 19" />
          <span className="inline-flex items-center gap-2 text-xs font-bold text-purple-400 uppercase tracking-widest">
            <span className="w-6 h-px bg-purple-500/30"></span>
            <Search className="w-3.5 h-3.5" />
            2,200/mo searches
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Remove forwardRef Wrapper
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          React 19 passes <code className="text-blue-400">ref</code> as a regular prop. 
          NeuroLint removes <code className="text-red-400">forwardRef</code> wrappers and cleans up imports.
        </p>

        <TLDRCommandCard
          command="npx @neurolint/cli fix . --layer=3"
          description="Auto-convert forwardRef components to direct ref props. Removes unused forwardRef imports."
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">The Change</h2>
          <p className="text-gray-300">
            In React 18 and earlier, you needed <code className="text-blue-400">forwardRef</code> to pass refs to child components.
            React 19 removes this requirement—ref is now a regular prop.
          </p>
          
          <CodeBlock
            code={`// React 18 - Required forwardRef
const Input = forwardRef((props, ref) => {
  return <input ref={ref} {...props} />;
});

// React 19 - ref is a regular prop
const Input = ({ ref, ...props }) => {
  return <input ref={ref} {...props} />;
};`}
            language="jsx"
            filename="The difference"
          />

          <Callout type="info" title="Why This Change">
            <p>
              forwardRef was always a workaround for a limitation in React's prop system.
              With React 19, this limitation is removed, making ref work like any other prop.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">What NeuroLint Does</h2>
        </section>

        <CompetitorCompare
          competitorName="react-codemod"
          rows={[
            { feature: "Remove forwardRef wrapper", competitor: "yes", neurolint: "yes" },
            { feature: "Clean up forwardRef import", competitor: "yes", neurolint: "yes" },
            { feature: "Handle TypeScript generics", competitor: "yes", neurolint: "yes" },
            { feature: "Integrated with other fixes", competitor: "no", competitorNote: "Separate command", neurolint: "yes" },
          ]}
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">TypeScript Components</h2>
          <p className="text-gray-300">
            NeuroLint handles TypeScript generics in forwardRef components:
          </p>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">Before</h3>
          <CodeBlock
            code={`import { forwardRef } from 'react';

interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', children }, ref) => {
    return (
      <button ref={ref} className={variant}>
        {children}
      </button>
    );
  }
);`}
            language="tsx"
            filename="Button.tsx"
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">After</h3>
          <CodeBlock
            code={`interface ButtonProps {
  variant?: 'primary' | 'secondary';
  children: React.ReactNode;
  ref?: React.Ref<HTMLButtonElement>;
}

const Button = ({ variant = 'primary', children, ref }: ButtonProps) => {
  return (
    <button ref={ref} className={variant}>
      {children}
    </button>
  );
};`}
            language="tsx"
            filename="Button.tsx"
            highlightLines={[4, 7]}
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Import Cleanup</h2>
          <p className="text-gray-300">
            NeuroLint removes the forwardRef import if it is no longer used:
          </p>

          <CodeBlock
            code={`// Before
import { forwardRef, useState } from 'react';

// After (forwardRef removed if no longer used)
import { useState } from 'react';`}
            language="jsx"
            filename="Import cleanup"
          />

          <Callout type="success" title="Verified in Source Code">
            <p>
              The forwardRef conversion is in <code>scripts/fix-layer-3-components.js</code> lines 254-289. 
              It handles both JavaScript and TypeScript with generic parameters.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Run It Now</h2>
          <CodeBlock
            code={`# Remove forwardRef wrappers and clean up imports
npx @neurolint/cli fix . --layer=3

# Preview changes without applying
npx @neurolint/cli fix . --layer=3 --dry-run

# Run Layer 5 for complete React 19 migration
npx @neurolint/cli fix . --layer=5`}
            language="bash"
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Related Fixes</h2>
          <div className="flex flex-wrap gap-3 my-6">
            <Link
              to="/fixes/react-19-migration"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              React 19 breaking changes
            </Link>
            <Link
              to="/fixes/react-keys-auto-fix"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              Auto-fix missing React keys
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
