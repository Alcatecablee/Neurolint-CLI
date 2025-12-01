"use client";

import React from "react";

interface IntegrationsHubProps {
  onNavigateToApiKeys: () => void;
}

export default function IntegrationsHub({ onNavigateToApiKeys }: IntegrationsHubProps) {
  return (
    <div className="tab-content">
      <div className="integrations-overview">
        <h3>Integrations & Automations</h3>
        <p className="tab-description">
          Connect NeuroLint with your development workflow.
        </p>

        <div className="integration-categories">
          <div className="integration-category">
            <div className="category-header">
              <h4>CI/CD Pipelines</h4>
              <span className="category-status" data-status="coming-soon">
                Coming Soon
              </span>
            </div>
            <p>
              Automatically analyze code in your CI/CD pipeline with GitHub
              Actions, GitLab CI, Jenkins, and more.
            </p>
            <div className="supported-platforms">
              <span className="platform-badge">GitHub Actions</span>
              <span className="platform-badge">GitLab CI</span>
              <span className="platform-badge">Jenkins</span>
              <span className="platform-badge">Azure DevOps</span>
            </div>
          </div>

          <div className="integration-category">
            <div className="category-header">
              <h4>Webhooks</h4>
              <span className="category-status" data-status="available">
                Available
              </span>
            </div>
            <p>
              Receive real-time notifications when analyses complete or issues
              are detected.
            </p>
            <div className="webhook-features">
              <div className="feature-item">
                Analysis completion notifications
              </div>
              <div className="feature-item">Error alerts</div>
              <div className="feature-item">Custom payload formatting</div>
              <div className="feature-item">Retry mechanisms</div>
            </div>
          </div>

          <div className="integration-category">
            <div className="category-header">
              <h4>Team Notifications</h4>
              <span className="category-status" data-status="available">
                Available
              </span>
            </div>
            <p>
              Keep your team informed with Slack and Microsoft Teams
              integrations.
            </p>
            <div className="notification-channels">
              <div className="channel-item">
                <span>Slack Channels</span>
              </div>
              <div className="channel-item">
                <span>Email Notifications</span>
              </div>
              <div className="channel-item">
                <span>Microsoft Teams</span>
              </div>
            </div>
          </div>

          <div className="integration-category">
            <div className="category-header">
              <h4>API Access</h4>
              <span className="category-status" data-status="available">
                Available
              </span>
            </div>
            <p>
              Programmatic access to NeuroLint analysis engine with
              comprehensive REST API.
            </p>
            <div className="api-features">
              <div className="feature-item">API key authentication</div>
              <div className="feature-item">Rate limiting</div>
              <div className="feature-item">OpenAPI documentation</div>
              <div className="feature-item">SDKs coming soon</div>
            </div>
            <div className="api-actions">
              <button
                className="btn btn-primary"
                onClick={() => window.open("/api/docs?format=html", "_blank")}
                aria-label="Open API documentation in new tab"
              >
                View API Docs
              </button>
              <button
                className="btn btn-secondary"
                onClick={onNavigateToApiKeys}
                aria-label="Navigate to API keys management section"
              >
                Manage API Keys
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export type { IntegrationsHubProps };
