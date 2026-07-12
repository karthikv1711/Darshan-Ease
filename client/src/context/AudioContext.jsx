import React, { createContext, useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export const AudioContext = createContext();

export const AudioProvider = ({ children }) => {
  const [currentTempleName, setCurrentTempleName] = useState('');
  const [currentAudioSrc, setCurrentAudioSrc] = useState('');
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const audioRef = useRef(null);
  const location = useLocation();

  // Handle automatic stopping of audio when navigating away from temple details pages
  useEffect(() => {
    if (!location.pathname.startsWith('/temple/')) {
      stopSong();
    }
  }, [location.pathname]);

  // Handle synchronization of audio element properties and playback
  useEffect(() => {
    if (!audioRef.current) return;
    const audio = audioRef.current;

    // Apply default volume
    audio.volume = 0.45;

    if (!currentAudioSrc) {
      audio.pause();
      return;
    }

    // Update source if changed
    if (audio.src !== currentAudioSrc) {
      // If the audio URL is local, ensure it starts with correct prefix or domain
      const finalSrc = currentAudioSrc.startsWith('http') 
        ? currentAudioSrc 
        : `${window.location.origin}${currentAudioSrc}`;
      
      if (audio.src !== finalSrc) {
        audio.src = finalSrc;
      }
    }

    if (isAudioMuted) {
      audio.pause();
    } else {
      // Attempt play. If browser restricts autoplay (e.g. on direct page reload),
      // set up a document click fallback to trigger as soon as user interacts.
      audio.play().catch(err => {
        console.log("Autoplay blocked, waiting for user activation gesture:", err.message);

        const handleDocClick = () => {
          if (!isAudioMuted && currentAudioSrc) {
            audio.play()
              .then(() => {
                document.removeEventListener('click', handleDocClick);
              })
              .catch(e => console.log("Failed to play on first user click:", e.message));
          } else {
            document.removeEventListener('click', handleDocClick);
          }
        };
        document.addEventListener('click', handleDocClick);
      });
    }
  }, [currentAudioSrc, isAudioMuted]);

  const playSong = (src, templeName) => {
    if (!src) return;
    setCurrentTempleName(templeName || '');
    setCurrentAudioSrc(src);
    setIsAudioMuted(false); // default to playing when starting a new chant
    
    if (audioRef.current) {
      const audio = audioRef.current;
      const finalSrc = src.startsWith('http') ? src : `${window.location.origin}${src}`;
      if (audio.src !== finalSrc) {
        audio.src = finalSrc;
      }
      audio.play().catch(e => console.log("Direct play blocked:", e.message));
    }
  };

  const stopSong = () => {
    setCurrentAudioSrc('');
    setCurrentTempleName('');
    if (audioRef.current) {
      audioRef.current.pause();
    }
  };

  const toggleMute = () => {
    setIsAudioMuted(prev => !prev);
  };

  return (
    <AudioContext.Provider value={{
      currentTempleName,
      currentAudioSrc,
      isAudioMuted,
      playSong,
      stopSong,
      toggleMute
    }}>
      {children}
      <audio ref={audioRef} loop preload="auto" />
    </AudioContext.Provider>
  );
};
