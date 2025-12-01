# Supabase RLS Infinite Recursion Fix

## Issue Description

The application was experiencing infinite recursion errors in Supabase Row Level Security (RLS) policies, specifically with the `team_members` and `collaboration_participants` tables. The error message was:

```
infinite recursion detected in policy for relation "team_members"
```

## Root Cause

The infinite recursion was caused by RLS policies that referenced the same table they were protecting. When Supabase tried to evaluate these policies, it would trigger the policy again, creating an infinite loop.

### Problematic Policies

1. **team_members table policy**: The policy "Team members can view team membership" was checking membership by querying the `team_members` table itself:

```sql
-- PROBLEMATIC POLICY (causes infinite recursion)
CREATE POLICY "Team members can view team membership" ON public.team_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.team_members tm
      WHERE tm.team_id = team_members.team_id AND tm.user_id::uuid = auth.uid()::uuid
    )
  );
```

2. **collaboration_participants table policy**: Similar issue with the "Participants can view session participants" policy.

## Solution

The fix involves simplifying the policies to avoid self-referencing queries. Instead of checking membership by querying the same table, we check if the user is the record owner or if they have ownership rights through related tables.

### Fixed Policies

1. **team_members table policy**:

```sql
-- FIXED POLICY (avoids infinite recursion)
CREATE POLICY "Team members can view team membership" ON public.team_members
  FOR SELECT USING (
    user_id::uuid = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM public.teams 
      WHERE id = team_members.team_id AND owner_id::uuid = auth.uid()::uuid
    )
  );
```

2. **collaboration_participants table policy**:

```sql
-- FIXED POLICY (avoids infinite recursion)
CREATE POLICY "Participants can view session participants" ON public.collaboration_participants
  FOR SELECT USING (
    user_id::uuid = auth.uid()::uuid OR
    EXISTS (
      SELECT 1 FROM public.collaboration_sessions 
      WHERE id = collaboration_participants.session_id AND host_user_id::uuid = auth.uid()::uuid
    )
  );
```

## How to Apply the Fix

### Option 1: Using the SQL Script

1. Open your Supabase dashboard
2. Go to the SQL Editor
3. Copy and paste the contents of `scripts/fix-rls-infinite-recursion.sql`
4. Run the script

### Option 2: Manual Fix

1. Go to Authentication > Policies in your Supabase dashboard
2. Find the "team_members" table
3. Drop the policy "Team members can view team membership"
4. Create a new policy with the fixed SQL above
5. Repeat for "collaboration_participants" table

## Verification

After applying the fix, you can verify it works by:

1. Running the diagnostic script: `node scripts/fix-rls-policies.js`
2. Testing team collaboration features in the application
3. Checking that the infinite recursion errors no longer appear in the logs

## Impact

This fix resolves:
- Infinite recursion errors in team collaboration features
- 500 errors when accessing `/api/collaboration/teams`
- Issues with team member management
- Problems with collaboration session participants

## Prevention

To prevent similar issues in the future:

1. Avoid self-referencing queries in RLS policies
2. Use direct user ID comparisons when possible
3. Reference related tables instead of the same table
4. Test RLS policies thoroughly before deployment
5. Use the diagnostic script to verify policy changes

## Files Modified

- `scripts/setup-database-safe.js` - Updated with fixed policies
- `scripts/fix-rls-policies.js` - Diagnostic script
- `scripts/fix-rls-infinite-recursion.sql` - SQL fix script
- `docs/SUPABASE_RLS_FIX.md` - This documentation 