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

// Layer 5 Test: ReactDOM.render to createRoot
import ReactDOM from 'react-dom';
import React from 'react';

// Bug #2: Multiple ReactDOM.render calls (CRITICAL TEST)
import { createRoot } from "react-dom/client";
const root = createRoot(typeof document !== "undefined" ? document.getElementById('root1') : null);
root.render(<div>App 1</div>);
const root1 = createRoot(typeof document !== "undefined" ? document.getElementById('root2') : null);
root1.render(<div>App 2</div>);
const root2 = createRoot(typeof document !== "undefined" ? document.getElementById('root3') : null);
root2.render(<div>App 3</div>);
export {};
