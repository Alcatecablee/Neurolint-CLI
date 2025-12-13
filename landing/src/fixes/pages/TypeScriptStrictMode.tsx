import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import { ProblemBadge } from "../components/ProblemBadge";
import { TLDRCommandCard } from "../components/TLDRCommandCard";
import { CompetitorCompare } from "../components/CompetitorCompare";
import { CodeBlock } from "../../docs/components/CodeBlock";
import { Callout } from "../../docs/components/Callout";

export function TypeScriptStrictMode() {
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

        <div className="mb-6">
          <ProblemBadge type="limitation" tool="tsconfig" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          TypeScript Strict Mode Setup
        </h1>
        <p className="text-lg text-gray-400 mb-8">
          <code className="text-blue-400">strict: true</code> only enables 7 flags.
          NeuroLint enables <strong className="text-white">17 strictness flags</strong> automatically, 
          including ones that catch real bugs in production.
        </p>

        <TLDRCommandCard
          command="npx @neurolint/cli fix . --layer=1"
          description="Auto-configure 17 TypeScript strict flags optimized for Next.js 15.5. Creates backups before changes."
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">The Problem</h2>
          <p className="text-gray-300">
            Most developers think <code className="text-blue-400">strict: true</code> is enough. 
            It enables these 7 flags:
          </p>
          
          <CodeBlock
            code={`// What strict: true actually enables (only 7 flags)
{
  "compilerOptions": {
    "strict": true
    // Equivalent to:
    // "noImplicitAny": true,
    // "strictNullChecks": true,
    // "strictFunctionTypes": true,
    // "strictBindCallApply": true,
    // "strictPropertyInitialization": true,
    // "noImplicitThis": true,
    // "alwaysStrict": true
  }
}`}
            language="json"
            filename="tsconfig.json"
          />

          <p className="text-gray-300">
            But TypeScript has <strong className="text-white">10 additional strictness flags</strong> that catch 
            real bugs <code className="text-blue-400">strict: true</code> misses.
          </p>

          <Callout type="info" title="What strict: true Misses">
            <p>
              Flags like <code>noUncheckedIndexedAccess</code> catch array/object index bugs. 
              <code>exactOptionalPropertyTypes</code> catches undefined vs missing property issues.
              These are not included in <code>strict: true</code>.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">What NeuroLint Enables</h2>
        </section>

        <CompetitorCompare
          competitorName="strict: true"
          rows={[
            { feature: "noImplicitAny", competitor: "yes", neurolint: "yes" },
            { feature: "strictNullChecks", competitor: "yes", neurolint: "yes" },
            { feature: "noUncheckedIndexedAccess", competitor: "no", neurolint: "yes", neurolintNote: "Catches array bugs" },
            { feature: "exactOptionalPropertyTypes", competitor: "no", neurolint: "yes" },
            { feature: "noPropertyAccessFromIndexSignature", competitor: "no", neurolint: "yes" },
            { feature: "noImplicitOverride", competitor: "no", neurolint: "yes" },
            { feature: "useUnknownInCatchVariables", competitor: "no", neurolint: "yes" },
          ]}
        />

        <section className="prose prose-invert max-w-none">
          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">All 17 Flags Enabled</h2>
          <p className="text-gray-300">
            NeuroLint Layer 1 enables these 17 flags in your tsconfig.json:
          </p>

          <CodeBlock
            code={`{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "useUnknownInCatchVariables": true,
    "alwaysStrict": true,
    "noPropertyAccessFromIndexSignature": true,
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler"
  }
}`}
            language="json"
            filename="tsconfig.json"
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">What These Flags Catch</h2>

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">noUncheckedIndexedAccess</h3>
          <p className="text-gray-300">
            Catches array access bugs that cause runtime errors:
          </p>

          <CodeBlock
            code={`const users = ["Alice", "Bob"];

// Without noUncheckedIndexedAccess:
const third = users[2]; // TypeScript thinks this is string
third.toUpperCase(); // Runtime error: Cannot read 'toUpperCase' of undefined

// With noUncheckedIndexedAccess:
const third = users[2]; // TypeScript knows this is string | undefined
third.toUpperCase(); // Error: 'third' is possibly undefined`}
            language="typescript"
            filename="Array access bug"
          />

          <h3 className="text-xl font-semibold text-white mt-8 mb-4">exactOptionalPropertyTypes</h3>
          <p className="text-gray-300">
            Distinguishes between missing properties and undefined values:
          </p>

          <CodeBlock
            code={`interface User {
  name: string;
  email?: string; // Optional
}

// Without exactOptionalPropertyTypes:
const user: User = { name: "Alice", email: undefined }; // Allowed

// With exactOptionalPropertyTypes:
const user: User = { name: "Alice", email: undefined }; // Error
const user: User = { name: "Alice" }; // Correct`}
            language="typescript"
            filename="Optional property handling"
          />

          <Callout type="success" title="Verified in Source Code">
            <p>
              The 17 strict settings are defined in <code>scripts/fix-layer-1-config.js</code> lines 176-194. 
              Each flag is verified before being added to your tsconfig.
            </p>
          </Callout>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Next.js 15.5 Optimization</h2>
          <p className="text-gray-300">
            Layer 1 also configures TypeScript for optimal Next.js 15.5 performance:
          </p>

          <ul className="list-disc list-inside text-gray-300 space-y-2 my-4">
            <li><code className="text-blue-400">target: "ES2022"</code> - Modern JavaScript features</li>
            <li><code className="text-blue-400">module: "ESNext"</code> - Better tree-shaking</li>
            <li><code className="text-blue-400">moduleResolution: "bundler"</code> - Modern bundler compatibility</li>
            <li><code className="text-blue-400">jsx: "react-jsx"</code> - React 19 JSX transform</li>
          </ul>

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Run It Now</h2>
          <CodeBlock
            code={`# Enable 17 strict flags with Next.js optimization
npx @neurolint/cli fix . --layer=1

# Preview changes without applying
npx @neurolint/cli fix . --layer=1 --dry-run

# See exactly what will change
npx @neurolint/cli fix . --layer=1 --verbose`}
            language="bash"
          />

          <h2 className="text-2xl font-semibold text-white mt-12 mb-4">Related Fixes</h2>
          <div className="flex flex-wrap gap-3 my-6">
            <Link
              to="/fixes/react-keys-auto-fix"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              Auto-fix missing React keys
            </Link>
            <Link
              to="/fixes/console-log-removal"
              className="px-4 py-2 bg-zinc-800 border border-black text-gray-300 rounded-lg hover:bg-zinc-700 hover:text-white transition-colors text-sm"
            >
              Remove console.log from production
            </Link>
          </div>
        </section>
      </div>
    </article>
  );
}
