import { NextResponse } from "next/server";

export const runtime = "nodejs";

type VerificationRequest = {
  image: string;
  mimeType: string;
  kind: "report" | "collection";
  expectedWasteType?: string;
  expectedAmount?: string;
};

type GroqCompletion = {
  choices?: Array<{ message?: { content?: string } }>;
  error?: { message?: string };
};

const supportedMimeTypes = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "Groq is not configured on the server." },
      { status: 503 }
    );
  }

  let body: VerificationRequest;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid verification request." },
      { status: 400 }
    );
  }

  if (
    !body.image ||
    !supportedMimeTypes.has(body.mimeType) ||
    !["report", "collection"].includes(body.kind)
  ) {
    return NextResponse.json(
      { error: "A supported waste image and verification type are required." },
      { status: 400 }
    );
  }

  const prompt =
    body.kind === "collection"
      ? `You are an expert in waste management and recycling. Analyze the image. Confirm whether the waste type matches "${body.expectedWasteType ?? "not provided"}" and whether the quantity matches "${body.expectedAmount ?? "not provided"}". Return exactly this JSON object: {"wasteTypeMatch":boolean,"quantityMatch":boolean,"confidence":number}. Confidence must be a number from 0 to 1.`
      : 'You are an expert in waste management and recycling. Analyze the image. Return exactly this JSON object: {"wasteType":string,"quantity":string,"confidence":number}. Use a waste type such as plastic, paper, glass, metal, or organic. Confidence must be a number from 0 to 1.';

  const base64Image = body.image.replace(/^data:[^;]+;base64,/, "");

  try {
    const response = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "qwen/qwen3.8-27b",
          temperature: 0,
          max_completion_tokens: 300,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                {
                  type: "image_url",
                  image_url: {
                    url: `data:${body.mimeType};base64,${base64Image}`,
                  },
                },
              ],
            },
          ],
        }),
      }
    );

    const payload = (await response.json()) as GroqCompletion;
    if (!response.ok) {
      console.error("Groq waste verification failed:", payload.error?.message);
      throw new Error("Groq request failed.");
    }

    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) throw new Error("Groq returned an empty response.");
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    console.error("Waste verification failed:", error);
    return NextResponse.json(
      { error: "Verification is temporarily unavailable. Please try again." },
      { status: 502 }
    );
  }
}
