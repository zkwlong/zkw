import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';

export default function Home() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  // 初始化深色模式
  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
  }, []);

  // 切换深色模式
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode);
  };

  // 获取文章
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        let query = new URLSearchParams();
        if (selectedCategory) query.append('category', selectedCategory);
        if (selectedTag) query.append('tag', selectedTag);
        if (searchQuery) query.append('search', searchQuery);

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/api/posts?${query.toString()}`
        );
        setPosts(response.data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, [selectedCategory, selectedTag, searchQuery]);

  // 获取分类和标签
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catRes, tagRes] = await Promise.all([
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/categories`),
          axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/tags`),
        ]);
        setCategories(catRes.data);
        setTags(tagRes.data);
      } catch (error) {
        console.error('Failed to fetch metadata:', error);
      }
    };

    fetchMetadata();
  }, []);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gradient-to-b from-blue-50 to-white'}`}>
        {/* 导航栏 */}
        <nav className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow`}>
          <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
            <h1 className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
              My Blog
            </h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={toggleDarkMode}
                className={`px-3 py-2 rounded ${darkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-800'}`}
              >
                {darkMode ? '☀️' : '🌙'}
              </button>
              {user ? (
                <>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>
                    Hi, {user.username}
                  </span>
                  <Link
                    href="/admin"
                    className={`px-4 py-2 rounded ${darkMode ? 'bg-blue-600 hover:bg-blue-700' : 'bg-blue-600 hover:bg-blue-700'} text-white`}
                  >
                    管理后台
                  </Link>
                  <button
                    onClick={logout}
                    className={`px-4 py-2 rounded ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-600 hover:bg-red-700'} text-white`}
                  >
                    退出
                  </button>
                </>
              ) : (
                <Link
                  href="/auth/login"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  登录
                </Link>
              )}
            </div>
          </div>
        </nav>

        {/* 主容器 */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          {/* 头部 */}
          <div className="text-center mb-12">
            <h2 className={`text-4xl font-bold mb-4 ${darkMode ? 'text-gray-100' : 'text-gray-800'}`}>
              欢迎来到我的博客
            </h2>
            <p className={`text-xl ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              分享技术、生活和想法
            </p>
          </div>

          {/* 搜索和过滤 */}
          <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow p-6 mb-8`}>
            {/* 搜索框 */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="搜索文章..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`w-full px-4 py-2 rounded border ${
                  darkMode
                    ? 'bg-gray-700 border-gray-600 text-white'
                    : 'border-gray-300'
                } focus:outline-none focus:ring-2 focus:ring-blue-600`}
              />
            </div>

            {/* 分类过滤 */}
            <div className="mb-6">
              <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                分类
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`px-3 py-1 rounded text-sm ${
                    !selectedCategory
                      ? 'bg-blue-600 text-white'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  全部
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedCategory === cat
                        ? 'bg-blue-600 text-white'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* 标签过滤 */}
            <div>
              <h3 className={`text-sm font-semibold mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                标签
              </h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedTag('')}
                  className={`px-3 py-1 rounded text-sm ${
                    !selectedTag
                      ? 'bg-blue-600 text-white'
                      : darkMode
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  全部
                </button>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3 py-1 rounded text-sm ${
                      selectedTag === tag
                        ? 'bg-blue-600 text-white'
                        : darkMode
                        ? 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 文章列表 */}
          {loading ? (
            <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              加载中...
            </p>
          ) : posts.length === 0 ? (
            <p className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
              暂无文章
            </p>
          ) : (
            <div className="grid gap-6">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className={`rounded-lg shadow p-6 hover:shadow-lg transition ${
                    darkMode ? 'bg-gray-800 hover:bg-gray-750' : 'bg-white'
                  }`}
                >
                  <Link href={`/blog/${post._id}`}>
                    <h3
                      className={`text-2xl font-bold hover:opacity-80 cursor-pointer mb-2 ${
                        darkMode ? 'text-blue-400' : 'text-blue-600'
                      }`}
                    >
                      {post.title}
                    </h3>
                  </Link>
                  <p className={`mb-4 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                    {post.excerpt}
                  </p>

                  {/* 分类和标签 */}
                  <div className="mb-4 flex flex-wrap gap-2">
                    {post.categories?.map((cat) => (
                      <span
                        key={cat}
                        className={`px-2 py-1 rounded text-xs ${
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
                        className={`px-2 py-1 rounded text-xs ${
                          darkMode
                            ? 'bg-green-900 text-green-200'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className={`flex justify-between items-center text-sm ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                    <div className="space-x-4">
                      <span>{new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
                      <span>👁 {post.views}</span>
                    </div>
                    <Link
                      href={`/blog/${post._id}`}
                      className={`${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'}`}
                    >
                      阅读全文 →
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}