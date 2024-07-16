import { google } from "@ai-sdk/google";
import { generateText, streamText } from "ai";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs/server";

export const maxDuration = 60;

export async function POST(
  req: Request,
  { params }: { params: { chatId: string } }
) {
  try {
    const { userMessage } = await req.json();
    const user = await currentUser();
    if (!user || !user.firstName || !user.id) {
      return new NextResponse("unauthorised", { status: 401 });
    }
    const companion = await prismadb.companion.update({
      where: { id: params.chatId, userId: user.id },
      data: {
        messages: {
          create: {
            content: userMessage.content,
            role: "user",
            userId: user.id,
          },
        },
      },
      include: {
        messages: true,
      },
    });
    if (!companion) {
      return new NextResponse("Companion not found", { status: 404 });
    }
    const messages = companion.messages;
    const messagesLength = messages.length;
    const recentMessages = [];
    for (let i = messagesLength - 1; i >= 0 && i >= messagesLength - 8; i--) {
      recentMessages.push(messages[i]);
    }
    let recentChatHistory = "";
    recentMessages.reverse();
    for (let i = 0; i < 8 && i < messagesLength; i++) {
      recentChatHistory =
        recentChatHistory +
        recentMessages[i].role +
        " : " +
        recentMessages[i].content;
    }
    const prompt = `
        ONLY generate plain sentences without prefix of who is speaking. DO NOT use ${companion.name}:prefix.DO NOT generate more than 100 words,

        ${companion.instruction} and here is an example conversation to tell you how ${companion.name} speaks : ${companion.seed}

        Below are the relevant details about ${companion.name}'s past and the conversation you are in,
        ${recentChatHistory}. Keep these details to yourself and do not repeat them in your output.Give small, concise, relevant and to the point outputs.
        ONLY ANSWER WHAT IS ASKED AT LAST NOT THE PREVIOUS QUESTIONS. Talk as if you are ${companion.name}, Always answer question as if it is being asked to ${companion.name}:
        
        `;
    const { text } = await generateText({
      model: google("models/gemini-1.5-flash"),
      prompt: prompt,
    });
    const res = {
      role: "system",
      content: text,
    };
    if (text != "" && text != undefined && text != null) {
      await prismadb.companion.update({
        where: {
          id: params.chatId,
          userId: user.id,
        },
        data: {
          messages: {
            create: {
              content: text.trim(),
              role: "system",
              userId: user.id,
            },
          },
        },
      });
    }
    return NextResponse.json({ message: res });
  } catch (error) {
    console.log("[Chat_Post]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
