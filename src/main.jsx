import { Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'

const App = lazy(() => import('./App.jsx'))
const Auth = lazy(() => import('./Auth.jsx'))
const Contact = lazy(() => import('./Contact.jsx'))
const Dashboard = lazy(() => import('./Dashboard.jsx'))
const Plan = lazy(() => import('./Plan.jsx'))
const Writing = lazy(() => import('./Components/CEFR/Writing.jsx'))
const DashboardAdmin = lazy(() => import('./Admin/Dashboard.jsx'))
const WritingMockForm = lazy(() => import('./Admin/WritingMockForm.jsx'))
const WritingMocks = lazy(() => import('./Admin/WritingMocks.jsx'))
const MockResult = lazy(() => import('./Components/MockResult.jsx'))
const News = lazy(() => import('./Components/News.jsx'))
const ReadingMockForm = lazy(() => import('./Admin/ReadingMockForm.jsx'))
const ReadingExamInterface = lazy(() => import('./Components/CEFR/Reading.jsx'))
const Speaking = lazy(() => import('./Components/CEFR/Speaking.jsx'))
const CEFRSpeaking = lazy(() => import('./Admin/CEFR_speaking.jsx'))
const SpeakingMockForm = lazy(() => import('./Admin/SpeakingMockForm.jsx'))
const SpeakingMocks = lazy(() => import('./Admin/SpeakingMocks.jsx'))
const SpeakingMockResult = lazy(() => import('./Components/SpeakingMockResult.jsx'))
const Listening = lazy(() => import('./Components/CEFR/Listening.jsx'))
const ListeningMockForm = lazy(() => import('./Admin/ListeningMockForm.jsx'))
const IeltsExamCDI = lazy(() => import('./Components/IELTS/IeltsExamCDI.jsx'))
const FullMockExam = lazy(() => import('./Components/CEFR/FullMockExam.jsx'))
const PrivacyPolicy = lazy(() => import('./PrivacyPolicy.jsx'))

function RouteFallback() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin" />
        <p className="text-sm text-slate-300">Loading module...</p>
      </div>
    </div>
  )
}

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path='/' element={<App />} />
        <Route path='/auth' element={<Auth />} />
        <Route path='/contact' element={<Contact />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/plans' element={<Plan />} />
        <Route path='/policy' element={<PrivacyPolicy />} />
        <Route path='/privacy' element={<PrivacyPolicy />} />
        <Route path='/mock/cefr/writing/:id' element={<Writing />} />
        <Route path='/mock/result/:resultId' element={<MockResult />} />
        <Route path='/admin/dashboard' element={<DashboardAdmin />} />
        <Route path='/mock/cefr/writing/form' element={<WritingMockForm />} />
        <Route path='/mock/cefr/writing/form/:id' element={<WritingMockForm />} />
        <Route path='/mock/cefr/writing/check-list' element={<WritingMocks />} />
        <Route path='/mock/cefr/reading/form' element={<ReadingMockForm />} />
        <Route path='/mock/cefr/reading/:id' element={<ReadingExamInterface />} />
        <Route path='/mock/cefr/speaking/:id' element={<Speaking />} />
        <Route path='/mock/cefr/speaking' element={<CEFRSpeaking />} />
        <Route path='/mock/cefr/speaking/form' element={<SpeakingMockForm />} />
        <Route path='/mock/cefr/speaking/check-list' element={<SpeakingMocks />} />
        <Route path='/mock/result/speaking/:resultId' element={<SpeakingMockResult />} />
        <Route path='/mock/cefr/listening/:id' element={<Listening />} />
        <Route path='/mock/cefr/full' element={<FullMockExam />} />
        <Route path='/mock/cefr/listening/form' element={<ListeningMockForm />} />
        <Route path='/mock/ielts/:module/:id' element={<IeltsExamCDI />} />
        <Route path='/news/:slug' element={<News />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
)
