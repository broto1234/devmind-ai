import { getDocumentCount } from "./getDocumentCount";
import { getDocumentById } from "./getDocumentById";
import { getDocumentByIdSchema } from "./schemas";

export async function executeTool(
  name: string,
  userId: string,
  args?: Record<string, unknown>,
) {
  try {
    switch (name) {
      case "getDocumentCount": {
        return await getDocumentCount(userId);
      }

      case "getDocumentById": {
        const validatedArgs = getDocumentByIdSchema.parse(args);
        return await getDocumentById(validatedArgs.documentId, userId);
      }

      default: {
        throw new Error(`Unknown tool: ${name}`);
      }
    }
  } catch (error) {
    if (error instanceof Error) {
      return {
        error: error.message,
      };
    }

    return {
      error: "An unknown tool error occurred",
    };
  }
}
