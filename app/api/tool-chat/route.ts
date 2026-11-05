import { GoogleGenAI } from "@google/genai";
import { toolDefinitions } from "@/app/lib/tools/toolDefinitions";
import { executeTool } from "@/app/lib/tools/executeTool";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const response = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: body.message,
      tools: toolDefinitions,
    });

    const functionCall = response.steps?.find(
      (step) => step.type === "function_call",
    );

    if (!functionCall || functionCall.type !== "function_call") {
      return Response.json({
        answer: response.output_text,
      });
    }

    const result = await executeTool(
      functionCall.name,
      functionCall.arguments,
    );

    const followUp = await ai.interactions.create({
      model: "gemini-3.6-flash",
      previous_interaction_id: response.id,
      input: [
        {
          type: "function_result",
          call_id: functionCall.id,
          name: functionCall.name,
          result: JSON.stringify(result),
        },
      ],
    });

    return Response.json({
      answer: followUp.output_text,
    });
  } catch (error) {
    console.error("Tool chat error:", error);

    return Response.json(
      { error: "Tool chat request failed" },
      { status: 500 },
    );
  }
}

