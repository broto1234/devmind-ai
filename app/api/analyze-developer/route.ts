import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { developerSchema } from "@/app/lib/schemas/developer";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: body.message,

      response_format: {
        type: "text",
        mime_type: "application/json",
        schema: z.toJSONSchema(developerSchema),
      },
    });

    if (!response.output_text) {
      throw new Error("Gemini returned no output");
    }

    const data = JSON.parse(response.output_text);

    const validatedData = developerSchema.parse(data);

    return Response.json({
      data: validatedData,
    });

  } catch (error) {
    console.error("AI analysis error:", error);

    return Response.json(
      {
        error: "AI analysis failed",
      },
      {
        status: 500,
      },
    );
  }
}