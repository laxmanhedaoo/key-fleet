import { Auth } from "../services/auth.js";

export async function authHandler(req: any) {
  const body = JSON.parse(req.body || "{}");
  const { token } = body;

  if (Auth.validate(token)) {
    return { statusCode: 200, body: JSON.stringify({ valid: true }) };
  }

  return { statusCode: 401, body: JSON.stringify({ valid: false }) };
}
