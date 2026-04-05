import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import axios from 'axios';
import MarkdownIt from 'markdown-it';
import { useAuth } from '../../hooks/useAuth';

const md = new MarkdownIt();

export default function BlogPost() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // 评论表单
  const [commentAuthor, setCommentAuthor] = useState('');
  const [commentEmail, setCommentEmail] = useState('');
  const [commentContent, setCommentContent] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
  }, []);

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`);
        setPost(response.data);

        // 获取评论
        const commentsResponse = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/comments`
        );
        setComments(commentsResponse.data);
      } catch (error) {
        console.error('Failed to fetch post:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setSubmittingComment(true);

    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}/comments`,
        {
          content: commentContent,
          author: commentAuthor,
          email: commentEmail,
        }
      );
      setComments([response.data, ...comments]);
      setCommentAuthor('');
      setCommentEmail('');
      setCommentContent('');
    } catch (error) {
      console.error('Failed to submit comment:', error);
      alert('评论提交失败');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (loading)
    return (
      <p className={`text-center py-12 ${darkMode ? 'bg-gray-900 text-gray-400' : ''}`}>
        加载中...
      </p>
    );
  if (!post)
    return (
      <p className={`text-center py-12 ${darkMode ? 'bg-gray-900 text-gray-400' : ''}`}>
        文章不存在
      </p>
    );

  return (
    <div className={darkMode ? 'dark bg-gray-900' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-white'}`}>
        {/* 导航 */}
        <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-b'}`}>
          <div className="max-w-4xl mx-auto px-4 py-4">
            <Link href="/" className={darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}>
              ← 返回首页
            </Link>
          </div>
        </nav>

        {/* 文章内容 */}
        <article className="max-w-4xl mx-auto px-4 py-12">
          <h1 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            {post.title}
          </h1>

          <div className={`flex justify-between items-center mb-8 text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            <div className="space-x-4">
              <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
              <span>作者: {post.author?.username}</span>
              <span>👁 {post.views}</span>
            </div>
          </div>

          {/* 分类和标签 */}
          {(post.categories?.length > 0 || post.tags?.length > 0) && (
            <div className="mb-8 flex flex-wrap gap-2">
              {post.categories?.map((cat) => (
                <span
                  key={cat}
                  className={`px-3 py-1 rounded text-sm ${
                    darkMode
                      ? 'bg-blue-900 text-blue-200'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {cat}
                </span>
              ))}
              {post.tags?.map((tag) => (
                <span
                  key={tag}
                  className={`px-3 py-1 rounded text-sm ${
                    darkMode
                      ? 'bg-green-900 text-green-200'
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          <div
            className={`prose max-w-none mb-12 ${darkMode ? 'prose-dark' : ''}`}
            dangerouslySetInnerHTML={{ __html: md.render(post.content) }}
          />

          {/* 评论部分 */}
          <section className={`mt-12 pt-8 border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              评论区 ({comments.length})
            </h2>

            {/* 评论表单 */}
            <form onSubmit={handleSubmitComment} className={`mb-8 p-6 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}>
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                发表评论
              </h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <input
                  type="text"
                  placeholder="你的名字"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  required
                  className={`px-4 py-2 rounded border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                />
                <input
                  type="email"
                  placeholder="你的邮箱"
                  value={commentEmail}
                  onChange={(e) => setCommentEmail(e.target.value)}
                  required
                  className={`px-4 py-2 rounded border ${
                    darkMode
                      ? 'bg-gray-700 border-gray-600 text-white'
                      : 'border-gray-300'
                  } focus:outline-none focus:ring-2 focus:ring-blue-600`}
                />
              </div>

              <textarea
                placeholder="输入评论内容..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                required
                rows="4"
                className={`w-full px-4 py-2 rounded border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4`}
              />

              <button
                type="submit"
                disabled={submittingComment}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
              >
                {submittingComment ? '提交中...' : '发表评论'}
              </button>
            </form>

            {/* 评论列表 */}
            <div className="space-y-6">
              {comments.length === 0 ? (
                <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>
                  还没有评论，快来抢沙发吧！
                </p>
              ) : (
                comments.map((comment) => (
                  <div
                    key={comment._id}
                    className={`p-4 rounded-lg ${darkMode ? 'bg-gray-800' : 'bg-gray-50'}`}
                  >
                    <div className={`flex justify-between items-start mb-2`}>
                      <div>
                        <p className={`font-semibold ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
                          {comment.author}
                        </p>
                        <p className={`text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                          {new Date(comment.createdAt).toLocaleDateString('zh-CN')}
                        </p>
                      </div>
                    </div>
                    <p className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                      {comment.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </article>
      </div>
    </div>
  );
}