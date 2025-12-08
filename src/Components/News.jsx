import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaCalendar, FaUser } from 'react-icons/fa'
import api from '../api'

const emojis = ["👍", "🔥", "💖", "👎", "🫨"]

export default function News() {
    const { slug } = useParams()
    const navigate = useNavigate()
    const [news, setNews] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [user,setUser] = useState(null)

    useEffect(() => {
        fetchNews()

        api.get("/user/me").then(res=>{
            if(res.status===200){
                setUser(res.data)
            }
        }).catch(err=>{
            alert("Error! Reload page.")
        })
    }, [slug])

    const fetchNews = async () => {
        try {
            setLoading(true)
            setError(null)
            // Slug yoki ID orqali news'ni fetch qilish
            const res = await api.get(`/news/${slug}`)
            setNews(res.data)
        } catch (err) {
            console.error('Error fetching news:', err)
            setError('News topilmadi')
        } finally {
            setLoading(false)
        }
    }

    // Format date
    const formatDate = (dateString) => {
        if (!dateString) return ''
        try {
            return new Date(dateString).toLocaleDateString('uz-UZ', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            })
        } catch {
            return dateString
        }
    }
    

    if (loading) {
        return (
            <div className='w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-lg flex items-center justify-center'>
                <div className='text-center'>
                    <div className='inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
                    <p className='mt-4 text-gray-600 dark:text-gray-400'>Yuklanyapti...</p>
                </div>
            </div>
        )
    }

    if (error || !news || !user) {
        return (
            <div className='w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-lg flex flex-col items-center justify-center'>
                <div className='text-center max-w-md'>
                    <h2 className='text-3xl font-bold text-gray-800 dark:text-white mb-4'>❌ {error || 'News topilmadi'}</h2>
                    <button
                        onClick={() => navigate(-1)}
                        className='px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-all'
                    >
                        ← Orqaga qaytish
                    </button>
                </div>
            </div>
        )
    }

    const react = (emoji) => {
        api.post(`/news/react/${news.id}`, { emoji }).then(res => {
            
        }).catch(err => {
            // console.log(err);
        })
    }

    return (
        <div className='w-full min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-8 rounded-lg'>
            <div className='max-w-4xl mx-auto'>
                {/* Back Button */}
                <button
                    onClick={() => navigate("/dashboard")}
                    className='flex items-center gap-2 px-4 py-2 mb-8 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-lg hover:shadow-lg transition-all font-semibold'
                >
                    <FaArrowLeft /> Orqaga
                </button>

                {/* Hero Section with Gradient */}
                <div className='bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 dark:from-blue-700 dark:via-purple-800 dark:to-pink-700 rounded-2xl p-8 text-white mb-8 shadow-2xl'>
                    {/* Meta Info */}
                    <div className='flex flex-wrap gap-6 mb-6 text-sm'>
                        {news.created_at && (
                            <div className='flex items-center gap-2'>
                                <FaCalendar className='text-cyan-200' />
                                <span className='text-blue-100'>{formatDate(news.created_at)}</span>
                            </div>
                        )}
                        {news.author && (
                            <div className='flex items-center gap-2'>
                                <FaUser className='text-cyan-200' />
                                <span className='text-blue-100'>{news.author}</span>
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <h1 className='text-5xl font-bold leading-tight drop-shadow-lg mb-4'>{news.title}</h1>

                    {/* Short Description */}
                    {news.description && (
                        <p className='text-lg text-blue-100 drop-shadow-md'>{news.description}</p>
                    )}
                </div>

                {/* Content Card */}
                <div className='bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 mb-8'>
                    {/* Body Content - HTML Render */}
                    {news.body && (
                        <div className='prose prose-invert max-w-none dark:prose-invert'>
                            <div
                                className='text-gray-800 dark:text-gray-200 leading-relaxed text-base'
                                dangerouslySetInnerHTML={{ __html: news.body }}
                            />
                        </div>
                    )}

                    <div className="w-full h-max mt-5 flex items-center gap-4 pl-5">
                        {emojis.map(emoji => {
                            return (
                                <span onClick={() => react(emoji)} className={`${news.reactions[emoji]?.includes(user.id)? "bg-blue-500" : "bg-white dark:bg-gray-700"} relative flex items-center gap-3 px-3 py-1   rounded-full shadow-lg shadow-black/50 hover:shadow-xl hover:shadow-blue-500/70 transition-all cursor-pointer z-10`} style={{ textShadow: '0 0 10px rgba(59, 130, 246, 0.5)' }}>
                                    {emoji} {news.reactions[emoji]?.length || 0}
                                </span>
                            )
                        })}
                    </div>
                </div>

                {/* Related News or Back to List */}
                <div className='mt-8 text-center'>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className='px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all hover:shadow-lg'
                    >
                        ← Barcha newslar
                    </button>
                </div>
            </div>
        </div>
    )
}
