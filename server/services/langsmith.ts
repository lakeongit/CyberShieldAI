import { Client } from "langsmith";

const PROJECT_NAME = "cybersecurity-expert-chatbot";

if (!process.env.LANGSMITH_API_KEY) {
  throw new Error("LANGSMITH_API_KEY is required for LangSmith integration");
}

// Initialize LangSmith client with project configuration
const client = new Client({
  apiUrl: "https://api.smith.langchain.com",
  apiKey: process.env.LANGSMITH_API_KEY,
});

// Create a trace handler for monitoring AI interactions
export async function createTrace(name: string) {
  try {
    const run = await client.createRun({
      name,
      inputs: {},
      run_type: "chain",
      start_time: Date.now(),
      project: PROJECT_NAME, // Changed from projectName to project
    });
    return run;
  } catch (error) {
    console.error("Failed to create trace:", error);
    return null;
  }
}

// Update trace with results
export async function updateTrace(runId: string | null, inputs: any, outputs: any, error?: any) {
  if (!runId) return;

  try {
    await client.updateRun(runId, {
      inputs,
      outputs: error ? undefined : outputs,
      error: error ? error.message : undefined,
      end_time: Date.now(),
    });
  } catch (error) {
    console.error("Failed to update trace:", error);
  }
}

// Add feedback to a trace
export async function addFeedback(runId: string | null, key: string, score: number, comment?: string) {
  if (!runId) return;

  try {
    await client.createFeedback(runId, key, {
      score,
      comment,
    });
  } catch (error) {
    console.error("Failed to add feedback:", error);
  }
}

// Helper function to add system feedback
export async function addSystemFeedback(runId: string | null, success: boolean, message?: string) {
  await addFeedback(runId, 'system_evaluation', success ? 1 : 0, message);
}