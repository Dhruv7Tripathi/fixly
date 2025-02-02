import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/db";


export async function GET() {
  try {
    const chats = await prisma.chat.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat history' },
      { status: 500 }
    );
  }
}
