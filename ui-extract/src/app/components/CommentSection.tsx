import { useState } from 'react';
import { Send, User } from 'lucide-react';

interface Comment {
  id: string;
  author: string;
  role: string;
  content: string;
  timestamp: string;
}

interface CommentSectionProps {
  comments: Comment[];
}

export default function CommentSection({ comments: initialComments }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    const comment: Comment = {
      id: Date.now().toString(),
      author: 'Current User',
      role: 'Teacher',
      content: newComment,
      timestamp: new Date().toLocaleString(),
    };

    setComments([...comments, comment]);
    setNewComment('');
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold mb-4">Comments</h3>
      
      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
        {comments.map((comment) => (
          <div key={comment.id} className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-sm">{comment.author}</span>
                <span className="text-xs text-gray-500">{comment.role}</span>
                <span className="text-xs text-gray-400">• {comment.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700">{comment.content}</p>
            </div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Send className="w-4 h-4" />
          Send
        </button>
      </form>
    </div>
  );
}
