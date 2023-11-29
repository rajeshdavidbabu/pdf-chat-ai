import { NextRequest, NextResponse } from "next/server";
import { callChain } from "@/lib/langchain";
import { DocumentAssistantManager, getDocumentAssistantManager,initDocumentAssistantManager ,DocumentAssistantAgent,isManagerInited} from "@/lib/document_assistant";
 



export async function POST(req: NextRequest) {
  
  const { question, chatHistory } = await req.json();

  if (!question) {
    return NextResponse.json("Error: No question in the request", {
      status: 400,
    });
  }

  try {
    if (!isManagerInited()){
      console.log("initing docs")
      await initDocumentAssistantManager("docs/great-gatsby.pdf", "deep-learning-bishop-pdf")
    }
    let docassist=await getDocumentAssistantManager()
    let agent=new DocumentAssistantAgent("ANNOTATION_TEST");
    return agent.askQuestion(question);
  } catch (error) {
    console.error("Internal server error ", error);
    return NextResponse.json("Error: Something went wrong. Try again!", {
      status: 500,
    });
  }
}
