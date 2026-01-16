import { NextResponse } from "next/server";

export async function POST(req) {
  try {
    const body = await req.json();

    const messages = body.messages.map((msg) => ({
      role: msg.role === "assistant" ? "assistant" : "user",
      content: msg.content,
    }));

    const groqResponse = await fetch(
      "https://api.groq.com/openai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant", // ✅ MOST STABLE MODEL
          messages,
          temperature: 0.7,
          max_tokens: 800,
        }),
      }
    );

    const data = await groqResponse.json();

    // 🔍 HANDLE GROQ ERRORS SAFELY
    if (!data.choices || !data.choices.length) {
      console.error("Groq error response:", data);
      return NextResponse.json(
        { error: "Groq API Error", details: data },
        { status: 500 }
      );
    }

    return NextResponse.json({
      content: [
        {
          text: data.choices[0].message.content,
        },
      ],
    });
  } catch (err) {
    console.error("Server error:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
