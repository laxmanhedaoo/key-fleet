

import dotenv from "dotenv";
dotenv.config();
import { keyHandler } from "../src/handlers/keyHandler.js"; 
import { KeyAction, KeyStatus } from "../src/models/types.js"; 

import { redis } from "../src/services/redisClient.js";
import { describe, it, expect } from "vitest";


// const { redis } = require("../src/services/redisClient.js");


describe("KeyHandler Test", () => {
   

  // // ---------------- KeyHandler ----------------
  // it("keyHandler CREATE should create a key", async () => { 

  //   const req = {
  //     body: JSON.stringify({ provider: "livekit", metadata: {
  //       "api_key": "mykey123",
  //       "secret": "mysecret123",
  //       "url": "urllll",
  //       "email": "asjdlgkas@gmail.com"
  //     } }),
  //   };
  //   const res = await keyHandler(req, KeyAction.CREATE);
  //   expect(res.statusCode).toBe(201);

  //   const body = JSON.parse(res.body); 
  //   expect(body.status).toBe(KeyStatus.ACTIVE);
  // });

  it("keyHandler ACQUIRE should acquire an active key", async () => { 

    const req = { body: JSON.stringify({ provider: "livekit" }) };
    const res = await keyHandler(req, KeyAction.ACQUIRE);
    console.log(`res : ${JSON.stringify(res)}`)
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body)
    expect(body.status).toBe(KeyStatus.IN_USE);
  });

  it("keyHandler RELEASE should release a key", async () => {
    const mockKeys = [{ id: "key_1761566492465", provider: "livekit", status: KeyStatus.IN_USE }]; 

    const req = { body: JSON.stringify({ provider: "livekit", keyId: "key_1761566492465" }) };
    const res = await keyHandler(req, KeyAction.RELEASE);
    console.log(`RELEASE res : ${JSON.stringify(res)}`)
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body); 
  });
});
