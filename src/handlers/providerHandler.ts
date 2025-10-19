export async function providerHandler(req: any) {
  if (req.method === "GET") {
    return {
      statusCode: 200,
      body: JSON.stringify({ providers: ["OpenAI", "Gemini", "Livekit"] }),
    };
  }

  return {
    statusCode: 405,
    body: JSON.stringify({ message: "Method not allowed" }),
  };
}
