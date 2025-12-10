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


import React, { useState, useEffect } from "react";

const TypewriterHeadline: React.FC = () => {
  const [currentText, setCurrentText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  const words = [
    "Stop React Hydration Crashes",
    "Ship React Fixes Automatically",
    "Deterministic Bug Fixes, On Demand",
    "Prevent Next.js Bugs Before Deploy",
    "Kill Missing Key Errors",
  ];

  const typingSpeed = 100;
  const deletingSpeed = 50;
  const delayBetweenWords = 2000;

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (currentIndex < words[currentWordIndex].length) {
      // Typing
      timeout = setTimeout(() => {
        setCurrentText((prev) => prev + words[currentWordIndex][currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, typingSpeed);
    } else {
      // Delay before deleting
      timeout = setTimeout(
        () => {
          // Start deleting
          if (currentText.length > 0) {
            setCurrentText((prev) => prev.slice(0, -1));
          } else {
            // Move to next word
            setCurrentWordIndex((prev) => (prev + 1) % words.length);
            setCurrentIndex(0);
          }
        },
        currentText.length === words[currentWordIndex].length
          ? delayBetweenWords
          : deletingSpeed,
      );
    }

    return () => clearTimeout(timeout);
  }, [currentIndex, currentText, currentWordIndex, words]);

  return (
    <div className="mb-8">
      <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-zinc-900">
        <span className="block">Advanced</span>
        <span className="block min-h-[1.2em]">
          {currentText}
          <span className="animate-pulse">|</span>
        </span>
      </h1>
    </div>
  );
};

export default TypewriterHeadline;
