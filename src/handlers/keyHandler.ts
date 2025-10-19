// src/handlers/keyHandler.ts
import { KeyManager } from "../services/keyManager.js";
import { KeyAction } from "../types.js";

export async function keyHandler(req: any, action: KeyAction) {
  const body = JSON.parse(req.body || "{}");
  const { providerId, keyId, key } = body;

  switch (action) {
    case KeyAction.ACQUIRE: {
      const result = await KeyManager.acquire(providerId);
      return {
        statusCode: 200,
        body: JSON.stringify(result)
      };
    }

    case KeyAction.RELEASE: {
      const ok = await KeyManager.release(providerId, keyId);
      return {
        statusCode: 200,
        body: JSON.stringify({ released: ok })
      };
    }

    case KeyAction.CREATE: {
      const created = await KeyManager.create(providerId, key);
      return {
        statusCode: 201,
        body: JSON.stringify(created)
      };
    }

    case KeyAction.MARK_INVALID: {
      const ok = await KeyManager.markInvalid(providerId, keyId);
      return {
        statusCode: 200,
        body: JSON.stringify({ invalidated: ok })
      };
    }

    case KeyAction.EXPIRE: {
      const ok = await KeyManager.expire(providerId, keyId);
      return {
        statusCode: 200,
        body: JSON.stringify({ expired: ok })
      };
    }

    default:
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid action" })
      };
  }
}
