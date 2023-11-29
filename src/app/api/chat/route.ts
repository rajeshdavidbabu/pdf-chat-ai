import { NextRequest, NextResponse } from "next/server";
import { callChain } from "@/lib/langchain";
import { DocumentAssistantManager, getDocumentAssistantManager,initDocumentAssistantManager } from "@/lib/document_assistant";
 



export async function POST(req: NextRequest) {
  initDocumentAssistantManager("docs/great-gatsby.pdf", "deep-learning-bishop-pdf")
  let docassist = await getDocumentAssistantManager()
  const { question, chatHistory, translation, targetLang } = await req.json();

  if (!question) {
    return NextResponse.json("Error: No question in the request", {
      status: 400,
    });
  }

  try {
    const transformStream = new TransformStream();
    const readableStream = callChain({
      question,
      chatHistory,
      transformStream,
      translation: translation || question.includes("translate"),
      targetLang: targetLang || "Chinese", 
    });

    return new Response(await readableStream);
  } catch (error) {
    console.error("Internal server error ", error);
    return NextResponse.json("Error: Something went wrong. Try again!", {
      status: 500,
    });
  }
}
