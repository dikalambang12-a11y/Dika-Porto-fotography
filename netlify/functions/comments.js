import { getStore } from "@netlify/blobs";

const STORE_NAME = "guestbook";
const KEY = "comments";

export default async (req) => {
  const store = getStore(STORE_NAME);

  if (req.method === "GET") {
    const data = (await store.get(KEY, { type: "json" })) || [];
    return Response.json(data);
  }

  if (req.method === "POST") {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    const name = String(body.name || "").trim().slice(0, 60);
    const message = String(body.message || "").trim().slice(0, 800);
    if (!name || !message) {
      return new Response("Name and message are required", { status: 400 });
    }

    const existing = (await store.get(KEY, { type: "json" })) || [];
    existing.push({ name, message, ts: Date.now() });
    await store.setJSON(KEY, existing);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
};
