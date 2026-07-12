import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Search, MapPin, Star, ArrowRight } from 'lucide-react';
import { AudioContext } from '../context/AudioContext';

const Home = () => {
  const { playSong } = useContext(AudioContext);
  const [temples, setTemples] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [locationTerm, setLocationTerm] = useState('');

  const fetchTemples = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await axios.get('/temples', {
        params: {
          search: searchTerm,
          location: locationTerm
        }
      });
      if (response.data.success) {
        setTemples(response.data.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load temples. Please ensure the backend server and MongoDB are online.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTemples();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchTemples();
  };

  const renderStars = (rating) => {
    const stars = [];
    const avg = Math.round(rating || 0);
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star 
          key={i} 
          size={16} 
          fill={i <= avg ? 'var(--accent)' : 'none'} 
          color={i <= avg ? 'var(--accent)' : 'var(--text-muted)'} 
        />
      );
    }
    return <div className="stars-display">{stars}</div>;
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <div className="hero-badge">DIVINE EXPERIENCES SIMPLIFIED</div>
          <h1>DarshanEase Ticket Booking</h1>
          <p>
            Experience seamless travel and spiritual darshan. Book preferred slots, participate in events, and make online donations from the comfort of your home.
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <div className="container">
        <form onSubmit={handleSearchSubmit} className="search-container">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderRight: '1px solid var(--glass-border)', paddingRight: '1rem' }}>
            <Search size={20} style={{ color: 'var(--primary)' }} />
            <input 
              type="text" 
              placeholder="Search temple name..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={20} style={{ color: 'var(--primary)' }} />
            <input 
              type="text" 
              placeholder="Filter by location (e.g. Tirupati, Varanasi)..." 
              value={locationTerm}
              onChange={(e) => setLocationTerm(e.target.value)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-main)', width: '100%', outline: 'none' }}
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Search
          </button>
        </form>

        {error && (
          <div className="alert alert-error" style={{ maxWidth: '800px', margin: '0 auto 2rem auto' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', margin: '4rem 0', fontSize: '1.25rem', color: 'var(--text-muted)' }}>
            Loading temples...
          </div>
        ) : (
          <div>
            <h2 style={{ marginBottom: '2rem', fontSize: '2rem' }}>Featured Temples</h2>
            {temples.length === 0 ? (
              <div className="card-glass" style={{ textAlign: 'center', padding: '4rem 2rem' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>No temples found matching your search. Try adjusting your search parameters.</p>
              </div>
            ) : (
              <div className="temples-grid">
                {temples.map((temple) => (
                  <div key={temple._id} className="card-glass-premium" style={{ display: 'flex', flexDirection: 'column' }}>
                    <div className="temple-image-wrapper">
                      <img 
                        src={temple.image || 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=800'} 
                        alt={temple.name} 
                      />
                      <div className="temple-rating-badge">
                        <Star size={14} fill="var(--accent)" color="var(--accent)" />
                        <span>{temple.averageRating?.toFixed(1) || 'N/A'}</span>
                      </div>
                    </div>

                    <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{temple.name}</h3>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                      <MapPin size={14} />
                      <span>{temple.location}</span>
                    </div>

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem', flexGrow: 1, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {temple.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--glass-border)', paddingTop: '1rem', marginTop: 'auto' }}>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Hours: {temple.darshanStartTime} - {temple.darshanEndTime}
                      </span>
                      <Link 
                        to={`/temple/${temple._id}`} 
                        className="btn btn-secondary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => playSong(temple.deityAudio, temple.name)}
                      >
                        Book Darshan
                        <ArrowRight size={14} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
