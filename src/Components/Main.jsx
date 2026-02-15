import React, { useState, useEffect } from 'react'
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'
import api from '../api'
import { Link } from 'react-router-dom'

export default function Main() {
    const [currentSlide, setCurrentSlide] = useState(0)
    const [autoPlay, setAutoPlay] = useState(true)

    const [slides, setSlides] = useState([]);

    useEffect(() => {
        if (!autoPlay) return

        const timer = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length)
        }, 5000)

        api.get("/news/").then(res=>{
            setSlides(res.data);
        }).catch(err=>{
            console.log(err);
        })
        return () => clearInterval(timer)

        
    }, [autoPlay, slides.length])

    const nextSlide = () => {
        setCurrentSlide((prev) => (prev + 1) % slides.length)
        setAutoPlay(false)
        setTimeout(() => setAutoPlay(true), 5000)
    }

    const prevSlide = () => {
        setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
        setAutoPlay(false)
        setTimeout(() => setAutoPlay(true), 5000)
    }

    const goToSlide = (index) => {
        setCurrentSlide(index)
        setAutoPlay(false)
        setTimeout(() => setAutoPlay(true), 5000)
    }

    return (
        <div className='w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-lg'>
            <section className="news w-full h-max flex flex-col gap-6">
                {/* Header */}
                <div className="space-y-2">
                    <h3 className="text-4xl font-bold text-gray-800 dark:text-white">What's New</h3>
                    <p className="text-gray-600 dark:text-gray-400">Check out our latest course updates and features</p>
                </div>

                {/* Carousel Container */}
                <div className="relative w-full h-96 rounded-2xl overflow-hidden shadow-2xl dark:shadow-cyan-500/20 group">
                    {/* Slides */}
                    <div className="relative w-full h-full z-0">
                        {slides.map((slide, index) => (
                            <Link
                                key={slide.id}
                                to={`/news/${slide.slug}`}
                                className={`absolute w-full h-full transition-all duration-1000 ease-in-out ${
                                    index === currentSlide 
                                        ? 'opacity-100 scale-100' 
                                        : 'opacity-0 scale-95'
                                }`}
                            >
                                {/* Gradient Background - Chiroyli */}
                                <div className='absolute inset-0 w-full h-full bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 dark:from-blue-700 dark:via-purple-800 dark:to-pink-700 z-0' />

                                {/* Content */}
                                <div className="absolute inset-0 flex flex-col justify-between p-8 text-white z-20 overflow-hidden">
                                    {/* Top Section */}
                                    <div className="flex justify-between items-start flex-shrink-0">
                                        <div>
                                            <p className="text-sm font-semibold text-cyan-200 uppercase tracking-wider">📰 Featured News</p>
                                        </div>
                                        <div className="backdrop-blur-md bg-white/10 px-4 py-2 rounded-full border border-white/30">
                                            <p className="text-sm font-semibold">{currentSlide + 1} / {slides.length}</p>
                                        </div>
                                    </div>

                                    {/* Bottom Section */}
                                    <div className="space-y-3 animate-fade-in flex flex-col">
                                        <h2 className="text-5xl font-bold leading-tight drop-shadow-lg flex-shrink-0">{slide.title}</h2>
                                        <div className="text-lg text-blue-100 drop-shadow-md line-clamp-3 flex-shrink-0" dangerouslySetInnerHTML={{ __html: slide.body }}></div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>

                    {/* Navigation Arrows */}
                    <button
                        onClick={prevSlide}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-50 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                        <FaChevronLeft size={20} />
                    </button>

                    <button
                        onClick={nextSlide}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-50 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100"
                    >
                        <FaChevronRight size={20} />
                    </button>

                    {/* Pagination Dots */}
                    <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex gap-3">
                        {slides.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => goToSlide(index)}
                                className={`transition-all duration-300 rounded-full backdrop-blur-md ${
                                    index === currentSlide
                                        ? 'bg-white w-8 h-3'
                                        : 'bg-white/50 hover:bg-white/70 w-3 h-3'
                                }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Info Cards Below */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
                    {slides.map((slide, index) => (
                        <div
                            key={slide.id}
                            onClick={() => goToSlide(index)}
                            className={`p-6 rounded-xl cursor-pointer max-h-30 overflow-hidden transition-all duration-300 transform hover:scale-105 ${
                                index === currentSlide
                                    ? 'bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 text-white shadow-2xl'
                                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-white hover:shadow-lg'
                            }`}
                        >
                            <h4 className="font-bold text-sm line-clamp-2">{slide.title}</h4>
                            <div dangerouslySetInnerHTML={{ __html: slide.body }} className={`text-xs mt-2 line-clamp-2 ${index === currentSlide ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'}`}>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            <style jsx>{`
                @keyframes fadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fadeIn 0.6s ease-out;
                }
            `}</style>
        </div>
    )
}