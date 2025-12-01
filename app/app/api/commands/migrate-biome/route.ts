import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectPath, dryRun = true, options = {} } = body;

    const startTime = Date.now();

    const migrateBiome = require("../../../../scripts/migrate-biome");
    const result = await migrateBiome.migrate(projectPath || process.cwd(), {
      dryRun,
      verbose: options.verbose || false,
      ...options,
    });

    return NextResponse.json({
      success: true,
      command: "migrate-biome",
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
    command: "migrate-biome",
    description: "Migrate from ESLint/Prettier to Biome",
    method: "POST",
    parameters: {
      projectPath: "string (optional) - Project path to migrate",
      dryRun: "boolean (default: true) - Preview changes without applying",
      options: "object (optional) - Additional migration options",
    },
  });
}
