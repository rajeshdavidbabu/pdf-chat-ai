import { NextRequest, NextResponse } from "next/server";
import { callChain } from "@/lib/langchain";
import { DocumentAssistantManager, getDocumentAssistantManager,initDocumentAssistantManager ,DocumentAssistantAgent,isManagerInited} from "@/lib/document_assistant";
 

function keepAlphanumeric(inputString:string) {
  return inputString.replace(/[^a-zA-Z0-9]/g, '');
}

export async function POST(req: NextRequest) {
  const { filepath, key } = await req.json();

const keyCleaned = keepAlphanumeric(key);
  try {
      await initDocumentAssistantManager(filepath, keyCleaned)
    let docassist=await getDocumentAssistantManager()
    return NextResponse.json("status: success", {
      status: 200,
    });
  } catch (error) {
    console.error("Internal server error ", error);
    return NextResponse.json("Error: Something went wrong. Try again!", {
      status: 500,
    });
  }
}
