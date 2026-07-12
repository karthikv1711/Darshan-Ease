import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, User, Mail, Lock, Phone, MapPin, ShieldAlert } from 'lucide-react';

const Register = () => {
  const { register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState('USER');
  
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

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    // Captcha Validation
    if (parseInt(captchaInput) !== captchaNums.n1 + captchaNums.n2) {
      setError('Incorrect security captcha answer. Please try again.');
      generateCaptcha();
      return;
    }

    setLoading(true);
    const result = await register(name, email, password, phone, address, role);
    setLoading(false);

    if (result.success) {
      navigate(redirect);
    } else {
      setError(result.message);
      generateCaptcha();
    }
  };

  return (
    <div className="container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '90vh', padding: '2rem 0' }}>
      <div className="card-glass" style={{ width: '100%', maxWidth: '480px', padding: '2.5rem 2rem' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <Compass size={40} style={{ color: 'var(--primary)' }} />
          <h2 style={{ fontSize: '1.75rem' }}>Create Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Join DarshanEase to start reserving temple slots.</p>
        </div>

        {error && <div className="alert alert-error" style={{ fontSize: '0.85rem', padding: '0.75rem' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Lord Krishna" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="email" 
                className="form-control" 
                placeholder="krishna@dwaraka.org" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                className="form-control" 
                placeholder="Min 6 characters" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '36px' }}
                required
              />
            </div>
          </div>

          <div className="responsive-grid-2" style={{ gap: '1rem' }}>
            <div className="form-group">
              <label>Phone (Optional)</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="9876543210" 
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Select Role</label>
              <select 
                className="form-control" 
                value={role} 
                onChange={(e) => setRole(e.target.value)}
                style={{ background: 'var(--dark-hover)' }}
              >
                <option value="USER">Devotee (User)</option>
                <option value="ORGANIZER">Temple Organizer</option>
                <option value="ADMIN">System Admin</option>
              </select>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '1.25rem' }}>
            <label>Address (Optional)</label>
            <div style={{ position: 'relative' }}>
              <MapPin size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="text" 
                className="form-control" 
                placeholder="Dwaraka City, Gujarat" 
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                style={{ paddingLeft: '36px' }}
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
            {loading ? 'Creating Account...' : 'Register'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.25rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
