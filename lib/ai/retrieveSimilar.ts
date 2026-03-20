import { getAdminClient } from "../supabase/admin";
import { getEmbedding } from "./embedMessage";

export interface SimilarEntry {
  id: string;
  content: string;
  similarity: number;
}

export async function retrieveSimilar(
  userId: string,
  queryText: string,
  limit: number = 5
): Promise<SimilarEntry[]> {
  const supabaseAdmin = getAdminClient()
  const embedding = await getEmbedding(queryText);
  const embeddingStr = `[${embedding.join(",")}]`;

  const { data, error } = await supabaseAdmin.rpc("match_embeddings", {
    query_embedding: embeddingStr,
    match_user_id: userId,
    match_limit: limit,
  });

  if (error) {
    throw new Error(`Similarity search failed: ${error.message}`);
  }

  return (data ?? []) as SimilarEntry[];
}
