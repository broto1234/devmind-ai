import { searchChunks } from "@/app/lib/embeddings/searchChunks";

export async function POST(request: Request) {
  const body = await request.json();

  const { query } = body;

  const results = await searchChunks(query);

  return Response.json({
    query,
    results,
  });
}