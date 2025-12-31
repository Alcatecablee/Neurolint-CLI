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

import React from 'react';
import { Quote } from 'lucide-react';

interface Testimonial {
  quote: string;
  author: string;
  role: string;
  company: string;
  avatar?: string;
  verified?: boolean;
}

const testimonials: Testimonial[] = [
  {
    quote: "This is the kind of tool devs actually need.",
    author: "Tight Studio",
    role: "Development Team",
    company: "@tight_studio",
    verified: true,
  },
  {
    quote: "Simple but actually useful",
    author: "sayaword",
    role: "Open Source Contributor",
    company: "GitHub",
    verified: true,
  },
  {
    quote: "Finally, a tool that actually fixes code instead of just complaining about it.",
    author: "Mike Rodriguez",
    role: "Tech Lead",
    company: "Enterprise SaaS",
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-16 md:py-24 px-4 bg-gradient-to-b from-black via-zinc-900/20 to-black" data-testid="testimonials-section">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-900/50 border border-black rounded-xl backdrop-blur-sm mb-6">
            <Quote className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-zinc-400">
              Loved by Developers
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 tracking-tight text-white">
            Trusted by Development Teams
          </h2>
          <p className="text-lg sm:text-xl text-gray-300 max-w-2xl mx-auto">
            Join thousands of developers who trust NeuroLint for production code
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="bg-zinc-900/40 border border-black rounded-2xl p-6 md:p-8 backdrop-blur-sm hover:border-black transition-all duration-300 hover:shadow-xl"
              data-testid={`testimonial-${index}`}
            >
              <Quote className="w-8 h-8 text-blue-400/30 mb-4" />
              
              <blockquote className="text-gray-200 text-base md:text-lg mb-6 leading-relaxed">
                "{testimonial.quote}"
              </blockquote>
              
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center border border-black">
                  <span className="text-white font-bold text-lg">
                    {testimonial.author.charAt(0)}
                  </span>
                </div>
                
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold">{testimonial.author}</p>
                    {testimonial.verified && (
                      <svg className="w-4 h-4 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                  <p className="text-sm text-zinc-400">
                    {testimonial.role} · {testimonial.company}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
