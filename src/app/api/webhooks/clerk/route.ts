import { NextRequest, NextResponse } from "next/server";
import { Webhook } from "svix";
import { db } from "@/lib/db";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

async function handleWebhook(request: NextRequest) {
  const payload = await request.text();
  const headers = Object.fromEntries(request.headers.entries());

  if (!webhookSecret) {
    return NextResponse.json(
      { error: "Webhook secret not configured" },
      { status: 500 }
    );
  }

  const wh = new Webhook(webhookSecret);
  let evt: { type: string; data: Record<string, unknown> };

  try {
    evt = wh.verify(payload, headers) as { type: string; data: Record<string, unknown> };
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const eventType = evt.type;
  const data = evt.data;

  if (eventType === "user.created") {
    const clerkId = data.id as string;
    const email =
      (data.email_addresses as Array<{ email_address: string }>)?.[0]
        ?.email_address || null;
    const name = [data.first_name, data.last_name]
      .filter(Boolean)
      .join(" ") || null;
    const image = data.image_url as string | null;
    const username = data.username as string | null;

    try {
      await db.user.create({
        data: {
          clerkId,
          email,
          name,
          image,
          username,
        },
      });
    } catch (error) {
      console.error("Failed to create user:", error);
    }
  }

  if (eventType === "user.updated") {
    const clerkId = data.id as string;
    const email =
      (data.email_addresses as Array<{ email_address: string }>)?.[0]
        ?.email_address || null;
    const name = [data.first_name, data.last_name]
      .filter(Boolean)
      .join(" ") || null;
    const image = data.image_url as string | null;
    const username = data.username as string | null;

    try {
      await db.user.upsert({
        where: { clerkId },
        update: { email, name, image, username },
        create: { clerkId, email, name, image, username },
      });
    } catch (error) {
      console.error("Failed to upsert user:", error);
    }
  }

  if (eventType === "user.deleted") {
    const clerkId = data.id as string;

    try {
      await db.user.delete({ where: { clerkId } });
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  }

  return NextResponse.json({ received: true });
}

export async function POST(request: NextRequest) {
  return handleWebhook(request);
}
