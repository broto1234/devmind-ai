import { searchChunks } from "@/app/lib/embeddings/searchChunks";
import { getCurrentUser } from "@/app/lib/auth/session";
import { searchSchema } from "@/app/lib/embeddings/searchSchema";

export async function POST(request: Request) {

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

  const validationResult = searchSchema.safeParse(body);

  if (!validationResult.success) {
    return Response.json(
      { error: "Invalid search data" },
      { status: 400 },
    );
  }

  const { query } = validationResult.data;

  const results = await searchChunks(query, user.id);

  return Response.json({
    query,
    results,
  });
}