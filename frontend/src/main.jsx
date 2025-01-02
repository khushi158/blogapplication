import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Signup from './Signup.jsx'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import Login from './Login.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter><Routes>
    <Route path="/" element={<Login/>}/>
    <Route path="/signup" element={<Signup/>}/>
    <Route path="/app" element={<App/>}/>
    </Routes>
    </BrowserRouter>
  </StrictMode>,
)
