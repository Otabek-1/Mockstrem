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

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path='/' element={<App />}/>
      <Route path='/auth' element={<Auth />}/>
      <Route path='/contact' element={<Contact />}/>
      <Route path='/dashboard' element={<Dashboard />}/>
      <Route path='/plans' element={<Plan />}/>
      <Route path='/mock/cefr/writing/:id' element={<Writing />}/>
    </Routes>
  </BrowserRouter>
)
