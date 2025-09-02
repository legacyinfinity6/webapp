import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { getSession } from '@/lib/session';
import CommentSection from '@/components/CommentSection';

async function getPostDetails(postId: string, userId?: string) {
  const post = await prisma.post.findUnique({
    where: { id: postId },
    include: {
      author: { select: { id: true, name: true } },
      votes: userId ? { where: { userId } } : false,
      _count: {
        select: {
          comments: true,
          votes: { where: { type: 'UPVOTE' } },
        },
      },
    },
  });

  if (!post) {
    notFound();
  }

  const comments = await prisma.comment.findMany({
    where: { postId },
    include: { author: { select: { id: true, name: true } } },
    orderBy: { createdAt: 'asc' },
  });

  return { post, comments };
}

export default async function PostPage({ params }: { params: { postId: string } }) {
  const session = await getSession();
  const { post, comments } = await getPostDetails(params.postId, session?.userId);

  return (
    <div className="bg-gray-50 min-h-screen">
       <header className="bg-white shadow-sm p-4">
         <h1 className="text-2xl font-bold max-w-4xl mx-auto"><a href="/">ClarityForge</a></h1>
       </header>
      <main className="p-8 max-w-4xl mx-auto">
        <PostCard post={post} />
        <div className="mt-8">
            <CommentSection postId={post.id} initialComments={comments} session={session} />
        </div>
      </main>
    </div>
  );
}
