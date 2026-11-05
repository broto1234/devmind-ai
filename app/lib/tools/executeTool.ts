import { getDocumentCount } from "./getDocumentCount";
import { getDocumentById } from "./getDocumentById";

export async function executeTool(
  name: string,
  args?: Record<string, unknown>,
) {
  switch (name) {
    case "getDocumentCount": {
      return await getDocumentCount();
    }

    case "getDocumentById": {
      const documentId = args?.documentId;

      if (typeof documentId !== "string") {
        throw new Error("Invalid document ID");
      }

      return await getDocumentById(documentId);
    }

    default: {
      throw new Error(`Unknown tool: ${name}`);
    }
  }
}