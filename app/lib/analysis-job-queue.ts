import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'crypto';

export type JobStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type JobPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface AnalysisJob {
  id: string;
  userId: string;
  projectId?: string;
  status: JobStatus;
  priority: JobPriority;
  code: string;
  filename?: string;
  layers: number[];
  options: Record<string, any>;
  result?: AnalysisJobResult;
  error?: string;
  progress: number;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  expiresAt: string;
}

export interface AnalysisJobResult {
  success: boolean;
  issues: Array<{
    id: string;
    type: string;
    message: string;
    line: number;
    column: number;
    layer: number;
    severity: 'error' | 'warning' | 'info';
    fix?: {
      description: string;
      code: string;
    };
  }>;
  transformedCode?: string;
  summary: {
    totalIssues: number;
    issuesByLayer: Record<number, number>;
    qualityScore: number;
    executionTime: number;
  };
  layers: Array<{
    layerId: number;
    success: boolean;
    changeCount: number;
    issues: any[];
  }>;
}

export class AnalysisJobQueueClient {
  private supabase: SupabaseClient;
  private userId: string;

  constructor(supabaseClient: SupabaseClient, userId: string) {
    this.supabase = supabaseClient;
    this.userId = userId;
  }

  async createJob(params: {
    code: string;
    filename?: string;
    layers?: number[];
    options?: Record<string, any>;
    priority?: JobPriority;
    projectId?: string;
  }): Promise<AnalysisJob> {
    const jobId = randomUUID();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const job: AnalysisJob = {
      id: jobId,
      userId: this.userId,
      projectId: params.projectId,
      status: 'pending',
      priority: params.priority || 'normal',
      code: params.code,
      filename: params.filename,
      layers: params.layers || [1, 2, 3, 4, 5, 6, 7],
      options: params.options || {},
      progress: 0,
      createdAt: now.toISOString(),
      expiresAt: expiresAt.toISOString(),
    };

    const { error } = await this.supabase
      .from('analysis_jobs')
      .insert({
        id: job.id,
        user_id: job.userId,
        project_id: job.projectId,
        status: job.status,
        priority: job.priority,
        code: job.code,
        filename: job.filename,
        layers: job.layers,
        options: job.options,
        progress: job.progress,
        created_at: job.createdAt,
        expires_at: job.expiresAt,
      });

    if (error) {
      throw new Error(`Failed to create analysis job: ${error.message}`);
    }

    return job;
  }

  async getJob(jobId: string): Promise<AnalysisJob | null> {
    const { data, error } = await this.supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .eq('user_id', this.userId)
      .single();

    if (error || !data) {
      return null;
    }

    return this.mapDbJobToJob(data);
  }

  async getJobsByUser(limit: number = 10): Promise<AnalysisJob[]> {
    const { data, error } = await this.supabase
      .from('analysis_jobs')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map(this.mapDbJobToJob);
  }

  async cancelJob(jobId: string): Promise<boolean> {
    const job = await this.getJob(jobId);
    
    if (!job) {
      return false;
    }

    if (job.status === 'completed' || job.status === 'failed') {
      return false;
    }

    const { error } = await this.supabase
      .from('analysis_jobs')
      .update({
        status: 'cancelled',
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobId)
      .eq('user_id', this.userId);

    if (error) {
      return false;
    }

    return true;
  }

  private mapDbJobToJob(data: any): AnalysisJob {
    return {
      id: data.id,
      userId: data.user_id,
      projectId: data.project_id,
      status: data.status,
      priority: data.priority,
      code: data.code,
      filename: data.filename,
      layers: data.layers,
      options: data.options || {},
      result: data.result,
      error: data.error,
      progress: data.progress,
      createdAt: data.created_at,
      startedAt: data.started_at,
      completedAt: data.completed_at,
      expiresAt: data.expires_at,
    };
  }
}

export function runSynchronousAnalysis(
  code: string,
  options: {
    filename?: string;
    layers?: number[];
  } = {}
): AnalysisJobResult {
  const startTime = Date.now();
  
  try {
    const layersToRun = options.layers || [1, 2, 3, 4, 5, 6, 7];
    
    let sharedCore;
    try {
      sharedCore = require('../../shared-core');
    } catch (e) {
      return createEmptyResult(startTime, 'Analysis engine not available');
    }
    
    const analysisResult = sharedCore.analyze(code, {
      filename: options.filename || 'temp.tsx',
      layers: layersToRun,
    });

    const issues = analysisResult.issues || [];
    const issuesByLayer: Record<number, number> = {};
    
    issues.forEach((issue: any) => {
      const layer = issue.layer || 1;
      issuesByLayer[layer] = (issuesByLayer[layer] || 0) + 1;
    });

    const executionTime = Date.now() - startTime;

    return {
      success: true,
      issues: issues.map((issue: any) => ({
        id: issue.id || randomUUID(),
        type: issue.type || 'code-quality',
        message: issue.message || issue.description || 'Issue detected',
        line: issue.line || 1,
        column: issue.column || 1,
        layer: issue.layer || 1,
        severity: issue.severity || 'warning',
        fix: issue.fix,
      })),
      summary: {
        totalIssues: issues.length,
        issuesByLayer,
        qualityScore: calculateQualityScore(issues),
        executionTime,
      },
      layers: layersToRun.map(layerId => ({
        layerId,
        success: true,
        changeCount: issuesByLayer[layerId] || 0,
        issues: issues.filter((i: any) => (i.layer || 1) === layerId),
      })),
    };
  } catch (error) {
    return createEmptyResult(startTime, error instanceof Error ? error.message : 'Unknown error');
  }
}

function createEmptyResult(startTime: number, errorMessage?: string): AnalysisJobResult {
  return {
    success: false,
    issues: errorMessage ? [{
      id: randomUUID(),
      type: 'error',
      message: errorMessage,
      line: 1,
      column: 1,
      layer: 1,
      severity: 'error',
    }] : [],
    summary: {
      totalIssues: 0,
      issuesByLayer: {},
      qualityScore: 0,
      executionTime: Date.now() - startTime,
    },
    layers: [],
  };
}

function calculateQualityScore(issues: any[]): number {
  if (issues.length === 0) return 100;
  
  const severityWeights = { error: 10, warning: 5, info: 1 };
  const totalPenalty = issues.reduce((sum, issue) => {
    const weight = severityWeights[issue.severity as keyof typeof severityWeights] || 5;
    return sum + weight;
  }, 0);
  
  return Math.max(0, 100 - Math.min(totalPenalty, 100));
}

export async function enqueueAnalysis(
  supabaseClient: SupabaseClient,
  userId: string,
  params: {
    code: string;
    filename?: string;
    layers?: number[];
    options?: Record<string, any>;
    priority?: JobPriority;
  }
): Promise<AnalysisJob> {
  const client = new AnalysisJobQueueClient(supabaseClient, userId);
  return client.createJob(params);
}

export async function getAnalysisStatus(
  supabaseClient: SupabaseClient,
  userId: string,
  jobId: string
): Promise<AnalysisJob | null> {
  const client = new AnalysisJobQueueClient(supabaseClient, userId);
  return client.getJob(jobId);
}

export async function cancelAnalysis(
  supabaseClient: SupabaseClient,
  userId: string,
  jobId: string
): Promise<boolean> {
  const client = new AnalysisJobQueueClient(supabaseClient, userId);
  return client.cancelJob(jobId);
}
