import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { CGU } from './pages/CGU'
import { Privacy } from './pages/Privacy'
import './styles.css'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/cgu" element={<CGU />} />
      <Route path="/privacy" element={<Privacy />} />
    </Routes>
  </BrowserRouter>
)
