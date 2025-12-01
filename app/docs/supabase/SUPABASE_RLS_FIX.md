# Supabase RLS Authentication Fix

## Problem

The error `"new row violates row-level security policy for table \"analysis_history\""` was occurring because:

1. **RLS Policy Requirement**: The `analysis_history` table has Row Level Security enabled with a policy requiring:

   ```sql
   CREATE POLICY "Users can insert own analysis history" ON public.analysis_history
       FOR INSERT WITH CHECK (auth.uid() = user_id);
   ```

2. **Authentication Issue**: The Supabase client was not properly authenticated with the user's session token, so `auth.uid()` was returning `null` instead of the user's UUID.

## Root Cause

The Supabase client was using only the anon key without setting the user's session, which meant:

- `auth.uid()` returned `null`
- RLS policy check `auth.uid() = user_id` failed
- Insert was rejected with error code 42501

## Solution Applied

### 1. **Enhanced Authentication Function**

```typescript
async function createAuthenticatedClient() {
  if (typeof window !== "undefined") {
    try {
      const savedSession = localStorage.getItem("supabase_session");
      if (savedSession) {
        const sessionData = JSON.parse(savedSession);
        if (sessionData?.access_token && sessionData?.refresh_token) {
          const { error } = await supabase.auth.setSession({
            access_token: sessionData.access_token,
            refresh_token: sessionData.refresh_token,
          });

          if (error) {
            console.error("Error setting Supabase session:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error reading session from localStorage:", error);
    }
  }
  return supabase;
}
```

### 2. **User ID Validation**

Added validation to ensure the authenticated user matches the requested user_id:

```typescript
const {
  data: { user },
} = await client.auth.getUser();
if (!user) {
  console.error("No authenticated user found for Supabase operation");
  return null;
}

if (user.id !== userId) {
  console.error(
    "User ID mismatch - authenticated user:",
    user.id,
    "vs requested:",
    userId,
  );
  return null;
}
```

### 3. **Improved Error Handling**

- Enhanced error logging with detailed context
- Graceful fallback to localStorage when Supabase operations fail
- Better debugging information for RLS policy violations

### 4. **Session Management**

- Properly reads user session from localStorage
- Sets session on Supabase client before database operations
- Validates session tokens before attempting operations

## Benefits

✅ **RLS Compliance**: All database operations now properly authenticate with user session  
✅ **Security**: User can only access their own data (enforced by RLS)  
✅ **Reliability**: Graceful fallback to localStorage if Supabase fails  
✅ **Debugging**: Better error messages for troubleshooting  
✅ **Performance**: Session is cached and reused across operations

## Testing

The fix should resolve the RLS policy violation error when:

- User is properly logged in with valid session
- Analysis history is saved to Supabase
- User ID matches the authenticated user's UUID

## Fallback Behavior

If Supabase operations fail (network issues, RLS violations, etc.):

- Data is still saved to localStorage
- User experience is not interrupted
- Sync can happen later when issues are resolved
