import prismadb from "@/lib/prismadb";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { google } from "@ai-sdk/google";
import { generateText, streamText } from "ai";
export const maxDuration = 60;

async function generateInstructions(name: string, description: string) {
  const { text } = await generateText({
    model: google("models/gemini-1.5-flash"),
    prompt: `Write an essay of 230 words on ${name}, ${description}. Essay should include the personal life, professional life, struggles, talking style, famous things related and all other major aspects worth telling about ${name}`,
  });
  return text;
}
async function generateSeed(
  name: string,
  description: string,
  instruction: string
) {
  const { text } = await generateText({
    model: google("models/gemini-1.5-flash"),
    prompt: `Write a conversation of 230 words of ${name}, ${description}, ${instruction}`,
  });
  return text;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const user = await currentUser();
    const { src, name, description, categoryId } = body;
    if (!user || !user.id || !user.firstName) {
      return new NextResponse("unauthorised", { status: 401 });
    }
    if (!src || !name || !description || !categoryId) {
      return new NextResponse("Incomplete data", { status: 402 });
    }
    const instruction = await generateInstructions(name, description);
    const seed = await generateSeed(name, description, instruction);
    const companion = await prismadb.companion.create({
      data: {
        categoryId,
        userId: user.id,
        userName: user.firstName,
        src,
        name,
        description,
        seed,
        instruction,
      },
    });
    return new NextResponse("Companion Created", { status: 200 });
  } catch (error) {
    console.log("COMPANION_POST_AUTO", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
