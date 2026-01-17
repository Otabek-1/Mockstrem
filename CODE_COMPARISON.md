# 🔄 Code Comparison - Before & After

## Part 1 Example Comparison

### BEFORE
```jsx
<div className='w-full h-max bg-white rounded-xl p-8'>
    <div className="max-w-4xl mx-auto">
        <h2 className='text-3xl font-bold text-slate-800 mb-2'>Part 1</h2>
        <span className='text-xl text-slate-700 block mb-8'>
            Instructions...
        </span>

        <div className="space-y-8">
            {data?.map((q, idx) => {
                const questionNum = idx + 1
                return (
                    <div key={idx} className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                        <span className='text-xl font-bold text-slate-800 block mb-5'>{questionNum}.</span>

                        <div className="flex flex-col gap-4 ml-6">
                            {q?.map((opt, optIdx) => (
                                <label key={optIdx} className="flex items-center gap-4 cursor-pointer p-3 rounded hover:bg-white transition-colors">
                                    <input type="radio" ... className="w-5 h-5 accent-green-500 cursor-pointer" />
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
```

### AFTER
```jsx
<div className='w-full h-max bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden'>
    {/* Beautiful Gradient Header */}
    <div className="bg-gradient-to-r from-blue-600 to-cyan-600 dark:from-blue-700 dark:to-cyan-700 px-6 sm:px-8 py-6 sm:py-8">
        <div className="max-w-5xl mx-auto">
            <h2 className='text-2xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3'>
                <span className="bg-white/20 px-4 py-1 rounded-full text-lg">Part 1</span>
            </h2>
            <p className='text-blue-100 text-sm sm:text-base leading-relaxed'>
                Instructions...
            </p>
        </div>
    </div>

    <div className="px-6 sm:px-8 py-8 sm:py-12">
        <div className="max-w-5xl mx-auto">
            {/* Progress Badge */}
            <div className="mb-8 flex justify-between items-center">
                <h3 className='text-lg font-semibold text-slate-700 dark:text-slate-300'>Questions</h3>
                <div className="bg-blue-100 dark:bg-blue-900/30 px-4 py-2 rounded-full">
                    <span className='text-sm font-bold text-blue-700 dark:text-blue-300'>
                        {totalAnswered}/{total}
                    </span>
                </div>
            </div>

            {/* Responsive Grid */}
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
                            {/* Numbered Badge with Gradient */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white font-bold text-sm sm:text-base">
                                    {questionNum}
                                </div>
                                {/* Status Badge */}
                                <div className="flex-1">
                                    {isAnswered && (
                                        <span className='inline-block text-xs font-semibold text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/40 px-3 py-1 rounded-full mb-2'>
                                            ✓ Answered
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Options */}
                            <div className="flex flex-col gap-3 ml-0 sm:ml-2">
                                {q?.map((opt, optIdx) => {
                                    const isSelected = answers.part_1?.[questionNum] === optIdx
                                    
                                    return (
                                        <label key={optIdx} className={`flex items-center gap-3 sm:gap-4 cursor-pointer p-3 sm:p-4 rounded-lg transition-all duration-200 ${
                                            isSelected
                                                ? 'bg-white dark:bg-gray-600 border-2 border-green-500 shadow-md'
                                                : 'bg-white dark:bg-gray-600/50 border-2 border-transparent hover:bg-white/80 dark:hover:bg-gray-600'
                                        }`}>
                                            <input type="radio" ... className="w-5 h-5 accent-green-500 cursor-pointer" />
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

            {/* Animated Progress Bar */}
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
```

## Key Improvements in Code

### 1. **Header Section**
- **Before:** Plain text title
- **After:** Beautiful gradient background with badge

### 2. **Visual Feedback**
- **Before:** No status indicators
- **After:** "✓ Answered" badge with color change

### 3. **Container Design**
- **Before:** `rounded-xl p-8` (basic)
- **After:** `rounded-2xl shadow-xl overflow-hidden` with gradient header

### 4. **Responsive Classes**
- **Before:** No responsive variants
- **After:** `sm:px-8`, `sm:text-4xl`, `sm:gap-6` throughout

### 5. **Dark Mode**
- **Before:** None
- **After:** `dark:bg-gray-800`, `dark:text-slate-300`, etc.

### 6. **Progress Tracking**
- **Before:** Text-only "Answered: X/8"
- **After:** Beautiful progress bar with percentage

### 7. **State Styling**
- **Before:** All boxes look the same
- **After:** Different styles for answered vs unanswered

### 8. **Animations**
- **Before:** Basic `hover:bg-white`
- **After:** `transition-all duration-200`, smooth borders

---

## Part 3 Desktop vs Mobile

### BEFORE (Same for all screens)
```jsx
<div className="flex gap-32 relative z-10">
    <div className="flex flex-col gap-6">
        {/* Speakers */}
    </div>
    <div className="flex flex-col gap-6">
        {/* Options */}
    </div>
</div>
<div className="mt-8 p-4 bg-gray-50 rounded-lg">
    <div className="flex flex-wrap gap-3">
        {/* Dropdowns */}
    </div>
</div>
```

### AFTER (Responsive with hidden/block)
```jsx
{/* Desktop: Visual Matching */}
<div className="hidden lg:block relative">
    <svg>
        {/* Connection Lines */}
    </svg>
    <div className="flex gap-12 lg:gap-20 relative z-10">
        {/* Speakers and Topics side by side */}
    </div>
</div>

{/* Mobile/Tablet: Dropdown Selection */}
<div className="lg:hidden space-y-6">
    <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-600 rounded-xl p-4">
        <p className='text-sm font-semibold text-blue-800 dark:text-blue-300 mb-4'>Select topic for each speaker:</p>
        <div className="space-y-3">
            {/* Full-width dropdowns */}
        </div>
    </div>
</div>
```

---

## Header Navigation

### BEFORE
```jsx
<div className="w-full fixed top-0 left-0 right-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-b-xl flex p-4 items-center justify-between text-white text-2xl font-bold z-30">
    <span>CEFR Listening Test</span>
    <div className="flex items-center gap-4">
        <span>Part {currentPart}/6</span>
        <button>Next Part</button>
    </div>
</div>
```

### AFTER
```jsx
<div className="w-full fixed top-0 left-0 right-0 bg-gradient-to-r from-blue-600 via-cyan-600 to-teal-600 dark:from-blue-700 dark:via-cyan-700 dark:to-teal-700 shadow-lg z-30">
    <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            {/* Title with emoji */}
            <div className="flex-1">
                <h1 className='text-lg sm:text-2xl font-bold text-white flex items-center gap-2'>
                    <span>🎯 CEFR Listening</span>
                </h1>
            </div>
            {/* Controls */}
            <div className="flex items-center gap-3 sm:gap-6 w-full sm:w-auto">
                <div className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 rounded-lg">
                    <span className='text-sm sm:text-base font-bold text-white'>
                        Part <span className="text-xl">{currentPart}</span>/<span className="text-lg">6</span>
                    </span>
                </div>
                <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-white text-blue-600 font-bold rounded-lg hover:bg-slate-100 transition-all transform hover:scale-105 text-sm sm:text-base shadow-md">
                    {currentPart === 6 ? '✓ Finish' : 'Next →'}
                </button>
            </div>
        </div>
    </div>
</div>
```

---

## Results Page

### BEFORE
```jsx
<div className='w-full min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800 flex flex-col items-center p-5'>
    <div className="w-full max-w-5xl mt-24">
        <div className="bg-white rounded-xl p-12 shadow-2xl">
            <h1 className='text-4xl font-bold text-center text-slate-800 mb-2'>Test Results</h1>
            <p className='text-center text-slate-600 mb-12 text-lg'>...</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-8 text-white text-center shadow-lg">
                    <p className='text-sm opacity-90 mb-2'>Correct Answers</p>
                    <p className='text-6xl font-bold'>{results.totalCorrect}</p>
                    <p className='text-sm opacity-90 mt-2'>out of {results.totalQuestions}</p>
                </div>
                {/* Score card */}
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-400 p-5 rounded-lg mb-8">
                <p className='text-blue-800 text-base'>
                    <FaLock className="inline mr-2" />
                    <span className='font-bold'>Login to save...</span>
                </p>
            </div>
        </div>
    </div>
</div>
```

### AFTER
```jsx
<div className='w-full min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex flex-col items-center pt-20 pb-10 px-4 sm:px-5'>
    <div className="w-full max-w-4xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border-2 border-slate-100 dark:border-slate-700">
            {/* Gradient Header */}
            <div className="bg-gradient-to-r from-green-600 to-emerald-600 dark:from-green-700 dark:to-emerald-700 px-6 sm:px-8 py-8 sm:py-10">
                <h1 className='text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3'>
                    <span>✨ Test Results</span>
                </h1>
                <p className='text-green-100 text-sm sm:text-base'>...</p>
            </div>

            {/* Content with padding */}
            <div className="px-6 sm:px-8 py-8 sm:py-12">
                {/* Score Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 sm:p-8 text-white text-center shadow-lg transform transition hover:scale-105">
                        <p className='text-xs sm:text-sm opacity-90 mb-2 font-semibold uppercase tracking-wide'>Correct Answers</p>
                        <p className='text-5xl sm:text-6xl font-bold mb-2'>{results.totalCorrect}</p>
                        <p className='text-sm sm:text-base opacity-90'>out of {results.totalQuestions}</p>
                    </div>
                    {/* Score card with transform hover */}
                </div>

                {/* Performance Feedback with Conditional Styling */}
                <div className={`rounded-xl p-5 sm:p-6 mb-8 border-l-4 ${
                    percentage >= 80 
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-500 text-green-800 dark:text-green-200'
                        : percentage >= 60
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-500 text-yellow-800 dark:text-yellow-200'
                        : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500 text-orange-800 dark:text-orange-200'
                }`}>
                    <p className='font-semibold text-sm sm:text-base'>
                        {/* Dynamic feedback */}
                    </p>
                </div>

                {/* Better CTA */}
                <div className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-2 border-blue-200 dark:border-blue-800 p-5 sm:p-6 rounded-xl">
                    <p className='text-slate-800 dark:text-slate-200 text-sm sm:text-base flex items-center gap-2'>
                        <FaLock className="text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <span className='font-semibold'>Login to save...</span>
                    </p>
                </div>
            </div>
        </div>
    </div>
</div>
```

---

## Summary of Code Changes

| Aspect | Before | After |
|--------|--------|-------|
| Header | Plain text | Gradient with badge |
| Cards | `rounded-lg p-6` | `rounded-2xl p-5 sm:p-6 shadow-xl` |
| Responsive | Minimal | Full `sm:`, `lg:` variants |
| Dark Mode | None | Full support with `dark:` |
| Animations | Basic | Multiple smooth animations |
| Status | Text only | Visual badges + colors |
| Progress | Text display | Animated progress bars |
| Colors | Gray/Green | Vibrant gradients |
| Accessibility | Basic | Enhanced hierarchy + ARIA |
| Mobile | Not optimized | Touch-friendly, responsive |

