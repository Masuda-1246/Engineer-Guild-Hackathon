import React from 'react';

interface ViolationPostProps {
  username: string;
  description: string;
  timeAgo: string;
  imageUrl: string;
  onConfess: () => void;
  onComment: () => void;
}

export function ViolationPost({
  username,
  description,
  timeAgo,
  imageUrl,
  onConfess,
  onComment,
}: ViolationPostProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-100 flex-shrink-0" />
          <div>
            <p className="font-semibold">{username}</p>
            <p className="text-sm text-gray-600">{description}</p>
            <p className="text-xs text-gray-500 mt-1">{timeAgo}</p>
          </div>
        </div>
      </div>
      <div className="aspect-video bg-gray-100">
        <img
          src={imageUrl}
          alt="違反の証拠"
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-4 flex gap-2">
        <button
          onClick={onConfess}
          className="flex-1 py-2 px-4 bg-primary-100 text-primary-600 rounded-full text-sm font-medium hover:bg-primary-200 transition-colors"
        >
          私がやりました
        </button>
        <button
          onClick={onComment}
          className="flex-1 py-2 px-4 bg-gray-100 text-gray-600 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          コメントする
        </button>
      </div>
    </div>
  );
}