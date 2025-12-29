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


/**
 * Test file for react-compiler-detector.js
 * Tests detection of manual memoization patterns
 */

import React, { useMemo, useCallback, memo, useRef, useEffect } from 'react';

// Test 1: useMemo (should be detected)
function Component1() {
  const expensiveValue = useMemo(() => {
    return computeExpensiveValue();
  }, []);
  
  return <div>{expensiveValue}</div>;
}

// Test 2: useCallback (should be detected)
function Component2({ onClick }) {
  const handleClick = useCallback(() => {
    onClick();
  }, [onClick]);
  
  return <button onClick={handleClick}>Click</button>;
}

// Test 3: React.memo (should be detected)
const MemoizedComponent = memo(function MyComponent({ value }) {
  return <div>{value}</div>;
});

// Test 4: useRef for previous values (should be detected)
function Component4() {
  const prevCountRef = useRef();
  
  useEffect(() => {
    prevCountRef.current = count;
  });
  
  return null;
}

// Test 5: Multiple empty dependency arrays (should be detected)
function Component5() {
  useEffect(() => {}, []);
  useEffect(() => {}, []);
  useEffect(() => {}, []);
  useEffect(() => {}, []);
  
  return null;
}
