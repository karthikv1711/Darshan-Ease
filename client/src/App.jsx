import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { AudioProvider } from './context/AudioContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import TempleDetails from './pages/TempleDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Donation from './pages/Donation';
import DashboardUser from './pages/DashboardUser';
import DashboardOrganizer from './pages/DashboardOrganizer';
import DashboardAdmin from './pages/DashboardAdmin';

function App() {
  return (
    <AuthProvider>
      <Router>
        <AudioProvider>
          <div className="app-container">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/temple/:id" element={<TempleDetails />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/donation" element={<Donation />} />
              
              {/* Dashboards */}
              <Route path="/dashboard" element={<DashboardUser />} />
              <Route path="/organizer" element={<DashboardOrganizer />} />
              <Route path="/admin" element={<DashboardAdmin />} />
            </Routes>
          </main>
          <Footer />
        </div>
        </AudioProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
