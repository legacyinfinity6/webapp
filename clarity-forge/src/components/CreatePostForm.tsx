'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CreatePostForm() {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [type, setType] = useState<'PROBLEM' | 'SOLUTION'>('PROBLEM');
  const [tags, setTags] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, content, type, tags }),
      });

      if (res.ok) {
        // Reset form and refresh the page to show the new post
        setTitle('');
        setContent('');
        setType('PROBLEM');
        setTags('');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.message || 'Failed to create post.');
      }
    } catch (err) {
      setError('An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold mb-4">Share a Problem or Solution</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className="mb-4">
        <label htmlFor="type" className="block text-sm font-bold mb-2">I am sharing a...</label>
        <select
          id="type"
          value={type}
          onChange={(e) => setType(e.target.value as 'PROBLEM' | 'SOLUTION')}
          className="w-full p-2 border rounded"
        >
          <option value="PROBLEM">Problem</option>
          <option value="SOLUTION">Solution</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="title" className="block text-sm font-bold mb-2">Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="w-full p-2 border rounded"
          placeholder="What's the problem or solution?"
        />
      </div>
      <div className="mb-4">
        <label htmlFor="content" className="block text-sm font-bold mb-2">Details</label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          className="w-full p-2 border rounded"
          placeholder="Describe it in more detail..."
          rows={4}
        />
      </div>
      <div className="mb-4">
        <label htmlFor="tags" className="block text-sm font-bold mb-2">Tags</label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="e.g. saas, ai, developer tools"
        />
        <p className="text-xs text-gray-500 mt-1">Comma-separated values.</p>
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
      >
        {isLoading ? 'Submitting...' : 'Submit Post'}
      </button>
    </form>
  );
}
