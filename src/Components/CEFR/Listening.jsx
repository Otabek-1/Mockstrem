import React, { useState, useRef, useEffect } from 'react'
import { useParams, useSearchParams, useNavigate } from 'react-router-dom'
import api from '../../api'
import { FaSmile, FaFrown, FaMeh, FaArrowRight, FaLock } from 'react-icons/fa'


// 🧪 TEST MODE FEEDBACK MODAL
const TestModeFeedbackModal = ({ showFeedback, score, navigate }) => {
    if (!showFeedback) return null

    const handleLogin = () => {
        navigate('/auth')
    }

    const getEmoji = () => {
        if (score >= 80) return <FaSmile className="text-5xl text-yellow-400 animate-bounce" />
        if (score >= 50) return <FaMeh className="text-5xl text-blue-400 animate-bounce" />
        return <FaFrown className="text-5xl text-orange-400 animate-bounce" />
    }

    const getFeedbackText = () => {
        if (score >= 80) return "Amazing! You did great! 🎉"
        if (score >= 60) return "Good job! Keep practicing! 💪"
        if (score >= 40) return "Nice try! Keep improving! 🚀"
        return "Keep practicing, you'll get better! 📚"
    }

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[9999] flex items-center justify-center p-4">
            <div className="bg-gradient-to-br from-white via-blue-50 to-cyan-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 rounded-2xl p-6 max-w-sm w-full shadow-2xl border-2 border-cyan-300 dark:border-cyan-600 transform transition-all animate-in fade-in scale-95 duration-300">
                
                {/* Header */}
                <div className="text-center mb-6">
                    <div className="flex justify-center mb-3">
                        {getEmoji()}
                    </div>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent mb-1">
                        Have you enjoyed?
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-sm">Yoqdimi? 👀</p>
                </div>

                {/* Score Display */}
                <div className="bg-gradient-to-r from-cyan-500 to-blue-500 rounded-xl p-4 text-white text-center mb-5 shadow-lg">
                    <p className="text-xs opacity-90 mb-1">Your Score</p>
                    <p className="text-4xl font-bold">{score}%</p>
                    <p className="text-xs opacity-90 mt-1">
                        {score >= 80 ? "Excellent! 🌟" : score >= 60 ? "Good! 👍" : score >= 40 ? "Average 😊" : "Keep trying! 💪"}
                    </p>
                </div>

                {/* Feedback Text */}
                <div className="bg-blue-100 dark:bg-blue-900/30 border-l-4 border-cyan-500 rounded-lg p-3 mb-5">
                    <p className="text-slate-800 dark:text-slate-200 font-semibold text-center text-sm">
                        {getFeedbackText()}
                    </p>
                </div>

                {/* Features Info */}
                <div className="bg-white dark:bg-gray-700/50 rounded-lg p-3 mb-5 border border-gray-200 dark:border-gray-600">
                    <p className="text-xs text-gray-700 dark:text-gray-300 mb-2 font-semibold">
                        <FaLock className="inline mr-1 text-cyan-600" />
                        Unlock more features:
                    </p>
                    <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                        <li>✅ Save results</li>
                        <li>✅ Track progress</li>
                        <li>✅ Analytics</li>
                        <li>✅ Premium</li>
                    </ul>
                </div>

                {/* Login Button */}
                <button
                    onClick={handleLogin}
                    className="w-full py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center gap-2 text-sm"
                >
                    <FaArrowRight size={14} />
                    Login Now
                </button>

                {/* Divider */}
                <div className="relative my-3">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                    </div>
                    <div className="relative flex justify-center text-xs">
                        <span className="px-2 bg-gradient-to-br from-white via-blue-50 to-cyan-50 dark:from-gray-800 dark:via-gray-700 dark:to-gray-600 text-gray-500 dark:text-gray-400">
                            or
                        </span>
                    </div>
                </div>

                {/* Trial Info */}
                <p className="text-center text-xs text-gray-600 dark:text-gray-400">
                    Create account to unlock all features 🚀
                </p>
            </div>
        </div>
    )
}

const Part1 = ({ data, answers, setAnswers }) => {
    const handleAnswerChange = (questionNum, optionIdx) => {
        setAnswers(prev => ({
            ...prev,
            part_1: {
                ...prev.part_1,
                [questionNum]: optionIdx
            }
        }))
    }

    const totalAnswered = Object.keys(answers.part_1 || {}).length
    const total = 8

    return (
        <div className='w-full h-max bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden'>
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 px-6 sm:px-8 py-6 sm:py-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className='text-2xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3'>
                        <span className="bg-white/20 px-4 py-1 rounded-full text-lg">Part 1</span>
                    </h2>
                    <p className='text-blue-100 text-sm sm:text-base leading-relaxed'>
                        You will hear some sentences. You will hear each sentence twice. Choose the correct reply to each sentence (A, B or C).
                    </p>
                </div>
            </div>

            <div className="px-6 sm:px-8 py-8 sm:py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 flex justify-between items-center">
                        <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300'>Questions</h3>
                        <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                            <span className='text-sm font-bold text-blue-700 dark:text-blue-300'>
                                {totalAnswered}/{total}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-5 sm:gap-6">
                        {data?.map((q, idx) => {
                            const questionNum = idx + 1
                            const isAnswered = answers.part_1?.[questionNum] !== undefined
                            
                            return (
                                <div key={idx} className={`group border-2 rounded-xl p-5 sm:p-6 transition-all duration-300 ${
                                    isAnswered 
                                        ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-600' 
                                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500'
                                }`}>
                                    <div className="flex items-start gap-4 mb-4">
                                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                            {questionNum}
                                        </div>
                                        <div className="flex-1">
                                            {isAnswered && (
                                                <span className='inline-block text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full mb-2'>
                                                    ✓ Answered
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 ml-0 sm:ml-2">
                                        {q?.map((opt, optIdx) => {
                                            const isSelected = answers.part_1?.[questionNum] === optIdx
                                            
                                            return (
                                                <label key={optIdx} className={`flex items-center gap-3 sm:gap-4 cursor-pointer p-3 sm:p-4 rounded-lg transition-all duration-200 ${
                                                    isSelected
                                                        ? 'bg-white dark:bg-gray-600 border-2 border-green-500 shadow-md'
                                                        : 'bg-white dark:bg-gray-600/50 border-2 border-transparent hover:bg-white/80 dark:hover:bg-gray-600'
                                                }`}>
                                                    <div className="flex-shrink-0 relative">
                                                        <input
                                                            type="radio"
                                                            name={`q1-${questionNum}`}
                                                            value={optIdx}
                                                            checked={isSelected}
                                                            onChange={() => handleAnswerChange(questionNum, optIdx)}
                                                            className="w-5 h-5 accent-green-500 cursor-pointer"
                                                        />
                                                    </div>
                                                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                                                        <span className={`font-bold text-base sm:text-lg min-w-fit ${
                                                            isSelected ? 'text-green-600' : 'text-slate-600 dark:text-slate-400'
                                                        }`}>
                                                            {String.fromCharCode(65 + optIdx)})
                                                        </span>
                                                        <span className='text-slate-800 dark:text-slate-200 text-sm sm:text-base leading-relaxed'>
                                                            {opt}
                                                        </span>
                                                    </div>
                                                </label>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-10 sm:mt-12">
                        <div className="flex justify-between items-center mb-2">
                            <span className='text-sm font-semibold text-slate-600 dark:text-slate-400'>Progress</span>
                            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>{Math.round((totalAnswered/total)*100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                                style={{width: `${(totalAnswered/total)*100}%`}}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Part2 = ({ data, answers, setAnswers }) => {
    const handleInputChange = (idx, value) => {
        setAnswers(prev => ({
            ...prev,
            part_2: {
                ...prev.part_2,
                [idx]: value
            }
        }))
    }

    const totalFilled = Object.keys(answers.part_2 || {}).filter(k => answers.part_2[k]?.trim()).length
    const total = 6

    return (
        <div className='w-full h-max bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden'>
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 dark:from-purple-700 dark:to-pink-700 px-6 sm:px-8 py-6 sm:py-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className='text-2xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3'>
                        <span className="bg-white/20 px-4 py-1 rounded-full text-lg">Part 2</span>
                    </h2>
                    <p className='text-purple-100 text-sm sm:text-base leading-relaxed'>
                        You will hear someone giving a talk. For each question, fill in the missing information in the numbered space.
                    </p>
                </div>
            </div>

            <div className="px-6 sm:px-8 py-8 sm:py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-purple-50 dark:bg-purple-900/20 border-2 border-purple-200 dark:border-purple-600 rounded-xl p-4 sm:p-6 mb-8">
                        <p className='text-sm font-semibold text-purple-700 dark:text-purple-300 mb-1'>Important:</p>
                        <p className='text-sm sm:text-base text-purple-800 dark:text-purple-200'>
                            Write ONE WORD and/or A NUMBER for each answer.
                        </p>
                    </div>

                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/20 dark:to-pink-900/20 border-l-4 border-purple-600 rounded-lg p-5 sm:p-6 mb-8">
                        <h3 className='text-2xl sm:text-3xl font-bold text-purple-700 dark:text-purple-300 italic'>
                            {data?.[0]?.before || "Win a 'dream night' at the theatre"}
                        </h3>
                    </div>

                    <div className="mb-8 flex justify-between items-center">
                        <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300'>Questions</h3>
                        <div className="bg-purple-100 dark:bg-purple-900/30 px-4 py-2 rounded-full">
                            <span className='text-sm font-bold text-purple-700 dark:text-purple-300'>
                                {totalFilled}/{total}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:gap-5">
                        {data?.map((q, idx) => {
                            const isFilled = answers.part_2?.[idx]?.trim()
                            
                            return (
                                <div key={idx} className={`group border-2 rounded-xl p-4 sm:p-5 transition-all duration-300 ${
                                    isFilled 
                                        ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-300 dark:border-purple-600' 
                                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-purple-300 dark:hover:border-purple-500'
                                }`}>
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                            {9 + idx}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {isFilled && (
                                                <span className='inline-block text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/40 px-3 py-1 rounded-full mb-2'>
                                                    ✓ Filled
                                                </span>
                                            )}
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className='text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 flex-shrink-0'>
                                                    {q?.label}:
                                                </span>
                                                <span className='text-sm sm:text-base text-slate-700 dark:text-slate-300'>
                                                    {q?.before}
                                                </span>
                                                <input
                                                    type="text"
                                                    className="flex-shrink-0 border-b-2 border-purple-500 focus:outline-none focus:border-purple-700 px-2 py-1 min-w-[80px] sm:min-w-[100px] bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm sm:text-base"
                                                    value={answers.part_2?.[idx] || ''}
                                                    onChange={(e) => handleInputChange(idx, e.target.value)}
                                                    maxLength="20"
                                                    placeholder="..."
                                                />
                                                <span className='text-sm sm:text-base text-slate-700 dark:text-slate-300 flex-shrink-0'>
                                                    {q?.after}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-10 sm:mt-12">
                        <div className="flex justify-between items-center mb-2">
                            <span className='text-sm font-semibold text-slate-600 dark:text-slate-400'>Progress</span>
                            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>{Math.round((totalFilled/total)*100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-full rounded-full transition-all duration-500"
                                style={{width: `${(totalFilled/total)*100}%`}}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Part3 = ({ data, answers, setAnswers }) => {
    const [selections, setSelections] = useState({})

    const handleSelect = (speakerIdx, optionIdx) => {
        setSelections(prev => ({
            ...prev,
            [speakerIdx]: optionIdx
        }))
        setAnswers(prev => ({
            ...prev,
            part_3: {
                ...prev.part_3,
                [speakerIdx]: optionIdx
            }
        }))
    }

    const totalMatched = Object.keys(selections).length
    const total = data?.speakers?.length || 4

    return (
        <div className='w-full h-max bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden'>
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 px-6 sm:px-8 py-6 sm:py-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className='text-2xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3'>
                        <span className="bg-white/20 px-4 py-1 rounded-full text-lg">Part 3</span>
                    </h2>
                    <p className='text-green-100 text-sm sm:text-base leading-relaxed'>
                        You will hear people talking. Match each speaker (15-18) to the subjects (A-F). There are TWO EXTRA places which you do not need to use.
                    </p>
                </div>
            </div>

            <div className="px-6 sm:px-8 py-8 sm:py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 flex justify-between items-center">
                        <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300'>Matches</h3>
                        <div className="bg-green-100 dark:bg-green-900/30 px-4 py-2 rounded-full">
                            <span className='text-sm font-bold text-green-700 dark:text-green-300'>
                                {totalMatched}/{total}
                            </span>
                        </div>
                    </div>

                    {/* Select interface */}
                    <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-200 dark:border-green-600 rounded-xl p-4 sm:p-6 mb-8">
                        <p className='text-sm font-semibold text-green-800 dark:text-green-300 mb-4'>Select topic for each speaker:</p>
                        <div className="space-y-3">
                            {data?.speakers?.map((speaker, speakerIdx) => {
                                const isMatched = selections[speakerIdx] !== undefined
                                
                                return (
                                    <div key={speakerIdx} className={`border-2 rounded-xl p-3 sm:p-4 transition-all duration-300 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${
                                        isMatched 
                                            ? 'bg-white dark:bg-gray-700 border-green-400 dark:border-green-600' 
                                            : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-600'
                                    }`}>
                                        <div className="flex items-center gap-3 flex-1 min-w-0">
                                            <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                                {15 + speakerIdx}
                                            </div>
                                            <span className='text-sm sm:text-base font-semibold text-slate-700 dark:text-slate-300 flex-shrink-0'>
                                                {speaker}:
                                            </span>
                                        </div>
                                        <select
                                            value={selections[speakerIdx] ?? ''}
                                            onChange={(e) => handleSelect(speakerIdx, parseInt(e.target.value))}
                                            className='flex-1 sm:flex-0 sm:min-w-[150px] px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-green-400 dark:border-green-600 rounded-lg focus:outline-none focus:border-green-600 dark:focus:border-green-400 bg-white dark:bg-gray-600 text-slate-800 dark:text-slate-200 font-medium'
                                        >
                                            <option value="">Select topic</option>
                                            {data?.options?.map((option, optIdx) => (
                                                <option key={optIdx} value={optIdx}>
                                                    {String.fromCharCode(65 + optIdx)}) {option}
                                                </option>
                                            ))}
                                        </select>
                                        {isMatched && (
                                            <span className='text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full flex-shrink-0'>
                                                ✓ {String.fromCharCode(65 + selections[speakerIdx])}
                                            </span>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-10 sm:mt-12">
                        <div className="flex justify-between items-center mb-2">
                            <span className='text-sm font-semibold text-slate-600 dark:text-slate-400'>Progress</span>
                            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>{Math.round((totalMatched/total)*100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-green-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                                style={{width: `${(totalMatched/total)*100}%`}}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Part4 = ({ data, answers, setAnswers }) => {
    const handleInputChange = (idx, value) => {
        setAnswers(prev => ({
            ...prev,
            part_4: {
                ...prev.part_4,
                [idx]: value
            }
        }))
    }

    const totalAnswered = Object.keys(answers.part_4 || {}).filter(k => answers.part_4[k]).length
    const total = data?.questions?.length || 5

    return (
        <div className='w-full h-max bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden'>
            <div className="bg-gradient-to-r from-orange-600 to-red-600 dark:from-orange-700 dark:to-red-700 px-6 sm:px-8 py-6 sm:py-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className='text-2xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3'>
                        <span className="bg-white/20 px-4 py-1 rounded-full text-lg">Part 4</span>
                    </h2>
                    <p className='text-orange-100 text-sm sm:text-base leading-relaxed'>
                        You will hear someone giving a talk. Label the places (19-23) on the map (A-I). There are extra options which you do not need to use.
                    </p>
                </div>
            </div>

            <div className="px-6 sm:px-8 py-8 sm:py-12">
                <div className="max-w-5xl mx-auto">
                    {/* Map */}
                    <div className="mb-8 sm:mb-10 flex flex-col items-center gap-4">
                        <div className="w-full max-w-3xl flex justify-center">
                            <div className="rounded-xl border-4 border-orange-300 dark:border-orange-600 shadow-xl overflow-hidden">
                                <img
                                    src={data?.mapUrl}
                                    alt="Map"
                                    className="w-full h-auto"
                                />
                            </div>
                        </div>

                        {/* Map Labels */}
                        <div className="flex gap-2 flex-wrap justify-center mt-4">
                            {data?.mapLabels?.map(label => (
                                <div key={label} className="px-3 sm:px-4 py-1 sm:py-2 bg-orange-100 dark:bg-orange-900/30 rounded-full border-2 border-orange-400 dark:border-orange-600">
                                    <span className="font-bold text-orange-700 dark:text-orange-300 text-sm sm:text-base">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mb-8 flex justify-between items-center">
                        <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300'>Places to identify</h3>
                        <div className="bg-orange-100 dark:bg-orange-900/30 px-4 py-2 rounded-full">
                            <span className='text-sm font-bold text-orange-700 dark:text-orange-300'>
                                {totalAnswered}/{total}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-3 sm:gap-4">
                        {data?.questions?.map((q, idx) => {
                            const isAnswered = answers.part_4?.[idx]
                            
                            return (
                                <div key={idx} className={`group border-2 rounded-xl p-4 sm:p-5 transition-all duration-300 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${
                                    isAnswered 
                                        ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-300 dark:border-orange-600' 
                                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-orange-300 dark:hover:border-orange-500'
                                }`}>
                                    <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                            {q?.num}
                                        </div>
                                        <span className='text-sm sm:text-base text-slate-700 dark:text-slate-300 font-medium flex-shrink-0'>
                                            {q?.place}:
                                        </span>
                                    </div>
                                    <select
                                        value={answers.part_4?.[idx] || ''}
                                        onChange={(e) => handleInputChange(idx, e.target.value)}
                                        className='flex-1 sm:flex-0 sm:min-w-[120px] px-3 sm:px-4 py-2 text-sm sm:text-base border-2 border-orange-400 dark:border-orange-600 rounded-lg focus:outline-none focus:border-orange-600 dark:focus:border-orange-400 bg-white dark:bg-gray-600 text-slate-800 dark:text-slate-200 font-medium'
                                    >
                                        <option value="">Select location</option>
                                        {data?.mapLabels?.map(label => (
                                            <option key={label} value={label}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    {isAnswered && (
                                        <span className='text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/40 px-3 py-1 rounded-full flex-shrink-0'>
                                            ✓ {isAnswered}
                                        </span>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-10 sm:mt-12">
                        <div className="flex justify-between items-center mb-2">
                            <span className='text-sm font-semibold text-slate-600 dark:text-slate-400'>Progress</span>
                            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>{Math.round((totalAnswered/total)*100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-500"
                                style={{width: `${(totalAnswered/total)*100}%`}}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Part5 = ({ data, answers, setAnswers }) => {
    const handleAnswerChange = (extractIdx, questionIdx, optionIdx) => {
        const key = `${extractIdx}-${questionIdx}`
        setAnswers(prev => ({
            ...prev,
            part_5: {
                ...prev.part_5,
                [key]: optionIdx
            }
        }))
    }

    const totalAnswered = Object.keys(answers.part_5 || {}).length
    const total = 6

    return (
        <div className='w-full h-max bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden'>
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-700 dark:to-purple-700 px-6 sm:px-8 py-6 sm:py-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className='text-2xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3'>
                        <span className="bg-white/20 px-4 py-1 rounded-full text-lg">Part 5</span>
                    </h2>
                    <p className='text-indigo-100 text-sm sm:text-base leading-relaxed'>
                        You will hear three extracts. Choose the correct answer (A, B or C) for each question (24-29). There are TWO questions for each extract.
                    </p>
                </div>
            </div>

            <div className="px-6 sm:px-8 py-8 sm:py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8 flex justify-between items-center">
                        <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300'>Answers</h3>
                        <div className="bg-indigo-100 dark:bg-indigo-900/30 px-4 py-2 rounded-full">
                            <span className='text-sm font-bold text-indigo-700 dark:text-indigo-300'>
                                {totalAnswered}/{total}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col gap-8">
                        {data?.map((extract, extractIdx) => {
                            const extractAnswered = Object.keys(answers.part_5 || {})
                                .filter(k => k.startsWith(extractIdx + '-')).length

                            return (
                                <div key={extractIdx} className="border-l-4 border-indigo-500 pl-6 sm:pl-8">
                                    <div className="inline-block bg-gradient-to-r from-indigo-200 to-purple-200 dark:from-indigo-900/40 dark:to-purple-900/40 px-4 sm:px-5 py-2 sm:py-3 rounded-full mb-6 border-2 border-indigo-400 dark:border-indigo-600">
                                        <span className='font-bold text-indigo-700 dark:text-indigo-300 text-sm sm:text-lg'>
                                            {extract?.name}
                                        </span>
                                    </div>

                                    <div className="flex flex-col gap-5 sm:gap-6">
                                        {extract?.questions?.map((q, questionIdx) => {
                                            const isAnswered = answers.part_5?.[`${extractIdx}-${questionIdx}`] !== undefined
                                            
                                            return (
                                                <div key={questionIdx} className={`group border-2 rounded-xl p-4 sm:p-6 transition-all duration-300 ${
                                                    isAnswered 
                                                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-600' 
                                                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500'
                                                }`}>
                                                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                                                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                                            {24 + extractIdx * 2 + questionIdx}
                                                        </div>
                                                        <span className='text-sm sm:text-base text-slate-800 dark:text-slate-200 flex-1'>
                                                            {q?.text}
                                                        </span>
                                                    </div>

                                                    <div className="flex flex-col gap-2 sm:gap-3 ml-0 sm:ml-2">
                                                        {q?.options?.map((option, optIdx) => {
                                                            const isSelected = answers.part_5?.[`${extractIdx}-${questionIdx}`] === optIdx
                                                            
                                                            return (
                                                                <label key={optIdx} className={`flex items-center gap-3 sm:gap-4 cursor-pointer p-3 sm:p-4 rounded-lg transition-all duration-200 ${
                                                                    isSelected
                                                                        ? 'bg-white dark:bg-gray-600 border-2 border-purple-500 shadow-md'
                                                                        : 'bg-white dark:bg-gray-600/50 border-2 border-transparent hover:bg-white/80 dark:hover:bg-gray-600'
                                                                }`}>
                                                                    <div className="flex-shrink-0 relative">
                                                                        <input
                                                                            type="radio"
                                                                            name={`q5-${extractIdx}-${questionIdx}`}
                                                                            value={optIdx}
                                                                            checked={isSelected}
                                                                            onChange={() => handleAnswerChange(extractIdx, questionIdx, optIdx)}
                                                                            className="w-5 h-5 accent-purple-500 cursor-pointer"
                                                                        />
                                                                    </div>
                                                                    <div className="flex items-center gap-2 sm:gap-3 flex-1">
                                                                        <span className={`font-bold text-base sm:text-lg min-w-fit ${
                                                                            isSelected ? 'text-purple-600' : 'text-slate-600 dark:text-slate-400'
                                                                        }`}>
                                                                            {String.fromCharCode(65 + optIdx)})
                                                                        </span>
                                                                        <span className='text-slate-800 dark:text-slate-200 text-sm sm:text-base'>
                                                                            {option}
                                                                        </span>
                                                                    </div>
                                                                </label>
                                                            )
                                                        })}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>

                                    {extractIdx < data.length - 1 && (
                                        <div className="mt-6 sm:mt-8 h-1 bg-gradient-to-r from-indigo-200 to-transparent dark:from-indigo-900/30 rounded-full"></div>
                                    )}
                                </div>
                            )
                        })}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-10 sm:mt-12">
                        <div className="flex justify-between items-center mb-2">
                            <span className='text-sm font-semibold text-slate-600 dark:text-slate-400'>Progress</span>
                            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>{Math.round((totalAnswered/total)*100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                                style={{width: `${(totalAnswered/total)*100}%`}}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const Part6 = ({ data, answers, setAnswers }) => {
    const handleInputChange = (idx, value) => {
        setAnswers(prev => ({
            ...prev,
            part_6: {
                ...prev.part_6,
                [idx]: value
            }
        }))
    }

    const totalFilled = Object.keys(answers.part_6 || {}).filter(k => answers.part_6[k]?.trim()).length
    const total = data?.questions?.length || 6

    return (
        <div className='w-full h-max bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden'>
            <div className="bg-gradient-to-r from-teal-600 to-cyan-600 dark:from-teal-700 dark:to-cyan-700 px-6 sm:px-8 py-6 sm:py-8">
                <div className="max-w-5xl mx-auto">
                    <h2 className='text-2xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3'>
                        <span className="bg-white/20 px-4 py-1 rounded-full text-lg">Part 6</span>
                    </h2>
                    <p className='text-teal-100 text-sm sm:text-base leading-relaxed'>
                        You will hear a part of a lecture. For each question, fill in the missing information in the numbered space.
                    </p>
                </div>
            </div>

            <div className="px-6 sm:px-8 py-8 sm:py-12">
                <div className="max-w-5xl mx-auto">
                    <div className="bg-teal-50 dark:bg-teal-900/20 border-l-4 border-teal-600 rounded-lg p-5 sm:p-6 mb-8">
                        <p className='text-sm font-semibold text-teal-700 dark:text-teal-300 mb-1'>Important:</p>
                        <p className='text-sm sm:text-base text-teal-800 dark:text-teal-200'>
                            Write no more than ONE WORD for each answer.
                        </p>
                    </div>

                    <div className="bg-gradient-to-r from-teal-100 to-cyan-100 dark:from-teal-900/20 dark:to-cyan-900/20 border-l-4 border-teal-600 rounded-lg p-5 sm:p-6 mb-8">
                        <h3 className='text-2xl sm:text-3xl font-bold text-teal-700 dark:text-teal-300 italic'>
                            {data?.title}
                        </h3>
                    </div>

                    <div className="mb-8 flex justify-between items-center">
                        <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300'>Questions</h3>
                        <div className="bg-teal-100 dark:bg-teal-900/30 px-4 py-2 rounded-full">
                            <span className='text-sm font-bold text-teal-700 dark:text-teal-300'>
                                {totalFilled}/{total}
                            </span>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:gap-5">
                        {data?.questions?.map((q, idx) => {
                            const isFilled = answers.part_6?.[idx]?.trim()
                            
                            return (
                                <div key={idx} className={`group border-2 rounded-xl p-4 sm:p-5 transition-all duration-300 ${
                                    isFilled 
                                        ? 'bg-teal-50 dark:bg-teal-900/20 border-teal-300 dark:border-teal-600' 
                                        : 'bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:border-teal-300 dark:hover:border-teal-500'
                                }`}>
                                    <div className="flex items-start gap-3 sm:gap-4">
                                        <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                            {q?.num}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            {isFilled && (
                                                <span className='inline-block text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-900/40 px-3 py-1 rounded-full mb-2'>
                                                    ✓ Filled
                                                </span>
                                            )}
                                            <div className="flex flex-wrap items-center gap-2 mt-2">
                                                <span className='text-sm sm:text-base text-slate-700 dark:text-slate-300'>
                                                    {q?.before}
                                                </span>
                                                <input
                                                    type="text"
                                                    value={answers.part_6?.[idx] || ''}
                                                    onChange={(e) => handleInputChange(idx, e.target.value)}
                                                    maxLength="20"
                                                    className='flex-shrink-0 border-b-2 border-teal-500 focus:outline-none focus:border-teal-700 px-2 py-1 min-w-[80px] sm:min-w-[100px] bg-transparent text-slate-800 dark:text-slate-200 font-semibold text-sm sm:text-base'
                                                    placeholder="..."
                                                />
                                                <span className='text-sm sm:text-base text-slate-700 dark:text-slate-300 flex-shrink-0'>
                                                    {q?.after}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-10 sm:mt-12">
                        <div className="flex justify-between items-center mb-2">
                            <span className='text-sm font-semibold text-slate-600 dark:text-slate-400'>Progress</span>
                            <span className='text-sm font-bold text-slate-700 dark:text-slate-300'>{Math.round((totalFilled/total)*100)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-teal-500 to-cyan-500 h-full rounded-full transition-all duration-500"
                                style={{width: `${(totalFilled/total)*100}%`}}
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

const ResultPage = ({ mockData, answers, correctAnswers, queryPart, currentPart }) => {
    const calculateResults = () => {
        let totalCorrect = 0
        let totalQuestions = 0
        const partResults = {}

        // Faqat individual partni yoki barcha partlarni hisoblash
        const partsToCheck = queryPart === "all" ? [1, 2, 3, 4, 5, 6] : [currentPart]

        // Part 1: 8 questions
        if (partsToCheck.includes(1)) {
            let part1Correct = 0
            Object.keys(answers.part_1 || {}).forEach(key => {
                const idx = parseInt(key) - 1
                const userAnswer = String.fromCharCode(65 + answers.part_1[key])
                const correctAnswer = correctAnswers.part_1[idx]
                if (userAnswer === correctAnswer) part1Correct++
            })
            partResults.part_1 = { correct: part1Correct, total: 8 }
            totalCorrect += part1Correct
            totalQuestions += 8
        }

        // Part 2: 6 questions
        if (partsToCheck.includes(2)) {
            let part2Correct = 0
            Object.keys(answers.part_2 || {}).forEach(key => {
                const userAnswer = answers.part_2[key]?.toLowerCase().trim()
                const correctAnswer = correctAnswers.part_2[parseInt(key)]?.toLowerCase()
                if (userAnswer === correctAnswer) part2Correct++
            })
            partResults.part_2 = { correct: part2Correct, total: 6 }
            totalCorrect += part2Correct
            totalQuestions += 6
        }

        // Part 3: 4 questions
        if (partsToCheck.includes(3)) {
            let part3Correct = 0
            Object.keys(answers.part_3 || {}).forEach(key => {
                const userAnswer = String.fromCharCode(65 + answers.part_3[key])
                const correctAnswer = correctAnswers.part_3[parseInt(key)]
                if (userAnswer === correctAnswer) part3Correct++
            })
            partResults.part_3 = { correct: part3Correct, total: 4 }
            totalCorrect += part3Correct
            totalQuestions += 4
        }

        // Part 4: 5 questions
        if (partsToCheck.includes(4)) {
            let part4Correct = 0
            Object.keys(answers.part_4 || {}).forEach(key => {
                const userAnswer = answers.part_4[key]
                const correctAnswer = correctAnswers.part_4[parseInt(key)]
                if (userAnswer === correctAnswer) part4Correct++
            })
            partResults.part_4 = { correct: part4Correct, total: 5 }
            totalCorrect += part4Correct
            totalQuestions += 5
        }

        // Part 5: 6 questions
        if (partsToCheck.includes(5)) {
            let part5Correct = 0
            Object.keys(answers.part_5 || {}).forEach(key => {
                const userAnswer = String.fromCharCode(65 + answers.part_5[key])
                const qIdx = parseInt(key.split('-')[0]) * 2 + parseInt(key.split('-')[1])
                const correctAnswer = correctAnswers.part_5[qIdx]
                if (userAnswer === correctAnswer) part5Correct++
            })
            partResults.part_5 = { correct: part5Correct, total: 6 }
            totalCorrect += part5Correct
            totalQuestions += 6
        }

        // Part 6: 6 questions
        if (partsToCheck.includes(6)) {
            let part6Correct = 0
            Object.keys(answers.part_6 || {}).forEach(key => {
                const userAnswer = answers.part_6[key]?.toLowerCase().trim()
                const correctAnswer = correctAnswers.part_6[parseInt(key)]?.toLowerCase()
                if (userAnswer === correctAnswer) part6Correct++
            })
            partResults.part_6 = { correct: part6Correct, total: 6 }
            totalCorrect += part6Correct
            totalQuestions += 6
        }

        return { totalCorrect, totalQuestions, partResults }
    }

    const results = calculateResults()
    const percentage = Math.round((results.totalCorrect / results.totalQuestions) * 100)

    return (
        <div className='w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center p-5'>
            <div className="w-full max-w-5xl mt-24">
                <div className="bg-white rounded-xl p-12 shadow-2xl">
                    <h1 className='text-4xl font-bold text-center text-slate-800 mb-2'>Test Results</h1>
                    <p className='text-center text-slate-600 mb-12 text-lg'>
                        {queryPart === "all" ? mockData?.title : `${mockData?.title} - Part ${currentPart}`}
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-8 text-white text-center shadow-lg">
                            <p className='text-sm opacity-90 mb-2'>Correct Answers</p>
                            <p className='text-6xl font-bold'>{results.totalCorrect}</p>
                            <p className='text-sm opacity-90 mt-2'>out of {results.totalQuestions}</p>
                        </div>

                        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-8 text-white text-center shadow-lg">
                            <p className='text-sm opacity-90 mb-2'>Score</p>
                            <p className='text-6xl font-bold'>{percentage}%</p>
                            <p className='text-sm opacity-90 mt-2'>Percentage</p>
                        </div>
                    </div>

                    <div className="mb-8">
                        <h2 className='text-2xl font-bold text-slate-800 mb-6'>Results by Part</h2>
                        <div className="space-y-4">
                            {Object.entries(results.partResults).map(([part, result]) => (
                                <div key={part} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <div className="flex items-center justify-between mb-3">
                                        <span className='font-bold text-slate-800 text-lg'>Part {part.split('_')[1]}</span>
                                        <span className={`text-xl font-bold ${result.correct === result.total ? 'text-green-600' : 'text-orange-600'}`}>
                                            {result.correct}/{result.total}
                                        </span>
                                    </div>
                                    <div className="w-full bg-gray-300 rounded-full h-3">
                                        <div
                                            className={`h-3 rounded-full transition-all ${result.correct === result.total ? 'bg-green-500' : 'bg-orange-500'}`}
                                            style={{ width: `${(result.correct / result.total) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-5 rounded-lg mb-8">
                        <p className='text-yellow-800 text-base'>
                            <span className='font-bold'>⚠️ Note:</span> Errors may occur during verification. Please compare your answers again.
                        </p>
                    </div>

                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => window.history.back()}
                            className='px-8 py-3 bg-slate-800 text-white font-bold rounded-lg hover:bg-slate-900 transition-all shadow-md'
                        >
                            Back
                        </button>
                        <button
                            onClick={() => window.location.href = '/listening'}
                            className='px-8 py-3 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-all shadow-md'
                        >
                            Try Another
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default function Listening() {
    const { id } = useParams()
    const [params] = useSearchParams()

    const mockId = id
    const queryPart = params.get("part")
    const initialPart = queryPart === "all" ? 1 : Number(queryPart)
    const initialAudioIndex = queryPart === "all" ? 0 : (Number(queryPart) - 1)

    // ✅ State declarations
    const [currentPart, setCurrentPart] = useState(initialPart)
    const [audioList, setAudioList] = useState([])
    const [mockData, setMockData] = useState(null)
    const [correctAnswers, setCorrectAnswers] = useState(null)
    const [loading, setLoading] = useState(true)
    const [answers, setAnswers] = useState({
        part_1: {},
        part_2: {},
        part_3: {},
        part_4: {},
        part_5: {},
        part_6: {}
    })
    const [showResults, setShowResults] = useState(false)
    const [showStartModal, setShowStartModal] = useState(true)
    const [currentAudioIndex, setCurrentAudioIndex] = useState(initialAudioIndex)
    const [showBreak, setShowBreak] = useState(false)
    const [breakTimer, setBreakTimer] = useState(10)
    const [shouldPlay, setShouldPlay] = useState(false) // ✅ NEW: Audio play qilishni control qilish
    const [showTestModeFeedback, setShowTestModeFeedback] = useState(false) // 🧪 Test mode feedback
    const navigate = useNavigate()

    // ✅ Check if test mode
    const isTestMode = () => {
        const params = new URLSearchParams(window.location.search)
        return params.get("test") === "true"
    }

    // ✅ Calculate results function (shared between ResultPage and test modal)
    const calculateResults = () => {
        let totalCorrect = 0
        let totalQuestions = 0
        const partResults = {}

        // Faqat individual partni yoki barcha partlarni hisoblash
        const partsToCheck = queryPart === "all" ? [1, 2, 3, 4, 5, 6] : [currentPart]

        // Part 1: 8 questions
        if (partsToCheck.includes(1)) {
            let part1Correct = 0
            Object.keys(answers.part_1 || {}).forEach(key => {
                const idx = parseInt(key) - 1
                const userAnswer = String.fromCharCode(65 + answers.part_1[key])
                const correctAnswer = correctAnswers.part_1[idx]
                if (userAnswer === correctAnswer) part1Correct++
            })
            partResults.part_1 = { correct: part1Correct, total: 8 }
            totalCorrect += part1Correct
            totalQuestions += 8
        }

        // Part 2: 6 questions
        if (partsToCheck.includes(2)) {
            let part2Correct = 0
            Object.keys(answers.part_2 || {}).forEach(key => {
                const userAnswer = answers.part_2[key]?.toLowerCase().trim()
                const correctAnswer = correctAnswers.part_2[parseInt(key)]?.toLowerCase()
                if (userAnswer === correctAnswer) part2Correct++
            })
            partResults.part_2 = { correct: part2Correct, total: 6 }
            totalCorrect += part2Correct
            totalQuestions += 6
        }

        // Part 3: 4 questions
        if (partsToCheck.includes(3)) {
            let part3Correct = 0
            Object.keys(answers.part_3 || {}).forEach(key => {
                const userAnswer = String.fromCharCode(65 + answers.part_3[key])
                const correctAnswer = correctAnswers.part_3[parseInt(key)]
                if (userAnswer === correctAnswer) part3Correct++
            })
            partResults.part_3 = { correct: part3Correct, total: 4 }
            totalCorrect += part3Correct
            totalQuestions += 4
        }

        // Part 4: 5 questions
        if (partsToCheck.includes(4)) {
            let part4Correct = 0
            Object.keys(answers.part_4 || {}).forEach(key => {
                const userAnswer = answers.part_4[key]
                const correctAnswer = correctAnswers.part_4[parseInt(key)]
                if (userAnswer === correctAnswer) part4Correct++
            })
            partResults.part_4 = { correct: part4Correct, total: 5 }
            totalCorrect += part4Correct
            totalQuestions += 5
        }

        // Part 5: 6 questions
        if (partsToCheck.includes(5)) {
            let part5Correct = 0
            Object.keys(answers.part_5 || {}).forEach(key => {
                const userAnswer = String.fromCharCode(65 + answers.part_5[key])
                const qIdx = parseInt(key.split('-')[0]) * 2 + parseInt(key.split('-')[1])
                const correctAnswer = correctAnswers.part_5[qIdx]
                if (userAnswer === correctAnswer) part5Correct++
            })
            partResults.part_5 = { correct: part5Correct, total: 6 }
            totalCorrect += part5Correct
            totalQuestions += 6
        }

        // Part 6: 6 questions
        if (partsToCheck.includes(6)) {
            let part6Correct = 0
            Object.keys(answers.part_6 || {}).forEach(key => {
                const userAnswer = answers.part_6[key]?.toLowerCase().trim()
                const correctAnswer = correctAnswers.part_6[parseInt(key)]?.toLowerCase()
                if (userAnswer === correctAnswer) part6Correct++
            })
            partResults.part_6 = { correct: part6Correct, total: 6 }
            totalCorrect += part6Correct
            totalQuestions += 6
        }

        return { totalCorrect, totalQuestions, partResults }
    }

    // ✅ Refs
    const audioRef = useRef(null)
    const breakIntervalRef = useRef(null)

    // ✅ FETCH DATA
    useEffect(() => {
        const fetchData = async () => {
            try {
                const mockRes = await api.get(`/cefr/listening/${Number(mockId)}`)

                console.log('Raw API Response:', mockRes.data)
                console.log('Mock ID:', mockId)

                const apiData = mockRes.data

                let processedData = apiData
                if (apiData.part_1 && !apiData.data) {
                    processedData = {
                        ...apiData,
                        data: apiData
                    }
                } else if (apiData.data) {
                    processedData = apiData
                }

                setMockData(processedData)

                const audioUrls = [
                    processedData.audio_part_1,
                    processedData.audio_part_2,
                    processedData.audio_part_3,
                    processedData.audio_part_4,
                    processedData.audio_part_5,
                    processedData.audio_part_6,
                ].filter(url => url && url.length > 0)

                console.log('Audio URLs:', audioUrls)
                setAudioList(audioUrls)

                const answersRes = await api.get(`/cefr/listening/answer/${mockId}`)
                console.log('Correct Answers:', answersRes.data)

                setCorrectAnswers(answersRes.data)
                setLoading(false)
            } catch (err) {
                console.error('Error fetching data:', err)
                setLoading(false)
            }
        }

        if (mockId) {
            fetchData()
        }
    }, [mockId])

    // ✅ AUDIO LOAD VA PLAY
    useEffect(() => {
        if (audioRef.current && audioList[currentAudioIndex]) {
            audioRef.current.src = audioList[currentAudioIndex]
            audioRef.current.load()
            
            // Agar shouldPlay true bo'lsa, audioni play qil
            if (shouldPlay && !showStartModal) {
                setTimeout(() => {
                    audioRef.current?.play().catch(err => {
                        console.log('Audio play xatosi:', err)
                    })
                }, 100)
            }
        }
    }, [currentAudioIndex, audioList, shouldPlay, showStartModal])

    // ✅ START MOCK
    const startMock = () => {
        setShowStartModal(false)
        setShouldPlay(true) // ✅ Audio play qilishni faol qil
    }

    // ✅ AUDIO ENDED HANDLER
    const handleAudioEnded = () => {
        // Agar "all" rejimida bo'lsa va yana audio qolsa - break vaqt ko'rsatish
        if (queryPart === "all" && currentAudioIndex < audioList.length - 1) {
            setShowBreak(true)
            setBreakTimer(10)
            setShouldPlay(false)

            const interval = setInterval(() => {
                setBreakTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        setShowBreak(false)
                        setCurrentAudioIndex(currentAudioIndex + 1)
                        setCurrentPart(currentPart + 1)
                        setShouldPlay(true) // ✅ Keyingi audioni play qil
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            breakIntervalRef.current = interval
        } else {
            // Audio tugadi - natijalarni ko'rsatish (individual part yoki oxirgi part)
            setShowResults(true)
        }
    }

    // ✅ CLEANUP
    useEffect(() => {
        return () => {
            if (breakIntervalRef.current) {
                clearInterval(breakIntervalRef.current)
            }
        }
    }, [])

    // ✅ NEXT PART HANDLER
    const handleNextPart = () => {
        if (currentPart === 6 || currentAudioIndex === audioList.length - 1) {
            // ✅ Oxirgi part yoki oxirgi audio - natijalarni ko'rsatish
            setShowResults(true)
        } else if (currentAudioIndex < audioList.length - 1) {
            // ✅ Keyingi partga o'tish
            setShowBreak(true)
            setBreakTimer(10)
            setShouldPlay(false)

            const interval = setInterval(() => {
                setBreakTimer(prev => {
                    if (prev <= 1) {
                        clearInterval(interval)
                        setShowBreak(false)
                        setCurrentAudioIndex(currentAudioIndex + 1)
                        setCurrentPart(currentPart + 1)
                        setShouldPlay(true)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            breakIntervalRef.current = interval
        }
    }

    // ✅ LOADING STATE
    if (loading || !mockData || !correctAnswers) {
        return (
            <div className='w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center'>
                <div className='text-center'>
                    <div className='animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4'></div>
                    <p className='text-xl text-slate-700 dark:text-slate-300'>Loading test...</p>
                </div>
            </div>
        )
    }

    // ✅ RESULTS PAGE
    if (showResults) {
        // 🧪 Test mode - show feedback modal after results
        if (isTestMode()) {
            const results = calculateResults()
            const percentage = Math.round((results.totalCorrect / results.totalQuestions) * 100)
            
            return (
                <>
                    <div className='w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center p-5'>
                        <div className="w-full max-w-5xl mt-24">
                            <div className="bg-white rounded-xl p-12 shadow-2xl">
                                <h1 className='text-4xl font-bold text-center text-slate-800 mb-2'>Test Results</h1>
                                <p className='text-center text-slate-600 mb-12 text-lg'>
                                    {queryPart === "all" ? mockData?.title : `${mockData?.title} - Part ${currentPart}`}
                                </p>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-8 text-white text-center shadow-lg">
                                        <p className='text-sm opacity-90 mb-2'>Correct Answers</p>
                                        <p className='text-6xl font-bold'>{results.totalCorrect}</p>
                                        <p className='text-sm opacity-90 mt-2'>out of {results.totalQuestions}</p>
                                    </div>

                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-8 text-white text-center shadow-lg">
                                        <p className='text-sm opacity-90 mb-2'>Score</p>
                                        <p className='text-6xl font-bold'>{percentage}%</p>
                                        <p className='text-sm opacity-90 mt-2'>Percentage</p>
                                    </div>
                                </div>

                                <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-lg mb-8">
                                    <p className='text-blue-800 text-base'>
                                        <FaLock className="inline mr-2" />
                                        <span className='font-bold'>Login to save your results and track progress!</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <TestModeFeedbackModal 
                        showFeedback={true}
                        score={percentage}
                        navigate={navigate}
                    />
                </>
            )
        }

        return <ResultPage mockData={mockData} answers={answers} correctAnswers={correctAnswers} queryPart={queryPart} currentPart={currentPart} />
    }

    // ✅ RENDER PART
    const renderCurrentPart = () => {
        const data = mockData?.data

        if (!data) {
            return (
                <div className="bg-white rounded-xl p-8 text-center">
                    <p className='text-red-500 text-lg font-semibold'>Data struktura xatosi</p>
                    <p className='text-gray-600 mt-2'>mockData.data topilmadi</p>
                </div>
            )
        }

        switch (currentPart) {
            case 1:
                return <Part1 data={data.part_1} answers={answers} setAnswers={setAnswers} />
            case 2:
                return <Part2 data={data.part_2} answers={answers} setAnswers={setAnswers} />
            case 3:
                return <Part3 data={data.part_3} answers={answers} setAnswers={setAnswers} />
            case 4:
                return <Part4 data={data.part_4} answers={answers} setAnswers={setAnswers} />
            case 5:
                return <Part5 data={data.part_5} answers={answers} setAnswers={setAnswers} />
            case 6:
                return <Part6 data={data.part_6} answers={answers} setAnswers={setAnswers} />
            default:
                return <Part1 data={data.part_1} answers={answers} setAnswers={setAnswers} />
        }
    }

    return (
        <div className='w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center pt-24 pb-10 px-3 sm:px-5'>
            {/* START MODAL */}
            {showStartModal && (
                <>
                    <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-40 animate-in fade-in duration-300" />
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in scale-95 duration-300">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 w-full max-w-sm text-center shadow-2xl border-2 border-blue-100 dark:border-blue-900">
                            <div className="mb-6">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full mb-4">
                                    <span className="text-2xl">🎧</span>
                                </div>
                            </div>
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-white mb-3">
                                Ready to start listening?
                            </h2>
                            <p className="text-slate-600 dark:text-slate-400 mb-8 text-sm sm:text-base">
                                Audio will start immediately after you click the button below.
                            </p>
                            <button
                                onClick={startMock}
                                className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold text-base sm:text-lg rounded-xl transition-all transform hover:scale-105 shadow-lg"
                            >
                                ▶ Start Mock Test
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* AUDIO ELEMENT */}
            <audio
                ref={audioRef}
                onEnded={handleAudioEnded}
                preload="auto"
            />

            {/* HEADER */}
            <div className="w-full fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700 shadow-lg z-30">
                <div className="px-4 sm:px-6 py-3 sm:py-4">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex-1">
                            <h1 className='text-lg sm:text-2xl font-bold text-white flex items-center gap-2'>
                                <span>🎯 CEFR Listening</span>
                            </h1>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
                            <div className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg">
                                <span className='text-sm sm:text-base font-bold text-white'>
                                    Part <span className="text-xl">{currentPart}</span>/<span className="text-lg">6</span>
                                </span>
                            </div>
                            {queryPart === "all" && (
                                <button
                                    onClick={handleNextPart}
                                    className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-blue-600 font-bold rounded-lg hover:bg-slate-100 transition-all transform hover:scale-105 text-sm sm:text-base shadow-md"
                                >
                                    {currentPart === 6 ? '✓ Finish' : 'Next →'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="w-full max-w-5xl">
                {showBreak ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center gap-6 sm:gap-8 shadow-2xl border-2 border-slate-100 dark:border-slate-700">
                        <div className="text-5xl sm:text-7xl animate-bounce">⏸</div>
                        <h2 className='text-3xl sm:text-5xl font-bold text-slate-800 dark:text-white text-center'>Take a Break!</h2>
                        <div className='text-6xl sm:text-7xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent animate-pulse'>
                            {breakTimer}
                        </div>
                        <p className='text-lg sm:text-xl text-slate-600 dark:text-slate-400 text-center'>
                            Part {currentPart + 1} will start shortly...
                        </p>
                    </div>
                ) : (
                    renderCurrentPart()
                )}
            </div>
        </div>
    )
}