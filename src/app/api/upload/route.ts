import { NextRequest, NextResponse } from "next/server";
import { getChunkedDocsFromPDF } from "@/lib/pdf-loader";
import { pineconeEmbedAndStore } from "@/lib/vector-store";
import { getPineconeClient } from "@/lib/pinecone-client";
import { summarize } from "@/lib/summarize";
import { env } from "./../../../lib/config";


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
    if (env.SUMMARIZE==="1"){
    console.log("Preparing chunks from PDF file", 1234343);
    const docs = await getChunkedDocsFromPDF(file);
    console.log(`Loading ${docs.length} chunks into pinecone...`);
    console.log("Data embedded and stored in pine-cone index");

    
    const transformStream = new TransformStream();
    const readableStream = summarize({
      docs,
      transformStream,
    });

    return new Response(await readableStream);
  }

    return NextResponse.json("success!", {
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