# PDF-CHAT AI

An AI-powered PDF chat built with Next.js 13, Langchain and PineconeDB

https://github.com/rajeshdavidbabu/pdf-chat-ai/assets/15684795/a62b759a-ef51-4028-a11e-5afe7fab1176

## Architecture
<img width="1275" alt="Screenshot 2023-08-14 at 12 11 05" src="https://github.com/rajeshdavidbabu/pdf-chat-ai/assets/15684795/4635271e-d580-4a26-a892-bc77d905cf72">


## 👩‍🚀 Description

Built with:
- ✅ Next-13
- ✅ Shadcn-ui
- ✅ Langchain Typescript integration
- ✅ PineconeDB as knowledge store
- ✅ Dark Mode with persistent theme-switching

## Pre-requisites
- Create a free account and get OPEN_AI key from platform.openai.com
- Create a free account and get access to PineconeDB

And populate your `.env` file with required information.

## 🧞 Commands

All commands are run from the root of the project, from a terminal:

| Command               | Action                                      |
| :-------------------- | :------------------------------------------ |
| `npm install`         | Installs dependencies                       |
| `npm run prepare:data`| Splits your PDF file under /docs folder into|
|                       | chunks, embeds them uploads them to pinecone|
| `npm run dev`         | Starts local dev server at `localhost:3000` |

## Roadmap
- Add sources to streamed chat bubble

## Contributing

Pull requests are welcome. For major changes, please open an issue first
to discuss what you would like to change.
