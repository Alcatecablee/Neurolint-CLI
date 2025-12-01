# Supabase Database Setup for NeuroLint Pro

## Quick Setup Instructions

You have the Supabase credentials configured correctly in your `.env` file. Now you need to run the database schema to enable dashboard data persistence.

### Step 1: Open Supabase SQL Editor

1. Go to https://supabase.com/dashboard
2. Select your project: `jetwhffgmohdqkuegtjh`
3. Navigate to **SQL Editor** in the left sidebar

### Step 2: Run the Extended Schema

Copy and paste the SQL commands from `supabase-extended-schema.md` into the SQL Editor and run them. This will create the necessary tables for:

- `analysis_history` - Stores user analysis results
- `projects` - User project management
- `user_settings` - Dashboard preferences
- `api_keys` - User API key management
- `collaboration_sessions` - Real-time collaboration sessions

### Step 3: Verify Tables Created

After running the schema, you should see these new tables in your **Table Editor**:

- ✅ `analysis_history`
- ✅ `projects`
- ✅ `user_settings`
- ✅ `api_keys`
- ✅ `collaboration_sessions`

## What This Fixes

Before this setup:

- ❌ Dashboard data was only saved to localStorage (lost when clearing browser data)
- ❌ Analysis history was not persistent across devices
- ❌ Projects were mock data only
- ❌ User settings were not saved

After this setup:

- ✅ All dashboard data persists to your Supabase database
- ✅ Analysis history is saved permanently and synced across devices
- ✅ Projects are real and backed by database
- ✅ User settings are properly stored
- ✅ Automatic fallback to localStorage if database is unavailable

## Current Status

Your environment variables are correctly configured:

- `SUPABASE_URL`: https://jetwhffgmohdqkuegtjh.supabase.co ✅
- `SUPABASE_ANON_KEY`: Configured ✅
- `SUPABASE_SERVICE_ROLE`: Configured ✅

The application will work with localStorage until you run the database schema, then it will automatically switch to using Supabase for data persistence.
