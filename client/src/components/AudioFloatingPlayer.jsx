import React from 'react';
import { Volume2, VolumeX, Music } from 'lucide-react';

const AudioFloatingPlayer = ({ isMuted, onMuteToggle, templeName }) => {
  return (
    <div className="audio-floating-pill" onClick={(e) => e.stopPropagation()}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Music size={14} style={{ color: 'var(--primary)' }} className="animate-pulse" />
        <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '600' }}>
          {templeName ? `${templeName.split(' ')[0]} Chant` : 'Temple Hymn'}
        </span>
      </div>

      {/* Sound wave animation */}
      {!isMuted && (
        <div className="audio-wave" style={{ margin: '0 0.25rem' }}>
          <div className="audio-wave-bar"></div>
          <div className="audio-wave-bar"></div>
          <div className="audio-wave-bar"></div>
        </div>
      )}

      <button
        type="button"
        onClick={onMuteToggle}
        style={{
          background: 'var(--highlight-5)',
          border: '1px solid var(--glass-border)',
          borderRadius: '50%',
          width: '28px',
          height: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          padding: 0,
          transition: 'var(--transition)'
        }}
        title={isMuted ? 'Play chanting' : 'Mute chanting'}
      >
        {isMuted ? (
          <VolumeX size={12} style={{ color: 'var(--text-muted)' }} />
        ) : (
          <Volume2 size={12} style={{ color: 'var(--primary)' }} />
        )}
      </button>
    </div>
  );
};

export default AudioFloatingPlayer;
