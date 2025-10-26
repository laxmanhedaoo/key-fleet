// src/handlers/keyHandler.ts
import { KeyManager } from "../services/keyManager.js";
import { KeyAction } from "../models/types.js";

export async function keyHandler(req: any, action: KeyAction) {
  const body = JSON.parse(req.body || "{}");
  const { provider, keyId, metadata } = body;

  switch (action) {
    case KeyAction.ACQUIRE: {
      const data = await KeyManager.acquire(provider);
      if (!data) {
        return {
          statusCode: 404,
          body: JSON.stringify({ error: `No keys available for provider: ${provider}` }),
        };
      }
      return {
        statusCode: 200,
        body: JSON.stringify(data), // now always a KeyInfo object
      };
    }

    case KeyAction.RELEASE: {
      const data = await KeyManager.release(provider, keyId);
      return {
        statusCode: 200,
        body: JSON.stringify(data)
      };
    }

    case KeyAction.CREATE: {
      const data = await KeyManager.addKey(provider, metadata);
      return {
        statusCode: 201,
        body: JSON.stringify(data.id)
      };
    }

    case KeyAction.FETCH: {
      const data = await KeyManager.getAllKeys(provider);
      return {
        statusCode: 201,
        body: JSON.stringify(data)
      };
    }


    default:
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid action" })
      };
  }
}
