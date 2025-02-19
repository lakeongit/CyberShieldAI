import OpenAI from "openai";
import { createTrace, updateTrace } from "./services/langsmith";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  const run = await createTrace("generate_embedding");
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    await updateTrace(run.id, { text }, { embedding: response.data[0].embedding });
    return response.data[0].embedding;
  } catch (error: any) {
    await updateTrace(run.id, { text }, undefined, error);
    throw error;
  }
}

export async function analyzeDocument(text: string) {
  const run = await createTrace("analyze_document");
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Analyze this cybersecurity document and provide metadata in the following JSON format:
{
  "tags": string[],  // 3-5 relevant tags
  "category": string,  // One of: "best-practices", "frameworks", "incident-response", "compliance", "threat-intel"
  "summary": string,  // A 2-3 sentence summary
  "confidence": number  // Classification confidence 0-1
}`
        },
        { role: "user", content: text }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content!) as {
      tags: string[];
      category: string;
      summary: string;
      confidence: number;
    };

    await updateTrace(run.id, { text }, { result });
    return result;
  } catch (error: any) {
    await updateTrace(run.id, { text }, undefined, error);
    throw error;
  }
}

export async function improveQuery(query: string): Promise<string> {
  const run = await createTrace("improve_query");
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are a cybersecurity expert helping to improve search queries. 
Expand this query to include relevant cybersecurity terminology and concepts.
Respond with JSON in the format: {"query": "improved search query"}`
        },
        { role: "user", content: query }
      ],
      response_format: { type: "json_object" }
    });

    const result = JSON.parse(response.choices[0].message.content!);
    await updateTrace(run.id, { query }, { improvedQuery: result.query });
    return result.query;
  } catch (error: any) {
    await updateTrace(run.id, { query }, undefined, error);
    throw error;
  }
}