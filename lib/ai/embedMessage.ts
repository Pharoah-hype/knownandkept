import { getAdminClient } from "../supabase/admin";

export async function getEmbedding(content: string): Promise<number[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY is not set");

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "models/text-embedding-004",
        content: { parts: [{ text: content }] },
        outputDimensionality: 768,
      }),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Gemini embedding API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.embedding.values;
}

export async function embedMessage(
  content: string,
  userId: string,
  conversationId: string
): Promise<string> {
  const supabaseAdmin = getAdminClient()
  const embedding = await getEmbedding(content);

  const { data, error } = await supabaseAdmin
    .from("embeddings")
    .insert({
      user_id: userId,
      conversation_id: conversationId,
      content,
      embedding: JSON.stringify(embedding),
    })
    .select("id")
    .single();

  if (error) throw new Error(`Failed to store embedding: ${error.message}`);

  return data.id;
}
