"use client";

import React from "react";
import Link from "next/link";

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  isExternal?: boolean;
  href?: string;
}

interface User {
  firstName?: string;
  lastName?: string;
  email?: string;
  plan?: string;
}

interface SidebarShellProps {
  sidebarCollapsed: boolean;
  userExpandedSidebar: boolean;
  activeSection: string;
  user: User | null;
  onToggleSidebar: () => void;
  onSectionChange: (sectionId: string) => void;
  onSignOut: () => void;
}

const sidebarItems: SidebarItem[] = [
  {
    id: "overview",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
    label: "Overview",
    description: "Dashboard summary",
  },
  {
    id: "editor",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    label: "Code Analysis",
    description: "Analyze your code",
  },
  {
    id: "bulk",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
      </svg>
    ),
    label: "GitHub Integration",
    description: "Scan repositories",
  },
  {
    id: "api-keys",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
      </svg>
    ),
    label: "API Keys",
    description: "Manage access tokens",
  },
  {
    id: "collaborate",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 00-3-3.87" />
        <path d="M16 3.13a4 4 0 010 7.75" />
      </svg>
    ),
    label: "Collaborate",
    description: "Real-time code editing",
  },
  {
    id: "integrations",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
        <polyline points="7.5,4.21 12,6.81 16.5,4.21" />
        <polyline points="7.5,19.79 7.5,14.6 3,12" />
        <polyline points="21,12 16.5,14.6 16.5,19.79" />
        <polyline points="12,22.08 12,17" />
      </svg>
    ),
    label: "Integrations",
    description: "CI/CD & webhooks",
  },
  {
    id: "projects",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
      </svg>
    ),
    label: "Projects",
    description: "Organize your work",
  },
  {
    id: "history",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12,6 12,12 16,14" />
      </svg>
    ),
    label: "Analysis History",
    description: "Previous analyses",
  },
  {
    id: "samples",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10,9 9,9 8,9" />
      </svg>
    ),
    label: "Sample Files",
    description: "Test with examples",
  },
  {
    id: "account",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
    label: "User Account",
    description: "Profile & billing",
  },
  {
    id: "docs",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z" />
        <path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z" />
      </svg>
    ),
    label: "Documentation",
    description: "Guides & API reference",
    isExternal: true,
    href: "/docs",
  },
  {
    id: "settings",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="20"
        height="20"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
    label: "Settings",
    description: "Configure preferences",
  },
];

export default function SidebarShell({
  sidebarCollapsed,
  userExpandedSidebar,
  activeSection,
  user,
  onToggleSidebar,
  onSectionChange,
  onSignOut,
}: SidebarShellProps) {
  return (
    <aside
      className={`dashboard-sidebar ${sidebarCollapsed ? "collapsed" : ""} ${userExpandedSidebar ? "user-expanded" : ""}`}
      aria-label="Main navigation"
      role="navigation"
    >
      <div className="sidebar-header">
        <div className="brand">
          <a
            href="/"
            className="brand-logo"
            aria-label="NeuroLint Logo - Go to homepage"
          >
            <img
              src="https://cdn.builder.io/api/v1/image/assets%2Fbcdfdb608d38407b88c1584fe3705961%2F1b38a4a385ed4a0bb404148fae0ce80e?format=webp&width=800"
              alt="NeuroLint"
              width="32"
              height="32"
            />
          </a>
        </div>
        <button
          className="sidebar-toggle"
          onClick={onToggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-expanded={!sidebarCollapsed}
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            {sidebarCollapsed ? (
              <path d="M9 18l6-6-6-6" />
            ) : (
              <path d="M15 18l-6-6 6-6" />
            )}
          </svg>
        </button>
      </div>

      <nav className="sidebar-nav" role="menu">
        {sidebarItems.map((item, index) => {
          if (item.isExternal) {
            return (
              <Link
                key={item.id}
                href={item.href || "#"}
                className="nav-item"
                role="menuitem"
                aria-label={`${item.label}: ${item.description}`}
                tabIndex={0}
                style={{
                  animationDelay: `${index * 0.1}s`,
                  display: "flex",
                  alignItems: "center",
                  textDecoration: "none",
                }}
              >
                <span className="nav-icon" aria-hidden="true">
                  {item.icon}
                </span>
                {!sidebarCollapsed && (
                  <div className="nav-content">
                    <span className="nav-label">{item.label}</span>
                    <span className="nav-description">{item.description}</span>
                  </div>
                )}
              </Link>
            );
          }

          return (
            <button
              key={item.id}
              className={`nav-item nav-item-animated ${activeSection === item.id ? "active" : ""}`}
              onClick={() => onSectionChange(item.id)}
              role="menuitem"
              aria-current={activeSection === item.id ? "page" : undefined}
              aria-label={`${item.label}: ${item.description}`}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSectionChange(item.id);
                }
              }}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <span className="nav-icon" aria-hidden="true">
                {item.icon}
              </span>
              {!sidebarCollapsed && (
                <div className="nav-content">
                  <span className="nav-label">{item.label}</span>
                  <span className="nav-description">{item.description}</span>
                </div>
              )}
            </button>
          );
        })}
      </nav>

      <div className={`sidebar-footer ${sidebarCollapsed ? "collapsed" : ""}`}>
        <div className="user-section">
          <div className="user-avatar" aria-label="User profile">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
          {!sidebarCollapsed && (
            <div className="user-info">
              <span className="user-name">
                {user?.firstName
                  ? `${user.firstName} ${user.lastName}`
                  : user?.email}
              </span>
              <span className="user-plan">
                {user?.plan?.charAt(0).toUpperCase() + (user?.plan?.slice(1) || "") ||
                  "Free"}{" "}
                Plan
              </span>
              <div className="flex items-center space-x-2 mt-1">
                <Link
                  href="/profile"
                  className="text-xs text-gray-400 hover:text-white"
                  title="Profile settings"
                >
                  Profile
                </Link>
                <span className="text-gray-600">•</span>
                <button
                  onClick={onSignOut}
                  className="text-xs text-gray-400 hover:text-white"
                  title="Sign out"
                >
                  Sign out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

export { sidebarItems };
export type { SidebarItem, SidebarShellProps };
