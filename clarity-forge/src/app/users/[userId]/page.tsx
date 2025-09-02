import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import PostCard from '@/components/PostCard';
import { getSession } from '@/lib/session';

async function getUserProfile(targetUserId: string, currentUserId?: string) {
  const user = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: {
      name: true,
      email: true,
      createdAt: true,
    },
  });

  if (!user) {
    notFound();
  }

  const posts = await prisma.post.findMany({
    where: { authorId: targetUserId },
    include: {
      author: { select: { id: true, name: true } },
      votes: currentUserId ? { where: { userId: currentUserId } } : false,
      _count: {
        select: {
          comments: true,
          votes: { where: { type: 'UPVOTE' } },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });

  return { user, posts };
}

export default async function UserProfilePage({ params }: { params: { userId: string } }) {
  const session = await getSession();
  const { user, posts } = await getUserProfile(params.userId, session?.userId);

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm p-4">
        <h1 className="text-2xl font-bold max-w-4xl mx-auto"><a href="/">ClarityForge</a></h1>
      </header>
      <main className="p-8 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold">{user.name}</h1>
          <p className="text-gray-500">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
        </div>

        <h2 className="text-2xl font-bold mb-6">Posts by {user.name}</h2>
        <div className="space-y-6">
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))
          ) : (
            <p className="text-gray-500">This user hasn't posted anything yet.</p>
          )}
        </div>
      </main>
    </div>
  );
}
