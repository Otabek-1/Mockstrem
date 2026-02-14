# AI Speaking Results - Architecture & Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    MockStream Client App                     │
└─────────────────────────────────────────────────────────────┘
                              │
                              │
                    ┌─────────┴─────────┐
                    │                   │
            ┌───────▼────────┐  ┌──────▼─────────┐
            │ Speaking.jsx   │  │ API.js         │
            │ (Main Exam)    │  │ (HTTP Client)  │
            └───────┬────────┘  └──────┬─────────┘
                    │                   │
                    │                   │
            ┌───────▼────────────────────▼─────────┐
            │     Backend Server (Render)          │
            │  /users/profile (Premium Status)     │
            │  /mock/speaking/submit (Record)      │
            └───────────────────────────────────────┘
                    │
                    │ (When Premium)
                    │
            ┌───────▼───────────────────────────┐
            │  AISpeakingResults Component      │
            │  ├─ Transcription Service        │
            │  ├─ Scoring Service              │
            │  └─ Report Generator             │
            └───────┬───────────────────────────┘
                    │
                    │
            ┌───────▼───────────────────────────┐
            │  Gemini API Client                │
            │  ├─ Audio Transcription          │
            │  ├─ Response Scoring             │
            │  └─ Feedback Generation          │
            └───────┬───────────────────────────┘
                    │
                    │
            ┌───────▼───────────────────────────┐
            │  Google Gemini 1.5 Flash         │
            │  ├─ Speech Recognition           │
            │  ├─ Language Analysis            │
            │  └─ Score Calculation            │
            └───────────────────────────────────┘
```

---

## User Flow Diagram

```
START
  │
  ▼
┌─────────────────┐
│ Select Mock     │ → Load mock data
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Mic Test        │ → Check audio setup
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Take Exam       │ 
│ 8 Questions     │ → Record responses
│ ~20 minutes     │ → Part 1.1 (2 Qs)
└────────┬────────┘   → Part 1.2 (2 Qs)
         │             → Part 2 (2 Qs)
         │             → Part 3 (2 Qs)
         │
         ▼
┌─────────────────┐
│ Submit Results  │ → Upload all audio
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Results Screen                  │
├─────────────────────────────────┤
│                                 │
│ Is User Premium?                │
│  │                              │
│  └─ YES ─→ ┌────────────────┐  │
│            │ AI Analysis    │  │
│            │ ├─ Progress    │  │
│            │ ├─ Transcribe  │  │
│            │ ├─ Score       │  │
│            │ └─ Report      │  │
│            └────────────────┘  │
│                                 │
│  └─ NO ──→ ┌────────────────┐  │
│            │ CTA Banner     │  │
│            │ "Upgrade now"  │  │
│            └────────────────┘  │
│                                 │
│  + Audio Recordings Grid        │
│  + Download Buttons             │
│  + Share/Dashboard Buttons      │
└─────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│ View Results    │ → Three tabs available
│ & Feedback      │   └─ Overview Tab
│                 │   └─ Transcripts Tab
└─────────────────┘   └─ Detailed Feedback Tab
```

---

## Component Hierarchy

```
App Component
│
├─ Dashboard (Parent Route)
│  │
│  └─ Speaking.jsx
│     │
│     ├─ Rules Screen (SELECT MOCK)
│     │  • Load available mocks
│     │  • Display mock details
│     │
│     ├─ Mic Check Screen (TEST AUDIO)
│     │  • Record test audio
│     │  • Play back test
│     │
│     ├─ Exam Screen (TAKE EXAM)
│     │  • Part 1.1, 1.2 (Individual)
│     │  • Part 2 (Monologue)
│     │  • Part 3 (Discussion)
│     │  • Timer & recording controls
│     │
│     └─ Results Screen (SHOW RESULTS)
│        │
│        ├─ AISpeakingResults ⭐
│        │  │
│        │  ├─ Premium Check
│        │  ├─ Loading State
│        │  │
│        │  ├─ Tab 1: Overview
│        │  │  • Raw score card
│        │  │  • Certificate score
│        │  │  • CEFR level
│        │  │  • Part-by-part scores
│        │  │  • Error summary
│        │  │
│        │  ├─ Tab 2: Transcripts
│        │  │  • Question 1 transcript
│        │  │  • Question 2 transcript
│        │  │  • ... (all 8 questions)
│        │  │
│        │  ├─ Tab 3: Detailed Feedback
│        │  │  • Corrected text with annotations
│        │  │  • Examiner feedback
│        │  │  • For each part
│        │  │
│        │  └─ Premium CTA (if free user)
│        │     • Eye-catching banner
│        │     • "Subscribe for AI results"
│        │
│        └─ Audio Recordings Grid
│           • 8 audio controls
│           • Download buttons
│           • Part organization
```

---

## Data Flow Diagram

```
Recording Phase
===============
User Voice Input (Audio)
    │
    ▼
MediaRecorder API
    │
    ├─ Blob Creation
    │  └─ audio/webm format
    │
    ▼
recordedBlobsRef object {
    q1: blob1,
    q2: blob2,
    q3: blob3,
    ... q8: blob8
}
    │
    ▼
Submit Exam
    │
    ├─ Send to Backend
    │ └─ /mock/speaking/submit
    │
    └─ Navigate to Results Screen


Results Phase
=============
Check Premium Status
    │
    ├─ GET /users/profile
    │  └─ Get is_premium flag
    │
    ▼
isPremium State Updated ─────┐
    │                         │
    ├─ YES ──────────────────┼─→ Start AI Analysis
    │                         │
    └─ NO ─────────────────┐ │
                            │ │
                    Show CTA│ │
                    Banner  │ │
                            │ │
    ┌───────────────────────┘ │
    │                         │
    ▼                         │
Loop through recordings {    │
    q1, q2, q3...q8         │
}                           │
    │                       │
    ├─ Convert blob to     │
    │  base64 data         │
    │                       │
    ├─ Group by part:       │
    │  Part 1.1: q1-q2     │
    │  Part 1.2: q3-q4     │
    │  Part 2: q5-q6       │
    │  Part 3: q7-q8       │
    │                       │
    └─ For each part:      │
       │                    │
       ▼▼▼◄─────────────────┘
    Send to Gemini API
       │
       ├─ Audio Data (base64)
       ├─ Task Number (1.1, 1.2, 2)
       ├─ Prompt Instructions
       └─ Scoring Rubric
           │
           ▼
    Gemini Model Processes
       │
       ├─ Transcribe Audio
       │  └─ Return text transcript
       │
       ├─ Analyze Response
       │  ├─ Grammar check
       │  ├─ Vocabulary analysis
       │  ├─ Fluency assessment
       │  └─ Topic relevance
       │
       └─ Generate Score
          ├─ Whole number (0-6)
          ├─ Error annotations
          ├─ Feedback points
          └─ CEFR level
           │
           ▼
    Return JSON Response {
        score: 4,
        word_count: 275,
        relevance: "ON-TOPIC",
        corrected_text: "...",
        feedback: "...",
        errors: {...},
        cefr_level: "B2"
    }
           │
           ▼
    Process Response
       │
       ├─ Extract transcript
       ├─ Store score
       ├─ Count errors
       └─ Update progress bar
           │
           ▼
    Repeat for All Parts
       │
       ├─ Part 1.1 score ✓
       ├─ Part 1.2 score ✓
       └─ Part 2 score ✓
           │
           ▼
    Generate Final Report {
        total_raw_score: 13,
        certificate_score: 63,
        cefr_level: "B2",
        percentage: 81%,
        parts: [...]
    }
           │
           ▼
    Display Results
       │
       ├─ Update aiScores state
       ├─ Hide loading spinner
       ├─ Show tabs
       └─ Enable interactions
```

---

## State Management Flow

```
Speaking.jsx
│
├─ screen: 'rules' | 'miccheck' | 'exam' | 'results'
│
├─ currentPart: '1.1' | '1.2' | '2' | '3'
│
├─ recordings: {
│   q1: 'blob:...',
│   q2: 'blob:...',
│   ...
│ }
│
├─ isPremium: boolean ◄─── Fetched from /users/profile
│
└─ userInfo: {...} ◄─── User details
   │
   ▼
AISpeakingResults.jsx
│
├─ aiScores: {
│   total_raw_score: number,
│   certificate_score: number,
│   cefr_level: string,
│   individual_scores: {
│     part_1_1: {...},
│     part_1_2: {...},
│     part_2: {...}
│   }
│ }
│
├─ loading: boolean (progress 0-100%)
│
├─ error: string | null
│
├─ transcriptions: {
│   q1: string,
│   q2: string,
│   ...
│ }
│
└─ selectedTab: 'overview' | 'transcript' | 'detailed'
```

---

## Scoring Pipeline

```
Raw Response Text
    │
    ▼
┌──────────────────────┐
│ Check Language       │ ──→ Mark non-English words [L1]
│ (English Only)       │     Count violations
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Count Words          │ ──→ Compare with minimum
│ (50, 120, 180)       │     Apply penalty if under
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Check Relevance      │ ──→ ON-TOPIC (normal scoring)
│ (Topic Match)        │     PARTIALLY (max -2)
└──────────┬───────────┘     OFF-TOPIC (max 0-1)
           │
           ▼
┌──────────────────────┐
│ Count Errors         │ ──→ Grammar errors
│                      │     Spelling errors
└──────────┬───────────┘     Vocabulary issues
           │
           ▼
┌──────────────────────┐
│ Assign Base Score    │ ──→ Whole number only
│ (0-6)                │     No decimals
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Apply Penalties      │ ──→ Word count: -1
│                      │     Non-English: -1/word
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│ Final Score          │ ──→ Integer 0-6
│                      │
└──────────┬───────────┘
           │
           ▼
Calculate Total (Part 1.1 + 1.2 + Part 2)
    │
    ▼
Convert to Certificate (16→75, 0→0)
    │
    ▼
Map to CEFR (Below B1, B1, B2, C1)
    │
    ▼
Generate Report
```

---

## API Call Sequence

```
STEP 1: Check User Status
┌────────────────────────────┐
│ GET /users/profile         │
│ Header: Authorization      │
└────────────────────────────┘
            │
            ▼
    Response: {
        id: 123,
        email: "user@test.com",
        is_premium: true ◄─── KEY
    }


STEP 2: For Each Part (Part 1.1, 1.2, Part 2)
┌────────────────────────────────────────┐
│ POST https://generativelanguage...     │
│ Content-Type: application/json         │
├────────────────────────────────────────┤
│ Body: {                                │
│   contents: [{                         │
│     parts: [                           │
│       {                                │
│         inline_data: {                 │
│           mime_type: audio/webm,       │
│           data: base64Audio            │
│         }                              │
│       },                               │
│       {                                │
│         text: "Score this speaking..." │
│       }                                │
│     ]                                  │
│   }]                                   │
│ }                                      │
└────────────────────────────────────────┘
            │
            ▼
    Response: {
        candidates: [{
            content: {
                parts: [{
                    text: "{\"score\": 4, ...}" ◄─ JSON response
                }]
            }
        }]
    }
```

---

## Performance Timeline Expected

```
User Completes Exam
    │
    ▼ t=0s
Submit Response
    │
    ▼ t=1s
Results Screen Loaded
Premium Check Complete
AI Analysis Starts
    │
    ├─ Transcribe Part 1.1 (q1-q2)
    │   └─ Complete: t=15s (Progress: 25%)
    │
    ├─ Score Part 1.1
    │   └─ Complete: t=20s
    │
    ├─ Transcribe Part 1.2 (q3-q4)
    │   └─ Complete: t=35s (Progress: 50%)
    │
    ├─ Score Part 1.2
    │   └─ Complete: t=40s
    │
    ├─ Transcribe Part 2 (q5-q6)
    │   └─ Complete: t=55s (Progress: 75%)
    │
    ├─ Score Part 2
    │   └─ Complete: t=60s
    │
    └─ Generate Report
        └─ Complete: t=65s (Progress: 100%)
            │
            ▼
    Results Displayed! 🎉
    Total time: ~1 minute
```

---

## Error Handling Flow

```
Try AI Analysis
    │
    ├─ Error: Transcription Failed
    │  │
    │  ├─ Log error
    │  ├─ Set error state
    │  ├─ Show error message
    │  └─ Show "Try Again" button
    │
    ├─ Error: API Timeout
    │  │
    │  ├─ Retry automatically (3 attempts)
    │  ├─ Show progress state
    │  └─ Fallback to manual entry
    │
    ├─ Error: Invalid Audio
    │  │
    │  ├─ Detect format issue
    │  ├─ Inform user
    │  └─ Suggest re-recording
    │
    └─ Error: Network Error
       │
       ├─ Check internet connection
       ├─ Queue for retry
       └─ Allow offline viewing of audio
```

---

This architecture ensures:
✅ Scalability - Async processing
✅ Reliability - Error handling & retries
✅ Performance - Progress tracking
✅ Security - API key management
✅ User Experience - Clear feedback
