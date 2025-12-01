import { NextRequest, NextResponse } from "next/server";
import { authGuard, createProtectedHandler, createOptionalAuthHandler, AuthenticatedUser } from "../../../../lib/auth-guard";

export const dynamic = "force-dynamic";

export const POST = createProtectedHandler(
  async (request: NextRequest, user: AuthenticatedUser) => {
    try {
      const body = await request.json();
      const { projectPath, options = {} } = body;

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

      const startTime = Date.now();

      const { RouterComplexityAssessor } = require("../../../../scripts/router-complexity-assessor");
      const assessor = new RouterComplexityAssessor({
        verbose: options.verbose || false,
        projectPath,
      });
      
      const result = await assessor.assess();

      return NextResponse.json({
        success: true,
        command: "assess-router",
        userId: user.id,
        metrics: result.metrics || {},
        recommendations: result.recommendations || [],
        complexityLevel: result.level || "unknown",
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
          error: "Router assessment failed",
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
    command: "assess-router",
    description: "Assess Next.js router complexity and recommend optimal setup",
    method: "POST",
    authentication: "Required (Bearer token or API key)",
    parameters: {
      projectPath: "string (required) - Absolute path to the project to assess",
      options: "object (optional) - Additional options like verbose: true",
    },
  });
}
