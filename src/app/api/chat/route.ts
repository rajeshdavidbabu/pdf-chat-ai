import { NextRequest, NextResponse } from "next/server";
import { callChain } from "@/lib/langchain";

export async function POST(req: NextRequest) {
  const { question, chatHistory } = await req.json();

  if (!question) {
    return NextResponse.json(
      {
        message: "No question in the request",
      },
      {
        status: 400,
      }
    );
  }

  try {
    const stream = callChain({ question, chatHistory });

    return new Response(await stream);
  } catch (error) {
    console.error("error", error);
    return NextResponse.json(
      {
        message: "Something went wrong. Try again!",
      },
      {
        status: 500,
      }
    );
  }
}
