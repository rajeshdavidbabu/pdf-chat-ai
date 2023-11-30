import { NextRequest, NextResponse } from "next/server";
import { callChain } from "@/lib/langchain";

export async function POST(req: NextRequest) {
  const { question, phrase, chatHistory, translation, targetLang, indexKey } = await req.json();


  if(!indexKey){
    return NextResponse.json("Error: No index key in the request", {
      status: 400,
    });
  }

  if (!question) {
    return NextResponse.json("Error: No question in the request", {
      status: 400,
    });
  }

  let realPhrase=""
  realPhrase= phrase||""

  let realQuestion= "\""+realPhrase+"\""+question
  try {
    const transformStream = new TransformStream();
    const readableStream = callChain({
      question: realQuestion,
      chatHistory,
      transformStream,
      translation: translation || question.includes("translate"),
      targetLang: targetLang || "Chinese", 
      indexKey:indexKey||"a",
    });

    return new Response(await readableStream);
  } catch (error) {
    console.error("Internal server error ", error);
    return NextResponse.json("Error: Something went wrong. Try again!", {
      status: 500,
    });
  }
}
