import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import NumDashboard from './NumDashboard.jsx'
import Instructions from './Instructions.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/num" element={<NumDashboard />} />
      <Route path="/instructions" element={<Instructions />} />
    </Routes>
  </BrowserRouter>
)