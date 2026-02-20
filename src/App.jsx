import React, { useEffect, useState } from 'react'
import logo from "./assets/logo.jpg"
import { Link } from 'react-router-dom'
import Aos from 'aos';
import "aos/dist/aos.css";
import { BookOpen, ChartArea, Command, GraduationCap, MessageCircle, Target, Trophy } from 'lucide-react';
import { SiCoursera } from 'react-icons/si';
import { GiTargetArrows } from 'react-icons/gi';
import api from './api';

const FALLBACK_FEEDBACKS = [
  {
    id: "fb-1",
    username: "Aziza",
    rating: 5,
    text: "MockStream orqali daily practice qilish odat bo'ldi. Ayniqsa speaking va writing mocklari juda foydali bo'ldi.",
  },
  {
    id: "fb-2",
    username: "Jasur",
    rating: 5,
    text: "Platforma interfeysi yengil va tushunarli. IELTS tayyorgarligimda vaqtni ancha tejadi.",
  },
  {
    id: "fb-3",
    username: "Malika",
    rating: 4,
    text: "Reading bo'limi zo'r, mocklar sifati yuqori. Umuman olganda motivatsiya beradigan platforma.",
  },
];

export default function App() {
  const [dirx, setDirx] = useState(0);
  const [diry, setDiry] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [feedbacks, setFeedbacks] = useState([]);
  const [activeReview, setActiveReview] = useState(0);
  const [isReviewTransitioning, setIsReviewTransitioning] = useState(false);

  function parallax(e) {
    setDirx(Math.floor(e.clientX / 100));
    setDiry(Math.floor(e.clientY / 100));
  }

  useEffect(() => {
    Aos.init({
      duration: 1200,
      offset: 100,
      easing: "ease-out-cubic",
      once: false,
    });

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const fetchFeedbacks = async () => {
      try {
        const res = await api.get("/feedback/public?limit=15");
        const items = Array.isArray(res.data?.feedbacks) ? res.data.feedbacks : [];
        setFeedbacks(items.length ? items : FALLBACK_FEEDBACKS);
      } catch (error) {
        setFeedbacks(FALLBACK_FEEDBACKS);
      }
    };

    fetchFeedbacks();
  }, []);

  const goToReview = (nextIndex) => {
    if (feedbacks.length === 0) return;
    if (isReviewTransitioning || nextIndex === activeReview) return;

    setIsReviewTransitioning(true);
    setTimeout(() => {
      setActiveReview(nextIndex);
      requestAnimationFrame(() => setIsReviewTransitioning(false));
    }, 180);
  };

  useEffect(() => {
    if (feedbacks.length <= 1 || isReviewTransitioning) return;

    const timer = setInterval(() => {
      const nextIndex = (activeReview + 1) % feedbacks.length;
      goToReview(nextIndex);
    }, 3600);

    return () => clearInterval(timer);
  }, [activeReview, feedbacks.length, isReviewTransitioning]);

  return (
    <div className='w-full min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-x-hidden'>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Work+Sans:wght@400;500;600;700&display=swap');
        
        * {
          font-family: 'Work Sans', sans-serif;
        }
        
        h1, h2, h3 {
          font-family: 'Playfair Display', serif;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .floating-badge {
          animation: float 6s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .blob {
          border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%;
          animation: blob-morph 8s ease-in-out infinite;
        }

        @keyframes blob-morph {
          0%, 100% { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; }
          25% { border-radius: 58% 42% 75% 25% / 76% 46% 54% 24%; }
          50% { border-radius: 50% 50% 33% 67% / 55% 27% 73% 45%; }
          75% { border-radius: 33% 67% 58% 42% / 63% 68% 32% 37%; }
        }

        .feature-card {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card:hover {
          transform: translateY(-12px) scale(1.02);
        }

        .nav-link {
          position: relative;
          transition: color 0.3s ease;
        }

        .nav-link::after {
          content: '';
          position: absolute;
          bottom: -4px;
          left: 0;
          width: 0;
          height: 2px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          transition: width 0.3s ease;
        }

        .nav-link:hover::after {
          width: 100%;
        }

        .scroll-indicator {
          animation: bounce 2s infinite;
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(10px); }
        }

        .review-orb {
          filter: blur(60px);
          opacity: 0.5;
          pointer-events: none;
        }

        .review-card {
          transition: transform 0.55s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.55s ease;
        }

        .review-glow {
          position: absolute;
          inset: -1px;
          border-radius: 1.5rem;
          background: linear-gradient(120deg, rgba(59, 130, 246, 0.35), rgba(234, 88, 12, 0.3), rgba(16, 185, 129, 0.35));
          filter: blur(14px);
          z-index: -1;
        }

        .review-quote::before {
          content: '"';
          font-size: 5rem;
          line-height: 0.5;
          position: absolute;
          top: 14px;
          left: 20px;
          color: rgba(71, 85, 105, 0.15);
          font-family: Georgia, serif;
        }

        @media (max-width: 768px) {
          .floating-badge {
            font-size: 1.25rem;
            padding: 0.5rem 1rem;
          }
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-[999] transition-all duration-500 ${
        scrolled ? 'glass-effect shadow-xl py-3' : 'bg-transparent py-5'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer group">
              <img 
                src={logo} 
                alt="MockStream Logo" 
                className='w-12 h-12 rounded-full transition-all duration-500 group-hover:scale-110 group-hover:rotate-12 shadow-lg' 
              />
              <span className="text-2xl font-bold gradient-text hidden sm:block">MockStream</span>
            </div>

            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center gap-8">
              <li><a href="#" className="nav-link text-slate-700 font-semibold hover:text-indigo-600">Main</a></li>
              <li><a href="#about" className="nav-link text-slate-700 font-semibold hover:text-indigo-600">About</a></li>
              <li><a href="#features" className="nav-link text-slate-700 font-semibold hover:text-indigo-600">Features</a></li>
              <li><a href="#reviews" className="nav-link text-slate-700 font-semibold hover:text-indigo-600">Reviews</a></li>
              <li><a href="#contact" className="nav-link text-slate-700 font-semibold hover:text-indigo-600">Contact</a></li>
            </ul>

            {/* CTA Button */}
            <Link
              to="/auth"
              className="hidden md:block px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              Get Started
            </Link>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/50 transition-colors"
            >
              <svg className="w-6 h-6 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`md:hidden overflow-hidden transition-all duration-300 ${
            mobileMenuOpen ? 'max-h-96 mt-4' : 'max-h-0'
          }`}>
            <div className="flex flex-col gap-4 py-4 glass-effect rounded-2xl px-4">
              <a href="#" className="text-slate-700 font-semibold hover:text-indigo-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Main</a>
              <a href="#about" className="text-slate-700 font-semibold hover:text-indigo-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>About</a>
              <a href="#features" className="text-slate-700 font-semibold hover:text-indigo-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Features</a>
              <a href="#reviews" className="text-slate-700 font-semibold hover:text-indigo-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Reviews</a>
              <a href="#contact" className="text-slate-700 font-semibold hover:text-indigo-600 transition-colors" onClick={() => setMobileMenuOpen(false)}>Contact</a>
              <Link
                to="/auth"
                className="text-center px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-full shadow-lg"
                onClick={() => setMobileMenuOpen(false)}
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div 
        onMouseMove={(e) => parallax(e)} 
        className="header w-full min-h-screen relative flex items-center pt-20 pb-10 px-4 sm:px-6 lg:px-8"
      >
        {/* Floating Badges with Parallax */}
        <div className="decorator w-full h-full absolute top-0 left-0 pointer-events-none">
          {/* Desktop badges */}
          <div className="hidden lg:block">
            <div 
              data-aos="fade-up" 
              data-aos-delay="100"
              className="floating-badge text-white text-2xl px-5 py-3 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full shadow-2xl absolute" 
              style={{ transform: `translateX(${100 + dirx}px) translateY(${100 + diry}px)` }}
            >
              CEFR
            </div>
            <div 
              data-aos="fade-up" 
              data-aos-delay="200"
              className="floating-badge text-white text-2xl px-5 py-3 bg-gradient-to-br from-purple-500 to-pink-400 rounded-full shadow-2xl absolute right-32" 
              style={{ transform: `translateX(${-dirx}px) translateY(${150 + diry}px)` }}
            >
              IELTS
            </div>
            <div 
              data-aos="fade-up" 
              data-aos-delay="300"
              className="floating-badge text-white text-2xl px-5 py-3 bg-gradient-to-br from-green-500 to-teal-400 rounded-full shadow-2xl absolute left-1/2" 
              style={{ transform: `translate(${-50 + dirx}%, ${320 + diry}px)` }}
            >
              Reading
            </div>
            <div 
              data-aos="fade-up" 
              data-aos-delay="400"
              className="floating-badge text-white text-2xl px-5 py-3 bg-gradient-to-br from-pink-500 to-rose-400 rounded-full shadow-2xl absolute bottom-32 left-20" 
              style={{ transform: `translateX(${dirx}px) translateY(${-diry}px)` }}
            >
              Listening
            </div>
            <div 
              data-aos="fade-up" 
              data-aos-delay="500"
              className="floating-badge text-white text-2xl px-5 py-3 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full shadow-2xl absolute bottom-40 right-40" 
              style={{ transform: `translateX(${-dirx}px) translateY(${-diry}px)` }}
            >
              Speaking
            </div>
            <div 
              data-aos="fade-up" 
              data-aos-delay="600"
              className="floating-badge text-white text-2xl px-5 py-3 bg-gradient-to-br from-purple-600 to-indigo-500 rounded-full shadow-2xl absolute top-1/3 right-20" 
              style={{ transform: `translateX(${-dirx}px) translateY(${diry}px)` }}
            >
              Writing
            </div>
            <div 
              data-aos="fade-up" 
              data-aos-delay="700"
              className="floating-badge text-white text-2xl px-5 py-3 bg-gradient-to-br from-emerald-500 to-green-400 rounded-full shadow-2xl absolute top-1/2 left-32" 
              style={{ transform: `translateX(${dirx}px) translateY(${-diry}px)` }}
            >
              Grammar
            </div>
          </div>

          {/* Mobile/Tablet badges - static positions */}
          <div className="lg:hidden">
            <div data-aos="fade-up" className="floating-badge text-white text-base sm:text-xl px-3 sm:px-4 py-2 bg-gradient-to-br from-orange-500 to-yellow-400 rounded-full shadow-xl absolute top-20 left-4">CEFR</div>
            <div data-aos="fade-up" data-aos-delay="100" className="floating-badge text-white text-base sm:text-xl px-3 sm:px-4 py-2 bg-gradient-to-br from-purple-500 to-pink-400 rounded-full shadow-xl absolute top-32 right-4">IELTS</div>
            <div data-aos="fade-up" data-aos-delay="200" className="floating-badge text-white text-base sm:text-xl px-3 sm:px-4 py-2 bg-gradient-to-br from-green-500 to-teal-400 rounded-full shadow-xl absolute top-60 left-1/2 -translate-x-1/2">Reading</div>
            <div data-aos="fade-up" data-aos-delay="300" className="floating-badge text-white text-base sm:text-xl px-3 sm:px-4 py-2 bg-gradient-to-br from-pink-500 to-rose-400 rounded-full shadow-xl absolute bottom-80 left-4">Listening</div>
            <div data-aos="fade-up" data-aos-delay="400" className="floating-badge text-white text-base sm:text-xl px-3 sm:px-4 py-2 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-full shadow-xl absolute bottom-72 right-4">Speaking</div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="text-content w-full max-w-5xl mx-auto flex flex-col justify-center items-center gap-8 z-10 text-center">
          <div 
            data-aos="fade-up" 
            className="inline-block px-6 py-2 glass-effect rounded-full text-indigo-600 font-semibold mb-2"
          >
            🚀 Welcome to the Future of Learning
          </div>
          
          <h1 
            data-aos="fade-up" 
            data-aos-delay="100"
            className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-800 leading-tight"
          >
            Train Your English
            <br />
            <span className="gradient-text">Language Skills</span>
            <br />
            With Us
          </h1>
          
          <p 
            data-aos="fade-up" 
            data-aos-delay="200"
            className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed"
          >
            Master English with interactive lessons, real-time feedback, and personalized learning paths designed for your success.
          </p>
          
          <div 
            data-aos="fade-up" 
            data-aos-delay="300"
            className="flex flex-col sm:flex-row items-center gap-4 mt-4"
          >
            <Link
              to="/auth"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-lg font-bold rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50 hover:-translate-y-1"
            >
              Get Started Free
            </Link>
            <a
              href="#about"
              className="w-full sm:w-auto px-8 py-4 glass-effect text-slate-700 text-lg font-bold rounded-full shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
            >
              Learn More
            </a>
          </div>

          {/* Stats */}
          <div 
            data-aos="fade-up" 
            data-aos-delay="400"
            className="grid grid-cols-3 gap-4 sm:gap-8 mt-12 w-full max-w-3xl"
          >
            <div className="glass-effect rounded-2xl p-4 sm:p-6">
              <div className="text-2xl sm:text-4xl font-black gradient-text">10K+</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">Active Learners</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 sm:p-6">
              <div className="text-2xl sm:text-4xl font-black gradient-text">50K+</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">Practice Tests</div>
            </div>
            <div className="glass-effect rounded-2xl p-4 sm:p-6">
              <div className="text-2xl sm:text-4xl font-black gradient-text">95%</div>
              <div className="text-xs sm:text-sm text-slate-600 mt-1">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 scroll-indicator hidden lg:block">
          <a href="#about">
            <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </a>
        </div>
      </div>

      {/* About Section */}
      <section id='about' className="w-full py-16 sm:py-24 lg:py-32 bg-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-200/30 to-transparent blob"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-200/30 to-transparent blob"></div>
        
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <div 
              data-aos="fade-up"
              className="inline-block px-6 py-2 glass-effect rounded-full text-indigo-600 font-semibold mb-4"
            >
              About MockStream
            </div>
            <h2 
              data-aos="fade-up" 
              data-aos-delay="100"
              className="text-3xl sm:text-4xl lg:text-6xl font-black text-slate-800 mb-6"
            >
              Your Path to
              <span className="gradient-text"> English Mastery</span>
            </h2>
            <p 
              data-aos="fade-up" 
              data-aos-delay="200"
              className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed"
            >
              We help learners improve their English skills with interactive lessons, exercises, and expert guidance.
              From CEFR levels to IELTS preparation, our platform covers all your needs.
            </p>
          </div>

          {/* Feature Grid */}
          <div 
            data-aos="fade-up" 
            data-aos-delay="300"
            className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-12"
          >
            <div className="glass-effect rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">Comprehensive Curriculum</h3>
              <p className="text-slate-600 leading-relaxed">
                Cover all aspects of English learning from grammar fundamentals to advanced communication skills.
              </p>
            </div>

            <div className="glass-effect rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">Instant Feedback</h3>
              <p className="text-slate-600 leading-relaxed">
                Get real-time corrections and suggestions to improve your English proficiency rapidly.
              </p>
            </div>

            <div className="glass-effect rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-teal-500 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">Practice Anywhere</h3>
              <p className="text-slate-600 leading-relaxed">
                Access lessons and exercises on any device, anytime, anywhere with our responsive platform.
              </p>
            </div>

            <div className="glass-effect rounded-3xl p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-2xl flex items-center justify-center mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-3">Track Progress</h3>
              <p className="text-slate-600 leading-relaxed">
                Monitor your improvement with detailed analytics and personalized learning insights.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className="w-full py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-slate-50 via-purple-50 to-blue-50 relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-20">
            <div 
              data-aos="fade-up"
              className="inline-block px-6 py-2 glass-effect rounded-full text-indigo-600 font-semibold mb-4"
            >
              Why Choose Us
            </div>
            <h2 
              data-aos="fade-up" 
              data-aos-delay="100"
              className="text-3xl sm:text-4xl lg:text-6xl font-black text-slate-800 mb-6"
            >
              Powerful Features for
              <span className="gradient-text"> Faster Learning</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                icon: <GiTargetArrows className='text-white'/>,
                title: "Interactive Lessons",
                description: "Engaging lessons that adapt to your learning style and progress with AI-powered personalization.",
                gradient: "from-indigo-500 to-purple-600"
              },
              {
                icon: <BookOpen className='text-white'/>,
                title: "Practice Exercises",
                description: "Thousands of exercises for grammar, reading, listening, and speaking with instant feedback.",
                gradient: "from-pink-500 to-rose-600"
              },
              {
                icon: <ChartArea className='text-white'/>,
                title: "Progress Tracking",
                description: "Track your improvements and achieve your goals faster with detailed analytics and insights.",
                gradient: "from-green-500 to-teal-600"
              },
              {
                icon: <GraduationCap className='text-white text-xl'/>,
                title: "Expert Content",
                description: "Learn from professionally designed courses created by language experts and educators.",
                gradient: "from-orange-500 to-yellow-600"
              },
              {
                icon: <MessageCircle className='text-white' />,
                title: "Community Support",
                description: "Connect with learners worldwide, practice together, and get motivated by shared success.",
                gradient: "from-blue-500 to-cyan-600"
              },
              {
                icon: <Trophy className='text-yellow-200' />,
                title: "Certification Ready",
                description: "Prepare for CEFR, IELTS, and other certifications with targeted practice and mock tests.",
                gradient: "from-purple-500 to-indigo-600"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                data-aos="fade-up" 
                data-aos-delay={index * 100}
                className="feature-card glass-effect rounded-3xl p-6 sm:p-8 shadow-xl"
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-2xl flex items-center justify-center mb-6 text-3xl`}>
                  {feature.icon}
                  
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-slate-800 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews Section */}
      <section id='reviews' className="w-full py-16 sm:py-24 lg:py-28 bg-slate-950 relative overflow-hidden">
        <div className="review-orb absolute -top-28 -left-16 w-72 h-72 bg-blue-400"></div>
        <div className="review-orb absolute top-1/3 -right-12 w-72 h-72 bg-orange-400"></div>
        <div className="review-orb absolute -bottom-24 left-1/3 w-72 h-72 bg-emerald-400"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-12 sm:mb-16">
            <div
              data-aos="fade-up"
              className="inline-block px-6 py-2 rounded-full border border-white/20 bg-white/5 text-orange-200 font-semibold mb-4"
            >
              Real Students, Real Voices
            </div>
            <h2
              data-aos="fade-up"
              data-aos-delay="100"
              className="text-3xl sm:text-4xl lg:text-6xl font-black text-white mb-5"
            >
              What users think about
              <span className="block bg-gradient-to-r from-orange-300 via-pink-300 to-blue-300 bg-clip-text text-transparent">
                MockStream
              </span>
            </h2>
            
          </div>

          {feedbacks.length > 0 ? (
            <div
              data-aos="zoom-in-up"
              className="relative w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
                <div className="hidden lg:flex lg:col-span-3">
                  {feedbacks.length > 1 && (
                    <div
                      className={[
                        "review-card w-full rounded-3xl p-5 bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-500",
                        isReviewTransitioning ? "opacity-55 translate-y-1 scale-[0.99]" : "opacity-70 translate-y-0 scale-100",
                      ].join(" ")}
                    >
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3">Previous</p>
                      <p className="font-semibold text-white text-lg">{feedbacks[(activeReview - 1 + feedbacks.length) % feedbacks.length].username}</p>
                      <p className="text-slate-300 mt-3 text-sm line-clamp-6">
                        {feedbacks[(activeReview - 1 + feedbacks.length) % feedbacks.length].text}
                      </p>
                    </div>
                  )}
                </div>

                <div className="lg:col-span-6 relative">
                  <div className="review-glow"></div>
                  <article
                    className={[
                      "review-card review-quote relative rounded-3xl p-7 sm:p-9 bg-gradient-to-br from-white via-slate-100 to-slate-200 shadow-2xl min-h-[320px] flex flex-col justify-between transition-all duration-500",
                      isReviewTransitioning ? "opacity-70 translate-y-1 scale-[0.995]" : "opacity-100 translate-y-0 scale-100",
                    ].join(" ")}
                  >
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.25em] text-slate-500 mb-5">Featured Review</p>
                      <p className="text-slate-700 text-base sm:text-lg leading-relaxed pl-8">
                        {feedbacks[activeReview].text}
                      </p>
                    </div>

                    <div className="mt-8 border-t border-slate-300 pt-5 flex flex-col gap-2">
                      <p className="text-slate-900 font-extrabold text-xl">{feedbacks[activeReview].username}</p>
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <span
                            key={star}
                            className={[
                              "text-2xl leading-none",
                              star <= feedbacks[activeReview].rating ? "text-amber-500" : "text-slate-300",
                            ].join(" ")}
                          >
                            {"\\u2605"}
                          </span>
                        ))}
                        <span className="ml-2 text-sm font-semibold text-slate-600">
                          {feedbacks[activeReview].rating}/5
                        </span>
                      </div>
                    </div>
                  </article>
                </div>

                <div className="hidden lg:flex lg:col-span-3">
                  {feedbacks.length > 1 && (
                    <div
                      className={[
                        "review-card w-full rounded-3xl p-5 bg-white/5 border border-white/10 backdrop-blur-md transition-all duration-500",
                        isReviewTransitioning ? "opacity-55 translate-y-1 scale-[0.99]" : "opacity-70 translate-y-0 scale-100",
                      ].join(" ")}
                    >
                      <p className="text-xs uppercase tracking-[0.25em] text-slate-400 mb-3">Next</p>
                      <p className="font-semibold text-white text-lg">{feedbacks[(activeReview + 1) % feedbacks.length].username}</p>
                      <p className="text-slate-300 mt-3 text-sm line-clamp-6">
                        {feedbacks[(activeReview + 1) % feedbacks.length].text}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-center items-center gap-2">
                {feedbacks.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => goToReview(index)}
                    className={[
                      "h-2.5 rounded-full transition-all duration-300",
                      activeReview === index ? "w-10 bg-white" : "w-2.5 bg-white/35 hover:bg-white/60",
                    ].join(" ")}
                    aria-label={`Go to review ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-3xl border border-white/15 bg-white/5 backdrop-blur-xl p-8 text-center text-slate-200">
              No feedbacks yet. First users are sharing their impressions now.
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section id='contact' className="w-full py-16 sm:py-24 lg:py-32 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 
            data-aos="fade-up"
            className="text-3xl sm:text-4xl lg:text-6xl font-black text-white mb-6"
          >
            Ready to Master English?
          </h2>
          <p 
            data-aos="fade-up" 
            data-aos-delay="100"
            className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Join thousands of learners and improve your English skills with us. Sign up now and start your journey to fluency!
          </p>
          
          <div 
            data-aos="fade-up" 
            data-aos-delay="200"
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/auth"
              className="px-8 sm:px-10 py-4 sm:py-5 bg-white text-indigo-600 text-lg font-bold rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:shadow-white/50 hover:-translate-y-1"
            >
              Start Learning Free
            </Link>
            <Link
              to="/contact"
              className="px-8 sm:px-10 py-4 sm:py-5 bg-transparent border-2 border-white text-white text-lg font-bold rounded-full shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white hover:text-indigo-600"
            >
              Contact Us
            </Link>
          </div>

          {/* Trust badges */}
          <div 
            data-aos="fade-up" 
            data-aos-delay="300"
            className="flex flex-wrap justify-center gap-8 mt-12 sm:mt-16 text-white/80"
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="font-semibold">4.9/5 Rating</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">Trusted by 10K+</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">ISO Certified</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full bg-slate-900 text-white py-12 sm:py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 sm:gap-12 mb-8">
            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <img src={logo} alt="MockStream" className="w-12 h-12 rounded-full" />
                <span className="text-2xl font-bold">MockStream</span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-md">
                Empowering learners worldwide to master English through innovative, interactive, and engaging learning experiences.
              </p>
              <div className="flex gap-4 mt-6">
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
                </a>
                <a href="#" className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/></svg>
                </a>
                <a
                  href="https://t.me/mock_stream"
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 bg-slate-800 rounded-full flex items-center justify-center hover:bg-indigo-600 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M21.94 2.34a1.5 1.5 0 00-1.62-.22L2.2 10.06a1.5 1.5 0 00.06 2.78l4.74 1.6 2.1 6.33a1.5 1.5 0 002.7.27l2.67-3.67 4.67 3.43a1.5 1.5 0 002.36-.91l2.74-15.25a1.5 1.5 0 00-2.3-1.3zM8.48 13.78l9.3-7.4-7.55 8.23-.28 3.52-1.3-3.93-3.7-1.25 3.53-.99z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-bold mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Home</a></li>
                <li><a href="#about" className="text-slate-400 hover:text-white transition-colors">About</a></li>
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#contact" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-bold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">CEFR Tests</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">IELTS Prep</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Grammar Guide</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-slate-400 text-sm text-center sm:text-left">
              Made by <span className="text-white font-semibold">Codecraft Co.</span> • &copy; 2025. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
