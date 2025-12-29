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
 * Test file for enhanced-react19-dom.js script
 * Tests React 19 DOM API transformations
 */

import React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { render } from 'react-dom/test-utils';

function App() {
  return <div>Hello World</div>;
}

// Test 1: ReactDOM.render (should convert to createRoot)
ReactDOM.render(<App />, document.getElementById('root'));

// Test 2: ReactDOM.hydrate (should convert to hydrateRoot)
ReactDOM.hydrate(<App />, document.getElementById('root'));

// Test 3: Multiple render calls (should generate unique root variables)
ReactDOM.render(<App />, document.getElementById('root1'));
ReactDOM.render(<App />, document.getElementById('root2'));

// Test 4: unmountComponentAtNode (should warn)
ReactDOM.unmountComponentAtNode(document.getElementById('root'));

// Test 5: findDOMNode (should warn)
const node = ReactDOM.findDOMNode(this);
