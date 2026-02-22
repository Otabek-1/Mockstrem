import api from '../../api'

/**
 * Listening exam answer service
 * Handles fetching correct answers and calculating results
 */

const API_BASE_URL = 'https://english-server-p7y6.onrender.com'

/**
 * Fetch correct answers for a listening mock test
 * @param {number} mockId - The mock test ID
 * @returns {Promise<Object>} Correct answers for all parts
 */
export const getListeningAnswers = async (mockId) => {
    try {
        const response = await api.get(`/cefr/listening/answer/${mockId}`)
        
        if (response.status !== 200) {
            throw new Error(`Failed to fetch answers: ${response.status}`)
        }
        
        return response.data
    } catch (error) {
        console.error('Error fetching listening answers:', error)
        throw error
    }
}

/**
 * Calculate the score by comparing user answers with correct answers
 * @param {Object} userAnswers - User's answers for all parts
 * @param {Object} correctAnswers - Correct answers for all parts
 * @returns {Object} Detailed results with score and answer comparison
 */
export const calculateListeningScore = (userAnswers, correctAnswers) => {
    const partTotals = {
        part1: Array.isArray(correctAnswers?.part_1) ? correctAnswers.part_1.length : 0,
        part2: Array.isArray(correctAnswers?.part_2) ? correctAnswers.part_2.length : 0,
        part3: Array.isArray(correctAnswers?.part_3) ? correctAnswers.part_3.length : 0,
        part4: Array.isArray(correctAnswers?.part_4) ? correctAnswers.part_4.length : 0,
        part5: Array.isArray(correctAnswers?.part_5) ? correctAnswers.part_5.length : 0,
        part6: Array.isArray(correctAnswers?.part_6) ? correctAnswers.part_6.length : 0
    }
    const dynamicMaxScore = Object.values(partTotals).reduce((acc, val) => acc + val, 0)

    const results = {
        total: 0,
        maxScore: dynamicMaxScore,
        percentage: 0,
        details: [],
        partScores: {
            part1: { correct: 0, total: partTotals.part1 },
            part2: { correct: 0, total: partTotals.part2 },
            part3: { correct: 0, total: partTotals.part3 },
            part4: { correct: 0, total: partTotals.part4 },
            part5: { correct: 0, total: partTotals.part5 },
            part6: { correct: 0, total: partTotals.part6 }
        }
    }

    let questionNumber = 1

    // Helper function to normalize answers (trim and lowercase)
    const normalizeAnswer = (answer) => {
        if (!answer) return ''
        return String(answer).trim().toLowerCase()
    }

    // Check Part 1 (Questions 1-8)
    if (correctAnswers.part_1 && userAnswers.part1) {
        correctAnswers.part_1.forEach((correctAns, index) => {
            const userAns = normalizeAnswer(userAnswers.part1[index])
            const correct = normalizeAnswer(correctAns)
            const isCorrect = userAns === correct

            if (isCorrect) {
                results.total++
                results.partScores.part1.correct++
            }

            results.details.push({
                question: questionNumber++,
                part: 1,
                user_answer: userAnswers.part1[index] || '',
                correct_answer: correctAns,
                is_correct: isCorrect
            })
        })
    }

    // Check Part 2 (Questions 9-14)
    if (correctAnswers.part_2 && userAnswers.part2) {
        correctAnswers.part_2.forEach((correctAns, index) => {
            const userAns = normalizeAnswer(userAnswers.part2[index])
            const correct = normalizeAnswer(correctAns)
            const isCorrect = userAns === correct

            if (isCorrect) {
                results.total++
                results.partScores.part2.correct++
            }

            results.details.push({
                question: questionNumber++,
                part: 2,
                user_answer: userAnswers.part2[index] || '',
                correct_answer: correctAns,
                is_correct: isCorrect
            })
        })
    }

    // Check Part 3 (Questions 15-18)
    if (correctAnswers.part_3 && userAnswers.part3) {
        correctAnswers.part_3.forEach((correctAns, index) => {
            const userAns = normalizeAnswer(userAnswers.part3[index])
            const correct = normalizeAnswer(correctAns)
            const isCorrect = userAns === correct

            if (isCorrect) {
                results.total++
                results.partScores.part3.correct++
            }

            results.details.push({
                question: questionNumber++,
                part: 3,
                user_answer: userAnswers.part3[index] || '',
                correct_answer: correctAns,
                is_correct: isCorrect
            })
        })
    }

    // Check Part 4 (Questions 19-23)
    if (correctAnswers.part_4 && userAnswers.part4) {
        correctAnswers.part_4.forEach((correctAns, index) => {
            const userAns = normalizeAnswer(userAnswers.part4[index])
            const correct = normalizeAnswer(correctAns)
            const isCorrect = userAns === correct

            if (isCorrect) {
                results.total++
                results.partScores.part4.correct++
            }

            results.details.push({
                question: questionNumber++,
                part: 4,
                user_answer: userAnswers.part4[index] || '',
                correct_answer: correctAns,
                is_correct: isCorrect
            })
        })
    }

    // Check Part 5 (Questions 24-29)
    if (correctAnswers.part_5 && userAnswers.part5) {
        correctAnswers.part_5.forEach((correctAns, index) => {
            const userAns = normalizeAnswer(userAnswers.part5[index])
            const correct = normalizeAnswer(correctAns)
            const isCorrect = userAns === correct

            if (isCorrect) {
                results.total++
                results.partScores.part5.correct++
            }

            results.details.push({
                question: questionNumber++,
                part: 5,
                user_answer: userAnswers.part5[index] || '',
                correct_answer: correctAns,
                is_correct: isCorrect
            })
        })
    }

    // Check Part 6 (Questions 30-35)
    if (correctAnswers.part_6 && userAnswers.part6) {
        correctAnswers.part_6.forEach((correctAns, index) => {
            const userAns = normalizeAnswer(userAnswers.part6[index])
            const correct = normalizeAnswer(correctAns)
            const isCorrect = userAns === correct

            if (isCorrect) {
                results.total++
                results.partScores.part6.correct++
            }

            results.details.push({
                question: questionNumber++,
                part: 6,
                user_answer: userAnswers.part6[index] || '',
                correct_answer: correctAns,
                is_correct: isCorrect
            })
        })
    }

    // Calculate percentage
    results.percentage = results.maxScore > 0 ? Math.round((results.total / results.maxScore) * 100) : 0

    return results
}

/**
 * Submit answers and get results (alternative method if backend handles scoring)
 * @param {number} mockId - The mock test ID
 * @param {Object} userAnswers - User's answers for all parts
 * @returns {Promise<Object>} Results from backend
 */
export const submitListeningAnswers = async (mockId, userAnswers) => {
    try {
        const token = localStorage.getItem('access_token')
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        }

        const response = await fetch(`${API_BASE_URL}/mock/listening/submit`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
                question_id: mockId,
                ...userAnswers
            })
        })

        if (!response.ok) {
            throw new Error(`Failed to submit answers: ${response.status}`)
        }

        const result = await response.json()
        return result
    } catch (error) {
        console.error('Error submitting listening answers:', error)
        throw error
    }
}

/**
 * Get CEFR level based on score percentage
 * @param {number} percentage - Score percentage (0-100)
 * @returns {string} CEFR level (A1, A2, B1, B2, C1, C2)
 */
export const getCEFRLevel = (percentage) => {
    if (percentage >= 90) return 'C2'
    if (percentage >= 80) return 'C1'
    if (percentage >= 70) return 'B2'
    if (percentage >= 60) return 'B1'
    if (percentage >= 50) return 'A2'
    return 'A1'
}

/**
 * Get performance message based on score
 * @param {number} percentage - Score percentage (0-100)
 * @returns {string} Performance message
 */
export const getPerformanceMessage = (percentage) => {
    if (percentage >= 90) return 'Outstanding! Excellent listening skills! 🌟'
    if (percentage >= 80) return 'Great job! Very strong performance! 🎉'
    if (percentage >= 70) return 'Well done! Good listening comprehension! 👏'
    if (percentage >= 60) return 'Good effort! Keep practicing! 💪'
    if (percentage >= 50) return 'Fair attempt. More practice needed. 📚'
    return 'Keep working hard. Practice makes perfect! 🎯'
}

export default {
    getListeningAnswers,
    calculateListeningScore,
    submitListeningAnswers,
    getCEFRLevel,
    getPerformanceMessage
}
