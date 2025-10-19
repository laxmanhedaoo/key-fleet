// src/services/keyManager.ts
import { redis } from "./redisClient.js";
import { KeyInfo } from "../models/model.js";
import { KeyStatus, KeyAction } from "../types.js";

const KEY_PREFIX = "KEY:";

export const KeyManager = {

  async acquire(providerId: string): Promise<KeyInfo | null> {
    const keys = (await redis.json.get(`${KEY_PREFIX}${providerId}`)) as KeyInfo[] || [];

    const available = keys.find(k => k.status === KeyStatus.ACTIVE);
    if (!available) return null;

    available.status = KeyStatus.IN_USE;
    available.lastUsed = new Date().toISOString();

    await redis.json.set(`${KEY_PREFIX}${providerId}`, "$", keys);
    return available;
  },

  async release(providerId: string, keyId: string): Promise<boolean> {
    const keys = (await redis.json.get(`${KEY_PREFIX}${providerId}`)) as KeyInfo[] || [];

    const target = keys.find(k => k.id === keyId);
    if (!target) return false;

    target.status = KeyStatus.ACTIVE;
    await redis.json.set(`${KEY_PREFIX}${providerId}`, "$", keys);
    return true;
  },

  async create(providerId: string, keyValue: string): Promise<KeyInfo> {
    const keys = (await redis.json.get(`${KEY_PREFIX}${providerId}`)) as KeyInfo[] || [];
    const newKey: KeyInfo = {
      id: `key_${Date.now()}`,
      providerId,
      key: keyValue,
      status: KeyStatus.PENDING,
      lastUsed: undefined,
      metadata: {}
    };

    keys.push(newKey);
    await redis.json.set(`${KEY_PREFIX}${providerId}`, "$", keys);
    return newKey;
  },

  async markInvalid(providerId: string, keyId: string): Promise<boolean> {
    const keys = (await redis.json.get(`${KEY_PREFIX}${providerId}`)) as KeyInfo[] || [];

    const target = keys.find(k => k.id === keyId);
    if (!target) return false;

    target.status = KeyStatus.DISABLED;
    await redis.json.set(`${KEY_PREFIX}${providerId}`, "$", keys);
    return true;
  },

  async expire(providerId: string, keyId: string): Promise<boolean> {
    const keys = (await redis.json.get(`${KEY_PREFIX}${providerId}`)) as KeyInfo[] || [];

    const target = keys.find(k => k.id === keyId);
    if (!target) return false;

    target.status = KeyStatus.EXPIRED;
    await redis.json.set(`${KEY_PREFIX}${providerId}`, "$", keys);
    return true;
  }
};
