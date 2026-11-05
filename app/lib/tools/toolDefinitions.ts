import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

type GeminiTools = NonNullable<
  Parameters<typeof ai.interactions.create>[0]["tools"]
>;

export const toolDefinitions: GeminiTools = [
  {
    type: "function",
    name: "getDocumentCount",
    description:
      "Returns the total number of documents stored in the database.",
  },
  {
    type: "function",
    name: "getDocumentById",
    description:
      "Returns a document using its document ID.",
    parameters: {
      type: "object",
      properties: {
        documentId: {
          type: "string",
          description: "The ID of the document.",
        },
      },
      required: ["documentId"],
    },
  },
];