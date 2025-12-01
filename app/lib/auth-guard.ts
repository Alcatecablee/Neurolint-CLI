import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { rateLimiter, getTierRateLimits } from "./rate-limiter";

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  plan: 'free' | 'premium' | 'enterprise';
  tier: 'free' | 'premium' | 'enterprise';
  emailConfirmed: boolean;
  createdAt?: string;
}

export interface AuthGuardOptions {
  requireAuth?: boolean;
  requireEmailConfirmed?: boolean;
  allowedTiers?: ('free' | 'premium' | 'enterprise')[];
  requiredFeatures?: string[];
  action?: string;
  rateLimit?: {
    requestsPerHour?: number;
    requestsPerDay?: number;
  };
}

export interface AuthGuardResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: string;
  errorCode?: 'NO_AUTH' | 'INVALID_TOKEN' | 'EMAIL_NOT_CONFIRMED' | 'TIER_NOT_ALLOWED' | 'FEATURE_NOT_ALLOWED' | 'RATE_LIMITED' | 'SERVER_ERROR';
  statusCode?: number;
  rateLimitInfo?: {
    remaining: number;
    resetTime: number;
    limit: number;
  };
}

const TIER_FEATURES: Record<string, string[]> = {
  free: [
    'basic_analysis',
    'preview_mode',
    'basic_reports',
    'community_support',
  ],
  premium: [
    'basic_analysis',
    'preview_mode',
    'basic_reports',
    'community_support',
    'apply_fixes',
    'detailed_reports',
    'pdf_export',
    'migration_plans',
    'email_support',
    'api_access',
  ],
  enterprise: [
    'basic_analysis',
    'preview_mode',
    'basic_reports',
    'community_support',
    'apply_fixes',
    'detailed_reports',
    'pdf_export',
    'migration_plans',
    'email_support',
    'api_access',
    'batch_fixes',
    'custom_rules',
    'priority_support',
    'sso',
    'audit_logs',
    'team_management',
    'dedicated_support',
  ],
};

export async function authGuard(
  request: NextRequest,
  options: AuthGuardOptions = {}
): Promise<AuthGuardResult> {
  const {
    requireAuth = true,
    requireEmailConfirmed = false,
    allowedTiers,
    requiredFeatures = [],
    rateLimit,
  } = options;

  try {
    const authHeader = request.headers.get("authorization");
    const apiKeyHeader = request.headers.get("x-api-key");

    if (!authHeader && !apiKeyHeader) {
      if (requireAuth) {
        return {
          success: false,
          error: "Authentication required",
          errorCode: 'NO_AUTH',
          statusCode: 401,
        };
      }
      return { success: true };
    }

    let userId: string;
    let userEmail: string;
    let userTier: 'free' | 'premium' | 'enterprise' = 'free';
    let emailConfirmed = false;
    let firstName: string | undefined;
    let lastName: string | undefined;

    if (apiKeyHeader) {
      const apiKeyResult = await validateApiKey(apiKeyHeader);
      if (!apiKeyResult.valid) {
        return {
          success: false,
          error: "Invalid or expired API key",
          errorCode: 'INVALID_TOKEN',
          statusCode: 401,
        };
      }
      userId = apiKeyResult.userId!;
      userEmail = apiKeyResult.email || '';
      userTier = (apiKeyResult.tier as any) || 'free';
      emailConfirmed = true;
    } else {
      const token = authHeader!.replace("Bearer ", "");
      
      if (!token || token.length < 10) {
        return {
          success: false,
          error: "Invalid token format",
          errorCode: 'INVALID_TOKEN',
          statusCode: 401,
        };
      }

      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

      if (!supabaseUrl || !supabaseAnonKey) {
        return {
          success: false,
          error: "Authentication service unavailable",
          errorCode: 'SERVER_ERROR',
          statusCode: 503,
        };
      }

      const supabase = createClient(supabaseUrl, supabaseAnonKey, {
        global: { headers: { Authorization: `Bearer ${token}` } },
      });

      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        return {
          success: false,
          error: "Invalid or expired session",
          errorCode: 'INVALID_TOKEN',
          statusCode: 401,
        };
      }

      userId = user.id;
      userEmail = user.email || '';
      emailConfirmed = user.email_confirmed_at !== null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("first_name, last_name, plan, tier")
        .eq("id", user.id)
        .single();

      if (profile) {
        firstName = profile.first_name;
        lastName = profile.last_name;
        userTier = (profile.tier || profile.plan || 'free') as any;
      }
    }

    if (requireEmailConfirmed && !emailConfirmed) {
      return {
        success: false,
        error: "Email confirmation required",
        errorCode: 'EMAIL_NOT_CONFIRMED',
        statusCode: 403,
      };
    }

    if (allowedTiers && allowedTiers.length > 0) {
      if (!allowedTiers.includes(userTier)) {
        return {
          success: false,
          error: `This feature requires ${allowedTiers.join(' or ')} tier`,
          errorCode: 'TIER_NOT_ALLOWED',
          statusCode: 403,
        };
      }
    }

    if (requiredFeatures.length > 0) {
      const userFeatures = TIER_FEATURES[userTier] || TIER_FEATURES.free;
      const missingFeatures = requiredFeatures.filter(f => !userFeatures.includes(f));
      
      if (missingFeatures.length > 0) {
        return {
          success: false,
          error: `Missing required features: ${missingFeatures.join(', ')}`,
          errorCode: 'FEATURE_NOT_ALLOWED',
          statusCode: 403,
        };
      }
    }

    const action = options.action || 'api';
    const tierLimits = rateLimit ? {
      requestsPerHour: rateLimit.requestsPerHour || getTierRateLimits(userTier).requestsPerHour,
      requestsPerDay: rateLimit.requestsPerDay || getTierRateLimits(userTier).requestsPerDay,
    } : getTierRateLimits(userTier);
    
    const rateLimitResult = rateLimiter.checkUserRateLimit(userId, action, userTier, tierLimits);
    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: "Rate limit exceeded",
        errorCode: 'RATE_LIMITED',
        statusCode: 429,
        rateLimitInfo: {
          remaining: rateLimitResult.remaining,
          resetTime: rateLimitResult.resetTime,
          limit: rateLimitResult.limit,
        },
      };
    }

    return {
      success: true,
      user: {
        id: userId,
        email: userEmail,
        firstName,
        lastName,
        plan: userTier,
        tier: userTier,
        emailConfirmed,
      },
      rateLimitInfo: {
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime,
        limit: rateLimitResult.limit,
      },
    };
  } catch (error) {
    console.error("Auth guard error:", error);
    return {
      success: false,
      error: "Authentication failed",
      errorCode: 'SERVER_ERROR',
      statusCode: 500,
    };
  }
}

async function validateApiKey(apiKey: string): Promise<{
  valid: boolean;
  userId?: string;
  email?: string;
  tier?: string;
  permissions?: string[];
}> {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return { valid: false };
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await supabase
      .from('api_keys')
      .select('user_id, permissions, expires_at, is_active, profiles(email, tier)')
      .eq('key_hash', hashApiKey(apiKey))
      .single();

    if (error || !data) {
      return { valid: false };
    }

    if (!data.is_active) {
      return { valid: false };
    }

    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false };
    }

    await supabase
      .from('api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('key_hash', hashApiKey(apiKey));

    const profile = data.profiles as any;

    return {
      valid: true,
      userId: data.user_id,
      email: profile?.email,
      tier: profile?.tier || 'free',
      permissions: data.permissions,
    };
  } catch (error) {
    return { valid: false };
  }
}

function hashApiKey(apiKey: string): string {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(apiKey).digest('hex');
}

export function createProtectedHandler<T = any>(
  handler: (request: NextRequest, user: AuthenticatedUser, ...args: any[]) => Promise<NextResponse>,
  options: AuthGuardOptions = {}
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const authResult = await authGuard(request, { requireAuth: true, ...options });

    if (!authResult.success || !authResult.user) {
      const response = NextResponse.json(
        { 
          error: authResult.error || "Authentication required",
          code: authResult.errorCode,
        },
        { status: authResult.statusCode || 401 }
      );
      
      if (authResult.rateLimitInfo) {
        response.headers.set('X-RateLimit-Limit', authResult.rateLimitInfo.limit.toString());
        response.headers.set('X-RateLimit-Remaining', authResult.rateLimitInfo.remaining.toString());
        response.headers.set('X-RateLimit-Reset', authResult.rateLimitInfo.resetTime.toString());
      }
      
      return response;
    }

    try {
      const response = await handler(request, authResult.user, ...args);
      
      if (authResult.rateLimitInfo) {
        response.headers.set('X-RateLimit-Limit', authResult.rateLimitInfo.limit.toString());
        response.headers.set('X-RateLimit-Remaining', authResult.rateLimitInfo.remaining.toString());
        response.headers.set('X-RateLimit-Reset', authResult.rateLimitInfo.resetTime.toString());
      }
      
      return response;
    } catch (error) {
      console.error("Handler error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

export function createOptionalAuthHandler<T = any>(
  handler: (request: NextRequest, user: AuthenticatedUser | null, ...args: any[]) => Promise<NextResponse>,
  options: Omit<AuthGuardOptions, 'requireAuth'> = {}
) {
  return async (request: NextRequest, ...args: any[]): Promise<NextResponse> => {
    const authResult = await authGuard(request, { requireAuth: false, ...options });

    if (authResult.errorCode === 'RATE_LIMITED') {
      const response = NextResponse.json(
        { error: authResult.error, code: authResult.errorCode },
        { status: 429 }
      );
      
      if (authResult.rateLimitInfo) {
        response.headers.set('X-RateLimit-Limit', authResult.rateLimitInfo.limit.toString());
        response.headers.set('X-RateLimit-Remaining', '0');
        response.headers.set('X-RateLimit-Reset', authResult.rateLimitInfo.resetTime.toString());
      }
      
      return response;
    }

    try {
      const response = await handler(request, authResult.user || null, ...args);
      
      if (authResult.rateLimitInfo) {
        response.headers.set('X-RateLimit-Limit', authResult.rateLimitInfo.limit.toString());
        response.headers.set('X-RateLimit-Remaining', authResult.rateLimitInfo.remaining.toString());
        response.headers.set('X-RateLimit-Reset', authResult.rateLimitInfo.resetTime.toString());
      }
      
      return response;
    } catch (error) {
      console.error("Handler error:", error);
      return NextResponse.json(
        { error: "Internal server error" },
        { status: 500 }
      );
    }
  };
}

export function requireTier(...tiers: ('free' | 'premium' | 'enterprise')[]) {
  return (options: AuthGuardOptions = {}): AuthGuardOptions => ({
    ...options,
    allowedTiers: tiers,
  });
}

export function requireFeatures(...features: string[]) {
  return (options: AuthGuardOptions = {}): AuthGuardOptions => ({
    ...options,
    requiredFeatures: [...(options.requiredFeatures || []), ...features],
  });
}

export function withRateLimit(limits: AuthGuardOptions['rateLimit']) {
  return (options: AuthGuardOptions = {}): AuthGuardOptions => ({
    ...options,
    rateLimit: limits,
  });
}
