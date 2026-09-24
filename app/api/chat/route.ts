import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

let interactionId: string | null = null;

export async function POST(request: Request) {
  try {
    const body = await request.json();    

    const stream = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: body.message,
      previous_interaction_id: body.conversationId,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.event_type === "interaction.created") {
              interactionId = event.interaction.id;

              controller.enqueue(
                encoder.encode(
                  `event: interaction\ndata: ${JSON.stringify({
                    id: interactionId,
                  })}\n\n`,
                ),
              );
            }
            if (
              event.event_type === "step.delta" &&
              event.delta.type === "text"
            ) {
              controller.enqueue(
                `event: text\ndata: ${JSON.stringify(event.delta.text)}\n\n`
              );
            }
          }

          controller.close();
        } catch (error) {
          console.error("Streaming error:", error);
          controller.error(error);
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    
    return Response.json(
      {
        error: "Gemini request failed",
      },
      {
        status: 500,
      }
    );
  }
}