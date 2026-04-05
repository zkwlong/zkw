import { useState } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';

export default function CreatePost() {
  const router = useRouter();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);

  // 未认证时重定向
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>请先登录</p>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`, {
        title,
        excerpt,
        content,
        categories: categories
          .split(',')
          .map((c) => c.trim())
          .filter(Boolean),
        tags: tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });
      router.push('/admin');
    } catch (error) {
      console.error('Failed to create post:', error);
      alert('创建失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <Link href="/admin" className="text-blue-600 hover:text-blue-800">
            ← 返回管理后台
          </Link>
        </div>
      </nav>

      {/* 编辑表单 */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">新建文章</h2>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">标题</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="输入文章标题"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">摘要</label>
            <input
              type="text"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="输入文章摘要"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">分类 (用逗号分隔)</label>
            <input
              type="text"
              value={categories}
              onChange={(e) => setCategories(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="例如: 技术, 生活, 随笔"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">标签 (用逗号分隔)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="例如: react, javascript, 教程"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">内容 (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="12"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono text-sm"
              placeholder="输入文章内容，支持 Markdown 格式"
            />
          </div>

          <div className="flex space-x-4">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? '保存中...' : '保存文章'}
            </button>
            <Link href="/admin" className="px-6 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400">
              取消
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}