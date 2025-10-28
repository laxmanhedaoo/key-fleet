// src/services/keyManager.ts
import { redis } from "./redisClient.js";
import { KeyInfo } from "../models/model.js";
import { KeyStatus } from "../models/types.js";


const KEY_PREFIX = "KEY:";

export const KeyManager = {


  // async acquire(provider: string) : Promise<any>{ 
  //   console.log(`acquire() for provider ${provider}`)  
  //   const usageKey = `${KEY_PREFIX}${provider}:keys`;
  //   const metaKey = `${KEY_PREFIX}${provider}:meta`;
    
  //   const result = await redis.zrange(usageKey, 0, 0, { withScores: true });

  //   if (!result || result.length === 0) throw new Error(`No keys for provider result: ${provider}`);

  //   // result is [member, score]
  //   const keyId = result[0] as string;   // member
  //   const score = Number(result[1]);     // score (string → number)

  //   console.log(`acquire() KEY ID ${keyId} SCORE ${score}`);

  //   if (!keyId) throw new Error(`No keys for provider: ${provider}`);

  //   const keyData = await redis.hget(metaKey, keyId);
  //   if (!keyData) throw new Error(`Metadata missing for ${keyId}`);
  //   console.log(` KEY Data ${JSON.stringify(keyData)}`)

  //   const data = typeof keyData === "string" ? JSON.parse(keyData) : keyData;
  //   if (data.status !== KeyStatus.ACTIVE) {
  //     // skip and bump usage slightly
  //     console.log(` Status is NOT ACTIVE of key ${keyId}`) 
  //     return await this.acquire(provider);
  //   }

  //   console.log(` Status is ACTIVE of key ${keyId} and marking IN_USE`)
  //   // mark as IN_USE
  //   data.status = KeyStatus.IN_USE;
  //   data.lastUsed = new Date().toISOString();

  //   await redis.hset(metaKey, { [data.id]: JSON.stringify(data) });
  //   await redis.zincrby(usageKey, 1, keyId);

  //   return data;
  // },


  async changeToInUse(data: any, metaKey: any, usageKey: any, keyId:any){
    data.status = KeyStatus.IN_USE;
    data.lastUsed = new Date().toISOString();

    await redis.hset(metaKey, { [data.id]: JSON.stringify(data) });
    await redis.zincrby(usageKey, 1, keyId);
  },

  async getMetaMap(redis: any, metaKey: string): Promise<Map<string, KeyInfo>> {
    const rawMetaEntries = (await redis.hgetall(metaKey)) || {};
    const metaEntries = (rawMetaEntries || {}) as Record<string, any>;
    const metaMap = new Map<string, KeyInfo>();
    console.log(`rawMetaEntries. : ${JSON.stringify(rawMetaEntries)}`);
    console.log(`metaEntries. : ${JSON.stringify(metaEntries)}`);
    console.log('Type of rawMetaEntries:', typeof rawMetaEntries);
    for (const [keyId, metaStr] of Object.entries(metaEntries)) {
      try {
        console.log(`metaStr : ${JSON.stringify(metaStr)}`);
        console.log('Type of metaStr:', typeof metaStr); 
        metaMap.set(keyId, metaStr);
      } catch (err) {
        console.error(`Invalid JSON for ${keyId}: ${JSON.stringify(metaStr)}`);
      }
    }

    return metaMap;
  },

  async acquire(provider: string): Promise<any> {
    console.log(`acquire() for provider ${provider}`);

    const usageKey = `${KEY_PREFIX}${provider}:keys`;
    const metaKey = `${KEY_PREFIX}${provider}:meta`;

    // --- 1. Fetch all keys & metadata in one go ---
    const keyIds = await redis.zrange(usageKey, 0, -1) as string[];
    if (!keyIds.length) throw new Error(`No keys for provider: ${provider}`);
 
    const keyValueMap= await this.getMetaMap(redis, metaKey)
    console.log(`keyValueMap : ${keyValueMap}`);
    
    for (const keyId of keyIds) {
      const keyInfo = keyValueMap.get(keyId);
      if (keyInfo?.status === KeyStatus.ACTIVE) {
        console.log(`✅ Found ACTIVE key: ${keyId}`);
        this.changeToInUse(keyInfo, metaKey, usageKey, keyId)
        return keyInfo;
      } else {
        console.log(`⏭️ Skipping key ${keyId} (status: ${keyInfo?.status})`);
      }
    }

    // --- 3. All keys are IN_USE: apply concurrency/monthly checks ---
    console.log(`⚠️ All keys are IN_USE for provider: ${provider} BUT CHECKING OTHER PARAMETERS`);
    
    for (const keyInfo of keyValueMap.values()) {
      const currentConcurrency = keyInfo.concurrency ?? 0;
      const maxConcurrency = keyInfo.maxConcurrency ?? 5;
      const currentMonthlyUsageCount = keyInfo.monthlyUsageCount ?? 0;
      const monthlyUsageLimit = keyInfo.monthlyUsageLimit ?? 1000;
      const currentMonthlyUsageDuration = keyInfo.monthlyUsageDuration ?? 0;
      const monthlyDurationLimit = keyInfo.monthlyDurationLimit ?? 5000;

      if (currentConcurrency < maxConcurrency && currentMonthlyUsageCount < monthlyUsageLimit 
        && currentMonthlyUsageDuration < monthlyDurationLimit) {
        keyInfo.concurrency = currentConcurrency + 1;
        keyInfo.monthlyUsageCount = currentMonthlyUsageCount + 1;
        keyInfo.lastUsed = new Date().toISOString();

        await redis.hset(metaKey, { [keyInfo.id]: JSON.stringify(keyInfo) });
        await redis.zincrby(usageKey, 1, keyInfo.id);

        console.log(`✅ Reusing key ${keyInfo.id} (concurrency ${keyInfo.concurrency}/${maxConcurrency})`);
        return keyInfo;
      }
    } 

    throw new Error(`🚫 All keys are IN_USE and limits reached for provider: ${provider}`);
  },

  async release(provider: string, keyId: string){ 

    const metaKey = `${KEY_PREFIX}${provider}:meta`;
    const raw = await redis.hget(metaKey, keyId) as string;
    if (!raw) throw new Error(`Key ${keyId} not found`);
    let data: KeyInfo;
    try {
      data = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch (err) {
      throw new Error(`Invalid metadata for key ${keyId}: ${(err as Error).message}`);
    } 
    if (data.status === KeyStatus.ACTIVE) {
      console.warn(`Key ${keyId} is already ACTIVE — release skipped`);
      return data;
    }
    console.log(`typeof data.concurrency : ${ data.concurrency}`);
    
    if (data.concurrency <= 0) {
      data.concurrency = 0;
    } else {
      data.concurrency -= 1;
    }
    if(data.concurrency == 0){
      data.status = KeyStatus.ACTIVE;
    }

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
      // concurrency tracking
      concurrency: 0,
      maxConcurrency: metadata.maxConcurrency ?? 5, // default: 5 clients

      // monthly usage count tracking
      monthlyUsageCount: 0,
      monthlyUsageLimit: metadata.monthlyUsageLimit ?? 1000, // default: 1000 acquisitions/month

      // monthly duration tracking (in minutes)
      monthlyUsageDuration: 0,
      monthlyDurationLimit: metadata.monthlyDurationLimit ?? 5000, // default: 5000 minutes/month

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
