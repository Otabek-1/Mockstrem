import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Auth from './Auth.jsx'
import Contact from './Contact.jsx'
import Dashboard from './Dashboard.jsx'
import Plan from './Plan.jsx'
import Writing from './Components/CEFR/Writing.jsx'
import Dashboard_admin from './Admin/Dashboard.jsx'
import WritingMockForm from './Admin/WritingMockForm.jsx'
import WritingMocks from './Admin/WritingMocks.jsx'
import MockResult from './Components/MockResult.jsx'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />}/>
      <Route path='/auth' element={<Auth />}/>
      <Route path='/contact' element={<Contact />}/>
      <Route path='/dashboard' element={<Dashboard />}/>
      <Route path='/plans' element={<Plan />}/>
      <Route path='/mock/cefr/writing/:id' element={<Writing />}/>
      <Route path='/mock/result/:resultId' element={<MockResult />}/>
      <Route path='/admin/dashboard' element={<Dashboard_admin />}/>
      <Route path='/mock/cefr/writing/form' element={<WritingMockForm />}/>
      <Route path='/mock/cefr/writing/form/:id' element={<WritingMockForm />}/>
      <Route path='/mock/cefr/writing/check-list' element={<WritingMocks />}/>
    </Routes>
  </BrowserRouter>
)
