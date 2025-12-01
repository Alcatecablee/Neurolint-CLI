import { NextRequest, NextResponse } from "next/server";
import { teamCollaboration } from "../../../../../lib/team-collaboration";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const hasBearer = !!authHeader?.startsWith("Bearer ");
    const token = hasBearer ? authHeader!.replace("Bearer ", "") : null;

    const guestUserId = request.headers.get("x-user-id");
    const guestUserName = request.headers.get("x-user-name");

    let userId: string | null = null;

    if (hasBearer && token) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return NextResponse.json(
          { error: "Invalid authentication" },
          { status: 401 }
        );
      }
      userId = user.id;
    } else if (guestUserId && guestUserName) {
      userId = guestUserId;
    } else {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { sessionId } = params;

    let session: any = null;
    if (hasBearer && userId) {
      session = await teamCollaboration.getCollaborationSession(sessionId, userId);
    } else {
      const { data, error } = await supabase
        .from('collaboration_sessions')
        .select('*')
        .or(`id.eq.${sessionId},session_id.eq.${sessionId}`)
        .eq('is_active', true)
        .single();
      
      if (error) {
        return NextResponse.json(
          { error: "Session not found or access denied" },
          { status: 404 }
        );
      }
      session = {
        ...data,
        document_filename: data.filename,
        document_language: data.language,
        document_content: data.document_content,
      };
    }
    
    if (!session) {
      return NextResponse.json(
        { error: "Session not found or access denied" },
        { status: 404 }
      );
    }

    const [participants, comments] = await Promise.all([
      teamCollaboration.getSessionPresence(sessionId),
      teamCollaboration.getComments(sessionId)
    ]);

    return NextResponse.json({
      session,
      participants,
      comments
    });
  } catch (error) {
    console.error("Session API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const authHeader = request.headers.get("authorization");
    const hasBearer = !!authHeader?.startsWith("Bearer ");
    const token = hasBearer ? authHeader!.replace("Bearer ", "") : null;

    const guestUserId = request.headers.get("x-user-id");
    const guestUserName = request.headers.get("x-user-name");

    let userId: string | null = null;

    if (hasBearer && token) {
      const { data: { user }, error: authError } = await supabase.auth.getUser(token);
      if (authError || !user) {
        return NextResponse.json(
          { error: "Invalid authentication" },
          { status: 401 }
        );
      }
      userId = user.id;
    } else if (guestUserId && guestUserName) {
      userId = guestUserId;
    } else {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { sessionId } = params;
    const { action } = await request.json();

    // Only allow control actions for authenticated owners; guests are not permitted
    if (!hasBearer) {
      return NextResponse.json(
        { error: "Only authenticated users can modify session state" },
        { status: 403 }
      );
    }

    switch (action) {
      case 'pause':
        await teamCollaboration.pauseSession(sessionId, userId!);
        break;
      case 'resume':
        await teamCollaboration.resumeSession(sessionId, userId!);
        break;
      case 'end':
        await teamCollaboration.endSession(sessionId, userId!);
        break;
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Session update error:", error);
    return NextResponse.json(
      { error: "Failed to update session" },
      { status: 500 }
    );
  }
}
