import { GoogleGenAI } from "@google/genai";
import { getCurrentUser } from "@/app/lib/auth/session";
import { chatSchema } from "@/app/lib/schemas/chatSchema";
import { createConversation, getConversation, updateConversation,} from "@/app/lib/conversations";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export async function POST(request: Request) {
  try {

    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        { error: "Not authenticated" },
        { status: 401 },
      );
    }
    
    let body;

    try {
      body = await request.json();
    } catch {
      return Response.json(
        { error: "Invalid JSON body" },
        { status: 400 },
      );
    }

    const validationResult = chatSchema.safeParse(body);

    if (!validationResult.success) {
      return Response.json(
        { error: "Invalid chat data" },
        { status: 400 },
      );
    }

    const conversationId = validationResult.data.conversationId;

    if (conversationId) {
      const conversation = await getConversation(
        conversationId,
        user.id,
      );

      if (!conversation) {
        return Response.json(
          { error: "Conversation not found" },
          { status: 404 },
        );
      }
    }

    const stream = await ai.interactions.create({
      model: "gemini-3.6-flash",
      input: validationResult.data.message,
      previous_interaction_id: conversationId ?? undefined,
      stream: true,
    });

    const encoder = new TextEncoder();

    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.event_type === "interaction.created") {

              const interactionId = event.interaction.id;

              if (conversationId) {
                await updateConversation(
                  conversationId,
                  interactionId,
                  user.id,
                );
              } else {
                await createConversation(
                  user.id,
                  interactionId,
                );
              }

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
     console.error("Chat route error:", error);
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