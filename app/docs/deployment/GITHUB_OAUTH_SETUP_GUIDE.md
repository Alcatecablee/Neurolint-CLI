# GitHub OAuth App Setup Guide

## Step-by-Step Instructions for Your NeuroLint Pro Deployment

### 1. Access GitHub Developer Settings

1. Go to [GitHub.com](https://github.com) and sign in to your account
2. Click on your profile picture (top right corner)
3. Select **"Settings"** from the dropdown menu
4. Scroll down in the left sidebar and click **"Developer settings"**
5. Click **"OAuth Apps"** in the left sidebar

### 2. Create New OAuth App

1. Click the **"New OAuth App"** button (green button on the right)
2. Fill in the application details:

**Application name:**
```
NeuroLint Pro
```

**Homepage URL:**
```
https://c79fc71801a141ac89cc07f4653cefa9-988a859a62a5454f9b3342c9b.fly.dev
```

**Application description (optional):**
```
NeuroLint Pro - React/Next.js code analysis and modernization platform with GitHub repository scanning capabilities.
```

**Authorization callback URL:**
```
https://jetwhffgmohdqkuegtjh.supabase.co/auth/v1/callback
```

3. Click **"Register application"**

### 3. Get Your Credentials

After creating the app, you'll see your OAuth app details page:

1. **Client ID** - Copy this value (it's visible immediately)
2. **Client Secret** - Click "Generate a new client secret" button and copy the generated secret

⚠️ **Important**: The client secret will only be shown once. Make sure to copy it immediately!

### 4. Configure Environment Variables

You need to configure these in your **Supabase Dashboard** (not your app's environment variables):

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **GitHub** and enable it
4. Add your GitHub OAuth credentials:
   - **Client ID**: `your_client_id_here`
   - **Client Secret**: `your_client_secret_here`

**Note**: Since you're using Supabase Auth, the OAuth flow is handled by Supabase, not your custom API routes.

### 5. For Local Development (Optional)

If you want to test locally, create a separate OAuth app:

**For Local Development:**

You can use the same OAuth app for both development and production since Supabase handles the callback. Just make sure your local Supabase configuration points to the same project, or create a separate Supabase project for development.

**Local Supabase Setup:**
- Use your local Supabase project URL
- Configure the same GitHub OAuth app in your local Supabase dashboard
- The callback URL will be: `https://your-local-supabase-project.supabase.co/auth/v1/callback`

### 6. Required Permissions

The OAuth app will request these permissions (already configured in the code):
- `repo` - Access to repositories (for scanning code)
- `user:email` - Access to user email
- `read:org` - Read organization membership

### 7. Security Considerations

1. **Keep Client Secret Safe**: Never expose the client secret in frontend code
2. **Use HTTPS**: Always use HTTPS for production callback URLs
3. **Validate State Parameter**: The implementation includes state validation for security

### 8. Testing the Integration

1. Configure GitHub OAuth in your Supabase dashboard
2. Navigate to your dashboard: `https://c79fc71801a141ac89cc07f4653cefa9-988a859a62a5454f9b3342c9b.fly.dev/dashboard`
3. Find the "GitHub Integration" section
4. Click "Connect GitHub"
5. You should be redirected to GitHub for authorization
6. Supabase will handle the OAuth flow and redirect you back
7. Your GitHub connection should appear in the dashboard

### 9. Troubleshooting

**Common Issues:**

1. **"Application not found" error**
   - Check that the Client ID is correct
   - Ensure the OAuth app exists in your GitHub account

2. **"Redirect URI mismatch" error**
   - Verify the callback URL exactly matches what's configured in GitHub
   - Ensure you're using HTTPS for production

3. **"Invalid client" error**
   - Check that the Client Secret is correct
   - Ensure environment variables are properly set in your deployment

4. **OAuth flow opens but doesn't redirect back**
   - Check browser console for errors
   - Verify GitHub provider is enabled in Supabase Auth
   - Check Supabase Auth logs for any errors

### 10. Verification Steps

After setup, verify everything works:

1. ✅ OAuth app created in GitHub
2. ✅ Environment variables set in deployment
3. ✅ Can click "Connect GitHub" without errors
4. ✅ GitHub authorization page appears
5. ✅ After approval, redirected back to dashboard
6. ✅ GitHub integration shows as connected

## Quick Reference

**Your OAuth App Details:**
- **App Name**: NeuroLint Pro
- **Homepage**: https://c79fc71801a141ac89cc07f4653cefa9-988a859a62a5454f9b3342c9b.fly.dev
- **Callback**: https://jetwhffgmohdqkuegtjh.supabase.co/auth/v1/callback

**Supabase Configuration:**
1. Go to Supabase Dashboard → Authentication → Providers
2. Enable GitHub provider
3. Add your GitHub OAuth App credentials:
   - Client ID: `<from_github_oauth_app>`
   - Client Secret: `<from_github_oauth_app>`

**No environment variables needed** - Supabase handles the OAuth flow automatically!

That's it! Your GitHub OAuth integration should now work with the NeuroLint Pro repository scanner.
