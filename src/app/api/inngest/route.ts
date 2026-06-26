import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";

const syncProblems = inngest.createFunction(
  { id: "sync-leetcode-problems", triggers: [{ event: "sync/problems.requested" }] },
  async ({ step }) => {
    const result = await step.run("fetch-and-store-problems", async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/sync`,
        {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${process.env.CRON_SECRET || ""}`,
          },
        }
      );
      return response.json();
    });

    return result;
  }
);

const generateNotes = inngest.createFunction(
  { id: "generate-ai-notes", triggers: [{ event: "notes/generate.requested" }] },
  async ({ event, step }) => {
    const { planProblemId, userId, problemTitle, tags } = event.data as {
      planProblemId: string;
      userId: string;
      problemTitle: string;
      tags: string[];
    };

    const notes = await step.run("generate-notes", async () => {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `You are an expert coding interview coach. Generate concise, actionable study notes for LeetCode problems. Format as markdown with sections: Pattern, Approach, Complexity, Common Mistakes, Interview Tips.`,
            },
            {
              role: "user",
              content: `Generate study notes for "${problemTitle}". Topics: ${tags.join(", ")}. Include pattern recognition, optimal approach, time/space complexity, common mistakes, and interview tips.`,
            },
          ],
        }),
      });

      const data = await response.json();
      return (data as { choices: Array<{ message: { content: string } }> }).choices[0].message.content;
    });

    await step.run("save-notes", async () => {
      const { db } = await import("@/lib/db");
      await db.note.upsert({
        where: { planProblemId_userId: { planProblemId, userId } },
        update: { content: notes as string, isAiGenerated: true },
        create: { planProblemId, userId, content: notes as string, isAiGenerated: true },
      });
    });

    return { notes };
  }
);

export const { GET, POST } = serve({
  client: inngest,
  functions: [syncProblems, generateNotes],
});
