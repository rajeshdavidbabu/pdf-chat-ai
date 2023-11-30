import { NextRequest, NextResponse } from "next/server";
import { getDocumentAssistantManager,initDocumentAssistantManager } from "@/lib/document_assistant";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as File;
  if (!file) {
    return NextResponse.json("Error: No file in the request", {
      status: 400,
    });
  }
  const key = formData.get("key") as string;
  if (!key) {
    return NextResponse.json("Error: No key in the request", {
      status: 400,
    });
  }
  try {
    console.log(`File name: ${file.name}`);
    console.log(`Content-Length: ${file.size}`);
    await initDocumentAssistantManager(file, key);
    const docAssistant = getDocumentAssistantManager()
    if (docAssistant) {
      return NextResponse.json("Error: init document assistant manager success", {
        status: 200,
      });
    } else {
      return NextResponse.json("Error: init document assistant manager failed", {
        status: 500,
      });
    }
  } catch (error) {
    console.error("Internal server error ", error);
    return NextResponse.json("Error: Something went wrong. Try again!", {
      status: 500,
    });
  }
}
