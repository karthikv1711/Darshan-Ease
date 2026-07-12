import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, PlusCircle, FileText, Bell, User, Clock, Trash2, ArrowRight } from 'lucide-react';

const DashboardOrganizer = () => {
  const { user, updateProfile } = useContext(AuthContext);

  const [activeTab, setActiveTab] = useState('slots');
  const [temples, setTemples] = useState([]);
  
  // Slots states
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [newSlotTemple, setNewSlotTemple] = useState('');
  const [newSlotDate, setNewSlotDate] = useState('');
  const [newSlotStartTime, setNewSlotStartTime] = useState('08:00 AM');
  const [newSlotEndTime, setNewSlotEndTime] = useState('10:00 AM');
  const [newSlotSeats, setNewSlotSeats] = useState(50);
  const [newSlotPrice, setNewSlotPrice] = useState(150);
  const [slotError, setSlotError] = useState('');
  const [slotSuccess, setSlotSuccess] = useState('');
  const [savingSlot, setSavingSlot] = useState(false);

  // Bookings states
  const [bookings, setBookings] = useState([]);
  const [bookingsLoading, setBookingsLoading] = useState(true);

  // Profile states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  const [updating, setUpdating] = useState(false);

  // Simulated notifications
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'New booking registered: 3 devotees for Morning Darshan', date: 'Just now', unread: true },
    { id: 2, text: 'Darshan Slot (04:00 PM - 06:00 PM) has been fully booked', date: '2 hours ago', unread: true },
    { id: 3, text: 'Devotee Radha Sharma cancelled booking DE-X9Y2Z8', date: '1 day ago', unread: false }
  ]);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
      setPhone(user.phone || '');
    }
    fetchTemples();
  }, [user]);

  useEffect(() => {
    if (activeTab === 'slots') {
      fetchSlots();
    } else if (activeTab === 'bookings') {
      fetchBookings();
    }
  }, [activeTab]);

  const fetchTemples = async () => {
    try {
      const response = await axios.get('/temples');
      if (response.data.success) {
        setTemples(response.data.data);
        if (response.data.data.length > 0) {
          setNewSlotTemple(response.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchSlots = async () => {
    setSlotsLoading(true);
    try {
      const response = await axios.get('/slots');
      if (response.data.success) {
        setSlots(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSlotsLoading(false);
    }
  };

  const fetchBookings = async () => {
    setBookingsLoading(true);
    try {
      const response = await axios.get('/bookings');
      if (response.data.success) {
        setBookings(response.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleCreateSlot = async (e) => {
    e.preventDefault();
    setSlotError('');
    setSlotSuccess('');
    
    if (!newSlotTemple || !newSlotDate || !newSlotStartTime || !newSlotEndTime) {
      setSlotError('Please fill out all slot fields.');
      return;
    }

    setSavingSlot(true);
    try {
      const response = await axios.post('/slots', {
        temple: newSlotTemple,
        date: newSlotDate,
        startTime: newSlotStartTime,
        endTime: newSlotEndTime,
        availableSeats: parseInt(newSlotSeats),
        price: parseFloat(newSlotPrice)
      });

      if (response.data.success) {
        setSlotSuccess('Darshan slot scheduled successfully!');
        setNewSlotDate('');
        fetchSlots(); // reload
      }
    } catch (err) {
      setSlotError(err.response?.data?.message || 'Error scheduling slot.');
    } finally {
      setSavingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId) => {
    if (!window.confirm('Are you sure you want to delete this scheduled slot? Devotees won\'t be able to book it anymore.')) {
      return;
    }
    try {
      const response = await axios.delete(`/slots/${slotId}`);
      if (response.data.success) {
        alert('Slot removed successfully.');
        fetchSlots(); // refresh list
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to remove slot.');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setUpdating(true);

    const result = await updateProfile({ name, email, phone, password });
    setUpdating(false);

    if (result.success) {
      setProfileSuccess('Profile updated successfully.');
      setPassword('');
    } else {
      setProfileError(result.message);
    }
  };

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, unread: false })));
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', color: '#ffffff', fontWeight: '700', fontSize: '1.5rem' }}>
            {user?.name ? user.name.charAt(0).toUpperCase() : 'O'}
          </div>
          <h4 style={{ fontSize: '1.1rem' }}>{user?.name}</h4>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Organizer Dashboard</span>
        </div>

        <div
          onClick={() => setActiveTab('slots')}
          className={`sidebar-link ${activeTab === 'slots' ? 'active' : ''}`}
        >
          <PlusCircle size={18} />
          <span>Slot Scheduler</span>
        </div>

        <div
          onClick={() => setActiveTab('bookings')}
          className={`sidebar-link ${activeTab === 'bookings' ? 'active' : ''}`}
        >
          <FileText size={18} />
          <span>Bookings Manager</span>
        </div>

        <div
          onClick={() => setActiveTab('notifications')}
          className={`sidebar-link ${activeTab === 'notifications' ? 'active' : ''}`}
        >
          <Bell size={18} />
          <span>Notifications</span>
        </div>

        <div
          onClick={() => setActiveTab('profile')}
          className={`sidebar-link ${activeTab === 'profile' ? 'active' : ''}`}
        >
          <User size={18} />
          <span>Profile Settings</span>
        </div>
      </div>

      {/* Content */}
      <div className="dashboard-content">
        
        {/* Slots Tab */}
        {activeTab === 'slots' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1.9fr', gap: '2.5rem' }}>
            
            {/* Create Slot Form */}
            <div className="card-glass" style={{ height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Schedule New Darshan Slot</h3>
              
              {slotError && <div className="alert alert-error" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>{slotError}</div>}
              {slotSuccess && <div className="alert alert-success" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>{slotSuccess}</div>}

              <form onSubmit={handleCreateSlot}>
                <div className="form-group">
                  <label>Temple Beneficiary</label>
                  {temples.length === 0 ? (
                    <div style={{ color: 'var(--error)', fontSize: '0.85rem' }}>Add temples first in Admin dashboard</div>
                  ) : (
                    <select 
                      className="form-control" 
                      value={newSlotTemple} 
                      onChange={(e) => setNewSlotTemple(e.target.value)}
                      style={{ background: 'var(--dark-hover)' }}
                      required
                    >
                      {temples.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="form-group">
                  <label>Slot Date</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={newSlotDate} 
                    onChange={(e) => setNewSlotDate(e.target.value)}
                    required 
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Start Time</label>
                    <select 
                      className="form-control" 
                      value={newSlotStartTime} 
                      onChange={(e) => setNewSlotStartTime(e.target.value)}
                      style={{ background: 'var(--dark-hover)' }}
                    >
                      {['04:00 AM', '06:00 AM', '08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>End Time</label>
                    <select 
                      className="form-control" 
                      value={newSlotEndTime} 
                      onChange={(e) => setNewSlotEndTime(e.target.value)}
                      style={{ background: 'var(--dark-hover)' }}
                    >
                      {['06:00 AM', '08:00 AM', '10:00 AM', '12:00 PM', '02:00 PM', '04:00 PM', '06:00 PM', '08:00 PM', '10:00 PM', '11:30 PM'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="form-group">
                    <label>Total Seats</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={newSlotSeats} 
                      onChange={(e) => setNewSlotSeats(e.target.value)}
                      min="1"
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Price (INR)</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      value={newSlotPrice} 
                      onChange={(e) => setNewSlotPrice(e.target.value)}
                      min="0"
                      required 
                    />
                  </div>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }} disabled={savingSlot || temples.length === 0}>
                  {savingSlot ? 'Creating slot...' : 'Schedule Slot'}
                </button>
              </form>
            </div>

            {/* List of current slots */}
            <div className="card-glass">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Scheduled Slots List</h3>
              
              {slotsLoading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading slots...</p>
              ) : slots.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No slots scheduled yet.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '550px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {slots.map(s => (
                    <div 
                      key={s._id} 
                      style={{ 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        background: 'var(--highlight-1)', 
                        border: '1px solid var(--glass-border)', 
                        padding: '0.75rem 1rem', 
                        borderRadius: '8px' 
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', color: 'var(--text-main)' }}>{s.temple?.name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem' }}>
                          <Clock size={12} />
                          <span>{new Date(s.date).toLocaleDateString()} | {s.startTime} - {s.endTime}</span>
                        </div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary)', marginTop: '0.25rem' }}>
                          Price: ₹{s.price} | Seats Left: {s.availableSeats} / {s.totalSeats}
                        </div>
                      </div>
                      <button onClick={() => handleDeleteSlot(s._id)} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', border: 'none', padding: '0.4rem', borderRadius: '4px' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Bookings Manager Tab */}
        {activeTab === 'bookings' && (
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>Devotee Bookings Registry</h2>

            {bookingsLoading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading registry...</p>
            ) : bookings.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No bookings registered yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {bookings.map(b => (
                  <div key={b._id} className="card-glass" style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr 1fr', gap: '1.5rem', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: 'var(--text-main)' }}>{b.user?.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{b.user?.email}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Phone: {b.user?.phone || 'N/A'}</div>
                    </div>
                    
                    <div style={{ fontSize: '0.9rem' }}>
                      <div style={{ fontWeight: '600', color: 'var(--primary)' }}>{b.temple?.name}</div>
                      <div style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                        <Clock size={12} />
                        <span>{new Date(b.slot?.date).toLocaleDateString()} ({b.slot?.startTime})</span>
                      </div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.25rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        Devotees: {b.devotees?.map(d => `${d.name} (${d.age})`).join(', ')}
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: '700', fontSize: '1.1rem', color: 'var(--text-main)' }}>₹{b.totalAmount}</div>
                      <span style={{ 
                        fontSize: '0.75rem', 
                        background: b.status === 'Booked' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: b.status === 'Booked' ? 'var(--success)' : 'var(--error)', 
                        padding: '2px 8px', 
                        borderRadius: '4px',
                        fontWeight: '600'
                      }}>
                        {b.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.75rem' }}>Inbox Notifications</h2>
              <button onClick={markAllRead} className="btn btn-secondary" style={{ padding: '0.4rem 1rem', fontSize: '0.85rem' }}>
                Mark all as read
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {notifications.map(n => (
                <div 
                  key={n.id} 
                  className="card-glass" 
                  style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center',
                    borderLeft: n.unread ? '4px solid var(--primary)' : '1px solid var(--glass-border)',
                    background: n.unread ? 'rgba(var(--primary-rgb), 0.03)' : 'var(--glass)'
                  }}
                >
                  <div>
                    <p style={{ color: n.unread ? 'var(--text-main)' : 'var(--text-muted)', fontWeight: n.unread ? '500' : '400' }}>
                      {n.text}
                    </p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{n.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="card-glass" style={{ maxWidth: '600px' }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Update Organizer Account</h2>

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
                <label>Phone Contact</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
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
    </div>
  );
};

export default DashboardOrganizer;
