import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

// GET all posts
export async function GET() {
  try {
    const posts = await prisma.post.findMany({
      include: {
        author: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            comments: true,
            votes: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    return NextResponse.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}

// POST a new post
export async function POST(request: Request) {
  const sessionCookie = cookies().get('session')?.value;
  if (!sessionCookie) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, secret);
    const userId = payload.userId as string;

    if (!userId) {
      return NextResponse.json({ message: 'Invalid token payload' }, { status: 401 });
    }

    const { title, content, type, tags } = await request.json(); // tags is a string of comma-separated values

    if (!title || !content || !type) {
      return NextResponse.json({ message: 'Title, content, and type are required' }, { status: 400 });
    }

    if (type !== 'PROBLEM' && type !== 'SOLUTION') {
      return NextResponse.json({ message: 'Invalid post type' }, { status: 400 });
    }

    const tagObjects = tags
      ? await Promise.all(
          tags.split(',').map((tag: string) => {
            const name = tag.trim().toLowerCase();
            return prisma.tag.upsert({
              where: { name },
              update: {},
              create: { name },
            });
          })
        )
      : [];

    const newPost = await prisma.post.create({
      data: {
        title,
        content,
        type,
        authorId: userId,
        tags: {
          connect: tagObjects.map((tag) => ({ id: tag.id })),
        },
      },
    });

    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.name === 'JWTExpired') {
        return NextResponse.json({ message: 'Session expired' }, { status: 401 });
    }
    console.error('Error creating post:', error);
    return NextResponse.json({ message: 'An unexpected error occurred' }, { status: 500 });
  }
}
