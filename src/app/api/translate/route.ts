import { NextRequest, NextResponse } from "next/server";
import { callDirectQuery } from "@/lib/direct-query";

export async function POST(req: NextRequest) {
  const { question } = await req.json();

  if (!question) {
    return NextResponse.json("Error: No question in the request", {
      status: 400,
    });
  }

  try {
    const transformStream = new TransformStream();
    const readableStream = callDirectQuery({
      question,
      transformStream,
    });

    return new Response(await readableStream);
  } catch (error) {
    console.log("Internal server error ", error, 1234);
    return NextResponse.json("Error: Something went wrong. Try again!", {
      status: 500,
    });
  }
}
