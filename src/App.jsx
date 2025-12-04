import React, { useEffect, useState } from 'react'
import logo from "./assets/logo.jpg"
import { Link } from 'react-router-dom'
import Aos from 'aos';
import "aos/dist/aos.css";

export default function App() {
  const [dirx, setDirx] = useState(0);
  const [diry, setDiry] = useState(0);
  function parallax(e) {
    setDirx(Math.floor(e.clientX / 100));
    setDiry(Math.floor(e.clientY / 100));
  }

  useEffect(() => {
    Aos.init({
      duration: 1000, // animatsiya davomiyligi (ms)
      offset: 200,    // qachon animatsiya boshlanishi (px)
      easing: "ease", // animatsiya effekti
      once: false,     // scroll qilinganida faqat bir marta animatsiya bo‘lsin
    });

    
  }, []);

  return (
    <div className='w-full h-screen flex flex-col bg-slate-200 relative'>
      <div className="nav w-full h-max py-3 flex items-center justify-center fixed top-0 z-[999]">
        <ul className="nav-items flex items-center justify-center gap-5 text-slate-800">
          <li className="nav-item text-2xl font-semibold cursor-pointer"><a href="#">Main</a></li>
          <li className="nav-item text-2xl font-semibold cursor-pointer"><a href="#about">About</a></li>
          <img src={logo} alt="" className='w-15 h-15 rounded-full cursor-pointer transition-all duration-500 hover:scale-110' />
          <li className="nav-item text-2xl font-semibold cursor-pointer"><a href="#features">Features</a></li>
          <li className="nav-item text-2xl font-semibold cursor-pointer"><a href="#contact">Contact</a></li>
        </ul>
      </div>
      <div onMouseMove={(e) => parallax(e)} className="header w-full min-h-screen relative flex items-center ">
        <div className="decorator w-full h-full absolute top-0 left-0 bg-gradient-to-t from-blue-300 to-transparent p-15">
          <div data-aos="bounce" className="text-white text-3xl px-5  py-3 bg-gradient-to-t from-orange-500 to-yellow-400 w-max h-max rounded-full shadow-xl absolute" style={{ transform: `translateX(${100 + dirx}px) translateY(${50 + diry}px)` }}>CEFR</div>
          <div data-aos="bounce" className="text-white text-3xl px-5  py-3 bg-gradient-to-t from-purple-500 to-cyan-400 w-max h-max rounded-full shadow-xl absolute" style={{ transform: `translateX(${1600 + dirx}px) translateY(${110 + diry}px)` }}>IELTS</div>
          <div data-aos="bounce" className="text-white text-3xl px-5  py-3 bg-gradient-to-t from-green-500 to-cyan-400 w-max h-max rounded-full shadow-xl absolute" style={{ transform: `translateX(${900 + dirx}px) translateY(${260 + diry}px)` }}>Reading</div>
          <div data-aos="bounce" className="text-white text-3xl px-5  py-3 bg-gradient-to-t from-pink-500 to-orange-400 w-max h-max rounded-full shadow-xl absolute" style={{ transform: `translateX(${200 + dirx}px) translateY(${700 + diry}px)` }}>Listening</div>
          <div data-aos="bounce" className="text-white text-3xl px-5  py-3 bg-gradient-to-t from-blue-400 to-cyan-500 w-max h-max rounded-full shadow-xl absolute" style={{ transform: `translateX(${1200 + dirx}px) translateY(${600 + diry}px)` }}>Speaking</div>
          <div data-aos="bounce" className="text-white text-3xl px-5  py-3 bg-gradient-to-t from-purple-500 to-pink-400 w-max h-max rounded-full shadow-xl absolute" style={{ transform: `translateX(${1500 + dirx}px) translateY(${400 + diry}px)` }}>Writing</div>
          <div data-aos="bounce" className="text-white text-3xl px-5  py-3 bg-gradient-to-t from-green-400 to-teal-500 w-max h-max rounded-full shadow-xl absolute" style={{ transform: `translateX(${100 + dirx}px) translateY(${400 + diry}px)` }}>Grammar</div>
        </div>
        <div className="text-content w-full h-full flex flex-col justify-center items-center p-5 gap-10 z-[1]">
          <h1 className="text-slate-800 text-6xl font-semibold">Train your English language skills with us.</h1>
          <div className="buttons flex items-center gap-5">
            <Link
              to="/auth"
              className="text-xl px-6 py-3 bg-blue-500 text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:bg-blue-600 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              Get started
            </Link>
            <a
              href="#about"
              className="text-xl px-6 py-3 bg-transparent border-2 border-blue-500 text-blue-500 font-semibold rounded-full shadow-lg transition-all duration-300 hover:bg-blue-600 hover:text-white hover:scale-105 hover:shadow-xl active:scale-95"
            >
              See more
            </a>
          </div>
        </div>
      </div>

      <section id='about' className="w-full py-32 bg-slate-100 flex flex-col items-center gap-10">
        <h2 className="text-5xl font-bold text-slate-800">About Us</h2>
        <p className="text-xl text-slate-700 max-w-3xl text-center">
          We help learners improve their English skills with interactive lessons, exercises, and expert guidance.
          From CEFR levels to IELTS preparation, our platform covers all your needs.
        </p>
      </section>

      <section id='features' className="w-full py-32 bg-slate-200 flex flex-col items-center gap-16">
        <h2 className="text-5xl font-bold text-slate-800">Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 px-5">
          <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl text-slate-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <h3 className="text-2xl font-semibold mb-3">Interactive Lessons</h3>
            <p className="text-center">Engaging lessons that adapt to your learning style and progress.</p>
          </div>
          <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl text-slate-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <h3 className="text-2xl font-semibold mb-3">Practice Exercises</h3>
            <p className="text-center">Thousands of exercises for grammar, reading, listening, and speaking.</p>
          </div>
          <div className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-xl text-slate-800 transition-all duration-300 hover:scale-105 hover:shadow-2xl">
            <h3 className="text-2xl font-semibold mb-3">Progress Tracking</h3>
            <p className="text-center">Track your improvements and achieve your goals faster.</p>
          </div>
        </div>
      </section>


      <section id='contact' className="w-full py-32 bg-gradient-to-t from-blue-500 to-cyan-400 flex flex-col items-center gap-8 text-white">
        <h2 className="text-5xl font-bold">Get Started Today!</h2>
        <p className="text-xl max-w-3xl text-center">
          Join thousands of learners and improve your English skills with us. Sign up now and start your journey!
        </p>
        <div className="flex gap-5">
          <Link
            to="/auth"
            className="px-8 py-4 bg-white text-blue-600 font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:bg-blue-600 hover:text-white"
          >
            Get Started
          </Link>
          <Link
            to="/contact"
            className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-full shadow-lg transition-all duration-300 hover:scale-105 hover:bg-white hover:text-blue-600"
          >
            Contact Us
          </Link>
        </div>
      </section>
      <footer className="w-full bg-slate-800 text-white py-10 flex flex-col md:flex-row justify-between items-center px-10 gap-5">
        <div className="text-lg font-semibold">
          MockStream
        </div>

        <div className="flex gap-5">
          <a href="#about" className="hover:text-blue-400 transition-colors">About</a>
          <a href="#features" className="hover:text-purple-400 transition-colors">Features</a>
          <a href="#contact" className="hover:text-teal-400 transition-colors">Contact</a>
        </div>

        <div className="text-center md:text-right text-sm">
          Made by Codecraft Co. <br /> &copy; 2025. All rights reserved.
        </div>
      </footer>

    </div>
  )
}
