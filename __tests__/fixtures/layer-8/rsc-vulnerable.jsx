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
