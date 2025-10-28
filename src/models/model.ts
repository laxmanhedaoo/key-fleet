
import { KeyStatus } from "../models/types.js";

export interface Provider {
  id: string;
  name: string; // OpenAI, Gemini, Livekit, etc.
  status: "active" | "inactive";
}

export interface KeyInfo {
  id: string;
  provider: string;
  status: KeyStatus
  lastUsed?: string;
  
  concurrency: number,
  maxConcurrency: number, 
  
  monthlyUsageCount: number,
  monthlyUsageLimit: number, 
  
  monthlyUsageDuration: number,
  monthlyDurationLimit: number,
  metadata?: Record<string, any>;
}

export interface Application {
  id: string;
  name: string;
  metadata?: Record<string, any>;
}

export interface Usage {
  keyId: string;
  appId: string;
  usedAt: string;
  requestCount: number;
}
