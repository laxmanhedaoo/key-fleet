// tests/keyManager.test.ts
import { KeyManager } from "../src/services/keyManager.js";
import { redis } from "../src/services/redisClient.js";
import { KeyStatus } from "../src/types.js";

jest.mock("../src/services/redisClient.js", () => {
  return {
    redis: {
      json: {
        get: jest.fn(),
        set: jest.fn(),
      },
    },
  };
});

describe("KeyManager", () => {
  const providerId = "provider_test";

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should acquire an available key", async () => {
    const mockKeys = [
      { id: "k1", providerId, key: "abc", status: KeyStatus.ACTIVE, lastUsed: undefined },
    ];

    (redis.json.get as jest.Mock).mockResolvedValue(mockKeys);
    (redis.json.set as jest.Mock).mockResolvedValue(true);

    const key = await KeyManager.acquire(providerId);

    expect(key).toBeDefined();
    expect(key?.status).toBe(KeyStatus.IN_USE);
    expect(redis.json.set).toHaveBeenCalled();
  });

  it("should release a key", async () => {
    const mockKeys = [
      { id: "k1", providerId, key: "abc", status: KeyStatus.IN_USE, lastUsed: undefined },
    ];
    (redis.json.get as jest.Mock).mockResolvedValue(mockKeys);
    (redis.json.set as jest.Mock).mockResolvedValue(true);

    const result = await KeyManager.release(providerId, "k1");

    expect(result).toBe(true);
    expect(mockKeys[0].status).toBe(KeyStatus.ACTIVE);
  });
});
