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


// Layer 2 Test: Pattern Fixes

import React from 'react';

// Bug #1: Console.log in arrow functions (CRITICAL TEST)
const handler1 = () => {} /* [NeuroLint] Removed console.log: 'test'*/;
const handler2 = value => {} /* [NeuroLint] Removed console.log: value*/;
const handler3 = (a, b) => {} /* [NeuroLint] Removed console.log: a, b*/;
const handler4 = ({
  name
}) => {} /* [NeuroLint] Removed console.log: name*/;

// Console variants
// [NeuroLint] Removed console.log: 'regular'
;
// [NeuroLint] Removed console.info: 'info'
;
// [NeuroLint] Removed console.warn: 'warning'
;
// [NeuroLint] Removed console.error: 'error'
;
// [NeuroLint] Removed console.debug: 'debug'
; // Alert/Confirm/Prompt
// [NeuroLint] Replace with toast notification: 'Hello'
;
const confirmed = // [NeuroLint] Replace with dialog: 'Sure?'
undefined;
const name = // [NeuroLint] Replace with dialog: 'Name?'
undefined;

// createFactory pattern
const divFactory = (props) => <div {...props} />;
const spanFactory = (props) => <span {...props} />;
const buttonFactory = (props) => <button {...props} />;
export default handler1;
