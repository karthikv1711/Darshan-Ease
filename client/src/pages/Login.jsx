import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, Mail, Lock, ShieldAlert } from 'lucide-react';

const Login = () => {
  const { login, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Security Captcha states
  const [captchaNums, setCaptchaNums] = useState({ n1: 0, n2: 0 });
  const [captchaInput, setCaptchaInput] = useState('');
  
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const redirect = location.state?.from || '/';

  const generateCaptcha = () => {
    setCaptchaNums({
      n1: Math.floor(Math.random() * 9) + 1,
      n2: Math.floor(Math.random() * 9) + 1
    });
    setCaptchaInput('');
  };

  useEffect(() => {
    if (user) {
      navigate(redirect);
    }
    generateCaptcha();
  }, [user, navigate, redirect]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Captcha Validation
    if (parseInt(captchaInput) !== captchaNums.n1 + captchaNums.n2) {
      setError('Incorrect security captcha answer. Please try again.');
      generateCaptcha();
      return;
    }

    setLoading(true);
    const result = await login(email, password);
    setLoading(false);

    if (result.success) {
      navigate(redirect);
    } else {
      setError(result.message);
      generateCaptcha(); // regen on fail
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
      <div className="card-glass" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem 2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem', textAlign: 'center' }}>
          <Compass size={40} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.75rem' }}>Login to DarshanEase</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enter credentials to book tickets, manage, and donate.</p>
        </div>

        {error && <div className="alert alert-error" style={{ fontSize: '0.85rem', padding: '0.75rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-control" 
                placeholder="devotee@example.com" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-control" 
                placeholder="••••••••" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          {/* Security Captcha Input */}
          <div className="form-group" style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldAlert size={14} style={{ color: 'var(--primary)' }} />
              <span>Security Math Captcha</span>
            </label>
            <div className="responsive-grid-2" style={{ gap: '1rem', alignItems: 'center' }}>
              <div style={{ 
                background: 'rgba(var(--primary-rgb), 0.15)', 
                border: '1px dashed var(--primary)', 
                color: 'var(--secondary)', 
                padding: '0.6rem', 
                borderRadius: '6px',
                fontWeight: '700',
                fontSize: '1.1rem',
                textAlign: 'center',
                letterSpacing: '2px',
                userSelect: 'none'
              }}>
                {captchaNums.n1} + {captchaNums.n2} = ?
              </div>
              <input 
                type="number" 
                className="form-control" 
                placeholder="Answer" 
                value={captchaInput}
                onChange={(e) => setCaptchaInput(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.8rem' }} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Don't have an account?{' '}
          <Link to="/register" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
