/**
 * Mini Blog - React 前端应用
 *
 * 单文件 React SPA，演示:
 *   - 组件化架构
 *   - useState / useEffect Hooks
 *   - 客户端路由 (hash-based)
 *   - API 调用 (fetch)
 *   - 表单处理
 *   - 条件渲染
 */

const { useState, useEffect, useCallback } = React;

// ============= API 工具 =============

const API_BASE = '/api';

async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...options.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || '请求失败');
  return data;
}

// ============= Toast 组件 =============

function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className={`toast toast-${type}`}>
      {type === 'success' ? '✅' : '❌'} {message}
    </div>
  );
}

// ============= 导航栏 =============

function Navbar({ user, onNavigate, onLogout, currentPage }) {
  return (
    <nav className="navbar">
      <a className="navbar-brand" onClick={() => onNavigate('home')}>
        ✨ Mini Blog
      </a>
      <div className="navbar-nav">
        <button
          className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
          onClick={() => onNavigate('home')}
        >
          📝 文章
        </button>
        {user ? (
          <div className="nav-user">
            <button className="nav-link" onClick={() => onNavigate('editor')}>
              ✏️ 写文章
            </button>
            <div className="nav-avatar">{user.username[0].toUpperCase()}</div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
              {user.username}
            </span>
            <button className="nav-link" onClick={onLogout}>退出</button>
          </div>
        ) : (
          <button
            className={`nav-link ${currentPage === 'auth' ? 'active' : ''}`}
            onClick={() => onNavigate('auth')}
          >
            🔑 登录
          </button>
        )}
      </div>
    </nav>
  );
}

// ============= 文章列表页 =============

function PostList({ onNavigate, showToast }) {
  const [posts, setPosts] = useState([]);
  const [tags, setTags] = useState([]);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [loading, setLoading] = useState(true);

  const loadPosts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (activeTag) params.set('tag', activeTag);
      const query = params.toString() ? `?${params}` : '';

      const data = await apiFetch(`/posts${query}`);
      setPosts(data.posts || []);
    } catch (e) {
      showToast(e.message, 'error');
    }
    setLoading(false);
  }, [search, activeTag]);

  const loadTags = useCallback(async () => {
    try {
      const data = await apiFetch('/tags');
      setTags(data.tags || []);
    } catch {}
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);
  useEffect(() => { loadTags(); }, []);

  return (
    <div className="container">
      <div className="hero">
        <h1>Mini Blog</h1>
        <p>使用 React + Node.js 构建的全栈博客系统</p>
      </div>

      {/* 搜索栏 */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input
          type="text"
          placeholder="搜索文章..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && loadPosts()}
        />
      </div>

      {/* 标签云 */}
      {tags.length > 0 && (
        <div className="tag-cloud">
          <span
            className={`tag ${!activeTag ? 'active' : ''}`}
            onClick={() => setActiveTag('')}
          >
            全部
          </span>
          {tags.map((t) => (
            <span
              key={t.name}
              className={`tag ${activeTag === t.name ? 'active' : ''}`}
              onClick={() => setActiveTag(activeTag === t.name ? '' : t.name)}
            >
              {t.name} ({t.count})
            </span>
          ))}
        </div>
      )}

      {/* 文章列表 */}
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          <p style={{ marginTop: '16px' }}>加载中...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">📭</div>
          <p>还没有文章，快来写一篇吧！</p>
        </div>
      ) : (
        posts.map((post) => (
          <div className="card" key={post.id}>
            <h3
              className="card-title"
              onClick={() => onNavigate('post', post.id)}
            >
              {post.title}
            </h3>
            <div className="card-meta">
              <span>👤 {post.author}</span>
              <span>📅 {new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
            </div>
            <p className="card-summary">{post.summary}</p>
            <div>
              {(post.tags || []).map((tag) => (
                <span
                  key={tag}
                  className="tag"
                  onClick={(e) => { e.stopPropagation(); setActiveTag(tag); }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}

// ============= 文章详情页 =============

function PostDetail({ postId, user, onNavigate, showToast }) {
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await apiFetch(`/posts/${postId}`);
        setPost(data.post);
        setComments(data.comments || []);
      } catch (e) {
        showToast(e.message, 'error');
      }
      setLoading(false);
    }
    load();
  }, [postId]);

  const handleComment = async () => {
    if (!commentText.trim()) return;
    try {
      const data = await apiFetch(`/posts/${postId}/comments`, {
        method: 'POST',
        body: JSON.stringify({
          content: commentText,
          author: user ? user.username : '匿名',
        }),
      });
      setComments([...comments, data.comment]);
      setCommentText('');
      showToast('评论成功！', 'success');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  const handleDelete = async () => {
    if (!confirm('确定要删除这篇文章吗？')) return;
    try {
      await apiFetch(`/posts/${postId}`, { method: 'DELETE' });
      showToast('已删除', 'success');
      onNavigate('home');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container">
        <div className="empty-state">
          <div className="emoji">😕</div>
          <p>文章不存在</p>
          <button className="btn btn-primary" onClick={() => onNavigate('home')}>
            返回首页
          </button>
        </div>
      </div>
    );
  }

  // 简易 Markdown → HTML (客户端)
  const htmlContent = renderMarkdown(post.content || '');

  return (
    <div className="container">
      {/* 文章头部 */}
      <div className="post-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('home')}>
          ← 返回
        </button>
        {user && user.username === post.author && (
          <div className="btn-group">
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onNavigate('editor', postId)}
            >
              ✏️ 编辑
            </button>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              🗑 删除
            </button>
          </div>
        )}
      </div>

      {/* 文章内容 */}
      <div className="card" style={{ cursor: 'default' }}>
        <h1 style={{ fontSize: '28px', marginBottom: '12px' }}>{post.title}</h1>
        <div className="card-meta">
          <span>👤 {post.author}</span>
          <span>📅 {new Date(post.createdAt).toLocaleDateString('zh-CN')}</span>
        </div>
        <div style={{ marginBottom: '16px' }}>
          {(post.tags || []).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <hr className="divider" />
        <div
          className="post-content"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </div>

      {/* 评论区 */}
      <h2 style={{ margin: '32px 0 16px' }}>💬 评论 ({comments.length})</h2>

      {comments.map((c) => (
        <div className="comment-card" key={c.id}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span className="comment-author">👤 {c.author}</span>
            <span className="comment-date">
              {new Date(c.createdAt).toLocaleDateString('zh-CN')}
            </span>
          </div>
          <p className="comment-text">{c.content}</p>
        </div>
      ))}

      {/* 发表评论 */}
      <div className="card" style={{ cursor: 'default', marginTop: '16px' }}>
        <h3 style={{ marginBottom: '12px', fontSize: '16px' }}>发表评论</h3>
        <textarea
          className="form-textarea"
          style={{ minHeight: '100px' }}
          placeholder="写下你的评论..."
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
        />
        <div className="btn-group">
          <button className="btn btn-primary" onClick={handleComment}>
            提交评论
          </button>
        </div>
      </div>
    </div>
  );
}

// ============= 文章编辑器 =============

function Editor({ editId, user, onNavigate, showToast }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(!!editId);

  useEffect(() => {
    if (editId) {
      apiFetch(`/posts/${editId}`)
        .then((data) => {
          setTitle(data.post.title);
          setContent(data.post.content);
          setTagsInput((data.post.tags || []).join(', '));
        })
        .catch((e) => showToast(e.message, 'error'))
        .finally(() => setLoading(false));
    }
  }, [editId]);

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      return showToast('标题和内容不能为空', 'error');
    }

    const tags = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    try {
      if (editId) {
        await apiFetch(`/posts/${editId}`, {
          method: 'PUT',
          body: JSON.stringify({ title, content, tags }),
        });
        showToast('更新成功！', 'success');
      } else {
        await apiFetch('/posts', {
          method: 'POST',
          body: JSON.stringify({ title, content, tags }),
        });
        showToast('发布成功！', 'success');
      }
      onNavigate('home');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  if (loading) {
    return <div className="loading"><div className="spinner"></div></div>;
  }

  return (
    <div className="container">
      <div className="post-actions">
        <button className="btn btn-secondary btn-sm" onClick={() => onNavigate('home')}>
          ← 返回
        </button>
        <div className="btn-group">
          <button
            className={`btn ${preview ? 'btn-secondary' : 'btn-primary'} btn-sm`}
            onClick={() => setPreview(false)}
          >
            ✏️ 编辑
          </button>
          <button
            className={`btn ${preview ? 'btn-primary' : 'btn-secondary'} btn-sm`}
            onClick={() => setPreview(true)}
          >
            👁 预览
          </button>
        </div>
      </div>

      <div className="card" style={{ cursor: 'default' }}>
        <h2 style={{ marginBottom: '24px' }}>{editId ? '编辑文章' : '写文章'}</h2>

        <div className="form-group">
          <label className="form-label">标题</label>
          <input
            className="form-input"
            placeholder="文章标题"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">标签 (逗号分隔)</label>
          <input
            className="form-input"
            placeholder="JavaScript, React, 前端"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">内容 (支持 Markdown)</label>
          {preview ? (
            <div
              className="post-content"
              style={{
                minHeight: '200px',
                padding: '16px',
                background: 'var(--bg-secondary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border)',
              }}
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          ) : (
            <textarea
              className="form-textarea"
              style={{ minHeight: '300px', fontFamily: "'SF Mono', 'Fira Code', monospace" }}
              placeholder="使用 Markdown 编写内容..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
          )}
        </div>

        <button className="btn btn-primary" onClick={handleSubmit}>
          {editId ? '💾 保存修改' : '🚀 发布文章'}
        </button>
      </div>
    </div>
  );
}

// ============= 登录/注册页 =============

function AuthPage({ onLogin, showToast, onNavigate }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    if (!username.trim() || !password.trim()) {
      return showToast('请填写用户名和密码', 'error');
    }

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const body = { username, password };
      if (!isLogin) body.email = email;

      const data = await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
      });

      localStorage.setItem('token', data.token);
      onLogin(data.user);
      showToast(isLogin ? '登录成功！' : '注册成功！', 'success');
      onNavigate('home');
    } catch (e) {
      showToast(e.message, 'error');
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-title">
          {isLogin ? '🔑 登录' : '✨ 注册'}
        </h2>

        <div className="form-group">
          <label className="form-label">用户名</label>
          <input
            className="form-input"
            placeholder="输入用户名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        {!isLogin && (
          <div className="form-group">
            <label className="form-label">邮箱</label>
            <input
              className="form-input"
              type="email"
              placeholder="输入邮箱"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        )}

        <div className="form-group">
          <label className="form-label">密码</label>
          <input
            className="form-input"
            type="password"
            placeholder="输入密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        </div>

        <button
          className="btn btn-primary"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={handleSubmit}
        >
          {isLogin ? '登录' : '注册'}
        </button>

        <div className="auth-switch">
          {isLogin ? '还没有账号？' : '已有账号？'}
          <button onClick={() => setIsLogin(!isLogin)}>
            {isLogin ? '去注册' : '去登录'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============= Markdown 渲染 (客户端) =============

function renderMarkdown(text) {
  if (!text) return '';
  let html = text;

  // 代码块
  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const escaped = code.trim().replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return `<pre><code class="language-${lang || 'text'}">${escaped}</code></pre>`;
  });
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/^######\s+(.+)$/gm, '<h6>$1</h6>');
  html = html.replace(/^#####\s+(.+)$/gm, '<h5>$1</h5>');
  html = html.replace(/^####\s+(.+)$/gm, '<h4>$1</h4>');
  html = html.replace(/^###\s+(.+)$/gm, '<h3>$1</h3>');
  html = html.replace(/^##\s+(.+)$/gm, '<h2>$1</h2>');
  html = html.replace(/^#\s+(.+)$/gm, '<h1>$1</h1>');
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
  html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  html = html.replace(/^>\s+(.+)$/gm, '<blockquote>$1</blockquote>');
  html = html.replace(/^[-*]\s+(.+)$/gm, '<li>$1</li>');
  html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
  html = html.replace(/^---+$/gm, '<hr>');

  html = html.split('\n\n').map((block) => {
    block = block.trim();
    if (!block || block.startsWith('<')) return block;
    return `<p>${block}</p>`;
  }).join('\n');

  return html;
}

// ============= 根组件 =============

function App() {
  const [page, setPage] = useState('home');
  const [pageParam, setPageParam] = useState(null);
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  // 初始化: 检查 Token
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // 从 Token 解码用户信息
      try {
        const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
        if (payload.exp > Date.now()) {
          setUser({ username: payload.username, userId: payload.userId });
        } else {
          localStorage.removeItem('token');
        }
      } catch {}
    }
  }, []);

  const navigate = (pageName, param) => {
    setPage(pageName);
    setPageParam(param || null);
    window.scrollTo(0, 0);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    showToast('已退出登录', 'success');
    navigate('home');
  };

  return (
    <div>
      <Navbar
        user={user}
        onNavigate={navigate}
        onLogout={handleLogout}
        currentPage={page}
      />

      {/* 路由 */}
      {page === 'home' && (
        <PostList onNavigate={navigate} showToast={showToast} />
      )}
      {page === 'post' && (
        <PostDetail
          postId={pageParam}
          user={user}
          onNavigate={navigate}
          showToast={showToast}
        />
      )}
      {page === 'editor' && (
        user ? (
          <Editor
            editId={pageParam}
            user={user}
            onNavigate={navigate}
            showToast={showToast}
          />
        ) : (
          <AuthPage onLogin={setUser} showToast={showToast} onNavigate={navigate} />
        )
      )}
      {page === 'auth' && (
        <AuthPage onLogin={setUser} showToast={showToast} onNavigate={navigate} />
      )}

      <footer className="footer">
        <p>✨ Mini Blog — React + Node.js 全栈博客系统</p>
        <p>前端课程实战项目 · Phase 16-18</p>
      </footer>

      {/* Toast 通知 */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}

// ============= 挂载 =============

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
