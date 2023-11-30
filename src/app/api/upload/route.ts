import { NextRequest, NextResponse } from "next/server";
import { getChunkedDocsFromPDF } from "@/lib/pdf-loader";
import { pineconeEmbedAndStore } from "@/lib/vector-store";
import { getPineconeClient } from "@/lib/pinecone-client";

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

    const pineconeClient = await getPineconeClient(key,true, file);
    if (pineconeClient===null){
        return
    }
    return NextResponse.json("init document assistant manager success", {
      status: 200,
    });
  } 
   catch (error) {
    console.error("Internal server error ", error);
    return NextResponse.json("Error: Something went wrong. Try again!", {
      status: 500,
    });
  }
}