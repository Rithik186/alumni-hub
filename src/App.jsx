import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { UserProvider, useUser } from './context/UserContext';
import { Navbar } from './components/landing/Navbar';
import { Hero } from './components/landing/Hero';
import { Features } from './components/landing/Features';
import { Footer } from './components/landing/Footer';
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import ForgotPassword from './pages/Auth/ForgotPassword';
import Profile from './pages/Profile';
import Dashboard from './pages/Dashboard';

const LandingPage = () => (
  <>
    <Navbar />
    <Hero />
    <Features />
    <Footer />
  </>
);

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useUser();
  if (loading) return null;
  if (!user) return <Navigate to="/login" />;
  return children;
};

function App() {
  return (
    <UserProvider>
      <Router>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </Router>
    </UserProvider>
  );
}

export default App;
