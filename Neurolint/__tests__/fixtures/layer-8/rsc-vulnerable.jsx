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
 * Layer 8 Test Fixture: RSC-Specific Vulnerabilities
 * Tests React Server Components security patterns
 */
'use server';

import { cookies } from 'next/headers';

export async function unsafeServerAction(formData) {
  const userCode = formData.get('code');
  const result = eval(userCode);
  return { result };
}

export async function dangerousRedirect(formData) {
  const url = formData.get('redirect');
  redirect(url);
}

export async function injectableQuery(formData) {
  const search = formData.get('search');
  const query = `SELECT * FROM products WHERE name LIKE '%${search}%'`;
  return db.query(query);
}

async function ServerComponent({ searchParams }) {
  const id = searchParams.id;
  const data = await fetch(`http://api.internal/users/${id}`);
  
  const userInput = searchParams.template;
  return (
    <div dangerouslySetInnerHTML={{ __html: userInput }} />
  );
}

export default ServerComponent;
