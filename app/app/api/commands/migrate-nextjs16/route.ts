import { NextRequest, NextResponse } from "next/server";
import { createProtectedHandler, AuthenticatedUser } from "../../../../lib/auth-guard";

export const dynamic = "force-dynamic";

export const POST = createProtectedHandler(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const body = await request.json();
      const { projectPath, dryRun = true, options = {} } = body;

      if (!projectPath || typeof projectPath !== "string") {
        return NextResponse.json(
          { error: "projectPath is required for security - cannot use server working directory" },
          { status: 400 }
        );
      }

      if (projectPath.includes('..') || projectPath.startsWith('/etc') || projectPath.startsWith('/root')) {
        return NextResponse.json(
          { error: "Invalid project path - path traversal not allowed" },
          { status: 400 }
        );
      }

      if (!dryRun && user.tier === 'free') {
        return NextResponse.json(
          { 
            error: "Applying fixes requires Premium or Enterprise tier",
            upgrade: true,
            dryRunAvailable: true,
          },
          { status: 403 }
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
        userId: user.id,
        changes: result.changes || [],
        changeCount: result.changes?.length || 0,
        summary: result.summary || "",
        dryRun,
        executionTime: Date.now() - startTime,
        metadata: {
          version: "1.4.0",
          timestamp: new Date().toISOString(),
          userTier: user.tier,
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
  },
  { requireAuth: true }
);

export async function GET() {
  return NextResponse.json({
    command: "migrate-nextjs16",
    description: "Migrate project to Next.js 16 compatibility (middleware->proxy, PPR->Cache, async APIs)",
    method: "POST",
    authentication: "Required (Bearer token or API key)",
    tierRequirements: {
      dryRun: "All tiers",
      applyFixes: "Premium or Enterprise",
    },
    parameters: {
      projectPath: "string (required) - Absolute path to the project to migrate",
      dryRun: "boolean (default: true) - Preview changes without applying",
      options: "object (optional) - Additional migration options",
    },
  });
}
