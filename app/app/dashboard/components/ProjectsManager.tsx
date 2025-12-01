"use client";

import React from "react";
import { LoadingButton, SectionLoader } from "../../../components/ui/LoadingSpinner";

interface Project {
  id: string;
  name: string;
  description: string;
  files: string[];
  createdAt: Date;
  lastAnalyzed?: Date;
}

interface ProjectsManagerProps {
  projects: Project[];
  isLoading: boolean;
  isLoadingDashboardData: boolean;
  onCreateProject: () => Promise<void>;
  onDeleteProject: (projectId: string, projectName: string) => Promise<void>;
  onOpenProject: (projectId: string) => void;
  getDeleteLoadingState: (projectId: string) => boolean;
}

export default function ProjectsManager({
  projects,
  isLoading,
  isLoadingDashboardData,
  onCreateProject,
  onDeleteProject,
  onOpenProject,
  getDeleteLoadingState,
}: ProjectsManagerProps) {
  return (
    <div className="tab-content">
      <div className="projects-header">
        <h3>Your Projects</h3>
        <LoadingButton
          isLoading={isLoading}
          variant="primary"
          onClick={onCreateProject}
        >
          New Project
        </LoadingButton>
      </div>

      {isLoadingDashboardData ? (
        <SectionLoader message="Loading your projects..." />
      ) : projects.length === 0 ? (
        <div className="empty-state">
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v2M7 13h10l-4-8H7l-4 8z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No projects yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Create your first project to organize your code analysis and
              track improvements over time.
            </p>
            <LoadingButton
              isLoading={isLoading}
              variant="primary"
              onClick={onCreateProject}
            >
              Create Your First Project
            </LoadingButton>
          </div>
        </div>
      ) : (
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <h4>{project.name}</h4>
              <p className="project-meta">
                Created {project.createdAt.toLocaleDateString()}
              </p>
              <p className="project-stats">{project.files.length} files</p>
              <div className="project-actions">
                <button
                  className="btn btn-sm"
                  onClick={() => onOpenProject(project.id)}
                >
                  Open
                </button>
                <LoadingButton
                  isLoading={getDeleteLoadingState(project.id)}
                  variant="danger"
                  className="btn-sm"
                  onClick={() => onDeleteProject(project.id, project.name)}
                >
                  Delete
                </LoadingButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export type { ProjectsManagerProps, Project };
