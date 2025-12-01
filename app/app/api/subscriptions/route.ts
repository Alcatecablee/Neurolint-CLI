import { NextRequest, NextResponse } from "next/server";
import { createAuthenticatedHandler } from "../../../lib/auth-middleware";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase: any = null;

if (supabaseUrl && supabaseServiceKey) {
  supabase = createClient(supabaseUrl, supabaseServiceKey);
} else {
  console.error("Missing Supabase environment variables for subscriptions API");
}

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_ENVIRONMENT = process.env.PAYPAL_ENVIRONMENT || 'production';
const PAYPAL_BASE_URL = PAYPAL_ENVIRONMENT === 'production'
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com';

async function getPayPalAccessToken(): Promise<string | null> {
  if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
    console.error('PayPal credentials not configured');
    return null;
  }

  try {
    const auth = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`).toString('base64');
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      console.error('PayPal auth failed:', response.status);
      return null;
    }

    const data = await response.json();
    return data.access_token || null;
  } catch (error) {
    console.error('PayPal auth error:', error);
    return null;
  }
}

async function verifyPayPalSubscription(subscriptionId: string): Promise<{ verified: boolean; status: string; planId?: string; isActive: boolean }> {
  const accessToken = await getPayPalAccessToken();
  if (!accessToken) {
    return { verified: false, status: 'auth_failed', isActive: false };
  }

  try {
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
    });

    if (!response.ok) {
      console.error('PayPal subscription lookup failed:', response.status);
      return { verified: false, status: 'not_found', isActive: false };
    }

    const subscription = await response.json();
    
    if (!subscription.id) {
      return { verified: false, status: 'invalid', isActive: false };
    }

    // Only ACTIVE status means the subscription is fully activated
    // APPROVED means payment approved but not yet activated
    const isActive = subscription.status === 'ACTIVE';
    const isValid = subscription.status === 'ACTIVE' || subscription.status === 'APPROVED';
    
    return { 
      verified: isValid, 
      status: subscription.status?.toLowerCase() || 'unknown',
      planId: subscription.plan_id,
      isActive: isActive
    };
  } catch (error) {
    console.error('PayPal subscription verification error:', error);
    return { verified: false, status: 'error', isActive: false };
  }
}

interface Subscription {
  id: string;
  userId: string;
  plan: "free" | "pro" | "enterprise";
  status: "active" | "cancelled" | "expired" | "pending";
  paypalSubscriptionId?: string;
  paypalPayerId?: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  updatedAt: string;
}

// Get user's subscriptions
export const GET = createAuthenticatedHandler(async (request, user) => {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 },
      );
    }

    // Get subscriptions from Supabase
    const { data: subscriptions, error } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Subscription fetch error:", error);
      return NextResponse.json(
        { error: "Failed to fetch subscriptions" },
        { status: 500 },
      );
    }

    return NextResponse.json({
      subscriptions: subscriptions || [],
      currentPlan: user.plan,
    });
  } catch (error) {
    console.error("Subscriptions API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});

// Create new subscription or upgrade plan
export const POST = createAuthenticatedHandler(async (request, user) => {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 },
      );
    }

    const { plan, paypalSubscriptionId, paypalPayerId } = await request.json();

    if (!plan || !["pro", "enterprise"].includes(plan)) {
      return NextResponse.json(
        { error: "Invalid plan selected" },
        { status: 400 },
      );
    }

    // Verify PayPal subscription with PayPal API
    let verified = false;
    let paypalStatus = 'pending';
    let isFullyActive = false;
    if (paypalSubscriptionId) {
      const verification = await verifyPayPalSubscription(paypalSubscriptionId);
      verified = verification.verified;
      paypalStatus = verification.status;
      isFullyActive = verification.isActive;
      
      if (!verified && paypalStatus !== 'auth_failed') {
        return NextResponse.json(
          { error: `PayPal subscription verification failed: ${paypalStatus}` },
          { status: 400 },
        );
      }
    }

    // Only set active if PayPal status is ACTIVE (not just APPROVED)
    const subscriptionData = {
      user_id: user.id,
      plan,
      status: isFullyActive ? "active" : "pending",
      paypal_subscription_id: paypalSubscriptionId || null,
      paypal_payer_id: paypalPayerId || null,
      current_period_start: new Date().toISOString(),
      current_period_end: new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString(), // 30 days
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Create subscription record
    const { data: subscription, error: subscriptionError } = await supabase
      .from("subscriptions")
      .insert(subscriptionData)
      .select()
      .single();

    if (subscriptionError) {
      console.error("Subscription creation error:", subscriptionError);
      return NextResponse.json(
        { error: "Failed to create subscription" },
        { status: 500 },
      );
    }

    // Only update user's plan if subscription is fully active (ACTIVE, not just APPROVED)
    if (!isFullyActive) {
      return NextResponse.json({
        success: true,
        subscription,
        message: `${plan} subscription created and pending activation`,
        status: 'pending',
      });
    }

    // Update user's plan in profiles table only when fully active
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        plan,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (profileError) {
      console.error("Profile update error:", profileError);
      // Don't fail the request, subscription is created
    }

    return NextResponse.json({
      success: true,
      subscription,
      message: `Successfully activated ${plan} subscription`,
    });
  } catch (error) {
    console.error("Subscription creation API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});

// Update subscription (cancel, reactivate, etc.)
export const PUT = createAuthenticatedHandler(async (request, user) => {
  try {
    if (!supabase) {
      return NextResponse.json(
        { error: "Database connection not available" },
        { status: 503 },
      );
    }

    const { subscriptionId, status, paypalData } = await request.json();

    if (!subscriptionId) {
      return NextResponse.json(
        { error: "Subscription ID is required" },
        { status: 400 },
      );
    }

    // Get existing subscription
    const { data: existingSubscription, error: fetchError } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("id", subscriptionId)
      .eq("user_id", user.id)
      .single();

    if (fetchError || !existingSubscription) {
      return NextResponse.json(
        { error: "Subscription not found" },
        { status: 404 },
      );
    }

    const updateData: any = {
      updated_at: new Date().toISOString(),
    };

    if (status) {
      updateData.status = status;
    }

    if (paypalData) {
      updateData.paypal_subscription_id = paypalData.subscriptionId;
      updateData.paypal_payer_id = paypalData.payerId;
    }

    // Update subscription
    const { data: updatedSubscription, error: updateError } = await supabase
      .from("subscriptions")
      .update(updateData)
      .eq("id", subscriptionId)
      .eq("user_id", user.id)
      .select()
      .single();

    if (updateError) {
      console.error("Subscription update error:", updateError);
      return NextResponse.json(
        { error: "Failed to update subscription" },
        { status: 500 },
      );
    }

    // Update user plan if subscription is cancelled
    if (status === "cancelled" || status === "expired") {
      await supabase
        .from("profiles")
        .update({
          plan: "free",
          updated_at: new Date().toISOString(),
        })
        .eq("id", user.id);
    }

    return NextResponse.json({
      success: true,
      subscription: updatedSubscription,
    });
  } catch (error) {
    console.error("Subscription update API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
});
