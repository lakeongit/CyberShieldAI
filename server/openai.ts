
import OpenAI from "openai";

export const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: text,
    });
    return response.data[0].embedding;
  } catch (error: any) {
    console.error("Embedding generation error:", error);
    throw error;
  }
}

export async function analyzeDocument(text: string) {
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

    return JSON.parse(response.choices[0].message.content!) as {
      tags: string[];
      category: string;
      summary: string;
      confidence: number;
    };
  } catch (error: any) {
    console.error("Document analysis error:", error);
    throw error;
  }
}

export async function improveQuery(query: string): Promise<string> {
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
    return result.query;
  } catch (error: any) {
    console.error("Query improvement error:", error);
    throw error;
  }
}
