import { loadSummarizationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { PromptTemplate } from "langchain/prompts";
import { TokenTextSplitter } from "langchain/text_splitter";
import { Document } from "langchain/document";


type summarizeArgs = {
    docs: Document[];
    transformStream: TransformStream;
};

// Function to call ChatGPT and get a response
export async function summarize({
    docs,
    transformStream,
}: summarizeArgs) {
    const splitter = new TokenTextSplitter({
        chunkSize: 10000,
        chunkOverlap: 250,
    });
    const docsSummary = await splitter.splitDocuments(docs);
    const llmSummary = new ChatOpenAI({
        modelName: "gpt-3.5-turbo-16k",
        temperature: 0,
    });

    const summaryTemplate = `
    You are an expert in summarizing PDFs.
    Your goal is to create a summary of a PDF.
    Below you find the content of the PDF:
    --------
    {text}
    --------
    
    SUMMARY:
    `;
    

    const SUMMARY_PROMPT = PromptTemplate.fromTemplate(summaryTemplate);

    const summaryRefineTemplate = `
You are an expert in summarizing PDFs.
Your goal is to create a summary of a PDF.
We have provided an existing summary up to a certain point: {existing_answer}

Below you find the content of the PDF:
--------
{text}
--------

Given the new context, refine the summary.
Total output will be a summary of the PDF
SUMMARY
`;
    
    const SUMMARY_REFINE_PROMPT = PromptTemplate.fromTemplate(
      summaryRefineTemplate
    );
    
    const summarizeChain = loadSummarizationChain(llmSummary, {
      type: "refine",
      verbose: true,
      questionPrompt: SUMMARY_PROMPT,
      refinePrompt: SUMMARY_REFINE_PROMPT,
    });

    const encoder = new TextEncoder();

    const writer = transformStream.writable.getWriter();
    
    try {
        summarizeChain.run(docsSummary).then(async (res) => {
        await writer.ready;
        setTimeout(async () => {
          await writer.ready;
          await writer.write(encoder.encode(`${res}`));
          await writer.write(encoder.encode("tokens-ended"));
          await writer.close();
        }, 100);
        
      });
      return transformStream?.readable;
      } catch (error) {
        console.error('Error calling ChatGPT:', error);
        throw new Error('Failed to get response from ChatGPT');
      }
    }