import { Post, User, Vote } from '@prisma/client';
import Link from 'next/link';
import VoteClient from './VoteClient';

// The new type definition based on the updated query in page.tsx
type PostWithDetails = Post & {
  author: Pick<User, 'id' | 'name'>;
  votes: Vote[]; // Now includes the actual vote records for the logged-in user
  _count: {
    comments: number;
    votes: number; // This is the count of UPVOTES only
  };
};

interface PostCardProps {
  post: PostWithDetails;
}

export default function PostCard({ post }: PostCardProps) {
  // The user's vote is the first (and should be only) item in the votes array
  const userVote = post.votes[0];

  return (
    <div className="p-6 border rounded-lg shadow-sm bg-white flex flex-col gap-4">
      <div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            post.type === 'PROBLEM' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
          }`}
        >
          {post.type}
        </span>
        <Link href={`/posts/${post.id}`}>
          <h2 className="text-xl font-bold mt-2 hover:text-blue-600 cursor-pointer">{post.title}</h2>
        </Link>
        <p className="text-gray-500 text-sm mt-1">
          By{' '}
          <Link href={`/users/${post.author.id}`} className="hover:underline">
            {post.author.name}
          </Link>
        </p>
      </div>
      <p className="text-gray-700">{post.content}</p>
      <div className="flex justify-between items-center mt-2">
        <VoteClient
          postId={post.id}
          initialVotes={post._count.votes}
          initialVoteType={userVote?.type}
        />
        <Link href={`/posts/${post.id}`} className="text-sm text-gray-500 hover:underline">
          {post._count.comments} Comments
        </Link>
      </div>
    </div>
  );
}
