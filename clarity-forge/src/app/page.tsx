import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import CreatePostForm from '@/components/CreatePostForm';
import PostCard from '@/components/PostCard';

async function getPosts(userId?: string) {
  const posts = await prisma.post.findMany({
    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },
      votes: userId ? { where: { userId } } : false, // Include user's vote if logged in
      _count: {
        select: {
          comments: true,
          // We only count upvotes for the main ranking
          votes: { where: { type: 'UPVOTE' } },
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  return posts;
}

export default async function HomePage() {
  const session = await getSession();
  const posts = await getPosts(session?.userId);

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm p-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">ClarityForge</h1>
        <nav>
          {session ? (
            <div className="flex items-center gap-4">
              <span>Welcome, {session.email}</span>
              <form action="/api/auth/logout" method="post">
                <button type="submit" className="bg-red-500 text-white px-4 py-2 rounded">Logout</button>
              </form>
            </div>
          ) : (
            <div className="flex gap-4">
              <Link href="/login" className="text-blue-500">Login</Link>
              <Link href="/register" className="bg-blue-500 text-white px-4 py-2 rounded">Register</Link>
            </div>
          )}
        </nav>
      </header>

      <main className="p-8 max-w-4xl mx-auto">
        {session && <CreatePostForm />}

        <div className="mt-8">
          <h2 className="text-3xl font-bold mb-6">Feed</h2>
          <div className="space-y-6">
            {posts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
