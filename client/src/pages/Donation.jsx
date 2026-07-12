import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { HeartHandshake, CheckCircle, Download, CreditCard, ShieldCheck } from 'lucide-react';

const Donation = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);

  // Form states
  const [templeId, setTempleId] = useState('');
  const [amount, setAmount] = useState('500');
  const [customAmount, setCustomAmount] = useState('');
  const [purpose, setPurpose] = useState('General');
  const [donorName, setDonorName] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Payment states
  const [cardNumber, setCardNumber] = useState('');
  const [expiryMonth, setExpiryMonth] = useState('');
  const [expiryYear, setExpiryYear] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paying, setPaying] = useState(false);

  const currentYear = new Date().getFullYear();

  const months = Array.from({ length: 12 }, (_, index) => index + 1);

  const expiryYears = Array.from(
  { length: 6 },
  (_, index) => currentYear + index
  );

  useEffect(() => {
    if (user) {
      setDonorName(user.name);
    }
    fetchTemples();
  }, [user]);

  const fetchTemples = async () => {
    try {
      const response = await axios.get('/temples');
      if (response.data.success) {
        setTemples(response.data.data);
        if (response.data.data.length > 0) {
          setTempleId(response.data.data[0]._id);
        }
      }
    } catch (err) {
      setError('Could not load temples list. Please ensure the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleAmountSelect = (val) => {
    setAmount(val);
    if (val !== 'custom') {
      setCustomAmount('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!user) {
      alert('Please log in to make a contribution.');
      navigate('/login', { state: { from: '/donation' } });
      return;
    }

    const finalAmount = amount === 'custom' ? parseFloat(customAmount) : parseFloat(amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      setError('Please enter a valid donation amount.');
      return;
    }

    // Basic card validation
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setError('Please enter a valid 16-digit credit card number.');
      return;
    }

    if (!expiryMonth || !expiryYear) {
  setError('Please select the card expiry month and year.');
  return;
}

const today = new Date();
const selectedMonth = Number(expiryMonth);
const selectedYear = Number(expiryYear);

const cardExpired =
  selectedYear < today.getFullYear() ||
  (
    selectedYear === today.getFullYear() &&
    selectedMonth < today.getMonth() + 1
  );

if (cardExpired) {
  setError('The selected card expiry date has already passed.');
  return;
}

if (!/^\d{3}$/.test(cardCvv)) {
  setError('Please enter a valid 3-digit CVV.');
  return;
}

    setPaying(true);
    try {
      const response = await axios.post('/donations', {
        templeId,
        amount: finalAmount,
        purpose,
        donorName: isAnonymous ? 'Anonymous Devotee' : donorName,
        isAnonymous
      });

      if (response.data.success) {
        setSuccessReceipt(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing donation. Please try again.');
    } finally {
      setPaying(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', margin: '4rem 0', color: 'var(--text-muted)' }}>
        Loading donation interface...
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '3rem 2rem', maxWidth: '800px' }}>
      
      {successReceipt ? (
        <div className="card-glass" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2rem', padding: '3rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--success)', gap: '0.5rem' }}>
            <CheckCircle size={56} />
            <h2 style={{ fontSize: '2rem' }}>Contribution Confirmed!</h2>
            <p style={{ color: 'var(--text-muted)' }}>Thank you for your generous contribution.</p>
          </div>

          {/* Donation Receipt Box */}
          <div className="ticket" style={{ width: '100%', color: '#1a1a1a', background: '#ffffff', borderRadius: '12px' }}>
            <div className="ticket-header" style={{ borderBottom: '1px dashed #dddddd', paddingBottom: '1rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>DarshanEase</div>
              <div style={{ fontSize: '0.8rem', color: '#666666', fontWeight: '500' }}>DONATION RECEIPT</div>
            </div>

            <div className="responsive-grid-2" style={{ gap: '1.25rem', padding: '1.5rem 0' }}>
              <div className="ticket-section">
                <span className="ticket-label" style={{ fontSize: '0.75rem', color: '#777777' }}>Transaction ID</span>
                <span className="ticket-value" style={{ fontWeight: '700' }}>{successReceipt.transactionId}</span>
              </div>
              <div className="ticket-section">
                <span className="ticket-label" style={{ fontSize: '0.75rem', color: '#777777' }}>Date</span>
                <span className="ticket-value">{new Date(successReceipt.date).toLocaleDateString()}</span>
              </div>
              <div className="ticket-section" style={{ gridColumn: 'span 2' }}>
                <span className="ticket-label" style={{ fontSize: '0.75rem', color: '#777777' }}>Beneficiary Temple</span>
                <span className="ticket-value" style={{ fontWeight: '600' }}>{successReceipt.temple?.name}</span>
              </div>
              <div className="ticket-section">
                <span className="ticket-label" style={{ fontSize: '0.75rem', color: '#777777' }}>Donor Name</span>
                <span className="ticket-value">{successReceipt.donorName}</span>
              </div>
              <div className="ticket-section">
                <span className="ticket-label" style={{ fontSize: '0.75rem', color: '#777777' }}>Purpose</span>
                <span className="ticket-value">{successReceipt.purpose}</span>
              </div>
              <div className="ticket-section" style={{ gridColumn: 'span 2', borderTop: '1px solid #eeeeee', paddingTop: '0.75rem', marginTop: '0.5rem' }}>
                <span className="ticket-label" style={{ fontSize: '0.75rem', color: '#777777' }}>Contribution Amount</span>
                <span className="ticket-value" style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary)' }}>
                  ₹{successReceipt.amount}
                </span>
              </div>
            </div>

            <div style={{ textAlign: 'center', fontSize: '0.7rem', color: '#888888', borderTop: '1px dashed #dddddd', paddingTop: '1rem', marginTop: '0.5rem' }}>
              May peace and divine blessings be with you.
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
            <button onClick={handlePrint} className="btn btn-secondary" style={{ flex: 1 }}>
              <Download size={16} />
              Print Receipt
            </button>
            <button onClick={() => setSuccessReceipt(null)} className="btn btn-primary" style={{ flex: 1 }}>
              Donate Again
            </button>
          </div>
        </div>
      ) : (
        <div className="card-glass">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem' }}>
            <HeartHandshake size={32} style={{ color: 'var(--primary)' }} />
            <div>
              <h2 style={{ fontSize: '1.75rem' }}>Temple Contributions</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Support sacred upkeep, daily rituals, and food distribution drives.</p>
            </div>
          </div>

          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            {/* Temple Selector */}
            <div className="form-group">
              <label>Select Temple</label>
              {temples.length === 0 ? (
                <div style={{ color: 'var(--error)', fontSize: '0.9rem' }}>No temples available. Cannot make donation.</div>
              ) : (
                <select 
                  className="form-control" 
                  value={templeId} 
                  onChange={(e) => setTempleId(e.target.value)}
                  style={{ background: 'var(--dark-hover)' }}
                  required
                >
                  {temples.map(t => (
                    <option key={t._id} value={t._id}>{t.name} ({t.location})</option>
                  ))}
                </select>
              )}
            </div>

            {/* Donation Amount selector */}
            <div className="form-group">
              <label>Donation Amount (INR)</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: '0.5rem' }}>
                {['250', '500', '1000', '2000'].map(val => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => handleAmountSelect(val)}
                    className="btn"
                    style={{
                      padding: '0.5rem',
                      fontSize: '0.9rem',
                      background: amount === val ? 'var(--accent-gradient)' : 'var(--highlight-2)',
                      border: amount === val ? 'none' : '1px solid var(--glass-border)',
                      color: amount === val ? '#ffffff' : 'var(--text-muted)',
                      borderRadius: '8px'
                    }}
                  >
                    ₹{val}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => handleAmountSelect('custom')}
                  className="btn"
                  style={{
                    padding: '0.5rem',
                    fontSize: '0.9rem',
                    background: amount === 'custom' ? 'var(--accent-gradient)' : 'var(--highlight-2)',
                    border: amount === 'custom' ? 'none' : '1px solid var(--glass-border)',
                    color: amount === 'custom' ? '#ffffff' : 'var(--text-muted)',
                    borderRadius: '8px'
                  }}
                >
                  Custom
                </button>
              </div>

              {amount === 'custom' && (
                <div style={{ marginTop: '0.75rem', position: 'relative' }}>
                  <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>₹</span>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="Enter Custom Amount" 
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    style={{ paddingLeft: '24px' }}
                    required
                  />
                </div>
              )}
            </div>

            {/* Purpose */}
            <div className="form-group">
              <label>Purpose of Contribution</label>
              <select 
                className="form-control" 
                value={purpose} 
                onChange={(e) => setPurpose(e.target.value)}
                style={{ background: 'var(--dark-hover)' }}
              >
                <option value="General">General Donation / Offering</option>
                <option value="Temple Maintenance">Temple Upkeep & Renovation</option>
                <option value="Anna Danam (Food Distribution)">Anna Danam (Free Food Distribution)</option>
                <option value="Pooja/Festival">Special Pooja & Festive Rituals</option>
                <option value="Prasadam Services">Prasadam Preps & distribution</option>
              </select>
            </div>

            {/* Donor Name details */}
            <div className="form-group">
              <label>Donor Identity Details</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Donor Name" 
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  disabled={isAnonymous}
                  required={!isAnonymous}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', marginTop: '0.25rem' }}>
                  <input 
                    type="checkbox" 
                    checked={isAnonymous} 
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                  />
                  <span>Donate anonymously (Your name will appear as 'Anonymous Devotee')</span>
                </label>
              </div>
            </div>

            {/* Simulated Payment */}
            <div style={{ marginTop: '2.5rem', background: 'var(--highlight-1)', border: '1px solid var(--glass-border)', padding: '1.5rem', borderRadius: '8px' }}>
              <h3 style={{ fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CreditCard size={18} style={{ color: 'var(--primary)' }} />
                Simulated Card Checkout
              </h3>
              
              <div className="form-group">
                <label>Card Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="4111 2222 3333 4444" 
                  maxLength="19"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, '').replace(/(\d{4})/g, '$1 ').trim())}
                  required
                />
              </div>

              <div className="responsive-grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
  <label>Expiry Month</label>

  <select
    className="form-control"
    value={expiryMonth}
    onChange={(e) => setExpiryMonth(e.target.value)}
    required
  >
    <option value="">Select Month</option>

    {months.map((month) => (
      <option key={month} value={month}>
        {month}
      </option>
    ))}
  </select>
</div>

<div className="form-group">
  <label>Expiry Year</label>

  <select
    className="form-control"
    value={expiryYear}
    onChange={(e) => setExpiryYear(e.target.value)}
    required
  >
    <option value="">Select Year</option>

    {expiryYears.map((year) => (
      <option key={year} value={year}>
        {year}
      </option>
    ))}
  </select>
</div>
                <div className="form-group">
                  <label>CVV</label>
                  <input 
                    type="password" 
                    className="form-control" 
                    placeholder="***" 
                    maxLength="3"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                    required
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', marginTop: '2rem', paddingTop: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                <ShieldCheck size={16} style={{ color: 'var(--success)' }} />
                <span>Secure 256-Bit SSL checkout</span>
              </div>
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={paying || temples.length === 0}
                style={{ padding: '0.75rem 2.5rem' }}
              >
                {paying ? 'Processing...' : `Donate ₹${amount === 'custom' ? (customAmount || 0) : amount}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Donation;
