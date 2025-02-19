import { Client } from "langsmith";

// Initialize LangSmith client
const client = new Client({
  apiUrl: "https://api.smith.langchain.com",
  apiKey: process.env.LANGSMITH_API_KEY,
});

// Create a trace handler for monitoring AI interactions
export async function createTrace(name: string) {
  const run = await client.createRun({
    name,
    inputs: {},
    run_type: "chain",
    start_time: Date.now(),
  });
  return run;
}

// Update trace with results
export async function updateTrace(runId: string, inputs: any, outputs: any, error?: any) {
  await client.updateRun(runId, {
    inputs,
    outputs: error ? undefined : outputs,
    error: error ? error.message : undefined,
    end_time: Date.now(),
  });
}

// Add feedback to a trace
export async function addFeedback(runId: string, key: string, score: number, comment?: string) {
  await client.createFeedback(runId, key, {
    score,
    comment,
  });
}