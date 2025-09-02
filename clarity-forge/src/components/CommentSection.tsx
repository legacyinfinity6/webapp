'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Comment, User } from '@prisma/client';

type CommentWithAuthor = Comment & {
  author: Pick<User, 'id' | 'name'>;
};

interface CommentSectionProps {
  postId: string;
  initialComments: CommentWithAuthor[];
  session: { userId: string; email: string } | null;
}

export default function CommentSection({ postId, initialComments, session }: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsLoading(true);

    // Optimistic update
    const optimisticComment: CommentWithAuthor = {
      id: Math.random().toString(), // temp ID
      content: newComment,
      postId,
      authorId: session!.userId,
      createdAt: new Date(),
      author: { id: session!.userId, name: session!.email }, // Use email as placeholder name
    };
    setComments((prev) => [...prev, optimisticComment]);
    setNewComment('');


    const res = await fetch(`/api/posts/${postId}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content: newComment }),
    });

    if (!res.ok) {
      // Revert on failure
      setComments(initialComments);
      alert('Failed to post comment.');
    } else {
        // Refresh server data in the background to get real data
        router.refresh();
    }

    setIsLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold mb-4">Comments ({comments.length})</h3>
      <div className="space-y-4 mb-6">
        {comments.map((comment) => (
          <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
            <p className="text-gray-800">{comment.content}</p>
            <p className="text-xs text-gray-500 mt-2">
              By {comment.author.name} on {new Date(comment.createdAt).toLocaleDateString()}
            </p>
          </div>
        ))}
      </div>
      {session && (
        <form onSubmit={handleSubmit}>
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="w-full p-2 border rounded"
            placeholder="Add your comment..."
            rows={3}
            required
          />
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
          >
            {isLoading ? 'Posting...' : 'Post Comment'}
          </button>
        </form>
      )}
    </div>
  );
}
