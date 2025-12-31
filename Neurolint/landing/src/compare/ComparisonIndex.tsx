import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export function ComparisonIndex() {
  return (
    <article className="py-12 md:py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <Link
          to="/fixes"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Fixes
        </Link>

        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Compare NeuroLint
        </h1>
        <p className="text-lg text-gray-400 mb-12">
          See how NeuroLint compares to other tools in the ecosystem
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link
            to="eslint"
            className="p-6 bg-zinc-900 border border-black rounded-lg hover:border-zinc-700 transition-colors group"
          >
            <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              NeuroLint vs ESLint
            </h2>
            <p className="text-gray-400">
              Compare NeuroLint's automatic fixing capabilities with ESLint
            </p>
          </Link>

          <Link
            to="biome"
            className="p-6 bg-zinc-900 border border-black rounded-lg hover:border-zinc-700 transition-colors group"
          >
            <h2 className="text-xl font-semibold text-white mb-2 group-hover:text-blue-400 transition-colors">
              NeuroLint vs Biome
            </h2>
            <p className="text-gray-400">
              See how NeuroLint's migrations complement Biome's linting
            </p>
          </Link>
        </div>
      </div>
    </article>
  );
}
