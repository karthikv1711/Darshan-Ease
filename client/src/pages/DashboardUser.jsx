import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { User, Calendar, HeartHandshake, ShieldAlert, CheckCircle, Ticket, X } from 'lucide-react';

const DashboardUser = () => {
  const { user, updateProfile } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('bookings');
  
  // Profile settings state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  // Booking history state
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);
  const [bookingsError, setBookingsError] = useState('');

  // Donation history state
  const [donations, setDonations] = useState([]);
  const [donationsLoading, setDonationsLoading] = useState(true);

  // Receipt Modal State
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
      setAddress(user.address || '');
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      fetchBookings();
    } else if (activeTab === 'donations') {
      fetchDonations();
    }
  }, [activeTab]);

  const fetchBookings = async () => {
    setBookingsLoading(true);
    setBookingsError('');
    try {
      const response = await axios.get('/bookings/my-bookings');
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (err) {
      setBookingsError('Failed to fetch bookings list.');
    } finally {
      setBookingsLoading(false);
    }
  };

  const fetchDonations = async () => {
    setDonationsLoading(true);
    try {
      const response = await axios.get('/donations/my-donations');
      if (response.data.success) {
        setDonations(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDonationsLoading(false);
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setUpdating(true);

    const result = await updateProfile({ name, email, phone, address, password });
    setUpdating(false);

    if (result.success) {
      setProfileSuccess('Profile updated successfully.');
      setPassword('');
    } else {
      setProfileError(result.message);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this darshan booking? This will refund the seats to the availability pool.')) {
      return;
    }

    setBookingsError('');
    try {
      const response = await axios.put(`/bookings/${bookingId}/cancel`);
      if (response.data.success) {
        alert('Booking cancelled successfully.'); // fallback
        setBookingsError('Booking successfully cancelled and seats have been refunded. Please wait...');
        // Let's clear the success message after 3 seconds and fetch bookings again
        setTimeout(() => {
          setBookingsError('');
          fetchBookings();
        }, 1500);
      }
    } catch (err) {
      setBookingsError(err.response?.data?.message || 'Failed to cancel booking.');
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', color: '#ffffff', fontWeight: '700', fontSize: '1.5rem' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <h4 style={{ fontSize: '1.1rem' }}>{user?.name}</h4>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{user?.email}</span>
        </div>

        <div
          onClick={() => setActiveTab('bookings')}
          className={`sidebar-link ${activeTab === 'bookings' ? 'active' : ''}`}
        >
          <Calendar size={18} />
          <span>My Bookings</span>
        </div>

        <div
          onClick={() => setActiveTab('donations')}
          className={`sidebar-link ${activeTab === 'donations' ? 'active' : ''}`}
        >
          <HeartHandshake size={18} />
          <span>My Contributions</span>
        </div>

        <div
          onClick={() => setActiveTab('profile')}
          className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <User size={18} />
          <span>Profile Settings</span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="dashboard-content">
        
        {/* Bookings Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>My Darshan Bookings</h2>
            
            {bookingsError && <div className="alert alert-error">{bookingsError}</div>}

            {bookingsLoading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading bookings...</p>
            ) : bookings.length === 0 ? (
              <div className="card-glass" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>You have no booked darshans. Visit Home to discover temples!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {bookings.map(booking => (
                  <div key={booking._id} className="card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>
                          {booking.temple.name}
                        </span>
                        <span style={{
                          fontSize: '0.75rem',
                          background: booking.status === 'Booked' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: booking.status === 'Booked' ? 'var(--success)' : 'var(--error)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}>
                          {booking.status}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'auto auto auto', gap: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.75rem' }}>DATE</span>
                          <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{formatDate(booking.slot.date)}</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.75rem' }}>TIMING</span>
                          <span style={{ color: 'var(--text-main)', fontWeight: '500' }}>{booking.slot.startTime} - {booking.slot.endTime}</span>
                        </div>
                        <div>
                          <span style={{ display: 'block', fontSize: '0.75rem' }}>DEVOTEES ({booking.numberOfDevotees})</span>
                          <span style={{ color: 'var(--text-main)', fontWeight: '500' }} title={booking.devotees.map(d => d.name).join(', ')}>
                            {booking.devotees[0]?.name} {booking.numberOfDevotees > 1 ? `+ ${booking.numberOfDevotees - 1} more` : ''}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                      <button 
                        onClick={() => setSelectedTicket(booking)} 
                        className="btn btn-secondary"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                      >
                        <Ticket size={14} />
                        View Ticket
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Donations Tab */}
        {activeTab === 'donations' && (
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>My Contributions</h2>

            {donationsLoading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading contributions list...</p>
            ) : donations.length === 0 ? (
              <div className="card-glass" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>You haven't made any online donations yet. Support shrines at the Donation portal!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {donations.map(donation => (
                  <div key={donation._id} className="card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                        Contribution to {donation.temple?.name || 'Temple'}
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Purpose: {donation.purpose} | Txn ID: <code style={{ color: 'var(--secondary)' }}>{donation.transactionId}</code>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)' }}>
                        ₹{donation.amount}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(donation.date).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Profile Settings Tab */}
        {activeTab === 'profile' && (
          <div className="card-glass" style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Update Profile Information</h2>
            
            {profileError && <div className="alert alert-error">{profileError}</div>}
            {profileSuccess && <div className="alert alert-success">{profileSuccess}</div>}

            <form onSubmit={handleProfileSubmit}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  className="form-control" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                />
              </div>

              <div className="form-group">
                <label>Address</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={address} 
                  onChange={(e) => setAddress(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '2rem' }}>
                <label>New Password (Leave blank to keep current)</label>
                <input 
                  type="password" 
                  className="form-control" 
                  placeholder="Enter new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={updating}>
                {updating ? 'Saving details...' : 'Save Settings'}
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Ticket E-Ticket Viewer Modal */}
      {selectedTicket && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <h3>Darshan Ticket Details</h3>
              <button onClick={() => setSelectedTicket(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
              <div className="ticket" style={{ width: '100%', color: '#1a1a1a', background: '#ffffff' }}>
                <div className="ticket-header" style={{ borderBottom: '1px dashed #dddddd', paddingBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="ticket-logo">DarshanEase</div>
                    <div style={{ fontSize: '0.7rem', color: '#666' }}>OFFICIAL ENTRY E-TICKET</div>
                    <div className="ticket-code" style={{ fontFamily: 'monospace', fontWeight: '700', fontSize: '1.25rem', marginTop: '0.25rem', color: '#111' }}>{selectedTicket.ticketCode}</div>
                  </div>
                  <div style={{ background: '#ffffff', padding: '4px', borderRadius: '4px', border: '1px solid #eeeeee' }}>
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=70x70&data=${encodeURIComponent(selectedTicket.ticketCode + ' | ' + selectedTicket.temple.name + ' | ' + selectedTicket.numberOfDevotees + ' Devotees')}`} 
                      alt="Ticket QR Code" 
                      style={{ width: '70px', height: '70px', display: 'block' }}
                    />
                  </div>
                </div>

                <div className="ticket-body" style={{ marginTop: '1.25rem' }}>
                  <div className="ticket-section">
                    <span className="ticket-label">Temple</span>
                    <span className="ticket-value">{selectedTicket.temple.name}</span>
                  </div>
                  <div className="ticket-section">
                    <span className="ticket-label">Location</span>
                    <span className="ticket-value">{selectedTicket.temple.location}</span>
                  </div>
                  <div className="ticket-section">
                    <span className="ticket-label">Date</span>
                    <span className="ticket-value">{formatDate(selectedTicket.slot.date)}</span>
                  </div>
                  <div className="ticket-section">
                    <span className="ticket-label">Timing</span>
                    <span className="ticket-value">{selectedTicket.slot.startTime} - {selectedTicket.slot.endTime}</span>
                  </div>
                  <div className="ticket-section" style={{ gridColumn: 'span 2' }}>
                    <span className="ticket-label">Devotees ({selectedTicket.numberOfDevotees})</span>
                    <span className="ticket-value" style={{ fontSize: '0.85rem' }}>
                      {selectedTicket.devotees.map((d, i) => `${d.name} (${d.age}, ${d.gender})`).join(', ')}
                    </span>
                  </div>
                  <div className="ticket-section">
                    <span className="ticket-label">Amount Paid</span>
                    <span className="ticket-value" style={{ color: 'var(--primary)', fontWeight: '700' }}>
                      ₹{selectedTicket.totalAmount}
                    </span>
                  </div>
                  <div className="ticket-section">
                    <span className="ticket-label">Booking Status</span>
                    <span className="ticket-value" style={{ color: selectedTicket.status === 'Booked' ? 'var(--success)' : 'var(--error)' }}>
                      {selectedTicket.status}
                    </span>
                  </div>
                </div>
                
                <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#888', marginTop: '1.5rem', borderTop: '1px dashed #dddddd', paddingTop: '0.75rem' }}>
                  Scan this QR code at temple check post gates. Keep digital/printed ticket handy.
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', width: '100%' }}>
                <button onClick={() => window.print()} className="btn btn-secondary" style={{ flex: 1 }}>
                  Print
                </button>
                <button onClick={() => setSelectedTicket(null)} className="btn btn-primary" style={{ flex: 1 }}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardUser;
