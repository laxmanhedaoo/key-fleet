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
    "/key/acquire": (req) => keyHandler(req, "acquire"),
    "/key/release": (req) => keyHandler(req, "release"),
    "/auth/login": authHandler,
  },
});
