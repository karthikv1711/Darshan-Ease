import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  BarChart3, Users, Building, Activity, ShieldCheck, 
  Trash2, Plus, Calendar, AlertCircle, Wrench, Edit, UserPlus 
} from 'lucide-react';

const DashboardAdmin = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  // Analytics states
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);

  // Users states
  const [usersList, setUsersList] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userRoleFilter, setUserRoleFilter] = useState('');

  // Temples states
  const [temples, setTemples] = useState([]);
  const [templesLoading, setTemplesLoading] = useState(true);

  // Create temple states
  const [tempName, setTempName] = useState('');
  const [tempLocation, setTempLocation] = useState('');
  const [tempDesc, setTempDesc] = useState('');
  const [tempImage, setTempImage] = useState('');
  const [tempVideoBg, setTempVideoBg] = useState('');
  const [tempDeityImage, setTempDeityImage] = useState('');
  const [tempDeityAudio, setTempDeityAudio] = useState('');
  const [tempStart, setTempStart] = useState('06:00 AM');
  const [tempEnd, setTempEnd] = useState('09:00 PM');
  const [tempAmenity, setTempAmenity] = useState('');
  const [tempAmenities, setTempAmenities] = useState([]);
  const [templeError, setTempleError] = useState('');
  const [templeSuccess, setTempleSuccess] = useState('');

  // Create event states
  const [evtTempleId, setEvtTempleId] = useState('');
  const [evtTitle, setEvtTitle] = useState('');
  const [evtDate, setEvtDate] = useState('');
  const [evtDesc, setEvtDesc] = useState('');
  const [evtError, setEvtError] = useState('');
  const [evtSuccess, setEvtSuccess] = useState('');

  // Maintenance states
  const [maintTempleId, setMaintTempleId] = useState('');
  const [maintDesc, setMaintDesc] = useState('');
  const [maintError, setMaintError] = useState('');
  const [maintSuccess, setMaintSuccess] = useState('');

  useEffect(() => {
    if (activeTab === 'analytics') {
      fetchAnalytics();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'temples') {
      fetchTemples();
    } else if (activeTab === 'facility') {
      fetchTemples();
    }
  }, [activeTab, userRoleFilter]);

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const res = await axios.get('/admin/analytics');
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await axios.get('/admin/users', { params: { role: userRoleFilter } });
      if (res.data.success) {
        setUsersList(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchTemples = async () => {
    setTemplesLoading(true);
    try {
      const res = await axios.get('/temples');
      if (res.data.success) {
        const data = res.data.data;
        setTemples(data);
        if (data.length > 0) {
          setEvtTempleId(data[0]._id);
          setMaintTempleId(data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTemplesLoading(false);
    }
  };

  // User deletion
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account?')) {
      return;
    }
    try {
      const res = await axios.delete(`/admin/users/${userId}`);
      if (res.data.success) {
        alert('User removed successfully.');
        fetchUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  // Add Amenity to helper array
  const handleAddAmenity = () => {
    if (tempAmenity.trim() && !tempAmenities.includes(tempAmenity.trim())) {
      setTempAmenities([...tempAmenities, tempAmenity.trim()]);
      setTempAmenity('');
    }
  };

  // Create Temple submission
  const handleCreateTempleSubmit = async (e) => {
    e.preventDefault();
    setTempleError('');
    setTempleSuccess('');

    try {
      const res = await axios.post('/temples', {
        name: tempName,
        location: tempLocation,
        description: tempDesc,
        image: tempImage,
        videoBg: tempVideoBg,
        deityImage: tempDeityImage,
        deityAudio: tempDeityAudio,
        darshanStartTime: tempStart,
        darshanEndTime: tempEnd,
        amenities: tempAmenities
      });

      if (res.data.success) {
        setTempleSuccess('Temple registered successfully!');
        setTempName('');
        setTempLocation('');
        setTempDesc('');
        setTempImage('');
        setTempVideoBg('');
        setTempDeityImage('');
        setTempDeityAudio('');
        setTempAmenities([]);
        fetchTemples();
      }
    } catch (err) {
      setTempleError(err.response?.data?.message || 'Failed to create temple.');
    }
  };

  // Delete Temple
  const handleDeleteTemple = async (templeId) => {
    if (!window.confirm('Delete this temple? This removes all details, slots, and ratings.')) {
      return;
    }
    try {
      const res = await axios.delete(`/temples/${templeId}`);
      if (res.data.success) {
        alert('Temple deleted.');
        fetchTemples();
      }
    } catch (err) {
      alert('Failed to delete temple.');
    }
  };

  // Create Event submission
  const handleCreateEventSubmit = async (e) => {
    e.preventDefault();
    setEvtError('');
    setEvtSuccess('');

    try {
      const res = await axios.post(`/temples/${evtTempleId}/events`, {
        title: evtTitle,
        date: evtDate,
        description: evtDesc
      });
      if (res.data.success) {
        setEvtSuccess('Temple event scheduled successfully!');
        setEvtTitle('');
        setEvtDate('');
        setEvtDesc('');
        fetchTemples(); // reload temple list to show events
      }
    } catch (err) {
      setEvtError(err.response?.data?.message || 'Failed to schedule event.');
    }
  };

  // Log Maintenance Request submission
  const handleCreateMaintenanceSubmit = async (e) => {
    e.preventDefault();
    setMaintError('');
    setMaintSuccess('');

    try {
      const res = await axios.post(`/temples/${maintTempleId}/maintenance`, {
        description: maintDesc
      });
      if (res.data.success) {
        setMaintSuccess('Facility maintenance request logged!');
        setMaintDesc('');
        fetchTemples(); // reload to show requests
      }
    } catch (err) {
      setMaintError(err.response?.data?.message || 'Failed to log maintenance request.');
    }
  };

  // Update Maintenance Status
  const handleUpdateMaintStatus = async (templeId, reqId, newStatus) => {
    try {
      const res = await axios.put(`/temples/${templeId}/maintenance/${reqId}`, {
        status: newStatus
      });
      if (res.data.success) {
        alert('Status updated successfully.');
        fetchTemples();
      }
    } catch (err) {
      alert('Failed to update maintenance status.');
    }
  };

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="dashboard-sidebar">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'var(--accent-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem auto', color: '#ffffff', fontWeight: '700', fontSize: '1.5rem' }}>
            A
          </div>
          <h4 style={{ fontSize: '1.1rem' }}>Admin Portal</h4>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>System Management</span>
        </div>

        <div
          onClick={() => setActiveTab('analytics')}
          className={`sidebar-link ${activeTab === 'analytics' ? 'active' : ''}`}
        >
          <BarChart3 size={18} />
          <span>Analytics & Reports</span>
        </div>

        <div
          onClick={() => setActiveTab('users')}
          className={`sidebar-link ${activeTab === 'users' ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>Devotees & Organizers</span>
        </div>

        <div
          onClick={() => setActiveTab('temples')}
          className={`sidebar-link ${activeTab === 'temples' ? 'active' : ''}`}
        >
          <Building size={18} />
          <span>Temples & Events</span>
        </div>

        <div
          onClick={() => setActiveTab('facility')}
          className={`sidebar-link ${activeTab === 'facility' ? 'active' : ''}`}
        >
          <Wrench size={18} />
          <span>Facility & Maintenance</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="dashboard-content">
        
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '1.5rem' }}>System Performance Overview</h2>

            {analyticsLoading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading analytics...</p>
            ) : !analytics ? (
              <p style={{ color: 'var(--text-muted)' }}>Database connection offline. No analytics to display.</p>
            ) : (
              <div>
                {/* Stats Widgets Row */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon"><Users size={20} /></div>
                    <div className="stat-info">
                      <p>Devotees</p>
                      <h3>{analytics.summary.totalUsers}</h3>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon"><Building size={20} /></div>
                    <div className="stat-info">
                      <p>Temples</p>
                      <h3>{analytics.summary.totalTemples}</h3>
                    </div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon"><Calendar size={20} /></div>
                    <div className="stat-info">
                      <p>Bookings</p>
                      <h3>{analytics.summary.totalBookingsCount}</h3>
                    </div>
                  </div>
                  <div className="stat-card" style={{ borderLeft: '3px solid var(--primary)' }}>
                    <div className="stat-icon" style={{ background: 'rgba(var(--primary-rgb),0.15)' }}>
                      <span style={{ fontWeight: '700', fontSize: '1.25rem', color: 'var(--primary)' }}>₹</span>
                    </div>
                    <div className="stat-info">
                      <p>Total Revenue</p>
                      <h3>₹{analytics.summary.totalRevenue}</h3>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '2rem', marginTop: '2rem' }}>
                  
                  {/* Temple booking popularity chart */}
                  <div className="card-glass">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Popular Temples by Booking Count</h3>
                    {analytics.popularTemples.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No booking records generated yet.</p>
                    ) : (
                      <div>
                        {analytics.popularTemples.map((item, idx) => {
                          const maxCount = Math.max(...analytics.popularTemples.map(t => t.count), 1);
                          const percentage = (item.count / maxCount) * 100;
                          return (
                            <div key={idx} className="chart-bar-container">
                              <div className="chart-bar-label-row">
                                <span style={{ fontWeight: '600' }}>{item.name}</span>
                                <span style={{ color: 'var(--text-muted)' }}>{item.count} bookings (₹{item.revenue})</span>
                              </div>
                              <div className="chart-bar-bg">
                                <div className="chart-bar-fill" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Devotee Demographics chart */}
                  <div className="card-glass">
                    <h3 style={{ fontSize: '1.25rem', marginBottom: '1.5rem' }}>Devotee Demographics</h3>
                    {analytics.demographics.reduce((sum, d) => sum + d.value, 0) === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No devotee ages recorded yet.</p>
                    ) : (
                      <div>
                        {analytics.demographics.map((demo, idx) => {
                          const totalDevotees = analytics.demographics.reduce((sum, d) => sum + d.value, 0) || 1;
                          const percentage = (demo.value / totalDevotees) * 100;
                          return (
                            <div key={idx} className="chart-bar-container">
                              <div className="chart-bar-label-row">
                                <span>{demo.name}</span>
                                <span style={{ fontWeight: '600' }}>{demo.value} ({percentage.toFixed(0)}%)</span>
                              </div>
                              <div className="chart-bar-bg">
                                <div className="chart-bar-fill" style={{ width: `${percentage}%`, background: 'linear-gradient(135deg, #ffd54f, #ffb300)' }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}
          </div>
        )}

        {/* Devotees & Organizers manager Tab */}
        {activeTab === 'users' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.75rem' }}>Devotee & Organizer Accounts</h2>
              
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <label style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Role Filter</label>
                <select 
                  className="form-control" 
                  value={userRoleFilter} 
                  onChange={(e) => setUserRoleFilter(e.target.value)}
                  style={{ width: '180px', background: 'var(--dark-hover)' }}
                >
                  <option value="">All Accounts</option>
                  <option value="USER">Devotees Only</option>
                  <option value="ORGANIZER">Organizers Only</option>
                  <option value="ADMIN">Admins Only</option>
                </select>
              </div>
            </div>

            {usersLoading ? (
              <p style={{ color: 'var(--text-muted)' }}>Loading account registry...</p>
            ) : usersList.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No accounts match criteria.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {usersList.map(u => (
                  <div key={u._id} className="card-glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)' }}>{u.name}</span>
                        <span style={{
                          fontSize: '0.7rem',
                          background: u.role === 'ADMIN' ? 'rgba(59, 130, 246, 0.15)' : u.role === 'ORGANIZER' ? 'rgba(245, 158, 11, 0.15)' : 'var(--highlight-5)',
                          color: u.role === 'ADMIN' ? '#60a5fa' : u.role === 'ORGANIZER' ? '#fbbf24' : 'var(--text-muted)',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          fontWeight: '600'
                        }}>
                          {u.role}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                        Email: {u.email} | Phone: {u.phone || 'N/A'}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                        Address: {u.address || 'Not specified'}
                      </div>
                    </div>

                    <button 
                      onClick={() => handleDeleteUser(u._id)} 
                      className="btn" 
                      style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.5rem' }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Temples & Events Tab */}
        {activeTab === 'temples' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '2.5rem' }}>
            
            {/* Create temple and event form block */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              
              {/* Add Temple */}
              <div className="card-glass">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Register New Temple</h3>
                {templeError && <div className="alert alert-error" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>{templeError}</div>}
                {templeSuccess && <div className="alert alert-success" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>{templeSuccess}</div>}

                <form onSubmit={handleCreateTempleSubmit}>
                  <div className="form-group">
                    <label>Temple Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Somnath Temple" 
                      value={tempName}
                      onChange={(e) => setTempName(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Location</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="e.g. Veraval, Gujarat" 
                      value={tempLocation}
                      onChange={(e) => setTempLocation(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label>Temple Card Image URL</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="https://..." 
                      value={tempImage}
                      onChange={(e) => setTempImage(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Temple Ambient Video URL (Optional)</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="https://... (mp4 link)" 
                      value={tempVideoBg}
                      onChange={(e) => setTempVideoBg(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Deity/God Portrait Image URL</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="https://..." 
                      value={tempDeityImage}
                      onChange={(e) => setTempDeityImage(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Devotional Chanting Audio URL</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="https://... (mp3 link)" 
                      value={tempDeityAudio}
                      onChange={(e) => setTempDeityAudio(e.target.value)}
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Opening Hour</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="05:00 AM" 
                        value={tempStart}
                        onChange={(e) => setTempStart(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Closing Hour</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="10:00 PM" 
                        value={tempEnd}
                        onChange={(e) => setTempEnd(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea 
                      rows="2" 
                      className="form-control" 
                      placeholder="Temple details..." 
                      value={tempDesc}
                      onChange={(e) => setTempDesc(e.target.value)}
                    ></textarea>
                  </div>
                  <div className="form-group">
                    <label>Amenities</label>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Free Food" 
                        value={tempAmenity}
                        onChange={(e) => setTempAmenity(e.target.value)}
                      />
                      <button type="button" onClick={handleAddAmenity} className="btn btn-secondary" style={{ padding: '0.5rem 1rem' }}>
                        Add
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem', marginTop: '0.5rem' }}>
                      {tempAmenities.map(am => (
                        <span key={am} style={{ fontSize: '0.75rem', background: 'var(--highlight-5)', padding: '2px 8px', borderRadius: '4px' }}>{am}</span>
                      ))}
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }}>
                    Register Temple
                  </button>
                </form>
              </div>

              {/* Add Event */}
              <div className="card-glass">
                <h3 style={{ fontSize: '1.2rem', marginBottom: '1.25rem' }}>Schedule Temple Event</h3>
                {evtError && <div className="alert alert-error" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>{evtError}</div>}
                {evtSuccess && <div className="alert alert-success" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>{evtSuccess}</div>}

                <form onSubmit={handleCreateEventSubmit}>
                  <div className="form-group">
                    <label>Select Temple</label>
                    <select 
                      className="form-control" 
                      value={evtTempleId} 
                      onChange={(e) => setEvtTempleId(e.target.value)}
                      style={{ background: 'var(--dark-hover)' }}
                      required
                    >
                      {temples.map(t => (
                        <option key={t._id} value={t._id}>{t.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '1rem' }}>
                    <div className="form-group">
                      <label>Event Title</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Annual Utsav" 
                        value={evtTitle}
                        onChange={(e) => setEvtTitle(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <label>Date</label>
                      <input 
                        type="date" 
                        className="form-control" 
                        value={evtDate}
                        onChange={(e) => setEvtDate(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Short Description</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="Brief details..." 
                      value={evtDesc}
                      onChange={(e) => setEvtDesc(e.target.value)}
                      required 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={temples.length === 0}>
                    Schedule Event
                  </button>
                </form>
              </div>

            </div>

            {/* Temples List with Event sublists */}
            <div className="card-glass">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Temples Registry</h3>
              {templesLoading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading temples...</p>
              ) : temples.length === 0 ? (
                <p style={{ color: 'var(--text-muted)' }}>No temples currently registered.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '750px', overflowY: 'auto', paddingRight: '0.25rem' }}>
                  {temples.map(t => (
                    <div key={t._id} style={{ background: 'var(--highlight-1)', border: '1px solid var(--glass-border)', padding: '1rem', borderRadius: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <div>
                          <span style={{ fontWeight: '700', color: 'var(--text-main)', fontSize: '1.1rem' }}>{t.name}</span>
                          <div style={{ fontSize: '0.85rem', background: 'rgba(var(--primary-rgb),0.1)', color: 'var(--primary)', padding: '2px 8px', borderRadius: '12px' }}>Location: {t.location}</div>
                        </div>
                        <button onClick={() => handleDeleteTemple(t._id)} className="btn" style={{ background: 'rgba(239, 68, 68, 0.1)', color: 'var(--error)', padding: '0.4rem', border: 'none', borderRadius: '4px' }}>
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Event logs for this temple */}
                      <div style={{ marginTop: '0.75rem', borderTop: '1px solid var(--highlight-5)', paddingTop: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--secondary)', fontWeight: '600', display: 'block', marginBottom: '0.25rem' }}>Scheduled Events:</span>
                        {t.events && t.events.length > 0 ? (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                            {t.events.map(ev => (
                              <div key={ev._id} style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                                <span>• {ev.title} ({new Date(ev.date).toLocaleDateString()})</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>No events scheduled.</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* Facility & Maintenance requests Tab */}
        {activeTab === 'facility' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2.5rem' }}>
            
            {/* Log maintenance request */}
            <div className="card-glass" style={{ height: 'fit-content' }}>
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Log Maintenance Job</h3>
              {maintError && <div className="alert alert-error" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>{maintError}</div>}
              {maintSuccess && <div className="alert alert-success" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>{maintSuccess}</div>}

              <form onSubmit={handleCreateMaintenanceSubmit}>
                <div className="form-group">
                  <label>Select Temple</label>
                  <select 
                    className="form-control" 
                    value={maintTempleId} 
                    onChange={(e) => setMaintTempleId(e.target.value)}
                    style={{ background: 'var(--dark-hover)' }}
                    required
                  >
                    {temples.map(t => (
                      <option key={t._id} value={t._id}>{t.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Maintenance Task Description</label>
                  <textarea 
                    rows="3" 
                    className="form-control" 
                    placeholder="e.g. Sanctum sanctorum electrical wiring replacement"
                    value={maintDesc}
                    onChange={(e) => setMaintDesc(e.target.value)}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={temples.length === 0}>
                  Log Request
                </button>
              </form>
            </div>

            {/* List request queues */}
            <div className="card-glass">
              <h3 style={{ fontSize: '1.25rem', marginBottom: '1.25rem' }}>Active Maintenance Requests Queue</h3>
              
              {templesLoading ? (
                <p style={{ color: 'var(--text-muted)' }}>Loading queues...</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', maxHeight: '550px', overflowY: 'auto' }}>
                  {temples.map(t => {
                    const activeReqs = t.maintenanceRequests || [];
                    if (activeReqs.length === 0) return null;
                    return (
                      <div key={t._id} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                        <h4 style={{ fontSize: '1.05rem', color: 'var(--primary)', marginBottom: '0.5rem' }}>{t.name}</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                          {activeReqs.map(req => (
                            <div 
                              key={req._id} 
                              style={{ 
                                background: 'var(--highlight-1)', 
                                border: '1px solid var(--glass-border)', 
                                padding: '0.75rem', 
                                borderRadius: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                              }}
                            >
                              <div style={{ maxWidth: '65%' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                  <p style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>{req.description}</p>
                                  <span style={{ fontSize: '0.8rem', color: 'var(--secondary)' }}>{new Date(req.createdAt).toLocaleDateString()}</span>
                                </div>
                              </div>

                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', width: '130px' }}>
                                <span style={{ 
                                  fontSize: '0.7rem', 
                                  textAlign: 'center',
                                  fontWeight: '600',
                                  padding: '1px 6px',
                                  borderRadius: '4px',
                                  color: req.status === 'Completed' ? 'var(--success)' : req.status === 'In Progress' ? 'var(--info)' : 'var(--warning)',
                                  background: 'var(--highlight-5)'
                                }}>
                                  {req.status}
                                </span>
                                <select 
                                  value={req.status}
                                  onChange={(e) => handleUpdateMaintStatus(t._id, req._id, e.target.value)}
                                  className="form-control"
                                  style={{ padding: '2px 4px', fontSize: '0.75rem', height: 'auto', background: 'var(--dark-hover)' }}
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                </select>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                  {temples.every(t => (t.maintenanceRequests || []).length === 0) && (
                    <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No maintenance requests logged in the system.</p>
                  )}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default DashboardAdmin;
