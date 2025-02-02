import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(req: Request) {
  try {
    const { title, input, response } = await req.json();
    const chat = await prisma.chat.create({
      data: {
        title,
        input,
        response,
      },
    });
    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return NextResponse.json(
      { error: 'Failed to save chat' },
      { status: 500 }
    );
  }
}
