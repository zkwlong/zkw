import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';

export default function Admin() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/api/posts`);
        setPosts(response.data);
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm('确定删除？')) return;
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/api/posts/${id}`);
      setPosts(posts.filter((p) => p._id !== id));
    } catch (error) {
      console.error('Failed to delete post:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* 导航栏 */}
      <nav className="bg-white shadow">
        <div className="max-w-6xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-600">博客管理后台</h1>
          <div className="space-x-4">
            <Link href="/" className="text-blue-600 hover:text-blue-800">
              查看博客
            </Link>
            <Link href="/admin/create" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
              新建文章
            </Link>
          </div>
        </div>
      </nav>

      {/* 文章管理 */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold mb-6">文章列表</h2>

        {loading ? (
          <p className="text-gray-500">加载中...</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500">暂无文章</p>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">标题</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">创建时间</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post._id} className="border-t hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-800">{post.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(post.createdAt).toLocaleDateString('zh-CN')}
                    </td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <Link href={`/admin/edit/${post._id}`} className="text-blue-600 hover:text-blue-800">
                        编辑
                      </Link>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        删除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}