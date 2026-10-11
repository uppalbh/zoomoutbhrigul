/* eslint-disable @typescript-eslint/no-explicit-any */
// Vite project: env vars use the VITE_ prefix (equivalent of NEXT_PUBLIC_).
const env = import.meta.env as Record<string, string | undefined>;
export const API_BASE = env["VITE_API_BASE_URL"] ?? "http://localhost:8000";
export const API_KEY = env["VITE_API_KEY"] ?? "";
export const PHOTON_NUMBER = env["VITE_PHOTON_NUMBER"];
export const REPORT_BASE_URL = env["VITE_REPORT_BASE_URL"];

// Kept for existing pages.
export function apiHeaders(): HeadersInit {
  return { "Content-Type": "application/json", ...(API_KEY ? { "X-API-Key": API_KEY } : {}) };
}

export type JobStatus = "queued" | "running" | "done" | "failed";

export interface Job {
  status: JobStatus;
  stage: string | null;
  progress: number;
  report_id?: string | null;
  error?: { code: string; stage: string; message: string; retryable: boolean } | null;
}

export interface AnalysisResult {
  job_id: string;
  status: JobStatus;
}

export interface ReportV2 {
  schema_version: "2.1";
  report_id: string;
  job_id: string;
  outcome: "matched" | "no_verified_match";
  submitted: { post: any; transcript: any };
  source: { post: any; transcript: any } | null;
  source_match: any;
  fact_check: any;
  historical_parallels: any;
  manipulation_check: any;
  summary: string | null;
  limitations: string[];
}

export class QuantroApiError extends Error {
  code: string;
  stage: string;
  status: number;
  retryable: boolean;
  constructor(status: number, code: string, stage: string, message: string, retryable = false) {
    super(message);
    this.name = "QuantroApiError";
    this.status = status;
    this.code = code;
    this.stage = stage;
    this.retryable = retryable;
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": API_KEY,
        ...(init?.headers ?? {}),
      },
      cache: "no-store",
    });
  } catch {
    throw new QuantroApiError(0, "NETWORK_ERROR", "fetch", "Backend unreachable. Is it running on localhost:8000?", true);
  }

  if (res.status === 401) {
    throw new QuantroApiError(401, "UNAUTHORIZED", "auth", "Missing API key.", false);
  }
  if (res.status === 404) {
    throw new QuantroApiError(404, "NOT_FOUND", path, "Report not found.", false);
  }
  if (res.status >= 500) {
    let msg = `Backend error (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error?.message) msg = `Backend error: ${body.error.message}`;
    } catch {
      /* ignore */
    }
    throw new QuantroApiError(res.status, "SERVER_ERROR", path, msg, true);
  }
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    let code = "REQUEST_FAILED";
    let stage = path;
    let retryable = false;
    try {
      const body = await res.json();
      if (body?.error) {
        msg = body.error.message ?? msg;
        code = body.error.code ?? code;
        stage = body.error.stage ?? stage;
        retryable = body.error.retryable ?? retryable;
      }
    } catch {
      /* ignore */
    }
    throw new QuantroApiError(res.status, code, stage, msg, retryable);
  }

  return (await res.json()) as T;
}

export async function runAnalysis(url: string): Promise<AnalysisResult> {
  return call<AnalysisResult>("/analyze", {
    method: "POST",
    body: JSON.stringify({ url, conversation_id: null }),
  });
}

export async function getJob(jobId: string): Promise<Job> {
  return call<Job>(`/jobs/${encodeURIComponent(jobId)}`);
}

export async function getReport(reportId: string): Promise<ReportV2> {
  return call<ReportV2>(`/reports/${encodeURIComponent(reportId)}`);
}
