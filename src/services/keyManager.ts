// src/services/keyManager.ts
import { redis } from "./redisClient.js";
import { KeyInfo } from "../models/model.js";
import { KeyStatus } from "../models/types.js";


const KEY_PREFIX = "KEY:";

export const KeyManager = {


  async acquire(provider: string) : Promise<any>{ 
    console.log(`acquire() for provider ${provider}`)  
    const usageKey = `${KEY_PREFIX}${provider}:keys`;
    const metaKey = `${KEY_PREFIX}${provider}:meta`;
    
    const result = await redis.zrange(usageKey, 0, 0, { withScores: true });

    if (!result || result.length === 0) throw new Error(`No keys for provider result: ${provider}`);

    // result is [member, score]
    const keyId = result[0] as string;   // member
    const score = Number(result[1]);     // score (string → number)

    console.log(`acquire() KEY ID ${keyId} SCORE ${score}`);

    if (!keyId) throw new Error(`No keys for provider: ${provider}`);

    const keyData = await redis.hget(metaKey, keyId);
    if (!keyData) throw new Error(`Metadata missing for ${keyId}`);
    console.log(` KEY Data ${JSON.stringify(keyData)}`)

    const data = typeof keyData === "string" ? JSON.parse(keyData) : keyData;
    if (data.status !== KeyStatus.ACTIVE) {
      // skip and bump usage slightly
      console.log(` Status is NOT ACTIVE of key ${keyId}`) 
      return await this.acquire(provider);
    }

    console.log(` Status is ACTIVE of key ${keyId} and marking IN_USE`)
    // mark as IN_USE
    data.status = KeyStatus.IN_USE;
    data.lastUsed = new Date().toISOString();

    await redis.hset(metaKey, { [data.id]: JSON.stringify(data) });
    await redis.zincrby(usageKey, 1, keyId);

    return data;
  },

  async release(provider: string, keyId: string){ 

    const metaKey = `${KEY_PREFIX}${provider}:meta`;
    const raw = await redis.hget(metaKey, keyId) as string;
    if (!raw) throw new Error(`Key ${keyId} not found`);
    const data = typeof raw === "string" ? JSON.parse(raw) : raw;
    data.status = KeyStatus.ACTIVE;
    data.lastUsed = new Date().toISOString();

    await redis.hset(metaKey, { [keyId]: JSON.stringify(data) });
    return data;
  },
  
  async addKey(provider: string, metadata: Record<string, any>) {
    const metaKey = `${KEY_PREFIX}${provider}:meta`;
    const usageKey = `${KEY_PREFIX}${provider}:keys`;

    const keyId = `key_${Date.now()}`;

    const keyData: KeyInfo = {
      id: keyId,
      provider: provider,
      status: KeyStatus.ACTIVE,
      lastUsed: undefined,
      ...metadata,
    };

    // store metadata as JSON string in hash
    await redis.hset(metaKey, { [keyId]: JSON.stringify(keyData) });
 
    // add key to round-robin zset
    await redis.zadd(usageKey, { score: 0, member: keyId });
    return keyData;
  },

  
  async getAllKeys(provider: string) {
    const metaKey = `${KEY_PREFIX}${provider}:meta`;

    // Fetch all key metadata (stored in hash)
    const metaEntries = await redis.hgetall(metaKey);
    if (!metaEntries || Object.keys(metaEntries).length === 0) {
      return [];
    }
    return metaEntries
  }
}
