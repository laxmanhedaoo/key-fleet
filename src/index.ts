// src/index.ts
import { providerHandler } from "./handlers/providerHandler.js";
import { keyHandler } from "./handlers/keyHandler.js";
import { authHandler } from "./handlers/authHandler.js";
import { KeyAction } from "./types.js";
import { APIGatewayEvent, Context } from "aws-lambda";

export const handler = async (event: APIGatewayEvent, context: Context) => {
  const path = event.resource || event.path;
  const method = event.httpMethod;

  if (path === "/providers" && method === "GET") {
    return providerHandler(event);
  }

  if (path === "/keys" && method === "POST") {
    return keyHandler(event, KeyAction.CREATE);
  }

  if (path === "/key/acquire" && method === "POST") {
    return keyHandler(event, KeyAction.ACQUIRE);
  }

  if (path === "/key/release" && method === "POST") {
    return keyHandler(event, KeyAction.RELEASE);
  }

  if (path === "/auth/login" && method === "POST") {
    return authHandler(event);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: "Route not found" }),
  };
};
