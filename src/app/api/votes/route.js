import { list, put } from "@vercel/blob";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function totals() {
  const { blobs } = await list({ prefix: "votes/" });
  const all = [];

  for (const blob of blobs) {
    try {
      const response = await fetch(blob.url, { cache: "no-store" });
      if (response.ok) all.push(await response.json());
    } catch {
      // Ignore an unreadable individual record; report aggregate below.
    }
  }

  all.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  all.shift(); // Conserva la exclusión del primer registro de prueba del proyecto original.

  let yes = 0;
  let no = 0;
  for (const vote of all) {
    if (vote.choice === "yes") yes++;
    if (vote.choice === "no") no++;
  }
  return { yes, no };
}

export async function GET() {
  try {
    return NextResponse.json(await totals(), {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudieron consultar las respuestas" },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const choice = body?.choice;

    if (choice !== "yes" && choice !== "no") {
      return NextResponse.json({ error: "Respuesta inválida" }, { status: 400 });
    }

    await put(
      `votes/${crypto.randomUUID()}.json`,
      JSON.stringify({ choice, createdAt: new Date().toISOString() }),
      {
        access: "public",
        contentType: "application/json",
        addRandomSuffix: false
      }
    );

    return NextResponse.json(await totals(), {
      headers: { "Cache-Control": "no-store" }
    });
  } catch {
    return NextResponse.json(
      { error: "No se pudo guardar la respuesta" },
      { status: 500 }
    );
  }
}
