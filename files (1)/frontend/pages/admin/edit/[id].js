import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import axios from 'axios';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';

export default function EditPost() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [categories, setCategories] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // 未认证时重定向
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>请先登录</p>
      </div>
    );
  }

  useEffect(() => {
    if (!id) return;

    const fetchPost = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`);
        setTitle(response.data.title);
        setExcerpt(response.data.excerpt);
        setContent(response.data.content);
        setCategories((response.data.categories || []).join(', '));
        setTags((response.data.tags || []).join(', '));
      } catch (error) {
        console.error('Failed to fetch post:', error);
        alert('无法加载文章');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      await axios.put(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`, {
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
      console.error('Failed to update post:', error);
      alert('更新失败，请重试');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <p className="text-center py-12">加载中...</p>;

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
        <h2 className="text-2xl font-bold mb-6">编辑文章</h2>

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
            <label