#!/usr/bin/env node

/**
 * NeuroLint Web App - Deployment Setup Script
 * 
 * This script helps automate the initial deployment setup process
 * for Vercel and GitHub integration.
 */

const fs = require('fs').promises;
const path = require('path');
const { execSync } = require('child_process');

class DeploymentSetup {
  constructor() {
    this.projectRoot = process.cwd();
    this.envFile = path.join(this.projectRoot, '.env.local');
  }

  async run() {
    console.log('[INFO] NeuroLint Web App - Deployment Setup\n');

    try {
      await this.checkPrerequisites();
      await this.createEnvFile();
      await this.validateConfiguration();
      await this.setupGit();
      
      console.log('\n[SUCCESS] Setup completed successfully!');
      console.log('\n[INFO] Next steps:');
      console.log('1. Create a GitHub repository');
      console.log('2. Set up Supabase project');
      console.log('3. Deploy to Vercel');
      console.log('4. Configure environment variables in Vercel');
      console.log('\n📖 See DEPLOYMENT_VERCEL_GITHUB.md for detailed instructions');
      
    } catch (error) {
      console.error('\n[ERROR] Setup failed:', error.message);
      process.exit(1);
    }
  }

  async checkPrerequisites() {
    console.log('[INFO] Checking prerequisites...');

    // Check Node.js version
    const nodeVersion = process.version;
    const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
    
    if (majorVersion < 18) {
      throw new Error(`Node.js 18+ required. Current version: ${nodeVersion}`);
    }

    // Check if package.json exists
    const packageJsonPath = path.join(this.projectRoot, 'package.json');
    try {
      await fs.access(packageJsonPath);
    } catch {
      throw new Error('package.json not found. Make sure you\'re in the web-app directory.');
    }

    // Check if Next.js is installed
    try {
      const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'));
      if (!packageJson.dependencies?.next) {
        throw new Error('Next.js not found in dependencies');
      }
    } catch (error) {
      throw new Error('Failed to read package.json');
    }

    console.log('[SUCCESS] Prerequisites check passed');
  }

  async createEnvFile() {
    console.log('📝 Creating environment file...');

    const envTemplate = `# Supabase Configuration (Required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# NextAuth Configuration (Required)
NEXTAUTH_SECRET=your_nextauth_secret_key
NEXTAUTH_URL=https://your-app-name.vercel.app

# Shared-Core Configuration (Required)
NEUROLINT_SHARED_CORE_PATH=./shared-core
NEUROLINT_API_URL=https://app.neurolint.dev/api
BABEL_CACHE_PATH=./.babel-cache

# PayPal Integration (Optional)
PAYPAL_CLIENT_ID=your_paypal_client_id
PAYPAL_CLIENT_SECRET=your_paypal_client_secret

# Analytics (Optional)
NEXT_PUBLIC_GA_ID=your_google_analytics_id
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key

# GitHub Integration (Optional)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Email Configuration (Optional)
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password

# Security (Optional)
JWT_SECRET=your_jwt_secret
ENCRYPTION_KEY=your_encryption_key
`;

    try {
      await fs.writeFile(this.envFile, envTemplate);
      console.log('[SUCCESS] Created .env.local file');
      console.log('[WARNING]  Remember to update the values with your actual credentials');
    } catch (error) {
      throw new Error(`Failed to create .env.local: ${error.message}`);
    }
  }

  async validateConfiguration() {
    console.log('[INFO] Validating configuration...');

    // Check if vercel.json exists
    const vercelConfigPath = path.join(this.projectRoot, 'vercel.json');
    try {
      await fs.access(vercelConfigPath);
      console.log('[SUCCESS] Vercel configuration found');
    } catch {
      console.log('[WARNING]  Vercel configuration not found - will be auto-generated');
    }

    // Check if next.config.js exists
    const nextConfigPath = path.join(this.projectRoot, 'next.config.js');
    try {
      await fs.access(nextConfigPath);
      console.log('[SUCCESS] Next.js configuration found');
    } catch {
      throw new Error('next.config.js not found');
    }

    // Check if TypeScript configuration exists
    const tsConfigPath = path.join(this.projectRoot, 'tsconfig.json');
    try {
      await fs.access(tsConfigPath);
      console.log('[SUCCESS] TypeScript configuration found');
    } catch {
      console.log('[WARNING]  TypeScript configuration not found');
    }
  }

  async setupGit() {
    console.log('📦 Setting up Git...');

    try {
      // Check if git is initialized
      execSync('git status', { stdio: 'ignore' });
      console.log('[SUCCESS] Git repository already initialized');
    } catch {
      try {
        execSync('git init', { stdio: 'ignore' });
        console.log('[SUCCESS] Git repository initialized');
      } catch (error) {
        console.log('[WARNING]  Failed to initialize Git repository');
      }
    }

    // Check if .gitignore exists
    const gitignorePath = path.join(this.projectRoot, '.gitignore');
    try {
      await fs.access(gitignorePath);
      console.log('[SUCCESS] .gitignore found');
    } catch {
      console.log('[WARNING]  .gitignore not found - creating basic one');
      
      const gitignoreContent = `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Next.js
.next/
out/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/

# Temporary folders
tmp/
temp/

# Cache
.cache/
.babel-cache/

# Supabase
.supabase/
`;

      try {
        await fs.writeFile(gitignorePath, gitignoreContent);
        console.log('[SUCCESS] Created .gitignore file');
      } catch (error) {
        console.log('[WARNING]  Failed to create .gitignore file');
      }
    }
  }

  generateRandomSecret() {
    return require('crypto').randomBytes(32).toString('hex');
  }
}

// Run the setup
if (require.main === module) {
  const setup = new DeploymentSetup();
  setup.run().catch(console.error);
}

module.exports = DeploymentSetup; 