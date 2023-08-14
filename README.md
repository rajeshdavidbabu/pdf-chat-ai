# PDF-CHAT AI ✨🤖💻🗃️

An AI-powered PDF chat built with Next.js 13, Langchain, and PineconeDB

## 👷🏾‍♂️ Want to Learn How to Build It?
Subscribe to my [YouTube Channel](https://www.youtube.com/channel/UCU2xH1a0ExxWXC4zk1VF_Eg) for an upcoming video tutorial!

https://github.com/rajeshdavidbabu/pdf-chat-ai/assets/15684795/625237f6-4d1f-4ad6-91a3-7bddebe8ab35

## Architecture
![Architecture Screenshot](https://github.com/rajeshdavidbabu/pdf-chat-ai/assets/15684795/4635271e-d580-4a26-a892-bc77d905cf72)

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

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command               | Action                                          |
| :-------------------- | :-----------------------------------------------|
| `npm install`         | Installs dependencies                           |
| `npm run prepare:data`| Splits your PDF file under the /docs folder into chunks, embeds them, uploads them to Pinecone|
| `npm run dev`         | Starts the local dev server at `localhost:3000` |

## 🚸 Roadmap
- Add sources to the streamed chat bubble

## 👏🏽 Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.
