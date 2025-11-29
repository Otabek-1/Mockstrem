import React, { useState } from 'react'
import { FaRandom, FaCrown } from 'react-icons/fa'
import { FiFilter } from 'react-icons/fi'
import { MdClose, MdCheckCircle } from 'react-icons/md'

export default function Writing_list() {
    const [filterOpen, setFilterOpen] = useState(false)
    const [mockModalOpen, setMockModalOpen] = useState(false)
    const [selectedTaskId, setSelectedTaskId] = useState(null)
    const [selectedPart, setSelectedPart] = useState(null)
    const [userPremium, setUserPremium] = useState(false)
    
    const [filters, setFilters] = useState({
        solved: false,
        unsolved: false,
        easy: false,
        medium: false,
        hard: false,
        recent: false,
        popular: false
    })

    const taskDetails = {
        1: {
            title: 'Writing Task 1',
            description: 'Academic Writing - Task 1',
            difficulty: 'Medium',
            time: '20 minutes',
            parts: [
                { id: 1, name: 'Part A', description: 'Letter Writing', time: '10 min' },
                { id: 2, name: 'Part B', description: 'Essay Writing', time: '10 min' }
            ]
        },
        2: {
            title: 'Writing Task 2',
            description: 'General Writing - Task 2',
            difficulty: 'Hard',
            time: '25 minutes',
            parts: [
                { id: 1, name: 'Part A', description: 'Response to Advertisement', time: '12 min' },
                { id: 2, name: 'Part B', description: 'Formal Letter', time: '13 min' }
            ]
        },
        3: {
            title: 'Writing Task 3',
            description: 'Advanced Writing - Task 3',
            difficulty: 'Hard',
            time: '30 minutes',
            parts: [
                { id: 1, name: 'Part A', description: 'Report Writing', time: '15 min' },
                { id: 2, name: 'Part B', description: 'Analysis Essay', time: '15 min' }
            ]
        },
        4: {
            title: 'Writing Task 4',
            description: 'Quick Writing - Task 4',
            difficulty: 'Easy',
            time: '15 minutes',
            parts: [
                { id: 1, name: 'Part A', description: 'Short Answer', time: '7 min' },
                { id: 2, name: 'Part B', description: 'Paragraph', time: '8 min' }
            ]
        }
    }

    const handleFilterChange = (key) => {
        setFilters(prev => ({
            ...prev,
            [key]: !prev[key]
        }))
    }

    const filterOptions = [
        { group: 'Status', items: ['solved', 'unsolved'] },
        { group: 'Difficulty', items: ['easy', 'medium', 'hard'] },
        { group: 'Sorting', items: ['recent', 'popular'] }
    ]

    const getLabel = (key) => {
        const labels = {
            solved: 'Solved',
            unsolved: 'Unsolved',
            easy: 'Easy',
            medium: 'Medium',
            hard: 'Hard',
            recent: 'Most Recent',
            popular: 'Most Popular'
        }
        return labels[key]
    }

    const activeFiltersCount = Object.values(filters).filter(Boolean).length

    const openTaskModal = (taskId) => {
        setSelectedTaskId(taskId)
        setMockModalOpen(true)
        setSelectedPart(null)
    }

    const selectRandomTask = () => {
        const randomTaskId = Math.floor(Math.random() * 4) + 1
        openTaskModal(randomTaskId)
    }

    const closeMockModal = () => {
        setMockModalOpen(false)
        setSelectedTaskId(null)
        setSelectedPart(null)
    }

    const getDifficultyColor = (difficulty) => {
        switch(difficulty.toLowerCase()) {
            case 'easy': return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
            case 'medium': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'
            case 'hard': return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
            default: return 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
        }
    }

    return (
        <div className='w-full min-h-screen flex flex-col items-start gap-5 p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800'>
            <h3 className="text-4xl font-bold text-gray-800 dark:text-white">CEFR writing tasks</h3>

            <div className="list w-full dark:bg-slate-700 bg-slate-300 rounded-lg p-5 flex flex-col gap-5">
                {/* Toolbar */}
                <div className="extras w-full flex items-center gap-4 flex-wrap">
                    {/* Random Button */}
                    <button onClick={selectRandomTask} className='flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 shadow-lg rounded-full text-white font-semibold hover:shadow-xl hover:scale-105 transition-all duration-200 cursor-pointer'>
                        <FaRandom className='text-white' size={16} />
                        <span>Select random</span>
                    </button>

                    {/* Filter Button */}
                    <div className="relative">
                        <button 
                            onClick={() => setFilterOpen(!filterOpen)}
                            className={`flex items-center gap-3 px-4 py-2 shadow-lg rounded-full font-semibold transition-all duration-200 cursor-pointer ${
                                filterOpen 
                                    ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white scale-105' 
                                    : 'bg-gray-200/50 dark:bg-gray-700 text-gray-800 dark:text-white hover:brightness-90'
                            }`}
                        >
                            <FiFilter size={16} />
                            <span>Filter</span>
                            {activeFiltersCount > 0 && (
                                <span className='ml-2 px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full'>
                                    {activeFiltersCount}
                                </span>
                            )}
                        </button>

                        {/* Dropdown Menu */}
                        {filterOpen && (
                            <div className="absolute top-full left-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
                                <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                                    <h4 className="text-lg font-bold text-gray-800 dark:text-white">Filter Options</h4>
                                    <button
                                        onClick={() => setFilterOpen(false)}
                                        className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                    >
                                        <MdClose size={20} className="text-gray-600 dark:text-gray-400" />
                                    </button>
                                </div>

                                <div className="p-4 flex flex-col gap-6 max-h-96 overflow-y-auto">
                                    {filterOptions.map((group, idx) => (
                                        <div key={idx} className="flex flex-col gap-3">
                                            <h5 className="text-sm font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                                                {group.group}
                                            </h5>
                                            <div className="flex flex-col gap-2 ml-2">
                                                {group.items.map((item) => (
                                                    <label
                                                        key={item}
                                                        className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={filters[item]}
                                                            onChange={() => handleFilterChange(item)}
                                                            className="w-4 h-4 accent-blue-500 cursor-pointer"
                                                        />
                                                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                                                            {getLabel(item)}
                                                        </span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t border-gray-200 dark:border-gray-700 p-4 flex gap-3">
                                    <button
                                        onClick={() => setFilters({
                                            solved: false,
                                            unsolved: false,
                                            easy: false,
                                            medium: false,
                                            hard: false,
                                            recent: false,
                                            popular: false
                                        })}
                                        className="flex-1 px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white font-semibold rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                    <button
                                        onClick={() => setFilterOpen(false)}
                                        className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                                    >
                                        Apply
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Tasks List */}
                <div className="mt-4 flex flex-col gap-3">
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Filters: {activeFiltersCount > 0 ? Object.entries(filters).filter(([_, v]) => v).map(([k]) => getLabel(k)).join(', ') : 'None'}</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[1, 2, 3, 4].map((task) => (
                            <div 
                                onClick={() => openTaskModal(task)}
                                key={task} 
                                className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-all cursor-pointer border border-gray-200 dark:border-gray-700 hover:scale-105 transform"
                            >
                                <h5 className="font-semibold text-gray-800 dark:text-white">Writing Task {task}</h5>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">Complete this writing exercise</p>
                                <div className="mt-3 flex items-center justify-between">
                                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${getDifficultyColor(['Medium', 'Hard', 'Hard', 'Easy'][task-1])}`}>
                                        {['Medium', 'Hard', 'Hard', 'Easy'][task-1]}
                                    </span>
                                    <span className="text-xs text-gray-500 dark:text-gray-400">Not solved</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Modal Overlay */}
            {mockModalOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[998] transition-opacity duration-300"
                    onClick={closeMockModal}
                />
            )}

            {/* Modal */}
            {mockModalOpen && selectedTaskId && (
                <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[999] w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">
                    
                    {/* Premium Banner */}
                    {!userPremium && (
                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <FaCrown size={20} />
                                <div>
                                    <p className="font-bold">Take Full Mock Exam</p>
                                    <p className="text-xs text-white/90">Premium feature - Complete all parts with instant feedback</p>
                                </div>
                            </div>
                            <a
                                href={`/mock/cefr/writing/${selectedTaskId}?part=all`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-4 py-2 bg-white text-purple-600 font-bold rounded-lg hover:bg-gray-100 transition-all transform hover:scale-105 cursor-pointer"
                            >
                                Try Full Mock
                            </a>
                        </div>
                    )}

                    {/* Modal Header */}
                    <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">{taskDetails[selectedTaskId].title}</h2>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{taskDetails[selectedTaskId].description}</p>
                        </div>
                        <button
                            onClick={closeMockModal}
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <MdClose size={24} className="text-gray-600 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {!selectedPart ? (
                            <div className="space-y-4">
                                {/* Task Info */}
                                <div className="grid grid-cols-2 gap-4 mb-6">
                                    <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Difficulty</p>
                                        <p className={`text-lg font-bold ${getDifficultyColor(taskDetails[selectedTaskId].difficulty)}`}>
                                            {taskDetails[selectedTaskId].difficulty}
                                        </p>
                                    </div>
                                    <div className="p-4 bg-green-50 dark:bg-green-900/30 rounded-lg">
                                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Total Time</p>
                                        <p className="text-lg font-bold text-green-700 dark:text-green-300">{taskDetails[selectedTaskId].time}</p>
                                    </div>
                                </div>

                                <p className="text-gray-600 dark:text-gray-400 mb-6">Select a part to start practicing:</p>

                                {/* Parts Selection */}
                                <div className="grid grid-cols-1 gap-3">
                                    {taskDetails[selectedTaskId].parts.map((part) => (
                                        <div
                                            key={part.id}
                                            onClick={() => setSelectedPart(part.id)}
                                            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 cursor-pointer transition-all transform hover:scale-102 group"
                                        >
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <h3 className="font-bold text-gray-800 dark:text-white text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                                        {part.name}
                                                    </h3>
                                                    <p className="text-sm text-gray-600 dark:text-gray-400">{part.description}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-xs text-gray-500 dark:text-gray-400">⏱️ {part.time}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <button
                                    onClick={() => setSelectedPart(null)}
                                    className="mb-4 text-blue-600 dark:text-blue-400 font-semibold hover:underline flex items-center gap-2"
                                >
                                    ← Back to parts
                                </button>

                                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                                    <h3 className="font-bold text-gray-800 dark:text-white text-lg mb-2">
                                        {taskDetails[selectedTaskId].parts.find(p => p.id === selectedPart)?.name}
                                    </h3>
                                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                                        {taskDetails[selectedTaskId].parts.find(p => p.id === selectedPart)?.description}
                                    </p>
                                </div>

                                <div className="flex gap-3 mt-6">
                                    <a
                                        href={`/mock/cefr/writing/${selectedTaskId}?part=${selectedPart}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all text-center"
                                    >
                                        Start Writing
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes slideInFromTop {
                    from {
                        opacity: 0;
                        transform: translateY(-10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .slide-in-from-top-2 {
                    animation: slideInFromTop 0.2s ease-out;
                }
            `}</style>
        </div>
    )
}