import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import '../styles/login.css';

const Login = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/login', { username, password });
      const role = res.data.data.user.role;

      if (role === 'admin') navigate('/admin');
      else navigate('/cashier');

    } catch (err) {
      setError('Username atau password salah!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen">
      <div className="login-content">

        {/* SISI KIRI */}
        <div className="left-brand">
          <img src="/assets/img/logo_login.png" alt="Marile" className="marile-logo" />
          <h1 className="marile-title">Marile</h1>
        </div>

        {/* SISI KANAN */}
        <div className="right-auth-card">
          <div className="card-header-vertical">
            <h2 className="login-header-text">LOGIN</h2>
            <p className="login-sub-text">
              Masuk untuk melanjutkan ke sistem Marile
            </p>
          </div>

          <form className="auth-form-body" onSubmit={handleLogin}>
            <div className="input-row">
              <label>Username</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
              />
            </div>

            <div className="input-row">
              <label>Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            {error && <p style={{ color: 'red', fontSize: '14px' }}>{error}</p>}

            <div className="auth-utils-row">
              <label className="remember-me-label">
                <input type="checkbox" />
                <span>Remember Me</span>
              </label>
              <a href="#" className="forgot-link">Forgot Password?</a>
            </div>

            <button type="submit" className="login-btn-orange" disabled={loading}>
              {loading ? 'Memuat...' : 'Login'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Login;