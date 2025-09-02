'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface VoteClientProps {
  postId: string;
  initialVotes: number;
  initialVoteType?: 'UPVOTE' | 'DOWNVOTE' | null;
}

export default function VoteClient({ postId, initialVotes, initialVoteType }: VoteClientProps) {
  const [votes, setVotes] = useState(initialVotes);
  const [currentVote, setCurrentVote] = useState(initialVoteType);
  const router = useRouter();

  const handleVote = async (voteType: 'UPVOTE' | 'DOWNVOTE') => {
    // Optimistic update logic
    let newVoteCount = votes;
    if (currentVote === voteType) { // Toggling off
      newVoteCount -= 1;
      setCurrentVote(null);
    } else if (currentVote) { // Changing vote
      // Vote count doesn't change, just the type
      setCurrentVote(voteType);
    } else { // New vote
      newVoteCount += 1;
      setCurrentVote(voteType);
    }
    setVotes(newVoteCount);

    const res = await fetch(`/api/posts/${postId}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ voteType }),
    });

    if (!res.ok) {
      // Revert optimistic update on failure
      setVotes(initialVotes);
      setCurrentVote(initialVoteType);
      alert('Failed to cast vote. Please try again.');
    } else {
      // Refresh data from server to ensure consistency
      router.refresh();
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => handleVote('UPVOTE')}
        className={`px-3 py-1 rounded-full ${
          currentVote === 'UPVOTE' ? 'bg-green-500 text-white' : 'bg-gray-200'
        }`}
      >
        ▲ Upvote
      </button>
      <span className="font-bold w-8 text-center">{votes}</span>
      {/* Downvoting is not part of the core feature for ranking, but the API supports it.
          For now, we will only show the Upvote button to keep the UI focused on positive ranking.
          If downvoting is needed later, this button can be enabled.
      <button
        onClick={() => handleVote('DOWNVOTE')}
        className={`px-3 py-1 rounded-full ${
          currentVote === 'DOWNVOTE' ? 'bg-red-500 text-white' : 'bg-gray-200'
        }`}
      >
        ▼ Downvote
      </button>
      */}
    </div>
  );
}
