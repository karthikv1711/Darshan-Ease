import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { AudioContext } from '../context/AudioContext';
import BookingModal from '../components/BookingModal';
import AudioFloatingPlayer from '../components/AudioFloatingPlayer';
import { MapPin, Clock, Calendar, ShieldCheck, Star, Users, MessageSquare, Plus, Trash } from 'lucide-react';

const TempleDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { currentAudioSrc, isAudioMuted, playSong, toggleMute } = useContext(AudioContext);

  const [temple, setTemple] = useState(null);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Date tabs filtering
  const [selectedDateStr, setSelectedDateStr] = useState('');
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState('');

  // Helper to format date object/string as YYYY-MM-DD for date inputs
  const formatYYYYMMDD = (dateObjOrStr) => {
    const d = new Date(dateObjOrStr);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const year = d.getFullYear();
    return `${year}-${month}-${day}`;
  };

  const getDateOnly = (dateObjOrStr) => {
    const d = new Date(dateObjOrStr);
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const getSlotEndDateTime = (slot) => {
    const slotDate = new Date(slot.date);
    const endTime = slot.endTime || slot.startTime;
    const match = endTime.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);

    if (!match) {
      return new Date(slotDate);
    }

    let hours = parseInt(match[1], 10);
    const minutes = parseInt(match[2], 10);
    const meridiem = match[3].toUpperCase();

    if (meridiem === 'PM' && hours !== 12) hours += 12;
    if (meridiem === 'AM' && hours === 12) hours = 0;

    return new Date(
      slotDate.getFullYear(),
      slotDate.getMonth(),
      slotDate.getDate(),
      hours,
      minutes,
      0,
      0
    );
  };

  const handleCalendarDateChange = (e) => {
    const yyyymmdd = e.target.value;
    setSelectedCalendarDate(yyyymmdd);
    if (yyyymmdd) {
      const [year, month, day] = yyyymmdd.split('-');
      const localDate = new Date(year, month - 1, day);
      setSelectedDateStr(localDate.toDateString());
    }
  };
  
  // Booking modal state
  const [activeSlot, setActiveSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  // Review state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState('');

  const fetchTempleDetails = async () => {
    try {
      const templeRes = await axios.get(`/temples/${id}`);
      if (templeRes.data.success) {
        setTemple(templeRes.data.data);
      }
    } catch (err) {
      setError('Failed to fetch temple details.');
    }
  };

  const fetchSlots = async () => {
    try {
      const slotsRes = await axios.get(`/slots`, { params: { templeId: id } });
      if (slotsRes.data.success) {
        const now = new Date();
        const today = getDateOnly(now);
        const slotsData = slotsRes.data.data.filter(slot => {
          const slotDay = getDateOnly(slot.date);

          if (slotDay < today) {
            return false;
          }

          if (slotDay.getTime() === today.getTime()) {
            return getSlotEndDateTime(slot) > now;
          }

          return true;
        });

        setSlots(slotsData);

        // Extract unique dates that have slots
        const dates = [...new Set(slotsData.map(s => new Date(s.date).toDateString()))];
        setAvailableDates(dates);
        if (dates.length > 0) {
          setSelectedDateStr(dates[0]);
          setSelectedCalendarDate(formatYYYYMMDD(dates[0]));
        } else {
          setSelectedDateStr('');
          setSelectedCalendarDate('');
        }
      }
    } catch (err) {
      console.error('Error fetching slots:', err);
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchTempleDetails(), fetchSlots()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [id]);

  // Trigger playing on direct link load or refresh
  useEffect(() => {
    if (temple && temple.deityAudio && currentAudioSrc !== temple.deityAudio) {
      playSong(temple.deityAudio, temple.name);
    }
  }, [temple, currentAudioSrc]);

  const handleMuteToggle = (e) => {
    if (e) e.stopPropagation();
    toggleMute();
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setReviewError('');
    setReviewSuccess('');

    if (!comment.trim()) {
      setReviewError('Please write a review comment');
      return;
    }

    try {
      const res = await axios.post(`/temples/${id}/reviews`, { rating, comment });
      if (res.data.success) {
        setReviewSuccess('Thank you for your feedback!');
        setComment('');
        fetchTempleDetails(); // reload review details
      }
    } catch (err) {
      setReviewError(err.response?.data?.message || 'Failed to submit review.');
    }
  };

  const handleBookingClick = (slot) => {
    if (!user) {
      navigate('/login', { state: { from: `/temple/${id}` } });
      return;
    }
    if (user.role !== 'USER') {
      alert('Only Devotee (USER) accounts can book tickets. Please log in with a Devotee account.');
      return;
    }
    setActiveSlot(slot);
    setShowBookingModal(true);
  };

  const handleBookingSuccess = () => {
    fetchSlots(); // refresh slot seat counts
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ textAlign: 'center', margin: '4rem 0', color: 'var(--text-muted)' }}>
        Loading temple details...
      </div>
    );
  }

  if (error || !temple) {
    return (
      <div className="container" style={{ margin: '3rem auto', maxWidth: '600px' }}>
        <div className="alert alert-error">{error || 'Temple not found.'}</div>
        <Link to="/" className="btn btn-secondary">Back to Home</Link>
      </div>
    );
  }

  // Filter slots for the selected tab date
  const activeSlots = slots.filter(s => new Date(s.date).toDateString() === selectedDateStr);

  return (
    <>
      <AudioFloatingPlayer 
        isMuted={isAudioMuted} 
        onMuteToggle={handleMuteToggle} 
        templeName={temple.name} 
      />
      <div className="container" style={{ paddingTop: '2rem' }}>
      {/* Temple Banner Header with Deity Background Video */}
      <div 
        className="card-glass responsive-grid-split" 
        style={{ 
          gap: '2rem', 
          padding: '2rem', 
          marginBottom: '2.5rem',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {temple.videoBg && (
          <>
            <video 
              src={temple.videoBg} 
              autoPlay 
              loop 
              muted 
              playsInline 
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                minWidth: '100%',
                minHeight: '100%',
                width: 'auto',
                height: 'auto',
                transform: 'translate(-50%, -50%)',
                objectFit: 'cover',
                opacity: 0.15,
                zIndex: 0,
                pointerEvents: 'none'
              }}
            />
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'var(--video-overlay)',
              zIndex: 0,
              pointerEvents: 'none'
            }} />
          </>
        )}

        <div style={{ zIndex: 1, borderRadius: '8px', overflow: 'hidden', height: '350px', position: 'relative' }}>
          <img 
            src={temple.deityImage || temple.image || 'https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?auto=format&fit=crop&q=80&w=800'} 
            alt={`${temple.name} Deity`} 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'var(--badge-bg)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--glass-border)',
            padding: '4px 10px',
            borderRadius: '6px',
            fontSize: '0.75rem',
            color: 'var(--accent)',
            fontWeight: '600'
          }}>
            🙏 Sacred Deity
          </div>
        </div>
        <div style={{ zIndex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: 'var(--text-main)' }}>{temple.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            <MapPin size={18} style={{ color: 'var(--primary)' }} />
            <span>{temple.location}</span>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Clock size={16} style={{ color: 'var(--primary)' }} />
              <span style={{ fontSize: '0.9rem' }}>Darshan Hours: {temple.darshanStartTime} - {temple.darshanEndTime}</span>
            </div>
            {temple.averageRating > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Star size={16} fill="var(--accent)" color="var(--accent)" />
                <span style={{ fontWeight: '600' }}>{temple.averageRating.toFixed(1)} / 5.0</span>
              </div>
            )}
          </div>

          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '1.5rem', lineHeight: '1.6' }}>
            {temple.description}
          </p>

          <div>
            <h4 style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.5rem' }}>Amenities Provided</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {temple.amenities && temple.amenities.length > 0 ? (
                temple.amenities.map((amenity, idx) => (
                  <span key={idx} style={{ fontSize: '0.8rem', background: 'var(--highlight-5)', border: '1px solid var(--glass-border)', padding: '0.25rem 0.75rem', borderRadius: '9999px', color: 'var(--text-main)' }}>
                    {amenity}
                  </span>
                ))
              ) : (
                <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Standard temple facilities available.</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="responsive-grid-split-alt" style={{ gap: '2.5rem', marginBottom: '4rem' }}>
        
        {/* Left Side: Slots selection & events */}
        <div>
          <div className="card-glass" style={{ marginBottom: '2.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
              <h2 style={{ fontSize: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Calendar size={22} style={{ color: 'var(--primary)' }} />
                Available Darshan Slots
              </h2>
              
              {/* Calendar Date Picker Input */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--highlight-2)', border: '1px solid var(--glass-border)', padding: '0.4rem 0.8rem', borderRadius: '8px' }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Choose Date:</span>
                <input 
                  type="date" 
                  value={selectedCalendarDate}
                  onChange={handleCalendarDateChange}
                  min={formatYYYYMMDD(new Date())}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-main)',
                    outline: 'none',
                    fontFamily: 'inherit',
                    fontSize: '0.85rem',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>

            {availableDates.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)' }}>
                No darshan slots currently scheduled. Please check back later.
              </div>
            ) : (
              <div>
                {/* Quick Date Selection Tabs */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.75rem', overflowX: 'auto' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '500', whiteSpace: 'nowrap' }}>Quick Select:</span>
                  {availableDates.map(dateStr => (
                    <button
                      key={dateStr}
                      onClick={() => {
                        setSelectedDateStr(dateStr);
                        setSelectedCalendarDate(formatYYYYMMDD(dateStr));
                      }}
                      className="btn"
                      style={{
                        padding: '0.4rem 1rem',
                        fontSize: '0.85rem',
                        background: selectedDateStr === dateStr ? 'var(--accent-gradient)' : 'var(--highlight-2)',
                        border: selectedDateStr === dateStr ? 'none' : '1px solid var(--glass-border)',
                        color: selectedDateStr === dateStr ? '#ffffff' : 'var(--text-muted)',
                        borderRadius: '6px',
                        cursor: 'pointer'
                      }}
                    >
                      {formatDate(dateStr)}
                    </button>
                  ))}
                </div>

                {/* Slots Grid */}
                {activeSlots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '2.5rem 1rem', color: 'var(--text-muted)' }}>
                    <p style={{ marginBottom: '1rem', color: 'var(--text-main)', fontWeight: '500' }}>No slots scheduled for <strong>{new Date(selectedDateStr).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</strong>.</p>
                    <p style={{ fontSize: '0.85rem', marginBottom: '1.5rem' }}>Please select one of the following scheduled dates with active slots:</p>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {availableDates.map(dateStr => (
                        <button
                          key={dateStr}
                          onClick={() => {
                            setSelectedDateStr(dateStr);
                            setSelectedCalendarDate(formatYYYYMMDD(dateStr));
                          }}
                          className="btn btn-secondary"
                          style={{ padding: '0.4rem 1.25rem', fontSize: '0.85rem' }}
                        >
                          {formatDate(dateStr)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
                    {activeSlots.map(slot => (
                      <div 
                        key={slot._id} 
                        style={{
                          background: 'var(--highlight-2)',
                          border: '1px solid var(--glass-border)',
                          borderRadius: '8px',
                          padding: '1rem',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.5rem',
                          position: 'relative'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: '700', fontSize: '1.05rem', color: 'var(--text-main)' }}>
                            {slot.startTime}
                          </span>
                          <span style={{ color: 'var(--secondary)', fontWeight: '600' }}>
                            ₹{slot.price}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                          Ends at {slot.endTime}
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.85rem', marginTop: '0.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Users size={14} style={{ color: 'var(--text-muted)' }} />
                            <span>{slot.availableSeats} / {slot.totalSeats} left</span>
                          </div>
                          <span className={`capacity-indicator ${
                            slot.availableSeats === 0 ? 'capacity-low' : 
                            slot.availableSeats <= 20 ? 'capacity-medium' : 'capacity-high'
                          }`}>
                            {slot.availableSeats === 0 ? 'Sold Out' : 
                             slot.availableSeats <= 20 ? 'Fast Filling' : 'Available'}
                          </span>
                        </div>

                        <button 
                          onClick={() => handleBookingClick(slot)}
                          disabled={slot.availableSeats === 0}
                          className="btn btn-primary"
                          style={{
                            padding: '0.5rem',
                            fontSize: '0.85rem',
                            borderRadius: '6px',
                            marginTop: '0.75rem',
                            width: '100%',
                            opacity: slot.availableSeats === 0 ? 0.5 : 1,
                            cursor: slot.availableSeats === 0 ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {slot.availableSeats === 0 ? 'Fully Booked' : 'Book Now'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Upcoming Events */}
          <div className="card-glass">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem' }}>Upcoming Temple Events</h2>
            {temple.events && temple.events.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {temple.events.map((event, idx) => (
                  <div key={idx} style={{ borderLeft: '3px solid var(--primary)', paddingLeft: '1rem', background: 'var(--highlight-1)', padding: '0.75rem 1rem', borderRadius: '0 8px 8px 0' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <h4 style={{ fontSize: '1.1rem' }}>{event.title}</h4>
                      <span style={{ fontSize: '0.8rem', color: 'var(--secondary)', fontWeight: '600' }}>
                        {new Date(event.date).toLocaleDateString()}
                      </span>
                    </div>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{event.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>No scheduled public events at this time.</p>
            )}
          </div>
        </div>

        {/* Right Side: Reviews & Ratings */}
        <div>
          <div className="card-glass">
            <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={22} style={{ color: 'var(--primary)' }} />
              Devotee Feedback
            </h2>

            {/* Leave Review Form */}
            {user ? (
              user.role === 'USER' ? (
                <form onSubmit={handleReviewSubmit} style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
                  <h4 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>Share Your Experience</h4>
                  {reviewError && <div className="alert alert-error" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>{reviewError}</div>}
                  {reviewSuccess && <div className="alert alert-success" style={{ padding: '0.5rem', fontSize: '0.85rem' }}>{reviewSuccess}</div>}

                  <div className="form-group">
                    <label>Rating</label>
                    <select 
                      className="form-control" 
                      value={rating} 
                      onChange={(e) => setRating(Number(e.target.value))}
                      style={{ background: 'var(--dark-hover)' }}
                    >
                      <option value="5">5 Stars - Excellent</option>
                      <option value="4">4 Stars - Very Good</option>
                      <option value="3">3 Stars - Good</option>
                      <option value="2">2 Stars - Fair</option>
                      <option value="1">1 Star - Poor</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label>Review Comment</label>
                    <textarea 
                      rows="3" 
                      className="form-control" 
                      placeholder="Write your review here..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.6rem' }}>
                    Submit Review
                  </button>
                </form>
              ) : (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                  Reviews can only be submitted by Devotee (USER) accounts.
                </p>
              )
            ) : (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>
                Please <Link to="/login" style={{ color: 'var(--primary)', fontWeight: '600' }}>Login</Link> to write a review.
              </p>
            )}

            {/* Past Reviews List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
              {temple.ratings && temple.ratings.length > 0 ? (
                temple.ratings.map((rev, idx) => (
                  <div key={idx} style={{ background: 'var(--highlight-1)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span style={{ fontWeight: '600', color: 'var(--text-main)' }}>{rev.userName}</span>
                      <div className="stars-display">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            size={12} 
                            fill={i < rev.rating ? "var(--accent)" : "none"} 
                            color={i < rev.rating ? "var(--accent)" : "var(--text-muted)"} 
                          />
                        ))}
                      </div>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>{rev.comment}</p>
                    <div style={{ fontSize: '0.7rem', color: 'var(--highlight-25)', marginTop: '0.5rem', textAlign: 'right' }}>
                      {new Date(rev.date).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', textAlign: 'center' }}>No reviews yet. Be the first to share feedback!</p>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Booking Modal render overlay */}
      {showBookingModal && activeSlot && (
        <BookingModal 
          slot={activeSlot} 
          onClose={() => {
            setShowBookingModal(false);
            setActiveSlot(null);
          }}
          onBookingSuccess={handleBookingSuccess}
        />
      )}
    </div>
    </>
  );
};

export default TempleDetails;
