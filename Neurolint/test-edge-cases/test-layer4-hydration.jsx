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


// Layer 4 Test: Hydration/SSR Fixes

// localStorage without guard
const theme = typeof window !== "undefined" ? localStorage.getItem('theme') : null;
const user = typeof window !== "undefined" ? sessionStorage.getItem('user') : null;

// window without guard
const width = typeof window !== "undefined" ? window.innerWidth : null;
const pathname = typeof window !== "undefined" ? window.location.pathname : null;

// document without guard
const element = typeof document !== "undefined" ? document.getElementById('root') : null;
const body = typeof document !== "undefined" ? document.body : null;

// Deep nesting tests (from bug reports)
if (typeof window !== "undefined") {
  window.navigator.geolocation.watchPosition = () => {};
}
if (typeof document !== "undefined") {
  document.body.firstElementChild.textContent = 'test';
} // Assignment expressions
if (typeof window !== "undefined") {
  window.myGlobal = 'value';
}
if (typeof document !== "undefined") {
  document.customProp = 'data';
}
export { theme, width, element };
