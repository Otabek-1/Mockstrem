# 🚀 Quick Reference - AI Speaking Results

## File Structure
```
src/
├── services/
│   └── geminiService.js          # AI scoring & transcription
├── Components/
│   └── CEFR/
│       ├── AISpeakingResults.jsx  # Results display component
│       └── Speaking.jsx            # Main exam (MODIFIED)
```

## Component Props (AISpeakingResults)

```jsx
<AISpeakingResults 
  recordings={recordings}           // Object: {q1: blob_url, q2: blob_url, ...}
  mockData={mockData}              // Mock questions data structure
  isPremium={isPremium}             // Boolean: user premium status
  currentPart={currentPart}         // String: current exam part
  onResultsGenerated={(report) => {}}  // Callback when scoring done
/>
```

## Integration in Speaking.jsx

```jsx
// At top of file
import AISpeakingResults from './AISpeakingResults'

// In component
const [isPremium, setIsPremium] = useState(false)

// Fetch user premium status
useEffect(() => {
  const fetchUserInfo = async () => {
    const response = await api.get('/users/profile')
    setIsPremium(response.data.is_premium || false)
  }
  fetchUserInfo()
}, [])

// In results screen (line ~838)
<AISpeakingResults 
  recordings={recordings}
  mockData={mockData}
  isPremium={isPremium}
  currentPart={currentPart}
/>
```

## Gemini Service Functions

### 1. transcribeAudio(audioBlob)
```javascript
const transcript = await transcribeAudio(audioBlob)
// Returns: "transcript text"
```

### 2. scoreSpeakingTask(transcription, taskNumber, minutesRequired, contextInfo, scenarioInfo)
```javascript
const score = await scoreSpeakingTask(
  "transcript text",
  "1.1",
  1,
  "context",
  "scenario"
)
// Returns: {score, word_count, relevance, corrected_text, feedback, ...}
```

### 3. generateSpeakingReport(task1_1_data, task1_2_data, task2_data)
```javascript
const report = await generateSpeakingReport(score1, score2, score3)
// Returns: {total_raw_score, certificate_score, cefr_level, ...}
```

## Scoring Rules Quick Ref

| Rule | Implementation |
|------|----------------|
| Whole numbers only | `Math.round()` in scorer |
| Non-English penalty | -1 per word, max score 2 |
| Off-topic | Score 0-1 completely, 0-2 partially |
| Word count min | Task 1.1: 50, 1.2: 120, 2: 180 |
| Certificate scale | 0-75 (conversion table in code) |
| CEFR levels | Below B1, B1, B2, C1 |

## Environment Variables
```
VITE_GEMINI_API_KEY=AIzaSyBrpcBmq46roJ5kRu3xa-zVrOUUt-zP8Bc
VITE_API_BASE_URL=https://english-server-p7y6.onrender.com
```

## Testing Checklist

- [ ] Premium user sees AI results
- [ ] Free user sees CTA banner
- [ ] Transcription completes for all 8 questions
- [ ] Scores display 0-6 (Part 2) or 0-5 (Parts 1.1, 1.2)
- [ ] CEFR level calculated correctly
- [ ] Certificate score between 0-75
- [ ] Error handling works (retry, fallback)
- [ ] Tabs switch properly (Overview, Transcripts, Detailed)
- [ ] Audio still plays from recordings grid
- [ ] Download buttons work for audio

## Common Issues & Solutions

### "Transcription failed"
- Check audio format (should be audio/webm)
- Verify blob URL is valid
- Check Gemini API key

### Scoring returns 0
- Check transcription isn't empty
- Verify task number format (1.1, 1.2, 2)
- Check API response format

### Premium status always false
- Verify `/users/profile` endpoint returns `is_premium` field
- Check auth token is valid
- Ensure user is actually premium in database

### Tab navigation broken
- Check selectedTab state is updating
- Verify className contains "in-progress" class
- Look for overflow issues in Detailed tab

## Performance Tips

1. Lazy load transcription service on results screen mount
2. Cache transcriptions in state to avoid re-processing
3. Use React.memo for tab components
4. Implement debouncing for tab clicks
5. Consider pagination for very long transcripts

## Future Enhancements

```jsx
// TODO: Add PDF export
const downloadPDF = async () => {
  // Use jsPDF + generate report
}

// TODO: Add comparison mode
<SpeakingComparison 
  attempt1={firstReport}
  attempt2={secondReport}
/>

// TODO: Add teacher verification
<TeacherVerification 
  scores={aiScores}
  teacherId={teacherId}
/>
```

## Debug Mode

Enable debug logging:
```javascript
// In geminiService.js
const DEBUG = true
if (DEBUG) console.log('Transcription:', transcript)
```

## Support Links

- Gemini API Docs: https://ai.google.dev/
- IELTS Scoring: https://www.ielts.org/
- CEFR Levels: https://www.coe.int/en/web/common-european-framework-reference-level

---

**Last Updated**: Feb 14, 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready
