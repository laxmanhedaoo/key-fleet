import { router } from "aws-lambda-router";
import { providerHandler } from "./handlers/providerHandler.js";
import { keyHandler } from "./handlers/keyHandler.js";
import { authHandler } from "./handlers/authHandler.js";

export const handler = router({
  get: {
    "/providers": providerHandler,
  },
  post: {
    "/keys": keyHandler,
    "/sdk/acquire": (req) => sdkHandler(req, "acquire"),
    "/sdk/release": (req) => sdkHandler(req, "release"),
    "/auth/login": authHandler,
  },
});
