import { NextResponse } from "next/server";

export async function POST(req) {
  const body = await req.json();

  const response = await fetch(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.1-70b-versatile",
        messages: body.messages,
        temperature: 0.7,
        max_tokens: 1000,
      }),
    }
  );

  const data = await response.json();

  return NextResponse.json({
    content: [
      {
        text: data.choices[0].message.content,
      },
    ],
  });
}








