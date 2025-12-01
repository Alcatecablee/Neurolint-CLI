# Update Your Existing GitHub OAuth App for Repository Scanning

## ✅ Good News: Use Your Existing Setup!

Since you already have GitHub login working, you can use the **same GitHub OAuth app** for the repository scanner. You just need to ensure it has the right permissions.

## 🔍 Check Your Current Scopes

### 1. Go to Your GitHub OAuth App
1. Visit [GitHub Developer Settings](https://github.com/settings/developers)
2. Click on your existing OAuth app (the one you're using for login)
3. Look at the current configuration

### 2. Required Scopes for Repository Scanning

Your OAuth app needs these scopes:
- ✅ `user:email` (you probably already have this for login)
- ✅ `read:user` (you probably already have this for login)
- 🔧 **`repo`** (needed for repository access - **ADD THIS**)
- 🔧 **`read:org`** (optional but recommended for organization repos)

## 🛠️ Update Your Supabase Configuration

### Option 1: Update in Supabase Dashboard
1. Go to your Supabase dashboard: Authentication → Providers → GitHub
2. Look for the **"Scopes"** field
3. Update it to include: `repo user:email read:org`
4. Save the changes

### Option 2: If You Need to Update the GitHub App Directly
If Supabase doesn't let you modify scopes, you might need to:
1. Go to your GitHub OAuth app settings
2. Update the app description to mention repository access
3. The scopes are actually requested by the client (Supabase), not set in the GitHub app itself

## 🧪 Test the Integration

After updating the scopes:

1. **Clear your browser session** (important!)
2. Go to your dashboard: https://c79fc71801a141ac89cc07f4653cefa9-988a859a62a5454f9b3342c9b.fly.dev/dashboard
3. If you're already logged in, **log out and log back in** to get the new scopes
4. Try the GitHub repository scanner integration

## 🔧 Quick Verification

To verify your current scopes are working:

1. Log into your app
2. Open browser dev tools (F12)
3. Go to Application/Storage → Local Storage or Session Storage
4. Look for any Supabase auth tokens
5. You can also check the Network tab when you try to connect GitHub to see what scopes are being requested

## 📋 Summary

**No new OAuth app needed!** Just:
1. ✅ Use your existing GitHub OAuth app credentials
2. ✅ Update Supabase scopes to include `repo user:email read:org`
3. ✅ Log out and back in to refresh permissions
4. ✅ Test the repository scanner

The same OAuth app can handle both authentication AND repository access - that's the beauty of OAuth scopes!
