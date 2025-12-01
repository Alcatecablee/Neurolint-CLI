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

    const fixMaster = require("../../../../fix-master");
    const result = await fixMaster.executeLayers(code, [7], {
      dryRun,
      verbose: options.verbose || false,
      filePath: filename || "unknown.tsx",
    });

    const changes = result.results?.filter((r: any) => r.success && r.changes > 0) || [];
    
    return NextResponse.json({
      success: result.success !== false,
      command: "migrate-react19",
      originalCode: code,
      transformedCode: result.finalCode || code,
      changes: changes.map((r: any) => ({
        layer: r.layer,
        changeCount: r.changes,
        description: `Layer ${r.layer} applied ${r.changes} fix(es)`,
      })),
      changeCount: changes.reduce((sum: number, r: any) => sum + (r.changes || 0), 0),
      dryRun,
      executionTime: Date.now() - startTime,
      metadata: {
        version: "1.3.9",
        timestamp: new Date().toISOString(),
        description: "React 19 migration via Layer 7 (Adaptive Learning)",
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
    description: "Migrate project to React 19 compatibility using Layer 7 (Adaptive Learning)",
    method: "POST",
    parameters: {
      code: "string (required) - The code to migrate",
      filename: "string (optional) - The filename",
      dryRun: "boolean (default: true) - Preview changes without applying",
      options: "object (optional) - Additional migration options",
    },
  });
}
