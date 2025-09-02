import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const voteSchema = z.object({
  voteType: z.enum(['UPVOTE', 'DOWNVOTE']),
});

export async function POST(
  request: Request,
  { params }: { params: { postId: string } }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const { postId } = params;
  const { userId } = session;

  try {
    const json = await request.json();
    const body = voteSchema.parse(json);

    const existingVote = await prisma.vote.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    // If the user is casting the same vote again, delete it (toggling off)
    if (existingVote && existingVote.type === body.voteType) {
      await prisma.vote.delete({
        where: {
          id: existingVote.id,
        },
      });
      return NextResponse.json({ message: 'Vote removed' }, { status: 200 });
    }

    // If the vote exists but is different, or if it doesn't exist, upsert it
    await prisma.vote.upsert({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
      update: {
        type: body.voteType,
      },
      create: {
        postId,
        userId,
        type: body.voteType,
      },
    });

    return NextResponse.json({ message: 'Vote cast' }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.errors }, { status: 400 });
    }
    console.error('Vote Error:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
