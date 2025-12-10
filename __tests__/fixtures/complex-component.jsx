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

// Component with multiple issues for comprehensive testing
const ComplexComponent = ({ items, title }) => {
  // Issue: Direct window access without SSR guard
  const width = window.innerWidth;

  // Issue: localStorage without hydration check
  const savedData = localStorage.getItem('data');

  // Issue: console.log should be removed
  console.log('Rendering ComplexComponent');

  // Issue: Missing keys in map
  return (
    <div>
      <h1>{title}</h1>
      <ul>
        {items.map(item => (
          <li>{item.name}</li>
        ))}
      </ul>
      <div style={{ width: width }}>
        Responsive content
      </div>
    </div>
  );
};

export default ComplexComponent;
