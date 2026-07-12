import React, { useState } from 'react';
import { Volume2, VolumeX, Sparkles, ArrowRight } from 'lucide-react';

const DeityIntroModal = ({ temple, onEnter, onClose }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  const handleEnterClick = () => {
    // Play audio synchronously inside the click event stack to bypass browser autoplay blocks
    onEnter({ startAudio: true, mute: isMuted });
    setIsEntering(true);
    // Allow animation to run before unmounting
    setTimeout(() => {
      onClose();
    }, 1000);
  };

  const handleSkipClick = () => {
    onEnter({ startAudio: false, mute: true });
    setIsEntering(true);
    setTimeout(() => {
      onClose();
    }, 800);
  };

  return (
    <div className={`divine-intro-overlay ${isEntering ? 'fade-out' : ''}`}>
      {/* Background visual elements */}
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage: `url(${temple.image || 'https://images.unsplash.com/photo-1600121848594-d8644e57abab?auto=format&fit=crop&q=80&w=1200'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: 'blur(30px) brightness(0.2)',
          transform: 'scale(1.1)',
          zIndex: -1
        }}
      />

      <div 
        style={{
          maxWidth: '520px',
          width: '100%',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2rem',
          zIndex: 2
        }}
      >
        {/* Divine Greeting Header */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
          <div 
            style={{
              background: 'rgba(var(--primary-rgb), 0.1)',
              border: '1px solid var(--primary)',
              borderRadius: '9999px',
              padding: '0.4rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              color: 'var(--primary)',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              marginBottom: '0.5rem'
            }}
          >
            <Sparkles size={12} />
            Divine Darshan Entry
          </div>
          <h2 style={{ fontSize: '2.25rem', lineHeight: '1.2', fontWeight: '800' }}>
            Welcome to {temple.name}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            {temple.location}
          </p>
        </div>

        {/* Deity Glowing Portrait Box */}
        <div 
          className="deity-glow-frame"
          style={{
            width: '280px',
            height: '350px',
            borderRadius: '20px',
            overflow: 'hidden',
            position: 'relative',
            background: '#07070b'
          }}
        >
          <img 
            className="deity-zoom"
            src={temple.deityImage || temple.image || 'https://images.unsplash.com/photo-1608976328267-e673d3ec06ce?auto=format&fit=crop&q=80&w=600'} 
            alt="Divine Deity" 
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
          {/* Subtle light aura overlay */}
          <div 
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0, bottom: 0,
              background: 'var(--video-overlay)',
              pointerEvents: 'none'
            }}
          />
        </div>

        <p style={{ color: 'var(--text-main)', fontSize: '1rem', fontStyle: 'italic', opacity: 0.9 }}>
          "Experience the spiritual energy and sacred hymns of the temple."
        </p>

        {/* Action Controls */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', width: '100%' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
            
            {/* Audio Mute/Unmute Toggle */}
            <button 
              onClick={() => setIsMuted(!isMuted)}
              type="button"
              className="btn btn-secondary"
              style={{
                borderRadius: '50%',
                width: '50px',
                height: '50px',
                padding: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderColor: isMuted ? 'var(--glass-border)' : 'var(--primary)'
              }}
              title={isMuted ? 'Unmute chanting' : 'Mute chanting'}
            >
              {isMuted ? <VolumeX size={20} style={{ color: 'var(--text-muted)' }} /> : <Volume2 size={20} style={{ color: 'var(--primary)' }} />}
            </button>

            {/* Enter Temple Button */}
            <button 
              onClick={handleEnterClick}
              type="button"
              className="btn btn-primary"
              style={{
                padding: '0.85rem 2.25rem',
                fontSize: '1.05rem',
                borderRadius: '9999px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                boxShadow: '0 0 25px rgba(var(--primary-rgb), 0.35)'
              }}
            >
              🙏 Enter Divine Portal
              <ArrowRight size={18} />
            </button>
          </div>

          <button 
            onClick={handleSkipClick}
            type="button"
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.85rem',
              cursor: 'pointer',
              textDecoration: 'underline',
              marginTop: '0.5rem'
            }}
          >
            Skip Intro & Go to Booking
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeityIntroModal;
