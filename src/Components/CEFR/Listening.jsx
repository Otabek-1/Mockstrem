import React, { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../api'

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

    return (
        <div className='w-full h-max bg-white rounded-xl p-8'>
            <div className="max-w-4xl mx-auto">
                <h2 className='text-3xl font-bold text-slate-800 mb-2'>Part 1</h2>
                <span className='text-xl text-slate-700 block mb-8'>
                    You will hear some sentences. You will hear each sentence twice. Choose the correct reply to each sentence (A, B or C).
                </span>

                <div className="space-y-8">
                    {data.map((q, idx) => {
                        const questionNum = idx + 1
                        return (
                            <div key={idx} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                                <span className='text-xl font-bold text-slate-800 block mb-5'>{questionNum}.</span>

                                <div className="flex flex-col gap-4 ml-6">
                                    {q.map((opt, optIdx) => (
                                        <label key={optIdx} className="flex items-center gap-4 cursor-pointer p-3 rounded hover:bg-white transition-colors">
                                            <input
                                                type="radio"
                                                name={`q1-${questionNum}`}
                                                value={optIdx}
                                                checked={answers.part_1?.[questionNum] === optIdx}
                                                onChange={() => handleAnswerChange(questionNum, optIdx)}
                                                className="w-5 h-5 accent-green-500 cursor-pointer"
                                            />
                                            <span className='text-green-600 font-bold min-w-[30px]'>
                                                {String.fromCharCode(65 + optIdx)})
                                            </span>
                                            <span className='text-slate-800 text-lg'>{opt}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>

                <div className="mt-12 p-5 bg-blue-50 rounded-lg border border-blue-200">
                    <span className='text-sm font-semibold text-blue-900'>
                        Answered: {Object.keys(answers.part_1 || {}).length} / 8 questions
                    </span>
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

    return (
        <div className='w-full h-max bg-white rounded-xl p-8'>
            <div className="max-w-4xl mx-auto">
                <h2 className='text-3xl font-bold text-slate-800 mb-2'>Part 2</h2>
                <span className='text-xl text-slate-700 block mb-8'>
                    You will hear someone giving a talk. For each question, fill in the missing information in the numbered space.
                    <br /><br />
                    <span className='font-semibold'>Write ONE WORD and/or A NUMBER for each answer.</span>
                </span>

                <div className="bg-green-100 border-l-4 border-green-500 p-6 rounded mb-10">
                    <h3 className='text-3xl font-bold text-green-700 italic'>Win a 'dream night' at the theatre</h3>
                </div>

                <div className="space-y-6">
                    {data.map((q, idx) => (
                        <div key={idx} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className='text-xl font-bold text-slate-800'>{9 + idx}.</span>
                                <span className='text-lg font-semibold text-slate-800'>{q.label}:</span>
                                <span className='text-lg text-slate-800'>{q.before}</span>
                                <input
                                    type="text"
                                    className="border-b-2 border-green-500 focus:outline-none focus:border-green-700 px-2 py-1 min-w-[100px] bg-transparent text-slate-800 font-medium"
                                    value={answers.part_2?.[idx] || ''}
                                    onChange={(e) => handleInputChange(idx, e.target.value)}
                                    maxLength="20"
                                />
                                {q.after && <span className='text-lg text-slate-800'>{q.after}</span>}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-5 bg-blue-50 rounded-lg border border-blue-200">
                    <span className='text-sm font-semibold text-blue-900'>
                        Filled: {Object.keys(answers.part_2 || {}).filter(k => answers.part_2[k]?.trim()).length} / 6 questions
                    </span>
                </div>
            </div>
        </div>
    )
}

const Part3 = ({ data, answers, setAnswers }) => {
    const [selections, setSelections] = useState({})
    const speakerRefs = useRef({})
    const optionRefs = useRef({})
    const [lines, setLines] = useState([])
    const svgRef = useRef(null)

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
        setTimeout(drawLines, 0)
    }

    const drawLines = () => {
        if (!svgRef.current) return

        const newLines = []
        Object.entries(selections).forEach(([speakerIdx, optionIdx]) => {
            const speakerIdx_num = parseInt(speakerIdx)
            const speakerEl = speakerRefs.current[speakerIdx_num]
            const optionEl = optionRefs.current[optionIdx]

            if (speakerEl && optionEl) {
                const speakerRect = speakerEl.getBoundingClientRect()
                const optionRect = optionEl.getBoundingClientRect()
                const svgRect = svgRef.current.getBoundingClientRect()

                const x1 = speakerRect.right - svgRect.left
                const y1 = speakerRect.top - svgRect.top + speakerRect.height / 2
                const x2 = optionRect.left - svgRect.left
                const y2 = optionRect.top - svgRect.top + optionRect.height / 2

                newLines.push({ x1, y1, x2, y2, id: `${speakerIdx_num}-${optionIdx}` })
            }
        })

        setLines(newLines)
    }

    useEffect(() => {
        window.addEventListener('resize', drawLines)
        drawLines()
        return () => window.removeEventListener('resize', drawLines)
    }, [selections])

    return (
        <div className='w-full h-max bg-white rounded-xl p-8'>
            <div className="max-w-5xl mx-auto">
                <h2 className='text-3xl font-bold text-slate-800 mb-2'>Part 3</h2>
                <span className='text-xl text-slate-700 block mb-8'>
                    You will hear people talking. Match each speaker (15-18) to the subjects (A-F). There are TWO EXTRA places which you do not need to use.
                </span>

                <div className="relative mt-10 px-10">
                    <svg
                        ref={svgRef}
                        className="absolute top-0 left-0 w-full h-full pointer-events-none"
                        style={{ minHeight: '500px' }}
                    >
                        {lines.map(line => (
                            <line
                                key={line.id}
                                x1={line.x1}
                                y1={line.y1}
                                x2={line.x2}
                                y2={line.y2}
                                stroke="#10b981"
                                strokeWidth="2"
                                strokeDasharray="5,5"
                            />
                        ))}
                    </svg>

                    <div className="flex gap-32 relative z-10">
                        <div className="flex flex-col gap-6">
                            <span className='text-lg font-bold text-slate-800 mb-2'>Speakers:</span>
                            {data.speakers.map((speaker, idx) => (
                                <div
                                    key={idx}
                                    ref={el => speakerRefs.current[idx] = el}
                                    className='text-lg font-semibold text-slate-800 px-4 py-3 bg-blue-100 rounded-lg whitespace-nowrap'
                                >
                                    {speaker}
                                </div>
                            ))}
                        </div>

                        <div className="flex flex-col gap-6">
                            <span className='text-lg font-bold text-slate-800 mb-2'>Topics:</span>
                            {data.options.map((option, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-3"
                                >
                                    <span className='text-lg font-semibold text-green-600 min-w-[30px]'>
                                        {String.fromCharCode(65 + idx)})
                                    </span>
                                    <div
                                        ref={el => optionRefs.current[idx] = el}
                                        className={`text-lg font-medium text-slate-800 px-4 py-3 rounded-lg cursor-pointer transition-all ${Object.values(selections).includes(idx)
                                            ? 'bg-green-200 border-2 border-green-500'
                                            : 'bg-gray-100 border-2 border-gray-300 hover:bg-gray-200'
                                            }`}
                                    >
                                        {option}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                        <span className='text-sm text-slate-600 block mb-3'>Select topic for each speaker:</span>
                        <div className="flex flex-wrap gap-3">
                            {data.speakers.map((speaker, speakerIdx) => (
                                <div key={speakerIdx} className="flex gap-2 items-center bg-white p-2 rounded border border-gray-300">
                                    <span className='font-semibold text-slate-700 text-sm'>{speaker}:</span>
                                    <select
                                        value={selections[speakerIdx] ?? ''}
                                        onChange={(e) => handleSelect(speakerIdx, parseInt(e.target.value))}
                                        className='px-2 py-1 border border-green-400 rounded text-sm focus:outline-none focus:border-green-600'
                                    >
                                        <option value="">Select</option>
                                        {data.options.map((_, optIdx) => (
                                            <option key={optIdx} value={optIdx}>
                                                {String.fromCharCode(65 + optIdx)}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ))}
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

    return (
        <div className='w-full h-max bg-white rounded-xl p-8'>
            <div className="max-w-4xl mx-auto">
                <h2 className='text-3xl font-bold text-slate-800 mb-2'>Part 4</h2>
                <span className='text-xl text-slate-700 block mb-8'>
                    You will hear someone giving a talk. Label the places (19-23) on the map (A-I). There are extra options which you do not need to use.
                </span>

                <div className="mt-8 flex flex-col items-center gap-4">
                    <div className="w-full max-w-2xl flex justify-center">
                        <img
                            src={data.mapUrl}
                            alt="Map"
                            className="w-full h-auto rounded-lg border-2 border-gray-300 shadow-lg"
                        />
                    </div>

                    <div className="flex gap-3 flex-wrap justify-center mt-4">
                        {data.mapLabels.map(label => (
                            <div key={label} className="px-3 py-1 bg-blue-100 rounded-full border-2 border-blue-400">
                                <span className="font-bold text-blue-700">{label}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-10 max-w-2xl mx-auto">
                    <span className='text-lg font-semibold text-slate-800 block mb-6'>Answer the questions:</span>

                    <div className="flex flex-col gap-6">
                        {data.questions.map((q, idx) => (
                            <div key={idx} className="flex items-center gap-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                                <span className='text-xl font-bold text-slate-800 min-w-[60px]'>{q.num}.</span>
                                <div className="flex items-center gap-4 flex-1">
                                    <span className='text-lg text-slate-700'>{q.place}</span>
                                    <select
                                        value={answers.part_4?.[idx] || ''}
                                        onChange={(e) => handleInputChange(idx, e.target.value)}
                                        className='px-4 py-2 border-2 border-green-400 rounded-lg focus:outline-none focus:border-green-600 bg-white text-slate-800 font-medium'
                                    >
                                        <option value="">Select location</option>
                                        {data.mapLabels.map(label => (
                                            <option key={label} value={label}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-12 p-5 bg-blue-50 rounded-lg border border-blue-200">
                    <span className='text-sm font-semibold text-blue-900'>
                        Answered: {Object.keys(answers.part_4 || {}).filter(k => answers.part_4[k]).length} / 5 questions
                    </span>
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

    return (
        <div className='w-full h-max bg-white rounded-xl p-8'>
            <div className="max-w-4xl mx-auto">
                <h2 className='text-3xl font-bold text-slate-800 mb-2'>Part 5</h2>
                <span className='text-xl text-slate-700 block mb-8'>
                    You will hear three extracts. Choose the correct answer (A, B or C) for each question (24-29). There are TWO questions for each extract.
                </span>

                <div className="flex flex-col gap-12">
                    {data.map((extract, extractIdx) => (
                        <div key={extractIdx} className="border-l-4 border-green-500 pl-6">
                            <div className="inline-block bg-green-200 px-4 py-2 rounded-full mb-6">
                                <span className='font-bold text-green-700 text-lg'>{extract.name}</span>
                            </div>

                            <div className="flex flex-col gap-8">
                                {extract.questions.map((q, questionIdx) => (
                                    <div key={questionIdx} className="bg-gray-50 p-5 rounded-lg">
                                        <div className="mb-5">
                                            <span className='text-lg font-bold text-slate-800'>{24 + extractIdx * 2 + questionIdx}. </span>
                                            <span className='text-lg text-slate-800'>{q.text}</span>
                                        </div>

                                        <div className="flex flex-col gap-3 ml-8">
                                            {q.options.map((option, optIdx) => (
                                                <label key={optIdx} className="flex items-center gap-3 cursor-pointer p-2 rounded hover:bg-white transition-colors">
                                                    <input
                                                        type="radio"
                                                        name={`q5-${extractIdx}-${questionIdx}`}
                                                        value={optIdx}
                                                        checked={answers.part_5?.[`${extractIdx}-${questionIdx}`] === optIdx}
                                                        onChange={() => handleAnswerChange(extractIdx, questionIdx, optIdx)}
                                                        className="w-5 h-5 accent-green-500 cursor-pointer"
                                                    />
                                                    <span className='text-green-600 font-bold min-w-[25px]'>
                                                        {String.fromCharCode(65 + optIdx)})
                                                    </span>
                                                    <span className='text-slate-800 text-base'>{option}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-5 bg-blue-50 rounded-lg border border-blue-200">
                    <span className='text-sm font-semibold text-blue-900'>
                        Answered: {Object.keys(answers.part_5 || {}).length} / 6 questions
                    </span>
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

    return (
        <div className='w-full h-max bg-white rounded-xl p-8'>
            <div className="max-w-4xl mx-auto">
                <h2 className='text-3xl font-bold text-slate-800 mb-2'>Part 6</h2>
                <span className='text-xl text-slate-700 block mb-8'>
                    You will hear a part of a lecture. For each question, fill in the missing information in the numbered space.
                    <br /><br />
                    <span className='font-semibold'>Write no more than ONE WORD for each answer.</span>
                </span>

                <div className="bg-green-100 border-l-4 border-green-500 p-5 rounded mb-10">
                    <h3 className='text-3xl font-semibold text-green-700 italic'>{data.title}</h3>
                </div>

                <div className="space-y-6">
                    {data.questions.map((q, idx) => (
                        <div key={idx} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                            <div className="flex items-baseline gap-2 flex-wrap">
                                <span className='text-lg font-bold text-slate-800'>{q.num}.</span>
                                <span className='text-base text-slate-800'>{q.before}</span>
                                <input
                                    type="text"
                                    value={answers.part_6?.[idx] || ''}
                                    onChange={(e) => handleInputChange(idx, e.target.value)}
                                    maxLength="20"
                                    className='border-b-2 border-green-500 focus:outline-none focus:border-green-700 px-2 py-1 min-w-[100px] bg-transparent text-slate-800 font-medium'
                                />
                                <span className='text-base text-slate-800'>{q.after}</span>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-12 p-5 bg-blue-50 rounded-lg border border-blue-200">
                    <span className='text-sm font-semibold text-blue-900'>
                        Filled: {Object.keys(answers.part_6 || {}).filter(k => answers.part_6[k]?.trim()).length} / 6 questions
                    </span>
                </div>
            </div>
        </div>
    )
}

const ResultPage = ({ mockData, answers, correctAnswers }) => {
    const calculateResults = () => {
        let totalCorrect = 0
        let totalQuestions = 0
        const partResults = {}

        // Part 1: 8 questions
        let part1Correct = 0
        Object.keys(answers.part_1 || {}).forEach(key => {
            const idx = parseInt(key) - 1
            const userAnswer = String.fromCharCode(65 + answers.part_1[key])
            const correctAnswer = correctAnswers.part_1[idx]
            if (userAnswer === correctAnswer) part1Correct++
        })
        partResults.part_1 = { correct: part1Correct, total: 8, wrong: [] }
        totalCorrect += part1Correct
        totalQuestions += 8

        // Part 2: 6 questions
        let part2Correct = 0
        Object.keys(answers.part_2 || {}).forEach(key => {
            const userAnswer = answers.part_2[key]?.toLowerCase().trim()
            const correctAnswer = correctAnswers.part_2[parseInt(key)]?.toLowerCase()
            if (userAnswer === correctAnswer) part2Correct++
        })
        partResults.part_2 = { correct: part2Correct, total: 6, wrong: [] }
        totalCorrect += part2Correct
        totalQuestions += 6

        // Part 3: 4 questions
        let part3Correct = 0
        Object.keys(answers.part_3 || {}).forEach(key => {
            const userAnswer = String.fromCharCode(65 + answers.part_3[key])
            const correctAnswer = correctAnswers.part_3[parseInt(key)]
            if (userAnswer === correctAnswer) part3Correct++
        })
        partResults.part_3 = { correct: part3Correct, total: 4, wrong: [] }
        totalCorrect += part3Correct
        totalQuestions += 4

        // Part 4: 5 questions
        let part4Correct = 0
        Object.keys(answers.part_4 || {}).forEach(key => {
            const userAnswer = answers.part_4[key]
            const correctAnswer = correctAnswers.part_4[parseInt(key)]
            if (userAnswer === correctAnswer) part4Correct++
        })
        partResults.part_4 = { correct: part4Correct, total: 5, wrong: [] }
        totalCorrect += part4Correct
        totalQuestions += 5

        // Part 5: 6 questions
        let part5Correct = 0
        Object.keys(answers.part_5 || {}).forEach(key => {
            const userAnswer = String.fromCharCode(65 + answers.part_5[key])
            const qIdx = parseInt(key.split('-')[0] * 2 + parseInt(key.split('-')[1]))
            const correctAnswer = correctAnswers.part_5[qIdx]
            if (userAnswer === correctAnswer) part5Correct++
        })
        partResults.part_5 = { correct: part5Correct, total: 6, wrong: [] }
        totalCorrect += part5Correct
        totalQuestions += 6

        // Part 6: 6 questions
        let part6Correct = 0
        Object.keys(answers.part_6 || {}).forEach(key => {
            const userAnswer = answers.part_6[key]?.toLowerCase().trim()
            const correctAnswer = correctAnswers.part_6[parseInt(key)]?.toLowerCase()
            if (userAnswer === correctAnswer) part6Correct++
        })
        partResults.part_6 = { correct: part6Correct, total: 6, wrong: [] }
        totalCorrect += part6Correct
        totalQuestions += 6

        return { totalCorrect, totalQuestions, partResults }
    }

    const results = calculateResults()
    const percentage = Math.round((results.totalCorrect / results.totalQuestions) * 100)

    return (
        <div className='w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center p-5'>
            <div className="w-full max-w-5xl mt-24">
                <div className="bg-white rounded-xl p-12 shadow-2xl">
                    <h1 className='text-4xl font-bold text-center text-slate-800 mb-2'>Test Results</h1>
                    <p className='text-center text-slate-600 mb-12 text-lg'>{mockData.title}</p>

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
    const [params] = useSearchParams()
    const mockId = params.get("id")
    const part = params.get("part")
    const [currentPart ,setCurrentPart] = useState(part);
    const queryPart = part;
    
    const [showBreak, setShowBreak] = useState(false)
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

    useEffect(() => {
        const fetchData = async () => {
            try {
                const mockRes = await api.get(`/cefr/listening/${mockId}`)
                console.log(mockRes);
                
                setMockData(mockRes.data)

                const answersRes = await api.get(`/answer/${mockId}`)
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

    useEffect(() => {
        if (queryPart !== "all") return

        if (showBreak) {
            const timer = setTimeout(() => {
                if (currentPart < 6) {
                    setCurrentPart(currentPart + 1)
                    setShowBreak(false)
                } else {
                    setShowResults(true)
                }
            }, 10000)
            return () => clearTimeout(timer)
        }
    }, [showBreak, currentPart, queryPart])

    const handleNextPart = () => {
        if (queryPart === "all" && currentPart < 6) {
            setShowBreak(true)
        } else if (currentPart === 6) {
            setShowResults(true)
        }
    }

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

    if (showResults) {
        return <ResultPage mockData={mockData} answers={answers} correctAnswers={correctAnswers} />
    }

    const renderCurrentPart = () => {
        const data = mockData.data
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
        <div className='w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center p-5 gap-5'>
            {/* Header */}
            <div className="w-full max-w-5xl fixed top-0 left-0 right-0 h-max bg-gradient-to-r from-green-500 to-cyan-500 rounded-b-xl flex p-4 items-center justify-between text-white text-2xl font-bold z-50 mx-auto">
                <div>
                    {mockData && mockData[`audio_part_${currentPart}`] && (
                        <audio
                            src={mockData[`audio_part_${currentPart}`]}
                            autoPlay
                            controls
                            className="absolute -bottom-16 left-4"
                        />
                    )}
                    <span>CEFR Listening Test</span>
                </div>
                <div className="flex items-center gap-4">
                    <span>Part {currentPart}/6</span>
                    {queryPart === "all" && currentPart <= 6 && (
                        <button
                            onClick={handleNextPart}
                            className="px-6 py-2 bg-white text-green-600 font-bold rounded-lg hover:bg-gray-100 transition-all"
                        >
                            {currentPart === 6 ? 'Finish' : 'Next Part'}
                        </button>
                    )}
                </div>
            </div>

            {/* Content */}
            <div className="w-full max-w-5xl mt-24 mb-10">
                {showBreak ? (
                    <div className="bg-white rounded-xl p-12 flex flex-col items-center justify-center gap-6 shadow-2xl">
                        <h2 className='text-4xl font-bold text-slate-800'>Break Time</h2>
                        <div className='text-6xl font-bold text-green-500' id="timer">10</div>
                        <p className='text-xl text-slate-600'>Next part starts in a moment...</p>
                    </div>
                ) : (
                    renderCurrentPart()
                )}
            </div>

            {/* Timer Script */}
            {showBreak && (
                <script dangerouslySetInnerHTML={{
                    __html: `
                        let count = 10;
                        const timer = setInterval(() => {
                            count--;
                            const timerEl = document.getElementById('timer');
                            if (timerEl) timerEl.textContent = count;
                            if (count <= 0) clearInterval(timer);
                        }, 1000);
                    `
                }} />
            )}
        </div>
    )
}