import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, filename, dryRun = true, options = {} } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json(
        { error: "Code is required and must be a string" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const simplify = require("../../../../scripts/simplify");
    const result = await simplify.simplifyCode(code, {
      dryRun,
      filename: filename || "unknown.tsx",
      verbose: options.verbose || false,
      ...options,
    });

    return NextResponse.json({
      success: true,
      command: "simplify",
      originalCode: code,
      simplifiedCode: result.code || code,
      changes: result.changes || [],
      changeCount: result.changeCount || 0,
      complexityBefore: result.complexityBefore || 0,
      complexityAfter: result.complexityAfter || 0,
      dryRun,
      executionTime: Date.now() - startTime,
      metadata: {
        version: "1.3.9",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Simplification failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    command: "simplify",
    description: "Simplify project complexity (convert Next.js to React, etc.)",
    method: "POST",
    parameters: {
      code: "string (required) - The code to simplify",
      filename: "string (optional) - The filename",
      dryRun: "boolean (default: true) - Preview changes without applying",
      options: "object (optional) - Additional options",
    },
  });
}
