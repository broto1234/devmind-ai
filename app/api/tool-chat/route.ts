import { GoogleGenAI } from "@google/genai";
import { toolDefinitions } from "@/app/lib/tools/toolDefinitions";
import { executeTool } from "@/app/lib/tools/executeTool";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    let response = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: body.message,
      tools: toolDefinitions,
    });

    let iterations = 0;
    const maxIterations = 5;

    while (iterations < maxIterations) {
      iterations++;

      const functionCalls = response.steps?.filter(
        (step) => step.type === "function_call",
      );

      if (!functionCalls || functionCalls.length === 0) {
        return Response.json({
          answer: response.output_text,
        });
      }

      const functionResults = [];

      for (const functionCall of functionCalls) {
        if (functionCall.type !== "function_call") continue;

        const result = await executeTool(
          functionCall.name,
          functionCall.arguments,
        );

        functionResults.push({
          type: "function_result" as const,
          call_id: functionCall.id,
          name: functionCall.name,
          result: JSON.stringify(result),
          is_error:
            typeof result === "object" && result !== null && "error" in result,
        });
      }

      response = await ai.interactions.create({
        model: "gemini-3.6-flash",
        previous_interaction_id: response.id,
        input: functionResults,
        tools: toolDefinitions,
      });
    }

    return Response.json(
      {
        error: "Agent reached the maximum number of iterations.",
      },
      {
        status: 500,
      },
    );
  } catch (error) {
    console.error("Tool chat error:", error);

    return Response.json(
      { error: "Tool chat request failed" },
      { status: 500 },
    );
  }
}
