import { prisma } from '@/lib/prisma';
import Link from 'next/link';

async function getRankedProblems(tag?: string) {
  const whereClause = {
    type: 'PROBLEM',
    ...(tag && {
      tags: {
        some: {
          name: tag,
        },
      },
    }),
  };

  const problems = await prisma.post.findMany({
    where: whereClause,
    include: {
      tags: true,
      _count: {
        select: {
          votes: { where: { type: 'UPVOTE' } },
        },
      },
    },
    orderBy: {
      votes: {
        _count: 'desc',
      },
    },
  });

  const allTags = await prisma.tag.findMany({
    orderBy: { name: 'asc' },
  });

  return { problems, allTags };
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: { tag?: string };
}) {
  const { problems, allTags } = await getRankedProblems(searchParams.tag);

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="bg-white shadow-sm p-4">
         <h1 className="text-2xl font-bold max-w-5xl mx-auto"><a href="/">ClarityForge</a></h1>
       </header>
      <main className="p-8 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <aside className="md:col-span-1">
            <h2 className="text-lg font-bold mb-4">Filter by Tag</h2>
            <div className="flex flex-wrap gap-2">
              <Link href="/dashboard" className={`px-3 py-1 text-sm rounded-full ${!searchParams.tag ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
                All
              </Link>
              {allTags.map((tag) => (
                <Link
                  key={tag.id}
                  href={`/dashboard?tag=${tag.name}`}
                  className={`px-3 py-1 text-sm rounded-full ${searchParams.tag === tag.name ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                >
                  {tag.name}
                </Link>
              ))}
            </div>
          </aside>
          <div className="md:col-span-3">
            <h1 className="text-3xl font-bold mb-6">
              Top Problems {searchParams.tag && `in #${searchParams.tag}`}
            </h1>
            <ol className="space-y-4">
              {problems.map((problem, index) => (
                <li key={problem.id} className="p-4 bg-white rounded-lg shadow-sm flex items-center gap-4">
                  <span className="text-2xl font-bold text-gray-400 w-8 text-center">{index + 1}</span>
                  <div className="flex-grow">
                    <Link href={`/posts/${problem.id}`} className="text-xl font-semibold hover:text-blue-600">{problem.title}</Link>
                    <div className="flex gap-2 mt-2">
                        {problem.tags.map(tag => (
                            <span key={tag.id} className="text-xs bg-gray-100 px-2 py-1 rounded-full">{tag.name}</span>
                        ))}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-green-500">
                    {problem._count.votes} Upvotes
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </main>
    </div>
  );
}
