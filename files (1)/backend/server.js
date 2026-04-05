const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 连接 MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (err) => console.error('MongoDB connection error:', err));
db.once('open', () => console.log('Connected to MongoDB'));

// 引入模型
const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const auth = require('./middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// ==================== 用户认证相关 ====================

// POST /api/auth/register - 注册
app.post('/api/auth/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // 检查用户是否存在
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: '用户已存在' });
    }

    // 创建新用户
    user = new User({ username, email, password });
    await user.save();

    // 生成 JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// POST /api/auth/login - 登录
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: '邮箱或密码错误' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: '邮箱或密码错误' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/auth/me - 获取当前用户信息
app.get('/api/auth/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ==================== 文章��关 ====================

// GET /api/posts - 获取所有文章（支持过滤）
app.get('/api/posts', async (req, res) => {
  try {
    const { category, tag, search } = req.query;
    let query = {};

    if (category) query.categories = category;
    if (tag) query.tags = tag;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
      ];
    }

    const posts = await Post.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/posts/:id - 获取单个文章
app.get('/api/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('author', 'username');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts - 创建文章（需要认证）
app.post('/api/posts', auth, async (req, res) => {
  try {
    const { title, excerpt, content, categories, tags } = req.body;

    const post = new Post({
      title,
      excerpt,
      content,
      categories: categories || [],
      tags: tags || [],
      author: req.userId,
    });

    await post.save();
    await post.populate('author', 'username');

    res.status(201).json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/posts/:id - 更新文章（需要认证）
app.put('/api/posts/:id', auth, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // 检查权限
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ error: '无权修改此文章' });
    }

    post = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true }).populate('author', 'username');

    res.json(post);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/posts/:id - 删除文章（需要认证）
app.delete('/api/posts/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // 检查权限
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ error: '无权删除此文章' });
    }

    await Post.findByIdAndDelete(req.params.id);

    res.json({ message: 'Post deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/posts/:id/comments - 获取文章评论
app.get('/api/posts/:id/comments', async (req, res) => {
  try {
    const comments = await Comment.find({ post: req.params.id }).sort({ createdAt: -1 });
    res.json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST /api/posts/:id/comments - 添加评论
app.post('/api/posts/:id/comments', async (req, res) => {
  try {
    const { content, author, email } = req.body;

    const comment = new Comment({
      content,
      author,
      email,
      post: req.params.id,
    });

    await comment.save();

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/comments/:id - 删除评论（需要认证）
app.delete('/api/comments/:id', auth, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // 获取文章信息检查权限
    const post = await Post.findById(comment.post);
    if (post.author.toString() !== req.userId) {
      return res.status(403).json({ error: '无权删除此评论' });
    }

    await Comment.findByIdAndDelete(req.params.id);

    res.json({ message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/categories - 获取所有分类
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await Post.distinct('categories');
    res.json(categories.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/tags - 获取所有标签
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await Post.distinct('tags');
    res.json(tags.filter(Boolean));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 启动服务器
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});