// ...
import { ChatOpenAI } from "langchain/chat_models/openai";
import { HumanChatMessage } from "langchain/schema";

const chat = new ChatOpenAI({
  temperature: 0.9,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

type callQueryArgs = {
    question: string;
    transformStream: TransformStream;
  };
  

// Function to call ChatGPT and get a response
export async function callDirectQuery({
    question,
    transformStream,
  }: callQueryArgs) {
    const chat = new ChatOpenAI({
        temperature: 0.9,
        openAIApiKey: process.env.OPENAI_API_KEY,
        streaming: true,
      });

    const encoder = new TextEncoder();
    const writer = transformStream.writable.getWriter();
  
    try {
        chat.call([new HumanChatMessage(question)]).then(async (res) => {
        await writer.ready;
        await writer.write(encoder.encode("tokens-ended"));
        setTimeout(async () => {
          await writer.ready;
          await writer.write(encoder.encode(`${res.content}`));
          await writer.close();
        }, 100);
      });
      return transformStream?.readable;
    } catch (error) {
      console.error('Error calling ChatGPT:', error);
      throw new Error('Failed to get response from ChatGPT');
    }
  }