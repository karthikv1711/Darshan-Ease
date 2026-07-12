import React from 'react';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
        <div>
          <h4 style={{ color: 'var(--text-main)', marginBottom: '1rem' }}>DarshanEase</h4>
          <p style={{ maxWidth: '350px' }}>
            Empowering devotees to explore temples, schedule spiritual slots, support shrines through online contributions, and experience seamless divine journeys.
          </p>
        </div>
        <div>
          <h5 style={{ color: 'var(--text-main)', marginBottom: '0.75rem' }}>Help & Support</h5>
          <p style={{ fontSize: '0.9rem' }}>Email: support@darshanease.com</p>
          <p style={{ fontSize: '0.9rem' }}>Phone: +91 1800-444-2326</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
          <p style={{ fontSize: '0.9rem' }}>
            &copy; {new Date().getFullYear()} DarshanEase. Built with love and devotion.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
