# PDF-CHAT AI ✨🤖💻🗃️

An AI-powered PDF chat built with Next.js 13, Langchain, and PineconeDB

## 👷🏾‍♂️ Want to Learn How to Build It?
Check out the tutorial on my YT [channel](https://www.youtube.com/watch?v=oiCFr19NtPo&t)


## ✨Update✨
Added sources to the stream and displaying it in an accordian



https://github.com/rajeshdavidbabu/pdf-chat-ai/assets/15684795/feb5331d-b43d-4778-a8dd-630d6f361197





## Architecture

<img width="1402" alt="Embed LLM" src="https://github.com/rajeshdavidbabu/pdf-chat-ai/assets/15684795/98f54183-b1e0-4dd4-8e8f-b6994e36f814">


## 👩‍🚀 Description

Built with:
- ✅ Next.js 13
- ✅ Shadcn-ui
- ✅ Langchain TypeScript integration
- ✅ PineconeDB as the knowledge store
- ✅ Dark Mode with persistent theme-switching

## 🗃️ Pre-requisites
- Create a free account and get an OPEN_AI key from platform.openai.com
- Create a free account and get access to PineconeDB
- And populate your `.env` file with the required information.

## 💬 Good to know
- The PineconeDB index creation happens when we run `npm run prepare:data`, but its better to create it manually if you dont want the command to fail.
- If the command fails, then give sometime for pinecone index to get initialized and try to run the command again, it should work eventually.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command               | Action                                          |
| :-------------------- | :-----------------------------------------------|
| `npm install`         | Installs dependencies                           |
| `npm run prepare:data`| Splits your PDF file under the /docs folder into chunks, embeds them, uploads them to Pinecone|
| `npm run dev`         | Starts the local dev server at `localhost:3000` |

## 🚸 Roadmap
- ✅ Add sources to the streamed chat bubble
- 🚧 Clean up and show proper error messages
- 🚧 Sanitize input and output source documents

## 👏🏽 Contributing

Pull requests are welcome, before creating a PR talk to me on [discord](https://discord.com/channels/1121796870231040020/1156553471881908275). For major changes, please open an issue first
to discuss what you would like to change.
