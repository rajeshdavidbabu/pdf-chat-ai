import { PineconeClient } from "@pinecone-database/pinecone";
import { env } from "./config";
import { delay } from "./utils";

let pineconeClientInstance: PineconeClient | null = null;
export let createdIndex: boolean=false;
async function createIndex(client: PineconeClient, indexName: string) {
  try {
    await client.createIndex({
      createRequest: {
        name: indexName,
        dimension: 1536,
        metric: "cosine",
      },
    });
    console.log(
      `Waiting for ${env.INDEX_INIT_TIMEOUT} seconds for index initialization to complete...`
    );
    await delay(env.INDEX_INIT_TIMEOUT);
    console.log("Index created !!");
  } catch (error) {
    console.error("error ", error);
    throw new Error("Index creation failed");
  }
}

async function deleteIndex(client: PineconeClient, indexName:string){
  try {
    let resp = await client.deleteIndex({indexName:indexName});
    console.log("delete index requested"+resp)
    await delay(env.INDEX_INIT_TIMEOUT);
  } catch (error) {
    console.error("error ", error);
    throw new Error("Index creation failed");
  }
}

export async function initPineconeClient(filePath: string) {
  try {
    const pineconeClient = new PineconeClient();
    await pineconeClient.init({
      apiKey: env.PINECONE_API_KEY,
      environment: env.PINECONE_ENVIRONMENT,
    });

    let existingIndexes = await pineconeClient.listIndexes();
    console.log("original indexes  are =",existingIndexes)

    if (existingIndexes.length>0 && existingIndexes[0]!=filePath) {
      createdIndex=false
      console.log("Your index already exists removing and resetting");
      await deleteIndex(pineconeClient,existingIndexes[0]);

     existingIndexes = await pineconeClient.listIndexes();
     console.log("indexes after delete are =",existingIndexes)
     
    } else if (existingIndexes.length>0 && existingIndexes[0]==filePath){
      createdIndex=false
      console.log("same index, no need to create more =",existingIndexes)
    }

    if (existingIndexes.length==0){
      createdIndex=true
      await createIndex(pineconeClient,filePath)
    }


    
    existingIndexes = await pineconeClient.listIndexes();

    console.log("indexes create are =",existingIndexes)


    pineconeClientInstance=pineconeClient;
    return pineconeClient;
  } catch (error) {
    console.error("error", error);
    throw new Error("Failed to initialize Pinecone Client a");
  }
}

 export async function getPineconeClient() {
  return pineconeClientInstance;
}
