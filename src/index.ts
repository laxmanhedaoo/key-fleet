// src/index.ts
import { providerHandler } from "./handlers/providerHandler.js";
import { keyHandler } from "./handlers/keyHandler.js";
import { authHandler } from "./handlers/authHandler.js";
import { KeyAction } from "./models/types.js";
import { APIGatewayEvent, Context } from "aws-lambda";

export const handler = async (event: APIGatewayEvent, context: Context) => {

  console.log("FULL EVENT:", JSON.stringify(event, null, 2));
  const path = event.resource || event.path;
  const method = event.httpMethod;
  
  console.log("EVENT PATH:", event.path);
  console.log("EVENT RESOURCE:", event.resource);
  console.log("HTTP METHOD:", event.httpMethod);
  if (path.endsWith("/providers") && method === "GET") {
    return providerHandler(event);
  }

  if (path.endsWith("/keys") && method === "POST") {
    return keyHandler(event, KeyAction.CREATE);
  }

  if (path.endsWith("/keys") && method === "GET") {
    return keyHandler(event, KeyAction.FETCH);
  }

  if (path.endsWith("/key/acquire") && method === "POST") {
    return keyHandler(event, KeyAction.ACQUIRE);
  }

  if (path.endsWith("/key/release") && method === "POST") {
    return keyHandler(event, KeyAction.RELEASE);
  }

  if (path.endsWith("/auth/login") && method === "POST") {
    return authHandler(event);
  }

  return {
    statusCode: 404,
    body: JSON.stringify({ message: "Route not found" }),
  };
};
