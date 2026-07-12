import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { X, CheckCircle, Download, Calendar, Clock, Users, ShieldAlert, Timer } from 'lucide-react';

const BookingModal = ({ slot, onClose, onBookingSuccess }) => {
  // Steps: 'details' | 'payment' | 'ticket' | 'expired'
  const [step, setStep] = useState('details');
  const [numDevotees, setNumDevotees] = useState(1);
  const [devotees, setDevotees] = useState([{ name: '', age: '', gender: 'Male' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Pending Booking details
  const [bookingId, setBookingId] = useState('');
  const [ticket, setTicket] = useState(null);
  const [expiresAt, setExpiresAt] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

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

  const timerRef = useRef(null);

  // Countdown timer hook
  useEffect(() => {
    if (step === 'payment' && expiresAt) {
      const calculateTimeLeft = () => {
        const difference = +new Date(expiresAt) - +new Date();
        const seconds = Math.floor(difference / 1000);
        return seconds > 0 ? seconds : 0;
      };

      setTimeLeft(calculateTimeLeft());

      timerRef.current = setInterval(() => {
        const remaining = calculateTimeLeft();
        setTimeLeft(remaining);

        if (remaining <= 0) {
          clearInterval(timerRef.current);
          setStep('expired');
          if (onBookingSuccess) {
            onBookingSuccess(); // refresh slot seat counts in background
          }
        }
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [step, expiresAt]);

  const handleNumDevoteesChange = (e) => {
    const count = parseInt(e.target.value) || 1;
    setNumDevotees(count);
    
    const updated = [...devotees];
    if (count > updated.length) {
      while (updated.length < count) {
        updated.push({ name: '', age: '', gender: 'Male' });
      }
    } else {
      updated.splice(count);
    }
    setDevotees(updated);
  };

  const handleDevoteeChange = (index, field, value) => {
    const updated = [...devotees];
    updated[index][field] = value;
    setDevotees(updated);
  };

  // Step 1: Submit devotee list to request seat holds
  const handleHoldRequest = async (e) => {
    e.preventDefault();
    setError('');

    // Field validations
    for (let i = 0; i < devotees.length; i++) {
      if (!devotees[i].name.trim() || !devotees[i].age) {
        setError(`Please fill in name and age for Devotee #${i + 1}`);
        return;
      }
      if (parseInt(devotees[i].age) <= 0 || parseInt(devotees[i].age) > 120) {
        setError(`Please enter a valid age (1-120) for Devotee #${i + 1}`);
        return;
      }
    }

    setLoading(true);
    try {
      const response = await axios.post('/bookings', {
        slotId: slot._id,
        devotees: devotees.map(d => ({
          name: d.name,
          age: parseInt(d.age),
          gender: d.gender
        }))
      });

      if (response.data.success) {
        const bookingData = response.data.data;
        setBookingId(bookingData._id);
        setExpiresAt(response.data.expiresAt);
        setStep('payment');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error processing reservation hold.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Confirm simulated card checkout payment
  const handleConfirmPayment = async (e) => {
  e.preventDefault();
  setError('');

  // Validate card number
  if (cardNumber.replace(/\s/g, '').length !== 16) {
    setError('Please enter a valid 16-digit credit card number.');
    return;
  }

  // Validate expiry selection
  if (!expiryMonth || !expiryYear) {
    setError('Please select the card expiry month and year.');
    return;
  }

  // Validate whether the card has expired
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

  // Validate CVV
  if (!/^\d{3}$/.test(cardCvv)) {
    setError('Please enter a valid 3-digit CVV.');
    return;
  }

  setPaying(true);

  try {
    const response = await axios.post(
      `/bookings/${bookingId}/confirm-payment`
    );

    if (response.data.success) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      setTicket(response.data.data);
      setStep('ticket');

      if (onBookingSuccess) {
        onBookingSuccess();
      }
    }
  } catch (err) {
    setError(
      err.response?.data?.message ||
      'Error completing checkout payment.'
    );
  } finally {
    setPaying(false);
  }
};

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: step === 'ticket' ? '500px' : '600px' }}>
        <div className="modal-header">
          <h3>
            {step === 'details' && 'Book Darshan Ticket'}
            {step === 'payment' && 'Confirm Simulated Checkout'}
            {step === 'expired' && 'Reservation Expired'}
            {step === 'ticket' && 'Booking Confirmed!'}
          </h3>
          {(step === 'details' || step === 'expired') && (
            <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
              <X size={20} />
            </button>
          )}
        </div>

        <div className="modal-body">
          {error && <div className="alert alert-error">{error}</div>}

          {/* STEP 1: Devotee Details entry */}
          {step === 'details' && (
            <form onSubmit={handleHoldRequest}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem', background: 'var(--highlight-2)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Calendar size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Date</div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{formatDate(slot.date)}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Clock size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Darshan Slot</div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{slot.startTime} - {slot.endTime}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Users size={18} style={{ color: 'var(--primary)' }} />
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Available Seats</div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{slot.availableSeats}</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '18px', fontWeight: 'bold', color: 'var(--primary)', marginLeft: '2px' }}>₹</span>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price per Devotee</div>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem', color: 'var(--secondary)' }}>₹{slot.price}</div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Number of Accompanying Devotees (Including You)</label>
                <select 
                  className="form-control" 
                  value={numDevotees} 
                  onChange={handleNumDevoteesChange}
                  style={{ background: 'var(--dark-hover)' }}
                >
                  {[1, 2, 3, 4, 5, 6].map(num => (
                    <option key={num} value={num} disabled={num > slot.availableSeats}>
                      {num} {num === 1 ? 'Devotee' : 'Devotees'} {num > slot.availableSeats ? '(No seats left)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <h4 style={{ fontSize: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>Devotee Details</h4>
                {devotees.map((devotee, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.75rem', alignItems: 'flex-end', background: 'var(--highlight-1)', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Name #{idx + 1}</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Full Name" 
                        value={devotee.name}
                        onChange={(e) => handleDevoteeChange(idx, 'name', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Age</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        placeholder="Age" 
                        value={devotee.age}
                        onChange={(e) => handleDevoteeChange(idx, 'age', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Gender</label>
                      <select 
                        className="form-control" 
                        value={devotee.gender}
                        onChange={(e) => handleDevoteeChange(idx, 'gender', e.target.value)}
                        style={{ background: 'var(--dark-hover)' }}
                      >
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Amount to Pay</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>₹{numDevotees * slot.price}</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="button" onClick={onClose} className="btn btn-secondary">
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>
                    {loading ? 'Holding seats...' : 'Continue to Payment'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 2: Hold & Countdown checkout timer */}
          {step === 'payment' && (
            <form onSubmit={handleConfirmPayment}>
              <div style={{ 
                background: 'rgba(245, 158, 11, 0.1)', 
                border: '1px solid rgba(245, 158, 11, 0.2)', 
                borderRadius: '8px', 
                padding: '1rem', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                marginBottom: '1.5rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--warning)' }}>
                  <Timer className="animate-pulse" size={20} />
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: '500' }}>SEATS ARE CURRENTLY HELD FOR YOU</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>Complete payment before hold expires.</div>
                  </div>
                </div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--warning)', fontFamily: 'monospace' }}>
                  {formatTimer(timeLeft)}
                </div>
              </div>

              <div style={{ background: 'var(--highlight-3)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text-main)' }}>Card Payment Details</h4>
                
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

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
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

              <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1.25rem' }}>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Amount to Charge</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>₹{numDevotees * slot.price}</div>
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn btn-primary" style={{ padding: '0.6rem 2rem' }} disabled={paying}>
                    {paying ? 'Processing...' : 'Complete Payment'}
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 3: Reservation Hold Expired */}
          {step === 'expired' && (
            <div style={{ textAlign: 'center', padding: '2rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.25rem' }}>
              <ShieldAlert size={56} style={{ color: 'var(--error)' }} />
              <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
                <h3 style={{ fontSize: '1.3rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Hold Window Expired</h3>
                <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto' }}>
                  The 5-minute reservation hold on your selected slots has timed out. The seats have been released back to other devotees.
                </p>
              </div>
              <button onClick={onClose} className="btn btn-primary" style={{ padding: '0.5rem 2rem', marginTop: '0.5rem' }}>
                Close and Select Again
              </button>
            </div>
          )}

          {/* STEP 4: Checkout confirmed e-ticket with QR Code */}
          {step === 'ticket' && ticket && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'var(--success)', gap: '0.25rem' }}>
                <CheckCircle size={48} />
                <span style={{ fontWeight: '600', fontSize: '1.1rem' }}>Electronic Ticket Generated</span>
              </div>

              {/* TTD Styled Premium E-Ticket */}
              <div className="ticket" style={{ width: '100%' }}>
                <div className="ticket-header" style={{ borderBottom: '1px dashed #dddddd', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="ticket-logo">DarshanEase</div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>OFFICIAL ENTRY TICKET</div>
                  </div>
                  {/* Dynamic QR Code generation */}
                  <div style={{ background: '#ffffff', padding: '4px', borderRadius: '4px', border: '1px solid #eeeeee' }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(ticket.ticketCode + ' | ' + ticket.temple.name + ' | ' + ticket.numberOfDevotees + ' Devotees')}`} 
                      alt="Ticket QR Code" 
                      style={{ width: '70px', height: '70px', display: 'block' }}
                    />
                  </div>
                </div>

                <div className="ticket-body" style={{ marginTop: '1.25rem' }}>
                  <div className="ticket-section">
                    <span className="ticket-label">Ticket Code</span>
                    <span className="ticket-value" style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '1.1rem', color: '#111' }}>{ticket.ticketCode}</span>
                  </div>
                  <div className="ticket-section">
                    <span className="ticket-label">Temple Beneficiary</span>
                    <span className="ticket-value">{ticket.temple.name}</span>
                  </div>
                  <div className="ticket-section">
                    <span className="ticket-label">Date of Darshan</span>
                    <span className="ticket-value">{formatDate(ticket.slot.date)}</span>
                  </div>
                  <div className="ticket-section">
                    <span className="ticket-label">Selected Timing</span>
                    <span className="ticket-value">{ticket.slot.startTime} - {ticket.slot.endTime}</span>
                  </div>
                  <div className="ticket-section" style={{ gridColumn: 'span 2' }}>
                    <span className="ticket-label">Devotees ({ticket.numberOfDevotees})</span>
                    <span className="ticket-value" style={{ fontSize: '0.85rem' }}>
                      {ticket.devotees.map((d, i) => `${d.name} (${d.age}, ${d.gender})`).join(', ')}
                    </span>
                  </div>
                  <div className="ticket-section">
                    <span className="ticket-label">Amount Paid</span>
                    <span className="ticket-value" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                      ₹{ticket.totalAmount}
                    </span>
                  </div>
                  <div className="ticket-section">
                    <span className="ticket-label">Status</span>
                    <span className="ticket-value" style={{ color: 'var(--success)' }}>{ticket.status}</span>
                  </div>
                </div>

                <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#888', marginTop: '1.5rem', borderTop: '1px dashed #dddddd', paddingTop: '0.75rem' }}>
                  Scan the QR code at the temple entry check post. Photo ID verification mandatory.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', width: '100%', marginTop: '1rem' }}>
                <button onClick={handlePrint} className="btn btn-secondary" style={{ flex: 1 }}>
                  <Download size={16} />
                  Print / Save
                </button>
                <button onClick={onClose} className="btn btn-primary" style={{ flex: 1 }}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BookingModal;
