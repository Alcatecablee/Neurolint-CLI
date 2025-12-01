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

    const migrateReact19 = require("../../../../scripts/migrate-react19");
    const result = await migrateReact19.migrate(code, {
      dryRun,
      filename: filename || "unknown.tsx",
      verbose: options.verbose || false,
      ...options,
    });

    return NextResponse.json({
      success: true,
      command: "migrate-react19",
      originalCode: code,
      transformedCode: result.code || code,
      changes: result.changes || [],
      changeCount: result.changeCount || 0,
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
        error: "Migration failed",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    command: "migrate-react19",
    description: "Migrate project to React 19 compatibility",
    method: "POST",
    parameters: {
      code: "string (required) - The code to migrate",
      filename: "string (optional) - The filename",
      dryRun: "boolean (default: true) - Preview changes without applying",
      options: "object (optional) - Additional migration options",
    },
  });
}
