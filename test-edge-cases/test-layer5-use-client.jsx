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


"use client";

import { Button } from "@/components/ui/button";
// Layer 5 Test: 'use client' directive

import { useState, useEffect, useCallback } from 'react';
function Counter() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    // [NeuroLint] Removed console.log: 'mounted'
    ;
  }, []);
  const increment = useCallback(() => {
    setCount(c => c + 1);
  }, []);
  return <Button onClick={increment} aria-label="Button" variant="default">{count}</Button>;
}
export default Counter;
