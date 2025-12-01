import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectPath, dryRun = true, options = {} } = body;

    if (!projectPath || typeof projectPath !== "string") {
      return NextResponse.json(
        { error: "projectPath is required for security - cannot use server working directory" },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    const { NextJS16Migrator } = require("../../../../scripts/migrate-nextjs-16");
    const migrator = new NextJS16Migrator({
      dryRun,
      verbose: options.verbose || false,
    });
    
    const result = await migrator.migrate(projectPath);

    return NextResponse.json({
      success: result.success !== false,
      command: "migrate-nextjs16",
      changes: result.changes || [],
      changeCount: result.changes?.length || 0,
      summary: result.summary || "",
      dryRun,
      executionTime: Date.now() - startTime,
      metadata: {
        version: "1.4.0",
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
    command: "migrate-nextjs16",
    description: "Migrate project to Next.js 16 compatibility (middleware->proxy, PPR->Cache, async APIs)",
    method: "POST",
    parameters: {
      projectPath: "string (required) - Absolute path to the project to migrate",
      dryRun: "boolean (default: true) - Preview changes without applying",
      options: "object (optional) - Additional migration options",
    },
  });
}
