
import { KeyStatus } from "../models/types.ts";

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
