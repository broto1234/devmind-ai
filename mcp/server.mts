import "dotenv/config";

import { McpServer } from "@modelcontextprotocol/server";
import { serveStdio } from "@modelcontextprotocol/server/stdio";
import * as z from "zod/v4";

import { getDocumentCount } from "../app/lib/tools/getDocumentCount.js";
import { getDocumentById } from "../app/lib/tools/getDocumentById.js";
import { ResourceTemplate } from "@modelcontextprotocol/server";

serveStdio(() => {
  const server = new McpServer({
    name: "devmind-ai",
    version: "1.0.0",
  });

  server.registerTool(
    "getDocumentCount",
    {
      description: "Returns the total number of documents stored in the DevMind AI database.",
      inputSchema: z.object({}),
    },
    async () => {
      try {
        const count = await getDocumentCount();

        return {
          content: [
            {
              type: "text",
              text: `There are ${count} documents in the database.`,
            },
          ],
        };
      } catch (error) {
        console.error("getDocumentCount failed:", error);

        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "Failed to retrieve the document count.",
            },
          ],
        };
      }
    },
  );


  server.registerTool(
    "getDocumentById",
    {
      description: "Retrieves a document using its document ID.",
      inputSchema: z.object({
        documentId: z.string().min(1),
      }),
    },
    async ({ documentId }) => {
      try {
        const document = await getDocumentById(documentId);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(document, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("getDocumentById failed:", error);

        return {
          isError: true,
          content: [
            {
              type: "text",
              text: "Failed to retrieve the document.",
            },
          ],
        };
      }
    },
  );


  server.registerResource(
    "document",
    new ResourceTemplate(
      "devmind://documents/{documentId}",
      { list: undefined },
    ),
    {
      title: "DevMind AI Document",
      description: "Read a document by its document ID.",
      mimeType: "application/json",
    },
    async (uri, { documentId }) => {
      try {
        
        const id = Array.isArray(documentId)
          ? documentId[0]
          : documentId;

        if (!id) {
          throw new Error("Invalid document ID");
        }

        const document = await getDocumentById(id);

        return {
          contents: [
            {
              uri: uri.href,
              mimeType: "application/json",
              text: JSON.stringify(document, null, 2),
            },
          ],
        };
      } catch (error) {
        console.error("Document resource error:", error);
        throw new Error("Failed to retrieve document resource.");
      }
    },
  );


  server.registerPrompt(
    "analyze_document",
    {
      title: "Analyze Document",
      description: "Creates instructions for analyzing a document.",
      argsSchema: {
        documentName: z.string(),
      },
    },
    ({ documentName }) => ({
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: `Analyze the document "${documentName}".

  Identify:
  1. Main topics
  2. Important information
  3. Potential risks
  4. A short summary

  Base your analysis only on the document content provided.`,
          },
        },
      ],
    }),
  );

  return server;
});
