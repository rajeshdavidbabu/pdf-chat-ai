import { NextRequest, NextResponse } from "next/server";
import { callChain } from "@/lib/langchain";
import { DocumentAssistantManager, getDocumentAssistantManager,initDocumentAssistantManager ,DocumentAssistantAgent,isManagerInited, initDocumentAssistantAgent, getDocumentAssistantAgent} from "@/lib/document_assistant";
import { error } from "console";
 



export async function POST(req: NextRequest) {
  const { question, chatHistory, translation, targetLang } = await req.json();
  if (!question) {
    return NextResponse.json("Error: No question in the request", {
      status: 400,
    });
  }

  try {
    if (!isManagerInited()){
      console.error("manager not inited, initing with great gatsby docs")
      await initDocumentAssistantManager("docs/great-gatsby.pdf", "deep-learning-bishop-pdf")
      await initDocumentAssistantAgent("ANNOTATION_TEST")
    }
    const transformStream = new TransformStream();


    let agent=getDocumentAssistantAgent()
    if (agent===null){
      throw new Error("agent not inited")
    }
    return agent.askQuestion(question,
       translation || question.includes("translate"),
      targetLang || "Chinese",
       );
  } catch (error) {
    console.error("Internal server error ", error);
    return NextResponse.json("Error: Something went wrong. Try again!", {
      status: 500,
    });
  }
}
