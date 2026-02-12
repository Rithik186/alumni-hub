
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/landing/Navbar';
import { Hero } from './components/landing/Hero';
import { Features } from './components/landing/Features';
import { Footer } from './components/landing/Footer';

const LandingPage = () => (
  <>
    <Navbar />
    <Hero />
    <Features />
    <Footer />
  </>
);

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 scroll-smooth">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          {/* Add more routes here, e.g., /login, /dashboard */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
