import { NextRequest, NextResponse } from "next/server";
import { createProtectedHandler, AuthenticatedUser } from "../../../../lib/auth-guard";

export const dynamic = "force-dynamic";

export const POST = createProtectedHandler(
  async (request: NextRequest, user: AuthenticatedUser) => {
    return NextResponse.json(
      {
        error: "Not implemented",
        message: "Biome migration is not yet available via the SaaS API. Use the CLI directly: npx neurolint migrate-biome",
        alternative: "npx neurolint migrate-biome /path/to/project",
        userId: user.id,
      },
      { status: 501 }
    );
  },
  { requireAuth: true }
);

export async function GET() {
  return NextResponse.json({
    command: "migrate-biome",
    description: "Migrate from ESLint/Prettier to Biome (CLI only - not available via SaaS)",
    method: "POST",
    authentication: "Required (Bearer token or API key)",
    status: "not_implemented",
    alternative: "Use CLI: npx neurolint migrate-biome /path/to/project",
  });
}
